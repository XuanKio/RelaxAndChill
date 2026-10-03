const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export const defaultView=()=>({zoom:1,angle:0,x:0,y:0});
export function viewPoint(p,v){const x=(p.x-450-v.x)/v.zoom,y=(p.y-450-v.y)/v.zoom,c=Math.cos(v.angle),s=Math.sin(v.angle);return{x:450+x*c+y*s,y:450-x*s+y*c};}
export function screenPoint(p,v){const x=p.x-450,y=p.y-450,c=Math.cos(v.angle),s=Math.sin(v.angle);return{x:450+v.x+v.zoom*(x*c-y*s),y:450+v.y+v.zoom*(x*s+y*c)};}
export function anchoredView(v,anchor,zoom,angle=v.angle,destination=anchor){
 const world=viewPoint(anchor,v),next={...v,zoom:clamp(zoom,.35,8),angle:Math.atan2(Math.sin(angle),Math.cos(angle))};
 const mapped=screenPoint(world,next);next.x=clamp(next.x+destination.x-mapped.x,-4500,4500);next.y=clamp(next.y+destination.y-mapped.y,-4500,4500);return next;
}
export function pinchView(v,a,b,nextA,nextB){
 const center=(p,q)=>({x:(p.x+q.x)/2,y:(p.y+q.y)/2});
 const distance=Math.hypot(b.x-a.x,b.y-a.y);
 if(distance<4)return v;
 return anchoredView(v,center(a,b),v.zoom*Math.hypot(nextB.x-nextA.x,nextB.y-nextA.y)/distance,v.angle+Math.atan2(nextB.y-nextA.y,nextB.x-nextA.x)-Math.atan2(b.y-a.y,b.x-a.x),center(nextA,nextB));
}
export function applyView(ctx,v){ctx.translate(450+v.x,450+v.y);ctx.rotate(v.angle);ctx.scale(v.zoom,v.zoom);ctx.translate(-450,-450);}

// Navigation owns multi-touch until every finger lifts, so it never leaves a paint dot.
export function attachViewNavigation(canvas,{enabled,point,getView,setView,interrupt}){
 const contacts=new Map();let gesture=null,blocked=false;
 const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
 const begin=()=>{interrupt();canvas.classList.add('navigating');};
 const reset=()=>{contacts.clear();gesture=null;blocked=false;canvas.classList.remove('navigating');};
 const snapshot=()=>{const points=[...contacts.values()];gesture=points.length>=2?{kind:'pinch',view:{...getView()},a:points[0],b:points[1]}:null;};
 canvas.addEventListener('pointerdown',e=>{
  if(!enabled())return;
  const p=point(e);
  if(e.pointerType==='touch'){
   contacts.set(e.pointerId,p);canvas.setPointerCapture(e.pointerId);
   if(contacts.size>=2){if(!blocked)begin();blocked=true;snapshot();consume(e);}else if(blocked)consume(e);
  }else if(e.button===2||e.button===1){begin();blocked=true;gesture={kind:e.shiftKey?'rotate':'pan',id:e.pointerId,start:p,view:{...getView()}};canvas.setPointerCapture(e.pointerId);consume(e);}
 },true);
 canvas.addEventListener('pointermove',e=>{
  if(!enabled())return;
  const p=point(e);if(contacts.has(e.pointerId))contacts.set(e.pointerId,p);
  if(!blocked)return;consume(e);
  if(gesture?.kind==='pinch'){
   const points=[...contacts.values()];if(points.length>=2)setView(pinchView(gesture.view,gesture.a,gesture.b,points[0],points[1]));
  }else if(gesture?.id===e.pointerId){const g=gesture;
   setView(g.kind==='rotate'?anchoredView(g.view,{x:450,y:450},g.view.zoom,g.view.angle+(p.x-g.start.x)*.006):{...g.view,x:clamp(g.view.x+p.x-g.start.x,-4500,4500),y:clamp(g.view.y+p.y-g.start.y,-4500,4500)});
  }
 },true);
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{
  contacts.delete(e.pointerId);if(!blocked)return;consume(e);
  if(e.pointerType!=='touch'||!contacts.size)reset();else snapshot();
 },true);
 canvas.addEventListener('wheel',e=>{if(!enabled())return;e.preventDefault();interrupt();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?300:1),v=getView(),p=point(e);setView(e.shiftKey?anchoredView(v,p,v.zoom,v.angle+clamp(delta,-100,100)*.003):anchoredView(v,p,v.zoom*Math.exp(-clamp(delta,-200,200)*.002)));},{passive:false});
 canvas.addEventListener('contextmenu',e=>{if(enabled())e.preventDefault();});
 window.addEventListener('blur',reset);document.addEventListener('visibilitychange',reset);
 return {reset};
}
