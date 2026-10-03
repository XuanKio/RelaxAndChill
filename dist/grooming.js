export function createGrooming(mode = 'brush') {
  return { mode, comfort: 0, strokes: 0, travel: 0, reaction: 'ready', completed: false };
}

/** Distance is in playfield widths; score only deliberate contact motion. */
export function tickGrooming(previous, { dt, distance = 0, contact = false, active = false }) {
  if (!Number.isFinite(dt) || dt <= 0 || !Number.isFinite(distance) || distance < 0) return { ...previous };
  const next = { ...previous }, elapsed = Math.min(dt, 0.1);
  if (!active || !contact || distance < 0.0001) { next.reaction = previous.completed ? 'happy' : 'ready'; return next; }
  const speed = distance / elapsed;
  const travel = Math.min(distance, elapsed * 1.8);
  next.travel += travel;
  next.strokes = Math.floor(next.travel / 0.16);
  next.reaction = speed > 3 ? 'fast' : 'gentle';
  next.comfort = Math.min(100, previous.comfort + travel * (previous.mode === 'brush' ? 32 : 26) * (speed > 3 ? 0.25 : 1));
  next.completed = next.comfort >= 100;
  if (next.completed) next.reaction = 'happy';
  return next;
}

export const springFactor = (dt, speed = 20) => 1 - Math.exp(-Math.max(0, dt) * speed);
