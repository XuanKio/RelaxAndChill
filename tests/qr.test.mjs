import test from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import QRCode from '../public/vendor/qrcode.esm.js';

test('shipped QR encoder creates scannable short and near-capacity links',()=>{
  for(const payload of ['https://xuankio.github.io/RelaxAndChill/create.html#preset=mochi','https://xuankio.github.io/RelaxAndChill/create.html#play=g'+'Abc123_-'.repeat(270)]){
    const qr=QRCode.create(payload,{errorCorrectionLevel:'L'}),size=(qr.modules.size+8)*4;
    const rgba=new Uint8ClampedArray(size*size*4).fill(255);
    for(let y=0;y<qr.modules.size;y++)for(let x=0;x<qr.modules.size;x++)if(qr.modules.get(y,x)){
      for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++){
        const index=(((y+4)*4+dy)*size+(x+4)*4+dx)*4;
        rgba[index]=36;rgba[index+1]=76;rgba[index+2]=62;
      }
    }
    assert.equal(jsQR(rgba,size,size)?.data,payload);
  }
});
