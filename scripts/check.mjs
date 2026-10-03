import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for(const dir of ['public','scripts','tests'])for(const name of readdirSync(dir)){
  if(!/\.(m?js)$/.test(name))continue;
  const r=spawnSync(process.execPath,['--check',`${dir}/${name}`],{stdio:'inherit'});if(r.status)process.exit(r.status);
}
for(const name of readdirSync('public').filter(n=>n.endsWith('.html'))){
const html=readFileSync('public/'+name,'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(https?:|data:|\.\/)/.test(match[1]))continue;
  if(!existsSync('public/'+match[1].split(/[?#]/)[0]))throw new Error('Missing asset: '+match[1]);
}
}
console.log('Syntax and local assets OK');
