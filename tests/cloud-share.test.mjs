import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/share-worker.js';
import {PRESETS} from '../public/assets.js';
test('cloud scenes are immutable, validated, deduplicated and readable',async()=>{
 const map=new Map(),env={BUCKET:{head:async k=>map.has(k),put:async(k,v)=>map.set(k,v),get:async k=>map.has(k)?{text:async()=>map.get(k)}:null}};
 const post=value=>worker.fetch(new Request('https://api/scenes',{method:'POST',headers:{Origin:'https://xuankio.github.io','Content-Type':'application/json'},body:JSON.stringify(value)}),env);
 const first=await post(PRESETS.mochi);assert.equal(first.status,201);const {id}=await first.json();assert.match(id,/^[A-Za-z0-9_-]{16}$/);
 assert.equal((await (await post(PRESETS.mochi)).json()).id,id);assert.equal(map.size,1);
 const get=await worker.fetch(new Request('https://api/scenes/'+id),env);assert.deepEqual(await get.json(),PRESETS.mochi);
 assert.equal((await worker.fetch(new Request('https://api/scenes/'+id,{method:'PUT',body:'{}'}),env)).status,404);
 assert.equal((await post({...PRESETS.mochi,cat:'https://bad.test/x.png'})).status,400);
 assert.equal((await worker.fetch(new Request('https://api/scenes',{method:'POST',body:'{}'}),env)).status,403);
});
