import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
const root=fileURLToPath(new URL('../',import.meta.url));
test('production package includes all routes, media and legacy documents while excluding source',()=>{
 execFileSync(process.execPath,['scripts/package.mjs'],{cwd:root});
 for(const name of ['index.html','404.html','work/index.html','about/index.html','recognition/index.html','contact/index.html','work/confosense/index.html','script.js','assets/portrait.webp','assets/projects/procurepilot.svg','assets/social-card.png','assets/resume-pdf.pdf','robots.txt','sitemap.xml'])assert.ok(existsSync(new URL('../dist/'+name,import.meta.url)),name);
 for(const name of ['.git','node_modules','tests','data','src','docs','lib','package-lock.json','README.md','.openai'])assert.ok(!existsSync(new URL('../dist/'+name,import.meta.url)),name+' must not deploy');
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 for(const file of walk(root+'dist').filter(f=>f.endsWith('.html'))){const {document}=parseHTML(readFileSync(file,'utf8'));for(const el of document.querySelectorAll('[src],[href]')){const url=el.getAttribute('src')||el.getAttribute('href');if(!url||/^(https?:|mailto:|#)/.test(url))continue;const resolved=new URL(url,'https://local/'+file.slice((root+'dist/').length));const target=root+'dist'+decodeURIComponent(resolved.pathname);assert.ok(existsSync(target),file+' -> '+url);}}
 const map=readFileSync(root+'dist/sitemap.xml','utf8');assert.equal((map.match(/<loc>/g)||[]).length,12);assert.ok(!map.includes('tanjinchun.me'));
});

test('company project content cannot be published through the current package',()=>{
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
 const forbidden=/apr[-_ ]dashboard|APR intelligence|github\.com\/jinchuntan\/combo|demo_logic|demo_io/i;
 for(const file of walk(root+'dist')){assert.ok(!forbidden.test(file),file);if(/\.(html|js|css|json|xml|txt|svg)$/.test(file))assert.ok(!forbidden.test(readFileSync(file,'utf8')),file);}
});
