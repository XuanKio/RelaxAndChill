import test from 'node:test';
import assert from 'node:assert/strict';
import {createGroomingAudio} from '../public/grooming-audio.js';
test('both modes purr, brushing also brushes, and mute stops every track',()=>{
 const tracks=[];
 globalThis.document={createElement:()=>({dataset:{},volume:0,paused:true,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}}),body:{append:a=>tracks.push(a)}};
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){}};
 try{const button={setAttribute(){}};const audio=createGroomingAudio(button);
 audio.prime('brush');audio.tick('brush',true,70,.1);assert.ok(tracks.every(t=>!t.paused&&t.volume>0));
 audio.prime('pet');audio.tick('pet',true,70,.1);assert.equal(tracks[0].paused,true);assert.equal(tracks[1].paused,false);assert.ok(tracks[1].volume>0);
 button.onclick();assert.ok(tracks.every(t=>t.paused&&t.volume===0));audio.prime('brush');assert.ok(tracks.every(t=>t.paused));
 }finally{delete globalThis.document;delete globalThis.window;delete globalThis.localStorage;}
});
