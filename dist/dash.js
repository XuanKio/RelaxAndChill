export const DASH_DURATION=3.2;
export function dashPose(age,reduced=false){
  const progress=Math.max(0,Math.min(1,(age-1.35)/.9));
  return {progress:progress*progress,stretch:1,alpha:reduced?Math.max(0,1-(age-1.5)/.6):1};
}
export function riderLayout(bounds){
  const scale=Math.min(260/bounds.width,270/bounds.height);
  const w=bounds.width*scale,h=bounds.height*scale;
  return {x:360-w/2,y:510-h*.78,w,h};
}
export function drawScooterRide(ctx,{age,reduced,image,bounds,fit,scooter,viewWidth}){
  const pose=dashPose(age,reduced),rider=riderLayout(bounds);
  const enter=Math.min(1,age/.45),hop=Math.min(1,Math.max(0,(age-.12)/.7));
  const ease=hop*hop*(3-2*hop),exit=reduced?0:pose.progress*(viewWidth+900);
  const bikeX=75+(reduced?0:-(1-enter)*(1-enter)*1100)+exit;
  const bikeY=345+(reduced?0:Math.sin(age*45)*Math.min(1,age)*2);
  const mix=(a,b)=>a+(b-a)*ease;
  ctx.save();ctx.globalAlpha=pose.alpha;
  ctx.drawImage(image,bounds.x,bounds.y,bounds.width,bounds.height,
    mix(fit.x,rider.x)+exit,mix(fit.y,rider.y)-(reduced?0:Math.sin(hop*Math.PI)*90),mix(fit.w,rider.w),mix(fit.h,rider.h));
  // The bike faces right; its upper fairing occludes the rider's lower edge.
  ctx.save();ctx.translate(bikeX+750,bikeY);ctx.scale(-1,1);ctx.drawImage(scooter,0,0,750,750*scooter.height/scooter.width);ctx.restore();
  if(!reduced&&age>1.35)drawDashSmoke(ctx,age-1.35,160,765);
  ctx.restore();
  if(age>2.55){ctx.save();ctx.globalAlpha=Math.min(1,(age-2.55)/.65);ctx.drawImage(image,bounds.x,bounds.y,bounds.width,bounds.height,fit.x,fit.y,fit.w,fit.h);ctx.restore();}
}
export function drawDashSmoke(ctx,age,x,y){
  for(let i=0;i<9;i++){
    const t=age-.12-i*.045;if(t<0||t>1.2)continue;
    const radius=(15+i%3*7)+t*30;
    ctx.save();ctx.globalAlpha=(1-t/1.2)*.5;ctx.fillStyle=i%2?'#ffffff':'#e8e6dc';
    ctx.beginPath();ctx.arc(x+i*20-t*35,y-Math.sin(i*1.7)*18-t*28,radius,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}
