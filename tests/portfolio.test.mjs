import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import {renderPages,profile,escape} from '../scripts/build.mjs';
const pages=renderPages();
function setup(page='index.html'){
 const {window,document}=parseHTML(pages[page]);
 const media={addEventListener(){}};
 const context={document,window,location:{pathname:'/'},requestAnimationFrame:fn=>fn(),setTimeout,clearTimeout};
 window.matchMedia=()=>media;window.scrollY=0;window.innerHeight=900;window.IntersectionObserver=function(){};
 vm.runInNewContext(readFileSync(new URL('../script.js',import.meta.url),'utf8'),context);
 const fire=(selector,type='click',key)=>{const event=new window.Event(type,{bubbles:true});if(key)event.key=key;document.querySelector(selector).dispatchEvent(event);};
 return {document,window,fire};
}
test('home is concise with four selected projects, three recognition highlights and four nav destinations',()=>{
 const {document}=parseHTML(pages['index.html'].replaceAll('><','> <'));
 assert.equal(document.querySelectorAll('.project-card').length,4);
 assert.equal(document.querySelectorAll('.recognition-row').length,3);
 assert.deepEqual([...document.querySelectorAll('#primary-nav a')].map(a=>a.textContent),['Work','About','Recognition','Contact']);
 for(const n of document.querySelectorAll('script,style,svg'))n.remove();
 const words=document.body.textContent.trim().split(/\s+/).filter(Boolean).length;
 assert.ok(words>=270&&words<=410,`Home has ${words} words`);
 assert.match(document.querySelector('h1').textContent,/Nigel Tan/);
 const actions=[...document.querySelectorAll('.hero-actions a')].map(a=>a.textContent.trim().replace(/ ↗$/,''));
 assert.deepEqual(actions,['View my work','Get in touch']);
});
test('every page has correct canonical metadata, headings, unique IDs and valid internal links/assets',()=>{
 for(const [file,html]of Object.entries(pages)){
 if(!file.endsWith('.html'))continue;
 const {document}=parseHTML(html);
 const route=file==='index.html'?'/':file==='404.html'?'/404.html':'/'+file.replace('index.html','');
 assert.equal(document.querySelector('link[rel="canonical"]').href,'https://tanjinchun.com'+route);
 assert.equal(document.querySelector('[property="og:url"]').content,'https://tanjinchun.com'+route);
 assert.equal(JSON.parse(document.querySelector('[type="application/ld+json"]').textContent).url,'https://tanjinchun.com/');
 assert.equal(document.querySelectorAll('h1').length,1,file);
 const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);assert.equal(new Set(ids).size,ids.length,file+' duplicate ID');
 for(const x of document.querySelectorAll('[href],[src]')){
 const href=x.getAttribute('href')||x.getAttribute('src');
 if(href.startsWith('#'))assert.ok(document.getElementById(href.slice(1)),file+href);
 if(href.startsWith('/')){
 const [url,hash]=href.split('#');let target=url==='/'?'index.html':url.endsWith('/')?url.slice(1)+'index.html':url.slice(1);
 assert.ok(pages[target]||existsSync(new URL('../'+target,import.meta.url)),file+' -> '+href);
 if(hash&&pages[target])assert.ok(parseHTML(pages[target]).document.getElementById(hash),href);
 }
 }
 assert.equal(document.querySelectorAll('img:not([alt])').length,0);
 assert.ok(!/tanjinchun\.me|\{\{\w+\}\}/.test(html));
 }
});
test('all seven projects have dedicated pages with contribution, outcome, scope and evidence links',()=>{
 assert.equal(profile.projects.length,7);
 for(const p of profile.projects){const {document}=parseHTML(pages[`work/${p.id}/index.html`]);
 for(const text of ['The problem','My contribution','The outcome','Scope & status'])assert.ok([...document.querySelectorAll('h2')].some(h=>h.textContent===text));
 assert.ok(document.querySelector('.case-links a'));assert.ok(document.querySelector('figcaption'));
 assert.equal(document.querySelector('[data-nav="work"]').getAttribute('aria-current'),'page');
 }
});
test('source profile retains award names, dates, credential and community records',()=>{
 const {document}=parseHTML(pages['recognition/index.html']);
 assert.equal(document.querySelectorAll('[id^="award-"]').length,profile.awards.length);
 for(const [title,,date]of profile.awards){assert.ok(document.body.textContent.includes(title));assert.ok(document.body.textContent.includes(date));}
 assert.equal(document.querySelectorAll('[id^="credential-"]').length,profile.certifications.length);
 assert.equal(parseHTML(pages['about/index.html']).document.querySelectorAll('[id^="community-"]').length,profile.volunteering.length);
});
test('mobile menu toggles, closes after navigation and supports Escape with focus restoration',()=>{
 const {document,fire}=setup();const menu=document.querySelector('.menu-toggle');
 assert.equal(menu.hidden,false);assert.equal(menu.getAttribute('aria-expanded'),'false');
 fire('.menu-toggle');assert.equal(menu.getAttribute('aria-expanded'),'true');
 fire('[data-nav="work"]');assert.equal(menu.getAttribute('aria-expanded'),'false');
 let restored=false;menu.focus=()=>restored=true;fire('.menu-toggle');fire('body','keydown','Escape');
 assert.equal(menu.getAttribute('aria-expanded'),'false');assert.equal(restored,true);
});
test('signal interaction cycles through three concrete outcomes with an accessible live update',()=>{
 const {document,fire}=setup();assert.equal(document.querySelector('#send-signal').hidden,false);
 const values=['Chips → dependable systems.','Research → better-informed decisions.','Community → shared opportunities.','Chips → dependable systems.'];
 for(const value of values){fire('#send-signal');assert.equal(document.querySelector('#signal-output').textContent,value);}
 assert.equal(document.querySelector('#signal-output').getAttribute('aria-live'),'polite');
});
test('reduced motion, keyboard focus and native no-JS links are present',()=>{
 const css=readFileSync(new URL('../style.css',import.meta.url),'utf8');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/:focus-visible/);
 const {document}=parseHTML(pages['index.html']);assert.equal(document.querySelector('.menu-toggle').hidden,true);
 assert.equal(document.querySelector('#primary-nav').hasAttribute('hidden'),false);
 assert.equal(document.querySelector('.hero-actions a').href,'#work');
 assert.equal(document.querySelector('.contact-actions a').href,'mailto:'+profile.email);
 assert.equal(escape('<img onerror="alert(1)">'),'&lt;img onerror=&quot;alert(1)&quot;&gt;');
});

test('public profile directory links are visible, explicit and included in structured data',()=>{
 const {document}=parseHTML(pages['contact/index.html']);
 assert.equal(document.querySelectorAll('.profile-card').length,profile.profiles.length);
 const person=JSON.parse(document.querySelector('[type="application/ld+json"]').textContent);
 for(const p of profile.profiles){assert.ok([...document.querySelectorAll('.profile-card')].some(a=>a.href===p.url));assert.ok(person.sameAs.includes(p.url));}
});
