import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root=fileURLToPath(new URL('../',import.meta.url));
test('public package contains its complete module and asset graph, excluding development files',()=>{
  execFileSync(process.execPath,['scripts/package.mjs'],{cwd:root});
  for(const name of ['index.html','script.js','lib/search.mjs','lib/uncertainty.mjs','assets/portrait.webp','assets/social-card.png','assets/resume-pdf.pdf','robots.txt','sitemap.xml']) {
    assert.ok(existsSync(new URL('../dist/'+name,import.meta.url)),name);
  }
  for(const name of ['.git','node_modules','tests','data','src','package-lock.json','README.md']) {
    assert.ok(!existsSync(new URL('../dist/'+name,import.meta.url)),`${name} must not be deployed`);
  }
  const {document}=parseHTML(readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'));
  for(const el of document.querySelectorAll('[src],link[href]')) {
    const url=el.getAttribute('src')||el.getAttribute('href');
    if(url.startsWith('./')) assert.ok(existsSync(new URL('../dist/'+url.slice(2),import.meta.url)),url);
  }
  const person=JSON.parse(document.querySelector('[type="application/ld+json"]').textContent);
  assert.equal(person.name,'Nigel Tan');
  assert.equal(person.url,'https://tanjinchun.me/');
  assert.equal(document.querySelector('[property="og:image"]').content,'https://tanjinchun.me/assets/social-card.png');
});
