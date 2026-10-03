import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
function section(start,end){
 const from=source.indexOf(start),to=source.indexOf(end,from);
 assert.ok(from>=0&&to>from,`Editor source contains ${start}`);
 return source.slice(from,to);
}
// Exercise the production lifecycle without booting the unrelated editor UI.
const lifecycle=[
 section('function checkpoint()','function updateButtons()'),
 section('function release()','const titles ='),
 section('function interruptStroke(){','const navigation='),
 section('canvas.onpointerdown =','canvas.onpointermove ='),
 source.match(/window\.addEventListener\('blur', release\);/)[0],
].join('\n');

function editor(step=2){
 let pixel=7,restores=0;
 const context2d={getImageData:()=>({pixel}),putImageData:data=>{pixel=data.pixel;restores++;}};
 const image={width:1,height:1,getContext:()=>context2d};
 const state={step,image,background:image,history:[],bgHistory:[],catKey:'cat.tabby',method:'manual',tool:'erase',busy:false,sampling:false,selection:null};
 const elements=new Map();
 const $=id=>{if(!elements.has(id))elements.set(id,{classList:{remove(){},add(){}},hidden:false,disabled:false});return elements.get(id);};
 const canvas={setPointerCapture(){},focus(){}};
 const window=new EventTarget();
 const sandbox={state,canvas,window,$,clearTimeout,sounds:{stop(){}},
  editImage:()=>image,editHistory:()=>step===5?state.bgHistory:state.history,
  measure:()=>{$('undo').disabled=!(step===5?state.bgHistory:state.history).length;},
  point:e=>({x:e.clientX,y:e.clientY}),toImage:p=>({...p,inside:true}),backgroundPoint:p=>({...p,inside:true}),
  brush:()=>{pixel=99;},
 };
 vm.createContext(sandbox);
 vm.runInContext('let strokeUndo=null,drawing=false,pressed=false,pointerId=null,lastPoint=null,holdTimer=null,holdPoint=null,keyboard=false,travel=0,furCarry=0,dashAge=-1,pointer=null,dirty=false;\n'+lifecycle,sandbox);
 return {state,canvas,window,$,read:()=>({pixel,restores}),run:code=>vm.runInContext(code,sandbox),
  down:id=>canvas.onpointerdown({button:0,pointerId:id,clientX:1,clientY:1,preventDefault(){}})};
}

for(const step of [2,5])test(`canceling a stroke preserves all six undo states and identity in editor step ${step}`,()=>{
 const app=editor(step),history=step===5?app.state.bgHistory:app.state.history;
 const previous=Array.from({length:6},(_,pixel)=>({pixel}));
 history.push(...previous);
 app.down(1);
 assert.equal(app.read().pixel,99,'first contact actually begins a stroke');
 app.run('interruptStroke()');
 assert.equal(app.read().pixel,7,'navigation rolls back only its first contact');
 assert.equal(history.length,6);
 previous.forEach((snapshot,index)=>assert.equal(history[index],snapshot,'oldest history entry survives cancellation'));
 assert.equal(app.state.catKey,'cat.tabby');
 assert.equal(app.$('undo').disabled,false);
 assert.equal(app.run('strokeUndo'),null);
});

test('blur completes the current stroke and later selection navigation cannot roll it back',()=>{
 const app=editor();
 app.down(1);
 app.window.dispatchEvent(new Event('blur'));
 assert.equal(app.run('strokeUndo'),null,'blur must discard the pending rollback snapshot');
 assert.equal(app.read().pixel,99,'blur preserves the completed brush mark');
 const checkpoint=app.state.history[0];
 app.state.tool='select';
 app.down(2);
 assert.ok(app.state.selection,'a new selection starts after blur');
 app.run('interruptStroke()');
 assert.equal(app.read().pixel,99,'navigation must not undo the earlier brush mark');
 assert.equal(app.read().restores,0);
 assert.equal(app.state.history.length,1);
 assert.equal(app.state.history[0],checkpoint);
 assert.equal(app.state.selection,null);
});
