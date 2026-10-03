/** Keep the detected foreground component nearest the held point. */
export function subjectMask(values, width, height, seed = null) {
  let min = Infinity, max = -Infinity;
  for (const value of values) { min = Math.min(min, value); max = Math.max(max, value); }
  if (!Number.isFinite(min) || max-min < .00001) throw new Error('Không thấy chủ thể rõ. Hãy dùng cọ sửa.');
  const normalized = Float32Array.from(values, v => (v-min)/(max-min));
  if (!seed) return normalized;
  let start = -1, nearest = Infinity;
  for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=y*width+x; if(normalized[i]<.35)continue;
    const d=(x-seed.x)**2+(y-seed.y)**2; if(d<nearest){nearest=d;start=i;}
  }
  if(start<0 || nearest > (Math.min(width,height)*.15)**2) throw new Error('Giữ vào giữa chủ thể nhé.');
  const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=1;queue[0]=start;seen[start]=1;
  const add=i=>{if(!seen[i]&&normalized[i]>.06){seen[i]=1;queue[tail++]=i;}};
  while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);if(x)add(p-1);if(x+1<width)add(p+1);if(y)add(p-width);if(y+1<height)add(p+width);}
  return normalized.map((v,i)=>seen[i]?v:0);
}
