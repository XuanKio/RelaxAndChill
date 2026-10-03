export function createGifExport(getSnapshot, release) {
  const dialog=document.createElement('dialog');dialog.className='gif-dialog';dialog.setAttribute('aria-label','Xuất GIF');
  dialog.innerHTML='<div class="cutout-heading"><h2>Gửi một cái xoa ♡</h2><button class="icon-button" data-close aria-label="Đóng xuất GIF">×</button></div><p class="help">Xoa / chải → lên SH · 8 giây · không âm thanh</p><img class="gif-preview" alt="Ảnh động xoa hoặc chải, rồi nhân vật lên SH" hidden><progress max="1" value="0" aria-label="Tiến độ tạo GIF"></progress><p class="gif-status" role="status">Đang tạo GIF…</p><div class="gif-actions"><a class="primary full" data-download hidden download="relax-and-chill.gif">Tải GIF</a><button class="secondary full" data-share hidden>Gửi GIF</button><button class="secondary full" data-retry hidden>Thử lại</button></div>';
  document.body.append(dialog);
  let worker=null,url=null,file=null,sequence=0,timer=null;
  const q=s=>dialog.querySelector(s);
  function stop(){sequence++;worker?.terminate();worker=null;clearTimeout(timer);if(url)URL.revokeObjectURL(url);url=null;file=null;}
  dialog.addEventListener('close',stop);q('[data-close]').onclick=()=>dialog.close();
  q('[data-share]').onclick=async()=>{try{await navigator.share({files:[file],title:'Một chút RelaxAndChill'});}catch(e){if(e.name!=='AbortError')q('.gif-status').textContent='Bạn có thể tải GIF rồi gửi qua ứng dụng.';}};
  async function start(){
    stop();const request=sequence;release();if(!dialog.open)dialog.showModal();
    q('img').hidden=true;q('img').removeAttribute('src');q('progress').hidden=false;q('progress').value=0;
    for(const selector of ['[data-download]','[data-share]','[data-retry]'])q(selector).hidden=true;
    q('.gif-status').textContent='Đang tạo GIF trên thiết bị…';
    const fail=()=>{worker?.terminate();worker=null;clearTimeout(timer);q('progress').hidden=true;q('.gif-status').textContent='Chưa tạo được GIF. Thử lại bằng trình duyệt mới hơn.';q('[data-retry]').hidden=false;};
    try{
      const snapshot=await getSnapshot();
      if(request!==sequence){snapshot.image.close();snapshot.hand.close();snapshot.sprite?.close();snapshot.backdrop?.close();snapshot.scooter?.close();return;}
      worker=new Worker(new URL('./gif-worker.js',import.meta.url),{type:'module'});
      worker.onerror=fail;timer=setTimeout(fail,60000);
      worker.onmessage=({data})=>{
        if(request!==sequence)return;
        if(data.error){fail();return;}
        if(data.progress)q('progress').value=data.progress;
        if(data.buffer){
          clearTimeout(timer);worker.terminate();worker=null;
          file=new File([data.buffer],'relax-and-chill.gif',{type:'image/gif'});url=URL.createObjectURL(file);
          q('img').src=url;q('img').hidden=false;q('progress').hidden=true;
          q('[data-download]').href=url;q('[data-download]').hidden=false;
          q('[data-share]').hidden=!navigator.canShare?.({files:[file]});
          q('.gif-status').textContent=`Sẵn sàng · ${(file.size/1024/1024).toFixed(1)} MB`;
        }
      };
      worker.postMessage(snapshot,[snapshot.image,snapshot.hand,...(snapshot.sprite?[snapshot.sprite]:[]),...(snapshot.backdrop?[snapshot.backdrop]:[]),snapshot.scooter]);
    }catch{if(request===sequence)fail();}
  }
  q('[data-retry]').onclick=start;
  return {open:start,get active(){return dialog.open;}};
}
