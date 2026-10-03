import test from 'node:test';
import assert from 'node:assert/strict';
import {compactHash,readSceneHash,shareURL,siteRoot} from '../public/short-links.js';
import {PRESETS} from '../public/assets.js';
import {packScene} from '../public/share.js';
test('presets use readable short links on the player route',async()=>{
  assert.equal(compactHash(PRESETS.mochi),'#mochi');assert.equal(compactHash(PRESETS.tabby),'#muop');
  for(const path of ['create.html?edit','create/','p/'])assert.equal(await shareURL(PRESETS.mochi,'https://xuankio.github.io/RelaxAndChill/'+path),'https://xuankio.github.io/RelaxAndChill/p/#mochi');
});
test('all customized stock settings survive compact sharing',async()=>{
 const scene={...PRESETS.mochi,name:'Mèo 🐾',mode:'pet',tool:'tool.hand',bg:'cream',size:91,soft:70,flip:true,subjectScale:1.2,toolStyle:{rotation:30,hue:10,saturation:80,brightness:110}};
 assert.deepEqual(await readSceneHash(compactHash(scene)),scene);
});
test('invalid settings fail and old full links still work',async()=>{
 for(const hash of ['#mochi?s=999','#muop?x=2','#mochi?s=40&s=50','#mochi?unknown=1'])await assert.rejects(readSceneHash(hash));
 assert.deepEqual(await readSceneHash('#play='+await packScene(PRESETS.mochi)),PRESETS.mochi);
 assert.equal(compactHash({...PRESETS.mochi,cat:'data:image/webp;base64,UklGRg=='}),null);
});
