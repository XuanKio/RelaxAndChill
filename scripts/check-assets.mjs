import { readFileSync, existsSync } from 'node:fs';
import { ASSETS } from '../public/assets.js';
for (const [key, asset] of Object.entries(ASSETS)) {
  if (!/^(assets\/)?[a-z0-9-]+\.png$/.test(asset.src)) throw new Error(`Unsafe asset path: ${key}`);
  const file = `public/${asset.src}`;
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
  const bytes = readFileSync(file);
  if (bytes.subarray(1, 4).toString() !== 'PNG') throw new Error(`Expected PNG: ${key}`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (width > 4096 || height > 4096 || bytes.length > 8 * 1024 * 1024) throw new Error(`Oversized asset: ${key}`);
  if (asset.contact?.some(x => !Number.isFinite(x) || x < 0 || x > 1)) throw new Error(`Invalid contact: ${key}`);
  if (asset.sprite) {
    if (!/^assets\/[a-z0-9-]+\.png$/.test(asset.sprite)) throw new Error(`Unsafe sprite path: ${key}`);
    const strip = readFileSync(`public/${asset.sprite}`);
    if (strip.subarray(1, 4).toString() !== 'PNG' || !Number.isInteger(asset.frames) || asset.frames < 1 ||
        strip.readUInt32BE(16) !== width * asset.frames || strip.readUInt32BE(20) !== height || strip.length > 8 * 1024 * 1024) {
      throw new Error(`Invalid animation strip: ${key}`);
    }
  }
  console.log(`${key}: ${width}×${height}, ${Math.round(bytes.length / 1024)} KB`);
}
