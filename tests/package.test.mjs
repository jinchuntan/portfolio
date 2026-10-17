import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
const root=fileURLToPath(new URL('../',import.meta.url));
test('production package includes all routes, media and legacy documents while excluding source',()=>{
 execFileSync(process.execPath,['scripts/package.mjs'],{cwd:root});
 for(const name of ['index.html','404.html','work/index.html','about/index.html','recognition/index.html','contact/index.html','work/confosense/index.html','script.js','assets/portrait.webp','assets/projects/apr-dashboard.webp','assets/social-card.png','assets/resume-pdf.pdf','robots.txt','sitemap.xml'])assert.ok(existsSync(new URL('../dist/'+name,import.meta.url)),name);
 for(const name of ['.git','node_modules','tests','data','src','docs','lib','package-lock.json','README.md','.openai'])assert.ok(!existsSync(new URL('../dist/'+name,import.meta.url)),name+' must not deploy');
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 for(const file of walk(root+'dist').filter(f=>f.endsWith('.html'))){const {document}=parseHTML(readFileSync(file,'utf8'));for(const el of document.querySelectorAll('[src],[href]')){const url=el.getAttribute('src')||el.getAttribute('href');if(!url||/^(https?:|mailto:|#)/.test(url))continue;const resolved=new URL(url,'https://local/'+file.slice((root+'dist/').length));const target=root+'dist'+decodeURIComponent(resolved.pathname);assert.ok(existsSync(target),file+' -> '+url);}}
 const map=readFileSync(root+'dist/sitemap.xml','utf8');assert.equal((map.match(/<loc>/g)||[]).length,13);assert.ok(!map.includes('tanjinchun.me'));
});
