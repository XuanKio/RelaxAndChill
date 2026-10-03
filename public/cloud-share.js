import { validateScene } from './share.js';
const endpoint='https://relax-chill-links.nhtlinn.chatgpt.site';
const saved=new Map();
export async function uploadScene(input){
  const body=JSON.stringify(validateScene(input));if(saved.has(body))return saved.get(body);
  const res=await fetch(endpoint+'/scenes',{method:'POST',headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(20000)});
  const data=await res.json();if(!res.ok||!/^[A-Za-z0-9_-]{16}$/.test(data.id))throw new Error(data.error||'Chưa lưu được link. Thử lại nhé.');
  saved.set(body,data.id);return data.id;
}
export async function downloadScene(id){
  if(!/^[A-Za-z0-9_-]{16}$/.test(id))throw new Error('Mã chia sẻ không hợp lệ.');
  const res=await fetch(endpoint+'/scenes/'+id,{signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw new Error('Chưa mở được cảnh chơi.');
  return validateScene(await res.json());
}
