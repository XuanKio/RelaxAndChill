import test from 'node:test';
import assert from 'node:assert/strict';
import {FAREWELLS,chooseFarewell,farewellPose,drawFarewell} from '../public/farewell.js';
test('all five departures are reachable without repeating the last one',()=>{
 assert.equal(new Set(Array.from({length:5},(_,i)=>chooseFarewell(null,()=>i/5))).size,5);
 for(const previous of FAREWELLS)for(const n of [0,.2,.5,.9,.999])assert.notEqual(chooseFarewell(previous,()=>n),previous);
});
test('all departures finish, reappear, and suppress travel with reduced motion',()=>{
 for(const type of FAREWELLS){assert.equal(farewellPose(type,2.5).alpha,0);assert.equal(farewellPose(type,3.2).returnAlpha,1);assert.equal(farewellPose(type,2,true).exit,0);assert.equal(farewellPose(type,2,true).wave,0);}
});
test('every departure renders finite coordinates with different subject shapes',()=>{
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get(o,k){return o[k]||((...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));});},set(o,k,v){o[k]=v;return true;}});
 for(const type of FAREWELLS)for(const bounds of [{x:0,y:0,width:480,height:370},{x:0,y:0,width:120,height:900}])for(const age of [0,.5,1.4,2.5,3.2])drawFarewell(ctx,{type,age,reduced:false,image:{},bounds,fit:{x:100,y:150,w:700,h:600},scooter:{width:800,height:500},skate:{width:900,height:220},viewWidth:900});
});
