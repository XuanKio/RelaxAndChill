import { alphaBounds } from './background.js';

export function createToolCutout(onApply) {
  const dialog = document.createElement('dialog');
  dialog.className = 'tool-cutout-dialog'; dialog.setAttribute('aria-labelledby', 'cutout-title');
  dialog.innerHTML = `<div class="cutout-heading"><h2 id="cutout-title">Tách nền dụng cụ</h2><button data-close class="icon-button" aria-label="Đóng tách nền dụng cụ">×</button></div>
    <div class="cutout-stage"><canvas width="600" height="600" aria-label="Vẽ lên ảnh dụng cụ để xóa hoặc khôi phục nền"></canvas></div>
    <div class="cutout-tools" role="group" aria-label="Sửa nền dụng cụ"><button data-auto class="secondary">✦ Tách</button><button data-brush="erase" aria-pressed="true" class="secondary">Xóa</button><button data-brush="restore" aria-pressed="false" class="secondary">Phục hồi</button><button data-undo class="secondary" aria-label="Hoàn tác sửa dụng cụ" disabled>↶</button></div>
    <label class="range-label" for="tool-brush-size">Cỡ cọ <output id="tool-brush-value">24</output></label><input id="tool-brush-size" type="range" min="5" max="70" value="24">
    <p class="cutout-status" role="status">Tách tự động hoặc dùng cọ sửa.</p><div class="cutout-footer"><button data-reset class="secondary">Ảnh gốc</button><button data-apply class="primary">Áp dụng</button></div>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector), view = find('canvas'), ctx = view.getContext('2d');
  let image, original, history = [], drawing = false, activePointer = null, last, mode = 'erase', worker, timer;
  const copy = source => { const c = document.createElement('canvas'); c.width = source.width; c.height = source.height; c.getContext('2d').drawImage(source, 0, 0); return c; };
  const pixels = () => image.getContext('2d').getImageData(0, 0, image.width, image.height);
  const fit = () => { const scale = Math.min(560 / image.width, 560 / image.height); return { scale, x: (600-image.width*scale)/2, y: (600-image.height*scale)/2 }; };
  const status = text => find('.cutout-status').textContent = text;
  const draw = () => { const f = fit(); ctx.clearRect(0,0,600,600); ctx.drawImage(image,f.x,f.y,image.width*f.scale,image.height*f.scale); find('[data-undo]').disabled = !!worker || !history.length; };
  const checkpoint = () => { history.push(pixels()); if(history.length>6)history.shift(); };
  const stop = () => { drawing=false; activePointer=null; worker?.terminate(); worker=null; clearTimeout(timer); dialog.querySelectorAll('button,input').forEach(b=>b.disabled=false); if(image)draw(); };
  const close = () => { stop(); dialog.close(); };
  find('[data-close]').onclick=close; dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  document.addEventListener('visibilitychange',()=>{drawing=false;}); window.addEventListener('blur',()=>{drawing=false;});
  window.addEventListener('pagehide',stop);
  find('[data-auto]').onclick=()=>{
    if(worker)return; drawing=false; const data=pixels();
    try { worker=new Worker(new URL('./subject-worker.js',import.meta.url),{type:'module'}); }
    catch { status('Không chạy được tự động. Bạn vẫn dùng cọ được.'); return; }
    dialog.querySelectorAll('button,input').forEach(b=>b.disabled=!b.hasAttribute('data-close'));
    status('Đang tách trên thiết bị…');
    timer=setTimeout(()=>{stop();status('Chưa tách được. Bạn có thể dùng cọ sửa.');},60000);
    worker.onmessage=({data:result})=>{
      if(result.status){status(result.status);return;}
      stop();if(result.error){status(result.error);return;}
      const output=new ImageData(new Uint8ClampedArray(result.buffer),result.width,result.height);
      if(!alphaBounds(output.data,output.width,output.height)){status('Chưa thấy dụng cụ. Thử dùng cọ xóa.');return;}
      checkpoint();image.getContext('2d').putImageData(output,0,0);draw();status('Đã tách. Dùng cọ để sửa thêm.');
    };
    worker.onerror=()=>{stop();status('Không chạy được tự động. Bạn vẫn dùng cọ được.');};
    worker.postMessage({buffer:data.data.buffer,width:data.width,height:data.height,seed:null},[data.data.buffer]);
  };
  dialog.querySelectorAll('[data-brush]').forEach(button=>button.onclick=()=>{mode=button.dataset.brush;dialog.querySelectorAll('[data-brush]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
  find('#tool-brush-size').oninput=()=>find('#tool-brush-value').textContent=find('#tool-brush-size').value;
  const point = event => {const r=view.getBoundingClientRect(),f=fit();return {x:((event.clientX-r.left)*600/r.width-f.x)/f.scale,y:((event.clientY-r.top)*600/r.height-f.y)/f.scale};};
  function dab(point){const c=image.getContext('2d'),radius=Number(find('#tool-brush-size').value)/fit().scale;c.save();c.beginPath();c.arc(point.x,point.y,radius,0,Math.PI*2);c.clip();c.clearRect(point.x-radius,point.y-radius,radius*2,radius*2);if(mode==='restore')c.drawImage(original,0,0);c.restore();}
  view.onpointerdown=event=>{if(worker||drawing||!event.isPrimary)return;event.preventDefault();view.setPointerCapture(event.pointerId);activePointer=event.pointerId;checkpoint();drawing=true;last=point(event);dab(last);draw();};
  view.onpointermove=event=>{if(!drawing||event.pointerId!==activePointer)return;const p=point(event),distance=Math.hypot(p.x-last.x,p.y-last.y),steps=Math.max(1,Math.ceil(distance/3));for(let i=1;i<=steps;i++)dab({x:last.x+(p.x-last.x)*i/steps,y:last.y+(p.y-last.y)*i/steps});last=p;draw();};
  for(const name of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(name,event=>{if(event.pointerId===activePointer){drawing=false;activePointer=null;}});
  find('[data-undo]').onclick=()=>{if(history.length){image.getContext('2d').putImageData(history.pop(),0,0);draw();}};
  find('[data-reset]').onclick=()=>{checkpoint();image=copy(original);draw();status('Đã lấy lại ảnh gốc.');};
  find('[data-apply]').onclick=()=>{const data=pixels();if(!alphaBounds(data.data,data.width,data.height)){status('Ảnh đã bị xóa hết. Hãy hoàn tác.');return;}onApply(copy(image));close();};
  return {open(current,source){image=copy(current);original=copy(source||current);history=[];draw();status('Tách tự động hoặc dùng cọ sửa.');dialog.showModal();},get active(){return dialog.open;}};
}
