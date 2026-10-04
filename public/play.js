let preset='mochi';
const preview=document.getElementById('home-game');
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
  preset=b.dataset.preset;
  document.querySelectorAll('[data-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  preview.src='p/?home#preset='+preset;
  preview.title='Chơi cùng '+(preset==='mochi'?'Mochi':'Mướp');
});
if(/^#(?:play=|s=|mochi(?:\?|$)|muop(?:\?|$)|shy(?:\?|$))/.test(location.hash))location.replace(new URL('p/'+location.hash,document.baseURI));
