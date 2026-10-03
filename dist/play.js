import { ASSETS, PRESETS } from './assets.js?v=20261004';
let preset='mochi';
const start=()=>{location.href='create.html#preset='+preset;};
document.getElementById('start').onclick=start;
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{preset=b.dataset.preset;document.querySelectorAll('[data-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const img=document.getElementById('menu-cat');img.src=ASSETS[PRESETS[preset].cat].src;img.alt='Ảnh mèo thật '+PRESETS[preset].name;});
// Preserve previously shared links after moving editing into the same workspace.
if(location.hash.startsWith('#play='))location.replace('create.html'+location.hash);
