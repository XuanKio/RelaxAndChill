import * as ort from './vendor/ort.wasm.min.mjs';
import { subjectMask } from './segmentation.js';
ort.env.wasm.numThreads=1;
ort.env.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;
let session;
self.onmessage=async({data:{buffer,width,height,seed}})=>{
 try{
  self.postMessage({status:'Đang chuẩn bị tách nền…'});
  session ||= await ort.InferenceSession.create(new URL('./models/u2netp.onnx',import.meta.url).href,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  const original=new ImageData(new Uint8ClampedArray(buffer),width,height),source=new OffscreenCanvas(width,height);source.getContext('2d').putImageData(original,0,0);
  const small=new OffscreenCanvas(320,320),c=small.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,320,320);c.drawImage(source,0,0,320,320);
  const pixels=c.getImageData(0,0,320,320).data,input=new Float32Array(3*320*320),means=[.485,.456,.406],std=[.229,.224,.225];let max=1;
  for(let i=0;i<pixels.length;i+=4)for(let channel=0;channel<3;channel++)max=Math.max(max,pixels[i+channel]);
  for(let i=0;i<320*320;i++)for(let channel=0;channel<3;channel++)input[channel*320*320+i]=(pixels[i*4+channel]/max-means[channel])/std[channel];
  self.postMessage({status:'Đang nhấc chủ thể…'});
  const result=await session.run({[session.inputNames[0]]:new ort.Tensor('float32',input,[1,3,320,320])});
  const mask=subjectMask(result[session.outputNames[0]].data,320,320,seed?{x:seed.x/width*320,y:seed.y/height*320}:null);
  const rgba=new Uint8ClampedArray(320*320*4);for(let i=0;i<mask.length;i++){rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=255;rgba[i*4+3]=Math.round(Math.max(0,Math.min(1,(mask[i]-.025)/.95))*255);}
  c.putImageData(new ImageData(rgba,320,320),0,0);const full=new OffscreenCanvas(width,height),fc=full.getContext('2d');fc.drawImage(small,0,0,width,height);const alpha=fc.getImageData(0,0,width,height).data;
  for(let i=0;i<original.data.length;i+=4)original.data[i+3]=Math.round(original.data[i+3]*alpha[i+3]/255);
  self.postMessage({buffer:original.data.buffer,width,height},[original.data.buffer]);
 }catch(error){self.postMessage({error:error.message||'Không tách được ảnh. Hãy dùng cọ sửa.'});}
};
