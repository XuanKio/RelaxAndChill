import test from 'node:test';
import assert from 'node:assert/strict';
import {stageSize,coverRect} from '../public/scene-layout.js';
import {gifPose,gifMoment,GIF_FRAMES,GIF_DELAY} from '../public/gif-motion.js';
import {packScene,unpackScene,validateScene} from '../public/share.js';
import {PRESETS} from '../public/assets.js';
import {dashPose,riderLayout,DASH_DURATION} from '../public/dash.js';
test('full-stage coordinates preserve aspect ratio and the 900-unit short edge',()=>{
  for(const [w,h] of [[1000,600],[390,650],[320,200],[900,900]]){
    const size=stageSize(w,h);assert.equal(Math.min(size.width,size.height),900);
    assert.ok(Math.abs(size.width/size.height-w/h)<.002);
    const bg=coverRect(1600,800,size.width,size.height);
    assert.ok(bg.w>=size.width&&bg.h>=size.height);
    assert.equal(bg.x+bg.w/2,450);assert.equal(bg.y+bg.h/2,450);
  }
});
test('GIF motion loops exactly for both modes and stays bounded',()=>{
  for(const mode of ['pet','brush']){
    assert.deepEqual(gifPose(0,mode),gifPose(GIF_FRAMES,mode));
    for(let i=0;i<GIF_FRAMES;i++){const p=gifPose(i,mode);assert.ok(p.frame>=0&&p.frame<10);assert.ok(p.squash>=0&&p.squash<.1);assert.ok(Math.abs(p.x)<=105);}
  }
});
test('painted backgrounds survive sharing without permitting URLs or SVG',async()=>{
  const scene={...PRESETS.mochi,background:'data:image/webp;base64,UklGRg==',subjectScale:1.25};
  assert.deepEqual(await unpackScene(await packScene(scene)),scene);
  for(const background of ['https://example.com/a.png','data:image/svg+xml,<svg/>','cat.mochi','data:image/webp;base64,'+'A'.repeat(27000)])assert.throws(()=>validateScene({...scene,background}));
  for(const subjectScale of [0,2,NaN,Infinity,'1'])assert.throws(()=>validateScene({...scene,subjectScale}));
});
test('completed brushing dashes out and reduced motion uses a fade',()=>{
  assert.equal(dashPose(0).progress,0);assert.equal(dashPose(DASH_DURATION).progress,1);
  let previous=0;for(let age=0;age<DASH_DURATION;age+=.03){const pose=dashPose(age);assert.ok(pose.progress>=previous);assert.ok(pose.stretch>.8&&pose.stretch<1.2);previous=pose.progress;}
  assert.equal(dashPose(2.2,true).stretch,1);assert.equal(dashPose(2.2,true).alpha,0);
});
test('riders of different aspect ratios align to the same scooter seat',()=>{
  for(const bounds of [{width:480,height:379},{width:595,height:381},{width:100,height:900},{width:900,height:100}]){
    const r=riderLayout(bounds);assert.equal(r.y+r.h*.78,510);assert.equal(r.x+r.w/2,360);assert.ok(r.w<=260&&r.h<=270);assert.ok(Math.abs(r.w/r.h-bounds.width/bounds.height)<1e-8);
  }
});
test('GIF gives both modes a complete grooming, boarding and departure sequence',()=>{
  assert.equal(GIF_FRAMES*GIF_DELAY,8000);
  assert.equal(gifMoment(0).stage,'groom');
  assert.equal(gifMoment(59).stage,'groom');
  assert.deepEqual(gifMoment(60),{stage:'ride',progress:1,age:0});
  assert.ok(gifMoment(73).age>.8&&gifMoment(73).age<1.35);
  assert.ok(gifMoment(90).age>2.25);
  assert.ok(gifMoment(99).age>3&&gifMoment(99).age<DASH_DURATION);
});
