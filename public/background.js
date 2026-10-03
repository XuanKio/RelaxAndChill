/** Lightweight color-based segmentation. No trained model and no network calls. */
export function removeConnectedBackground({ data, width, height, tolerance = 38, seed = null }) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || data.length !== width * height * 4) {
    throw new Error('Invalid RGBA image dimensions');
  }
  if (!Number.isFinite(tolerance) || tolerance < 1 || tolerance > 150) throw new Error('Invalid tolerance');
  if (seed && (!Number.isInteger(seed.x) || !Number.isInteger(seed.y) || seed.x < 0 || seed.x >= width || seed.y < 0 || seed.y >= height)) {
    throw new Error('Seed outside image');
  }
  const output = new Uint8ClampedArray(data);
  const boundary = [];
  for (let x = 0; x < width; x++) { boundary.push(x); if (height > 1) boundary.push((height - 1) * width + x); }
  for (let y = 1; y < height - 1; y++) { boundary.push(y * width); if (width > 1) boundary.push(y * width + width - 1); }
  let reference;
  if (seed) reference = Array.from(data.slice((seed.y * width + seed.x) * 4, (seed.y * width + seed.x) * 4 + 3));
  else {
    const bins = new Map();
    for (const pixel of boundary) {
      const i = pixel * 4; if (data[i + 3] < 16) continue;
      const key = (data[i] >> 5) * 64 + (data[i + 1] >> 5) * 8 + (data[i + 2] >> 5);
      const bin = bins.get(key) || { count: 0, rgb: [0, 0, 0] };
      bin.count++; for (let c = 0; c < 3; c++) bin.rgb[c] += data[i + c]; bins.set(key, bin);
    }
    if (!bins.size) return { data: output, removed: 0 };
    const dominant = [...bins.values()].sort((a, b) => b.count - a.count)[0];
    reference = dominant.rgb.map(c => c / dominant.count);
  }
  const distance = pixel => {
    const i = pixel * 4;
    return Math.hypot(data[i] - reference[0], data[i + 1] - reference[1], data[i + 2] - reference[2]) / Math.sqrt(3);
  };
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height); let head = 0, tail = 0, removed = 0;
  const enqueue = pixel => {
    if (seen[pixel]) return;
    seen[pixel] = 1;
    if (data[pixel * 4 + 3] < 16 || distance(pixel) <= tolerance) queue[tail++] = pixel;
  };
  if (seed) enqueue(seed.y * width + seed.x); else boundary.forEach(enqueue);
  while (head < tail) {
    const p = queue[head++], x = p % width, y = Math.floor(p / width);
    if (output[p * 4 + 3]) removed++; output[p * 4 + 3] = 0;
    if (x) enqueue(p - 1); if (x + 1 < width) enqueue(p + 1);
    if (y) enqueue(p - width); if (y + 1 < height) enqueue(p + width);
  }
  return { data: output, removed };
}

export function alphaBounds(data, width, height) {
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] < 10) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}
