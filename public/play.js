let preset='mochi';
const preview=document.getElementById('home-game');
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
  preset=b.dataset.preset;
  document.querySelectorAll('[data-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  preview.src='create.html?home&v=next-studio#preset='+preset;
  preview.title='Chơi cùng '+(preset==='mochi'?'Mochi':'Mướp');
});
if(location.hash.startsWith('#play='))location.replace('create.html'+location.hash);