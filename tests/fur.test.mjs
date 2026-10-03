import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleCoat, furCount, makeFur, advanceFur } from '../public/fur.js';

test('fur keeps the contacted coat color and ignores transparent background', () => {
  const data = new Uint8ClampedArray([180,100,40,255, 255,255,255,0, 40,35,30,255]);
  assert.deepEqual(sampleCoat(data,3,1,0,0),[180,100,40]);
  assert.deepEqual(sampleCoat(data,3,1,2,0),[40,35,30]);
  assert.equal(sampleCoat(data,3,1,1,0,()=>.5),null);
});

test('fur requires moving contact, respects pool limit and accumulates small strokes', () => {
  for (const [distance,active,contact] of [[0,true,true],[.1,false,true],[.1,true,false]]) {
    assert.equal(furCount(.5,distance,active,contact).count,0);
  }
  assert.equal(furCount(0,.1,true,true,2).count,2);
  let carry=0,total=0;
  for(let i=0;i<10;i++){const next=furCount(carry,.01,true,true);carry=next.carry;total+=next.count;}
  assert.equal(total,furCount(0,.1,true,true).count);
});

test('fur lifts then falls, expires, and follows the same path at 30 and 120 Hz', () => {
  const simulate = hz => { const p=makeFur(50,50,[180,100,40],1,()=>.5);for(let i=0;i<hz;i++)advanceFur(p,1/hz);return p; };
  const slow=simulate(30),fast=simulate(120);
  assert.ok(slow.y>50);assert.ok(slow.vy>0);
  assert.ok(Math.abs(slow.x-fast.x)<.001);assert.ok(Math.abs(slow.y-fast.y)<.001);
  advanceFur(slow,2);assert.ok(slow.life<0);
});
