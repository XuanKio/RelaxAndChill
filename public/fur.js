// Sample actual opaque pixels so orange, dark and white coats keep their own color.
export function sampleCoat(data, width, height, x, y, random = Math.random) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const px = Math.round(x + (attempt ? (random() - .5) * 18 : 0));
    const py = Math.round(y + (attempt ? (random() - .5) * 18 : 0));
    if (px < 0 || py < 0 || px >= width || py >= height) continue;
    const i = (py * width + px) * 4;
    if (data[i + 3] > 100) return [data[i], data[i + 1], data[i + 2]];
  }
  return null;
}

export function furCount(carry, distance, active, contact, capacity = 80) {
  if (!active || !contact || !Number.isFinite(distance) || distance <= 0) return { count: 0, carry: 0 };
  const total = carry + Math.min(distance, .15) * 110;
  return { count: Math.min(capacity, Math.floor(total)), carry: total % 1 };
}

export function makeFur(x, y, color, direction = 0, random = Math.random) {
  const duration = 1.5 + random() * .8;
  return { kind: 'fur', x, y, color, life: duration, duration, age: 0,
    vx: direction * 45 + (random() - .5) * 95, vy: -25 - random() * 45,
    angle: random() * Math.PI, spin: (random() - .5) * 3,
    length: 13 + random() * 13, bend: 2 + random() * 4, strands: 3 + Math.floor(random() * 3) };
}

export function advanceFur(p, dt) {
  // Analytic gravity and drag keep trajectories stable across refresh rates.
  const drag = Math.exp(-1.1 * dt);
  p.x += p.vx * (1 - drag) / 1.1;
  p.vx *= drag;
  p.y += p.vy * dt + 75 * dt * dt;
  p.vy += 150 * dt;
  p.angle += p.spin * dt; p.age += dt; p.life -= dt;
}

export function drawFur(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
  ctx.globalAlpha = Math.min(1, Math.max(0, p.life / .65)) * .9;
  ctx.lineCap = 'round';
  for (let strand = 0; strand < p.strands; strand++) {
    const offset = (strand - (p.strands - 1) / 2) * 2;
    const shade = (strand % 3 - 1) * 15;
    const rgb = p.color.map(c => Math.max(0, Math.min(255, c + shade)));
    const tip = p.length / 2 - (strand % 3) * 2.5;
    ctx.beginPath(); ctx.moveTo(offset - 2, -p.length / 2 + strand * 1.5);
    ctx.quadraticCurveTo(offset + p.bend + strand % 2, 0, offset + Math.sin(strand * 2) * 3, tip);
    ctx.strokeStyle = 'rgba(60,45,28,.10)'; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.strokeStyle = `rgb(${rgb.join(',')})`; ctx.lineWidth = .95; ctx.stroke();
  }
  ctx.restore();
}
