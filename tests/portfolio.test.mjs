import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { profile, render, escape } from '../scripts/build.mjs';
import { matches, filterEntries } from '../lib/search.mjs';
import { evaluateSignal, signalSVG } from '../lib/uncertainty.mjs';

const html = render();
function setup() {
  const { window, document } = parseHTML(html);
  const dialog = document.querySelector('dialog');
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; };
  dialog.getBoundingClientRect = () => ({left:0,top:0,right:600,bottom:600});
  // linkedom models markup and events, not browser layout or native focus management.
  for (const element of document.querySelectorAll('*')) element.focus = () => { document._focused = element; };
  for (const select of document.querySelectorAll('select')) {
    let value = 'All';
    Object.defineProperty(select, 'value', {get:()=>value,set:next=>{value=next;}});
  }
  window.print = () => {};
  const location = {hash:''};
  const navigator = {clipboard:{writeText:async text=>{navigator.copied=text;}}};
  const context = vm.createContext({window,document,location,navigator,matches,evaluateSignal,signalSVG,console});
  const source=readFileSync(new URL('../script.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInContext(source, context);
  const fire = (selector,event='click') => document.querySelector(selector).dispatchEvent(new window.Event(event,{bubbles:true}));
  return {window,document,navigator,fire,location};
}

test('profile renders complete records into the no-JavaScript document',()=>{
  const {document}=parseHTML(html);
  assert.equal(document.querySelectorAll('.project-card').length,profile.projects.length);
  assert.equal(document.querySelectorAll('#achievements .record').length,29);
  assert.equal(document.querySelectorAll('#certifications .record').length,71);
  assert.equal(document.querySelectorAll('#community-record .record').length,34);
  assert.equal(document.querySelectorAll('.experience-row').length,8);
  assert.equal(document.querySelectorAll('.education-row').length,8);
  assert.ok(!html.includes('Master of Data Science'));
  assert.ok(!/\{\{\w+\}\}/.test(html));
  assert.ok(html.includes('NOT A RESEARCH RESULT'));
});
test('local resources, fragments, image descriptions, and external links are valid',()=>{
  const {document}=parseHTML(html);
  const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length,'duplicate IDs');
  for(const el of document.querySelectorAll('[src],link[href],a[href]')) {
    const url=el.getAttribute('src') || el.getAttribute('href');
    if(url.startsWith('#')) assert.ok(document.getElementById(url.slice(1)),url);
    else if(url.startsWith('./')) assert.ok(existsSync(new URL('../'+url.slice(2),import.meta.url)),url);
    if(el.getAttribute('target')==='_blank') assert.ok(el.getAttribute('rel').includes('noopener'));
  }
  for(const img of document.querySelectorAll('img')) assert.ok(img.getAttribute('alt'));
});
test('template escapes supplied strings rather than introducing markup',()=>{
  assert.equal(escape('<img src=x onerror="bad()">'), '&lt;img src=x onerror=&quot;bad()&quot;&gt;');
});
test('literal multi-token search handles accents, quotes, and regex characters',()=>{
  assert.ok(matches('Université · Cadence Semiconductor','universite cadence'));
  assert.ok(!matches('Cadence','.*'));
  assert.ok(!matches('PMP','<script>'));
  assert.equal(filterEntries([{text:'PMP leadership',category:'Business'},{text:'PMP',category:'Other'}],'pmp','Business').length,1);
});
test('project filter changes visible cards and pressed states, then restores all',()=>{
  const {document,fire}=setup();
  fire('[data-project-filter="Research"]');
  assert.equal(document.querySelectorAll('.project-card:not([hidden])').length,1);
  assert.equal(document.querySelector('[data-project-filter="Research"]').getAttribute('aria-pressed'),'true');
  assert.match(document.querySelector('#project-count').textContent,/1 projects/);
  fire('[data-project-filter="All"]');
  assert.equal(document.querySelectorAll('.project-card:not([hidden])').length,8);
});
test('interest selector updates the chip routes and caption',()=>{
  const {document,fire}=setup();
  fire('[data-domain-select="research"]');
  assert.equal(document.querySelector('.hero-lab').dataset.domain,'research');
  assert.match(document.querySelector('#domain-caption').textContent,/Ask a better question/);
  assert.equal(document.querySelectorAll('[data-domain-select][aria-pressed="true"]').length,1);
});
test('fieldbook search combines category and query, and handles no results and clear',()=>{
  const {document,fire}=setup();
  document.querySelector('#record-search').value='cadence';fire('#record-search','input');
  assert.equal(document.querySelectorAll('.record:not([hidden])').length,9);
  assert.equal(document.querySelector('#certifications').open,true);
  document.querySelector('#certifications select').value='Cloud & AI';fire('#certifications select','change');
  assert.equal(document.querySelectorAll('.record:not([hidden])').length,1); // Cadence student ambassador
  document.querySelector('#record-search').value='no-such-result';fire('#record-search','input');
  assert.equal(document.querySelector('#record-empty').hidden,false);
  fire('#clear-record-search');
  assert.equal(document.querySelectorAll('.record:not([hidden])').length,134);
  assert.equal(document.querySelector('#record-empty').hidden,true);
});
test('global search opens, safely renders matches, and restores a hidden project',()=>{
  const {document,fire}=setup();
  fire('[data-project-filter="Engineering"]');
  fire('[data-open-search]');
  assert.equal(document.querySelector('dialog').open,true);
  document.querySelector('#site-search').value='RoomLab';fire('#site-search','input');
  assert.equal(document.querySelectorAll('#site-search-results a').length,1);
  fire('#site-search-results a');
  assert.equal(document.querySelector('dialog').open,false);
  assert.equal(document.querySelector('#project-roomlab').hidden,false);
  fire('[data-open-search]');
  document.querySelector('#site-search').value='<img onerror=alert(1)>';fire('#site-search','input');
  assert.equal(document.querySelectorAll('#site-search-results img').length,0);
  assert.equal(document.querySelectorAll('#site-search-results a').length,0);
});
test('global record search clears earlier filters and opens its parent disclosure',()=>{
  const {document,fire}=setup();
  document.querySelector('#record-search').value='missing';fire('#record-search','input');
  fire('[data-open-search]');
  document.querySelector('#site-search').value='King\'s Scout';fire('#site-search','input');
  assert.equal(document.querySelectorAll('#site-search-results a').length,1);
  fire('#site-search-results a');
  assert.equal(document.querySelector('#achievements').open,true);
  assert.equal(document.querySelector('#record-search').value,'');
  assert.equal(document.querySelectorAll('#achievements .record:not([hidden])').length,29);
});
test('synthetic illustration has bounded intervals and monotonic outside counts',()=>{
  let previous=Infinity;
  for(let width=.2;width<=1.61;width+=.1){
    const result=evaluateSignal(width);
    assert.equal(result.points.length,80);
    assert.ok(result.outside<=previous);
    previous=result.outside;
    for(const p of result.points) assert.ok(p.lower<=p.forecast && p.forecast<=p.upper);
  }
  assert.equal(evaluateSignal('bad').halfWidth,.7);
  assert.equal(evaluateSignal(99).halfWidth,1.6);
  assert.ok(evaluateSignal(.7,true).outside>evaluateSignal(.7,false).outside);
});
test('research controls update output, SVG description, and drift state',()=>{
  const {document,fire}=setup();
  document.querySelector('#interval-width').value='1.6';fire('#interval-width','input');
  assert.equal(document.querySelector('#interval-value').textContent,'±1.6°C');
  assert.match(document.querySelector('#signal-desc').textContent,/1.6 degrees/);
  fire('#toggle-drift');
  assert.equal(document.querySelector('#toggle-drift').getAttribute('aria-pressed'),'true');
  assert.match(document.querySelector('#signal-desc').textContent,/drift/);
});
test('copy email reports both success and a denied-clipboard fallback',async()=>{
  const {document,navigator,fire}=setup();
  fire('#copy-email');await new Promise(resolve=>setImmediate(resolve));
  assert.equal(navigator.copied,profile.email);
  assert.match(document.querySelector('#copy-status').textContent,/copied/);
  navigator.clipboard.writeText=async()=>{throw Error('denied');};
  fire('#copy-email');await new Promise(resolve=>setImmediate(resolve));
  assert.match(document.querySelector('#copy-status').textContent,/unavailable/);
});
test('print opens disclosure content and restores previous state',()=>{
  const {document,window}=setup();
  const details=document.querySelector('#achievements');details.open=false;
  window.dispatchEvent(new window.Event('beforeprint'));
  assert.ok([...document.querySelectorAll('details')].every(el=>el.open));
  window.dispatchEvent(new window.Event('afterprint'));
  assert.equal(details.open,false);
});
