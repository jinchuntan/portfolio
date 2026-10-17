import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root,'dist');
rmSync(output,{recursive:true,force:true});
mkdirSync(output,{recursive:true});
// Explicit public allowlist. Preserve legacy asset/PDF URLs, exclude source and dependencies.
for(const name of ['index.html','style.css','mediaqueries.css','script.js','lib','assets','robots.txt','sitemap.xml']) {
  cpSync(path.join(root,name),path.join(output,name),{recursive:true});
}
for(const name of ['CNAME','.nojekyll']) if(existsSync(path.join(root,name))) cpSync(path.join(root,name),path.join(output,name));
console.log('Packaged public site in dist/.');
