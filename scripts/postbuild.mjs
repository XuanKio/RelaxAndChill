import { writeFileSync, copyFileSync, readdirSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { SITE_BASE } from '../site-path.mjs';
const root=resolve('out'),destination=resolve(root,'nlinn');
const files=readdirSync(root).filter(name=>name!=='nlinn');
mkdirSync(destination,{recursive:true});
for(const name of files){
  const source=resolve(root,name),target=resolve(destination,name);
  if(!source.startsWith(root+sep)||!target.startsWith(destination+sep))throw new Error('Unsafe export path');
  renameSync(source,target);
}
copyFileSync(resolve(destination,'create/index.html'),resolve(destination,'create.html'));
writeFileSync(resolve(root,'.nojekyll'),'');
const redirect=(file,to)=>{
 const target=resolve(root,file);mkdirSync(resolve(target,'..'),{recursive:true});
 writeFileSync(target,`<!doctype html><html lang="vi"><meta charset="utf-8"><title>RelaxAndChill 🐾</title><link rel="icon" href="${SITE_BASE}/favicon.svg"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script><a href="${to}">Mở RelaxAndChill</a></html>`);
};
redirect('index.html',SITE_BASE+'/');
redirect('create.html',SITE_BASE+'/create/');
redirect('create/index.html',SITE_BASE+'/create/');
redirect('p/index.html',SITE_BASE+'/p/');
