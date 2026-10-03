// One stamp, used by the interpolated pointer stroke and all brush shapes.
export function paintStamp(ctx, x, y, radius, {shape = 'round', color = '#ef7293', opacity = 1} = {}) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity)) * (shape === 'marker' ? .25 : 1);
  ctx.fillStyle = color;
  if (shape === 'soft') {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color); gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
  }
  if (shape === 'marker') ctx.fillRect(x - radius, y - radius * .4, radius * 2, radius * .8);
  else { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
