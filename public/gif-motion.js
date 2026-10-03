export const GIF_SIZE = 400, GIF_FRAMES = 100, GIF_DELAY = 80, GIF_GROOM_FRAMES = 60;
export function gifMoment(index) {
  const frame = Math.max(0, Math.min(GIF_FRAMES - 1, index));
  return frame < GIF_GROOM_FRAMES
    ? { stage: 'groom', progress: frame / GIF_GROOM_FRAMES, age: 0 }
    : { stage: 'ride', progress: 1, age: (frame - GIF_GROOM_FRAMES) * GIF_DELAY / 1000 };
}
export function gifPose(index, mode, softness = .5) {
  const phase = (index % GIF_FRAMES) / GIF_FRAMES * Math.PI * 2;
  const stroke = phase * 2;
  return { x: Math.sin(stroke) * (mode === 'pet' ? 35 : 105),
    y: Math.cos(stroke) * (mode === 'pet' ? 8 : 20),
    squash: (1 - Math.cos(stroke)) * .045 * softness,
    angle: Math.sin(stroke) * .045, frame: Math.floor((index % 20) / 2) };
}
