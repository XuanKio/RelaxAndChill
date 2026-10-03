import test from 'node:test';
import assert from 'node:assert/strict';
import { subjectMask } from '../public/segmentation.js';
test('holding one subject excludes a disconnected foreground object',()=>{
 const values=new Float32Array(100*100);for(let y=10;y<30;y++)for(let x=10;x<30;x++)values[y*100+x]=1;for(let y=65;y<85;y++)for(let x=65;x<85;x++)values[y*100+x]=.8;
 const mask=subjectMask(values,100,100,{x:20,y:20});assert.equal(mask[20*100+20],1);assert.equal(mask[70*100+70],0);assert.equal(mask[0],0);
});
test('empty predictions and holding far from a subject are recoverable errors',()=>{
 assert.throws(()=>subjectMask(new Float32Array(100),10,10));const values=new Float32Array(10000);values[0]=1;assert.throws(()=>subjectMask(values,100,100,{x:99,y:99}));
});
