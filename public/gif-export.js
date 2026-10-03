export function createGifExport(getSnapshot, release) {
  const dialog=document.createElement('dialog');dialog.className='gif-dialog';dialog.setAttribute('aria-label','Xuất GIF');
  dialog.innerHTML='<div class="cutout-heading"><h2>Gửi một cái xoa ♡</h2><div class="gif-heading-actions"><button class="icon-button" data-roll disabled aria-label="Đổi kết thúc và tạo lại GIF" title="Đổi kết thúc"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01" stroke-width="3" stroke-linecap="round"/></svg></button><button class="icon-button" data-close aria-label="Đóng xuất GIF">×</button></div></div><p class="help">Xoa / chải → tạm biệt bất ngờ · 8 giây · không âm thanh</p><img class="gif-preview" alt="Ảnh động xoa hoặc chải, rồi nhân vật tạm biệt" hidden><progress max="1" value="0" aria-label="Tiến độ tạo GIF"></progress><p class="gif-status" role="status">Đang tạo GIF…</p><div class="gif-actions"><a class="primary full" data-download hidden download="relax-and-chill.gif">Tải GIF</a><button class="secondary full" data-share hidden>Gửi GIF</button><button class="secondary full" data-retry hidden>Thử lại</button></div>';
  document.body.append(dialog);
  let worker=null,url=null,file=null,sequence=0,timer=null;
  const q=s=>dialog.querySelector(s);
  function stop(){sequence++;worker?.terminate();worker=null;clearTimeout(timer);if(url)URL.revokeObjectURL(url);url=null;file=null;}
  dialog.addEventListener('close',stop);q('[data-close]').onclick=()=>dialog.close();
  q('[data-share]').onclick=async()=>{try{await navigator.share({files:[file],title:'Một chút RelaxAndChill'});}catch(e){if(e.name!=='AbortError')q('.gif-status').textContent='Bạn có thể tải GIF rồi gửi qua ứng dụng.';}};
  async function start(){
    stop();q('[data-roll]').disabled=true;const request=sequence;release();if(!dialog.open)dialog.showModal();
    q('img').hidden=true;q('img').removeAttribute('src');q('progress').hidden=false;q('progress').value=0;
    for(const selector of ['[data-download]','[data-share]','[data-retry]'])q(selector).hidden=true;
    q('.gif-status').textContent='Đang tạo GIF trên thiết bị…';
    const fail=()=>{worker?.terminate();worker=null;clearTimeout(timer);q('progress').hidden=true;q('.gif-status').textContent='Chưa tạo được GIF. Thử lại bằng trình duyệt mới hơn.';q('[data-retry]').hidden=false;};
    try{
      const snapshot=await getSnapshot();
      if(request!==sequence){snapshot.image.close();snapshot.hand.close();snapshot.sprite?.close();snapshot.backdrop?.close();snapshot.scooter?.close();snapshot.skate?.close();snapshot.explosion?.close();return;}
      dialog.dataset.ending=snapshot.farewell;
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
          q('[data-roll]').disabled=false;q('[data-download]').href=url;q('[data-download]').hidden=false;
          q('[data-share]').hidden=!navigator.canShare?.({files:[file]});
          q('.gif-status').textContent=`Sẵn sàng · ${(file.size/1024/1024).toFixed(1)} MB`;
        }
      };
      worker.postMessage(snapshot,[snapshot.image,snapshot.hand,...(snapshot.sprite?[snapshot.sprite]:[]),...(snapshot.backdrop?[snapshot.backdrop]:[]),snapshot.scooter,snapshot.skate,snapshot.explosion]);
    }catch{if(request===sequence)fail();}
  }
  q('[data-retry]').onclick=q('[data-roll]').onclick=start;
  return {open:start,get active(){return dialog.open;}};
}
