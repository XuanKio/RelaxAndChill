export function coverRect(width,height,viewWidth,viewHeight) {
  const scale=Math.max(viewWidth/width,viewHeight/height);
  return {x:(900-width*scale)/2,y:(900-height*scale)/2,w:width*scale,h:height*scale,scale};
}
export function stageSize(width,height) {
  const scale=900/Math.max(1,Math.min(width,height));
  return {width:Math.round(width*scale),height:Math.round(height*scale)};
}
