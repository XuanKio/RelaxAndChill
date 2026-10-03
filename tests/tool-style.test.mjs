import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TOOL_STYLE, tintPixels, validateToolStyle } from '../dist/tool-style.js';
import { PRESETS } from '../dist/assets.js';
import { packScene, unpackScene, validateScene } from '../dist/share.js';

test('neutral tool colors preserve pixels including transparent edges', () => {
  const pixels=new Uint8ClampedArray([180,120,40,255, 40,100,200,70, 230,210,200,0]);
  assert.deepEqual(tintPixels(pixels,DEFAULT_TOOL_STYLE),pixels);
});
test('color edits preserve alpha and do not mutate the uploaded image', () => {
  const pixels=new Uint8ClampedArray([100,80,60,90, 240,230,220,0]);
  const edited=tintPixels(pixels,{brightness:120,hue:10,saturation:80});
  assert.equal(edited[3],90);assert.equal(edited[7],0);
  assert.notEqual(edited[0],pixels[0]);assert.equal(pixels[0],100);
});
test('custom tool appearance survives a share round trip and old links stay unchanged', async () => {
  const scene={...PRESETS.tabby,toolStyle:{rotation:-75,hue:12,saturation:85,brightness:110}};
  assert.deepEqual(await unpackScene(await packScene(scene)),scene);
  assert.deepEqual(validateScene(PRESETS.tabby),PRESETS.tabby);
});
test('reject invalid tool appearance in untrusted share links', () => {
  for(const style of [null,[],{rotation:181},{hue:NaN},{brightness:1000},{saturation:'100'}]){
    assert.throws(()=>validateToolStyle(style));
    assert.throws(()=>validateScene({...PRESETS.mochi,toolStyle:style}));
  }
});
