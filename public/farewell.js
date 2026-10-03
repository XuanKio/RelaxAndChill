import { drawScooterRide } from './dash.js';
export const FAREWELLS=['scooter','skate','shaka','boom','wave'];
export function chooseFarewell(previous,random=Math.random){
  const pool=FAREWELLS.filter(type=>type!==previous);
  return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];
}
const clamp=v=>Math.max(0,Math.min(1,v));
export function farewellPose(type,age,reduced=false){
  const exit=clamp((age-1.15)/1.05),returnAlpha=clamp((age-2.65)/.55);
  return {exit:reduced?0:exit*exit,alpha:1-clamp((age-1.25)/.8),returnAlpha,wave:reduced?0:Math.sin(age*14)*.22};
}
function subject(c,s,x,y,w,h,alpha=1){c.save();c.globalAlpha=alpha;c.drawImage(s.image,s.bounds.x,s.bounds.y,s.bounds.width,s.bounds.height,x,y,w,h);c.restore();}
function caption(c,text,x,y,size=65,alpha=1){c.save();c.globalAlpha=alpha;c.font=`900 ${size}px "Arial Black", "Segoe UI", sans-serif`;c.textAlign='center';c.lineJoin='round';c.strokeStyle='#233c34';c.lineWidth=8;c.strokeText(text,x,y);c.fillStyle='#fffdf1';c.fillText(text,x,y);c.restore();}
export function drawFarewell(c,s){
 const {age,reduced,fit:f}=s,type=s.type||'scooter',p=farewellPose(type,age,reduced);
 if(type==='scooter'){drawScooterRide(c,s);caption(c,'Bye!',450,180,65,1-clamp((age-1.6)/.8));return;}
 if(type==='skate'&&s.skate){
  const scale=Math.min(380/s.bounds.width,340/s.bounds.height),w=s.bounds.width*scale,h=s.bounds.height*scale;
  const hop=clamp(age/.75),ease=hop*hop*(3-2*hop),exit=p.exit*(s.viewWidth+700);
  const mix=(a,b)=>a+(b-a)*ease,alpha=reduced?p.alpha:1;
  c.save();c.globalAlpha=alpha;
  const bw=440,bh=bw*s.skate.height/s.skate.width;
  c.drawImage(s.skate,450-bw/2+exit,610,bw,bh);
  subject(c,s,mix(f.x,450-w/2)+exit,mix(f.y,620-h)-(reduced?0:Math.sin(hop*Math.PI)*65),mix(f.w,w),mix(f.h,h),alpha);
  caption(c,'Bye',450+exit,Math.max(150,610-h-28),70,alpha);c.restore();
 }else{
  if(type==='boom'&&s.explosion){
   const intensity=clamp(age/.22)*(1-clamp((age-2)/.55));
   const vw=s.viewWidth||900,vh=s.viewHeight||900,zoom=reduced?1:1+clamp(age/2)*.16;
   const scale=Math.max(vw/s.explosion.width,vh/s.explosion.height)*zoom,w=s.explosion.width*scale,h=s.explosion.height*scale;
   c.save();c.globalAlpha=intensity;c.drawImage(s.explosion,450-w/2,450-h/2,w,h);c.restore();
  }
  subject(c,s,f.x,f.y,f.w,f.h,p.alpha);
  const text=type==='boom'?'goodbye':type==='shaka'?'BYE BYE!!!':'Bye bye!';
  caption(c,text,450,type==='boom'?190:640,type==='boom'?96:66,p.alpha);
  if(type!=='boom'){
   c.save();c.globalAlpha=p.alpha;c.translate(260,795);c.rotate(p.wave);c.font='155px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';c.textAlign='center';c.fillText(type==='shaka'?'🤙':'👋',0,0);c.restore();
  }
 }
 if(p.returnAlpha)subject(c,s,f.x,f.y,f.w,f.h,p.returnAlpha);
}
