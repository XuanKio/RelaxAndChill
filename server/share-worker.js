import { validateScene } from '../public/share.js';
const allowed = new Set(['https://xuankio.github.io','http://127.0.0.1:8765','http://localhost:8765']);
const rates = new Map();
export default { async fetch(request, env) {
  const origin=request.headers.get('Origin'), path=new URL(request.url).pathname;
  const headers={'Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})};
  const reply=(value,status=200)=>Response.json(value,{status,headers});
  if(request.method==='OPTIONS')return new Response(null,{status:allowed.has(origin)?204:403,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'3600'}});
  if(path==='/')return reply({service:'RelaxAndChill',status:'ready'});
  if(request.method==='POST'&&path==='/scenes'){
    if(!allowed.has(origin))return reply({error:'Origin not allowed'},403);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
    const now=Date.now(),ip=request.headers.get('CF-Connecting-IP')||'unknown';
    for(const [key,value] of rates)if(value.until<now)rates.delete(key);
    const rate=rates.get(ip)||{count:0,until:now+60000};
    if(rate.count>=12||rates.size>=10000)return reply({error:'Thử lại sau 1 phút nhé.'},429);
    rate.count++;rates.set(ip,rate);
    if(Number(request.headers.get('Content-Length'))>80000)return reply({error:'Ảnh quá lớn.'},413);
    const reader=request.body?.getReader();if(!reader)return reply({error:'Thiếu cảnh chơi.'},400);
    let size=0,chunks=[];
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>80000){await reader.cancel();return reply({error:'Ảnh quá lớn.'},413);}chunks.push(value);}
    let scene;
    try{const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}scene=validateScene(JSON.parse(new TextDecoder().decode(bytes)));}catch{return reply({error:'Cảnh chơi không hợp lệ.'},400);}
    const body=JSON.stringify(scene);
    // Content addresses deduplicate repeated shares and expose no update API.
    const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body)));
    const id=btoa(String.fromCharCode(...digest.slice(0,12))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
    try{if(!await env.BUCKET.head('scenes/'+id))await env.BUCKET.put('scenes/'+id,body,{httpMetadata:{contentType:'application/json'}});return reply({id},201);}catch{return reply({error:'Chưa lưu được cảnh. Thử lại nhé.'},503);}
  }
  const match=path.match(/^\/scenes\/([A-Za-z0-9_-]{16})$/);
  if(request.method==='GET'&&match){
    try{const object=await env.BUCKET.get('scenes/'+match[1]);if(!object)return reply({error:'Không tìm thấy cảnh chơi.'},404);return new Response(await object.text(),{headers:{...headers,'Cache-Control':'public, max-age=86400'}});}catch{return reply({error:'Chưa tải được cảnh. Thử lại nhé.'},503);}
  }
  return reply({error:'Not found'},404);
}};
