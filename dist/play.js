let preset='mochi';
const preview=document.getElementById('home-game');
document.getElementById('start').onclick=()=>{preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});preview.contentWindow.document.getElementById('canvas')?.focus({preventScroll:true});};
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
  preset=b.dataset.preset;
  document.querySelectorAll('[data-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  preview.src='create.html?home&v=20261004-studio#preset='+preset;
  preview.title='Chơi cùng '+(preset==='mochi'?'Mochi':'Mướp');
});
if(location.hash.startsWith('#play='))location.replace('create.html'+location.hash);
