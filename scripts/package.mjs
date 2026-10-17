import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),output=path.join(root,'dist');
rmSync(output,{recursive:true,force:true});mkdirSync(output,{recursive:true});
// Only public routes and assets are deployed. Keep legacy PDF URLs intact.
for(const name of ['index.html','404.html','work','about','recognition','contact','style.css','mediaqueries.css','script.js','assets','robots.txt','sitemap.xml'])cpSync(path.join(root,name),path.join(output,name),{recursive:true});
for(const name of ['CNAME','.nojekyll'])if(existsSync(path.join(root,name)))cpSync(path.join(root,name),path.join(output,name));
console.log('Packaged public site in dist/.');
