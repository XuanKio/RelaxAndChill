import test from 'node:test';
import assert from 'node:assert/strict';
import {restoreRegion,restoreStamp} from '../public/restore-brush.js';
const pixels=(width,height,rgba)=>({width,height,data:Uint8ClampedArray.from(Array.from({length:width*height},()=>rgba).flat())});
test('overlapping restore dabs never punch holes in an opaque image',()=>{
 const source=pixels(64,64,[150,90,40,255]),target=pixels(64,64,[150,90,40,255]);
 for(let i=0;i<100;i++)restoreRegion(target,source,0,0,15+i%20*1.4,30+Math.sin(i*.3)*5,8);
 assert.deepEqual(target.data,source.data);
});
test('restore recovers exact source RGB and alpha, including transparent source',()=>{
 for(const rgba of [[50,90,110,255],[200,80,20,128],[0,0,0,0]]){
  const source=pixels(9,9,rgba),target=pixels(9,9,[210,30,170,200]);restoreRegion(target,source,0,0,4.5,4.5,2);
  assert.deepEqual([...target.data.slice(160,164)],rgba);
  assert.deepEqual([...target.data.slice(0,4)],[210,30,170,200]);
 }
});
test('fractional restore edges converge to the original without exceeding source alpha',()=>{
 const source=pixels(8,8,[170,100,40,180]),target=pixels(8,8,[0,0,0,0]);
 for(let i=0;i<40;i++)restoreRegion(target,source,0,0,4.2,4.3,2.1);
 for(let i=3;i<target.data.length;i+=4)assert.ok(target.data[i]<=180);
 assert.equal(target.data[(4*8+4)*4+3],180);
});
test('bounded stamps ignore outside/invalid input and read original only once',()=>{
 let reads=0,writes=0;const original={getContext:()=>({getImageData:()=>{reads++;return pixels(10,10,[90,120,50,255]);}}),width:10,height:10};
 const ctx={canvas:{width:10,height:10},getImageData:(x,y,w,h)=>{assert.ok(x>=0&&y>=0&&x+w<=10&&y+h<=10);return pixels(w,h,[0,0,0,0]);},putImageData:()=>writes++};
 restoreStamp(ctx,original,-50,-50,2);restoreStamp(ctx,original,NaN,0,2);assert.equal(writes,0);
 restoreStamp(ctx,original,0,0,3);restoreStamp(ctx,original,9,9,3);assert.equal(writes,2);assert.equal(reads,1);
});
