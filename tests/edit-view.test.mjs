import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultView,viewPoint,screenPoint,anchoredView,pinchView,attachViewNavigation} from '../public/edit-view.js';
import {createGrooming,tickGrooming} from '../public/grooming.js';
const near=(a,b)=>{assert.ok(Math.abs(a.x-b.x)<1e-7);assert.ok(Math.abs(a.y-b.y)<1e-7);};
test('endless grooming keeps scoring and purring contact past full comfort, then decays on pause',()=>{
 for(const mode of ['brush','pet']){
  let state=createGrooming(mode);
  for(let i=0;i<3600;i++)state=tickGrooming(state,{dt:1/60,distance:.02,active:true,contact:true,endless:true});
  assert.equal(state.comfort,100);assert.equal(state.completed,false);assert.ok(state.strokes>400);assert.equal(state.reaction,'gentle');
  for(let i=0;i<120;i++)state=tickGrooming(state,{dt:1/60,endless:true});
  assert.ok(state.comfort<90);assert.equal(state.completed,false);
  const normal=tickGrooming({...state,comfort:99.9},{dt:1/60,distance:.02,active:true,contact:true});assert.equal(normal.completed,true);
 }
});
test('brush coordinates round trip through zoom, pan and rotation',()=>{
 for(const zoom of [.35,1,3,8])for(const angle of [-Math.PI,0,.4,Math.PI/2]){
  const view={zoom,angle,x:170,y:-90};
  for(const p of [{x:0,y:0},{x:450,y:450},{x:1200,y:-200}])near(viewPoint(screenPoint(p,view),view),p);
 }
});
test('zoom stays anchored under the pointer, including minimum and maximum limits',()=>{
 const view={zoom:2,angle:.7,x:40,y:-200},anchor={x:700,y:170},world=viewPoint(anchor,view);
 for(const zoom of [.01,.35,1,8,99]){const next=anchoredView(view,anchor,zoom);near(screenPoint(world,next),anchor);assert.ok(next.zoom>=.35&&next.zoom<=8);}
});
test('two fingers combine pan, rotation and scale without moving the touched image points',()=>{
 const view=defaultView(),a={x:350,y:450},b={x:550,y:450},nextA={x:500,y:200},nextB={x:500,y:600};
 const next=pinchView(view,a,b,nextA,nextB);near(screenPoint(a,next),nextA);near(screenPoint(b,next),nextB);assert.equal(next.zoom,2);assert.equal(next.angle,Math.PI/2);
});
test('navigation cancels a first-finger paint mark, suppresses remaining fingers and resumes cleanly',()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 globalThis.window=new EventTarget();globalThis.document=new EventTarget();
 const canvas=new EventTarget();canvas.setPointerCapture=()=>{};canvas.classList={add(){},remove(){}};
 let view=defaultView(),interrupts=0,paints=0;
 try{
  attachViewNavigation(canvas,{enabled:()=>true,point:e=>({x:e.clientX,y:e.clientY}),getView:()=>view,setView:v=>view=v,interrupt:()=>interrupts++});
  canvas.addEventListener('pointerdown',()=>paints++);
  const event=(type,id,x,y,extra={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,button:0,...extra});canvas.dispatchEvent(e);return e;};
  event('pointerdown',1,350,450);event('pointerdown',2,550,450);event('pointermove',2,750,450);
  assert.equal(paints,1);assert.equal(interrupts,1);assert.equal(view.zoom,2);
  event('pointerup',2,750,450);assert.ok(event('pointermove',1,300,400).defaultPrevented);
  event('pointerup',1,300,400);event('pointerdown',3,350,450);assert.equal(paints,2);event('pointerup',3,350,450);
  event('pointerdown',4,200,200,{pointerType:'mouse',button:2});event('pointermove',4,240,230,{pointerType:'mouse',button:2});
  assert.equal(paints,2);assert.equal(interrupts,2);event('pointerup',4,240,230,{pointerType:'mouse',button:2});
  const before=view.angle;event('pointerdown',5,200,200,{pointerType:'mouse',button:2,shiftKey:true});event('pointermove',5,300,200,{pointerType:'mouse',button:2,shiftKey:true});assert.notEqual(view.angle,before);
 }finally{globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
