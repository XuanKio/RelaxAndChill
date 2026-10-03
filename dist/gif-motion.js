export const GIF_SIZE = 400, GIF_FRAMES = 40, GIF_DELAY = 80;
export function gifPose(index, mode, softness = .5) {
  const phase = (index % GIF_FRAMES) / GIF_FRAMES * Math.PI * 2;
  const stroke = phase * 2;
  return { x: Math.sin(stroke) * (mode === 'pet' ? 35 : 105),
    y: Math.cos(stroke) * (mode === 'pet' ? 8 : 20),
    squash: (1 - Math.cos(stroke)) * .045 * softness,
    angle: Math.sin(stroke) * .045, frame: Math.floor((index % 20) / 2) };
}
