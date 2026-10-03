const originals=new WeakMap();

// Blend once in premultiplied alpha. Clearing then drawing through an AA clip
// applies edge coverage twice and punches a translucent ring into opaque pixels.
export function restoreRegion(target,source,left,top,x,y,radius){
 const dst=target.data,src=source.data;
 for(let row=0;row<target.height;row++)for(let col=0;col<target.width;col++){
  const coverage=Math.max(0,Math.min(1,radius+.5-Math.hypot(left+col+.5-x,top+row+.5-y)));
  if(!coverage)continue;
  const d=(row*target.width+col)*4,s=((top+row)*source.width+left+col)*4;
  if(coverage===1){dst[d]=src[s];dst[d+1]=src[s+1];dst[d+2]=src[s+2];dst[d+3]=src[s+3];continue;}
  const a=dst[d+3]*(1-coverage),b=src[s+3]*coverage,alpha=a+b;
  for(let channel=0;channel<3;channel++)dst[d+channel]=alpha?(dst[d+channel]*a+src[s+channel]*b)/alpha:0;
  dst[d+3]=alpha;
 }
 return target;
}

export function restoreStamp(ctx,original,x,y,radius){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(radius)||radius<=0)return;
 const left=Math.max(0,Math.floor(x-radius-1)),top=Math.max(0,Math.floor(y-radius-1));
 const width=Math.min(ctx.canvas.width,Math.ceil(x+radius+1))-left,height=Math.min(ctx.canvas.height,Math.ceil(y+radius+1))-top;
 if(width<=0||height<=0)return;
 let source=originals.get(original);
 if(!source){source=original.getContext('2d').getImageData(0,0,original.width,original.height);originals.set(original,source);}
 const target=ctx.getImageData(left,top,width,height);
 restoreRegion(target,source,left,top,x,y,radius);ctx.putImageData(target,left,top);
}
