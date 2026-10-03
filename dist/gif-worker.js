import { GIFEncoder, quantize, applyPalette } from './vendor/gifenc.esm.js';
import { GIF_SIZE, GIF_FRAMES, GIF_DELAY, gifPose } from './gif-motion.js';
import { drawFur } from './fur.js?v=20261004';
import { isolateHandFrames } from './hand-frames.js';
import { coverRect } from './scene-layout.js';
self.onmessage = ({data:s}) => {
  try {
    const canvas = new OffscreenCanvas(GIF_SIZE, GIF_SIZE), c = canvas.getContext('2d', {willReadFrequently:true});
    const gif = GIFEncoder();
    const handFrames=s.sprite?isolateHandFrames(s.sprite,(w,h)=>new OffscreenCanvas(w,h)):[];
    const b = s.bounds, scale = Math.min(760/b.width, 700/b.height)*(s.subjectScale??1), w=b.width*scale, h=b.height*scale;
    const x=(900-w)/2, y=(900-h)/2+25;
    const tw=s.size*(s.sprite?5.4:s.mode==='brush'?2.9:3), th=tw*s.hand.height/s.hand.width;
    // One palette prevents color shimmer and keeps the encoder's memory bounded.
    let palette;
    for(let i=0;i<GIF_FRAMES;i++) {
      const pose=gifPose(i,s.mode,s.soft/100);
      c.setTransform(GIF_SIZE/900,0,0,GIF_SIZE/900,0,0);c.fillStyle=s.background;c.fillRect(0,0,900,900);
      if(s.backdrop){const bg=coverRect(s.backdrop.width,s.backdrop.height,900,900);c.drawImage(s.backdrop,bg.x,bg.y,bg.w,bg.h);}
      c.save();c.translate(450,y+h);c.scale(1+pose.squash*.35,1-pose.squash);
      c.drawImage(s.image,b.x,b.y,b.width,b.height,x-450,-h,w,h);c.restore();
      if(s.mode==='brush'&&s.coat)for(let n=0;n<8;n++) {
        const age=((i+n*5)%GIF_FRAMES)/GIF_FRAMES;
        drawFur(c,{x:450+Math.sin(n*2.7)*100+age*35,y:y+h*.36+age*260,angle:n+age*2,
          life:(1-age)*.8,color:s.coat,length:17+n%3*4,bend:3,strands:3});
      }
      c.save();c.translate(470+pose.x,y+h*.3+pose.y);if(s.flip)c.scale(-1,1);
      c.rotate(s.rotation+pose.angle);
      if(s.sprite)c.drawImage(handFrames[pose.frame],-tw*s.anchor[0],-th*s.anchor[1],tw,th);
      else c.drawImage(s.hand,-tw*s.anchor[0],-th*s.anchor[1],tw,th);
      c.restore();
      const rgba=c.getImageData(0,0,GIF_SIZE,GIF_SIZE).data;
      palette ||= quantize(rgba,256);
      gif.writeFrame(applyPalette(rgba,palette),GIF_SIZE,GIF_SIZE,{palette,delay:GIF_DELAY,repeat:0});
      self.postMessage({progress:(i+1)/GIF_FRAMES});
    }
    gif.finish();const bytes=gif.bytes();self.postMessage({buffer:bytes.buffer},[bytes.buffer]);
  } catch(error) { self.postMessage({error:error.message}); }
  finally { s.image?.close();s.hand?.close();s.sprite?.close();s.backdrop?.close(); }
};
