// Crop at native resolution before scaling so adjacent sprite pixels cannot bleed.
export function isolateHandFrames(strip, makeCanvas) {
  return Array.from({length:10},(_,i)=>{
    const frame=makeCanvas(112,112),c=frame.getContext('2d');
    c.drawImage(strip,i*112,0,112,112,0,0,112,112);
    return frame;
  });
}
