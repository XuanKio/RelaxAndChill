import test from 'node:test';
import assert from 'node:assert/strict';
import { createGrooming, tickGrooming, springFactor } from '../public/grooming.js';
test('a one-second pause drains progress smoothly in both modes',()=>{
 for(const mode of ['pet','brush']){
  const simulate=fps=>{let s={...createGrooming(mode),comfort:50};for(let i=0;i<fps*3;i++)s=tickGrooming(s,{dt:1/fps});return s;};
  assert.ok(Math.abs(simulate(30).comfort-26)<1e-8);assert.ok(Math.abs(simulate(60).comfort-26)<1e-8);
  let s={...createGrooming(mode),comfort:50};for(let i=0;i<9;i++)s=tickGrooming(s,{dt:.1});assert.equal(s.comfort,50);
  s=tickGrooming(s,{dt:.1,distance:.05,active:true,contact:true});assert.ok(s.comfort>50);assert.equal(s.idle,0);
  s={...s,comfort:100,completed:true};assert.equal(tickGrooming(s,{dt:.1}).comfort,100);
 }
});
test('stationary, outside, and released pointers do not score', () => {
  const initial = createGrooming();
  for (const input of [{ dt: .02, active: true, contact: true }, { dt: .02, distance: .01, active: true }, { dt: .02, distance: .01, contact: true }]) assert.equal(tickGrooming(initial, input).comfort, 0);
});
test('gentle movement rewards more than a fast sweep and never exceeds 100', () => {
  const s = createGrooming(); const slow = tickGrooming(s, { dt: .1, distance: .1, active: true, contact: true }); const fast = tickGrooming(s, { dt: .01, distance: .1, active: true, contact: true });
  assert.ok(slow.comfort > fast.comfort); assert.equal(fast.reaction, 'fast'); assert.equal(s.comfort, 0);
  let next = s; for (let i = 0; i < 500; i++) next = tickGrooming(next, { dt: .05, distance: .05, active: true, contact: true }); assert.equal(next.comfort, 100); assert.equal(next.completed, true);
});
test('equivalent 30fps and 60fps movements have equal progress', () => {
  const simulate = fps => { let s = createGrooming(); for (let i = 0; i < fps; i++) s = tickGrooming(s, { dt: 1 / fps, distance: .5 / fps, active: true, contact: true }); return s; };
  assert.ok(Math.abs(simulate(30).comfort - simulate(60).comfort) < 1e-10);
  assert.ok(Math.abs((1 - springFactor(.5)) ** 2 - (1 - springFactor(1))) < 1e-10);
});
