import { readFileSync, existsSync } from 'node:fs';
import { ASSETS } from '../dist/assets.js';
for (const [key, asset] of Object.entries(ASSETS)) {
  if (!/^(assets\/)?[a-z0-9-]+\.png$/.test(asset.src)) throw new Error(`Unsafe asset path: ${key}`);
  const file = `dist/${asset.src}`;
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
  const bytes = readFileSync(file);
  if (bytes.subarray(1, 4).toString() !== 'PNG') throw new Error(`Expected PNG: ${key}`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (width > 4096 || height > 4096 || bytes.length > 8 * 1024 * 1024) throw new Error(`Oversized asset: ${key}`);
  if (asset.contact?.some(x => !Number.isFinite(x) || x < 0 || x > 1)) throw new Error(`Invalid contact: ${key}`);
  console.log(`${key}: ${width}×${height}, ${Math.round(bytes.length / 1024)} KB`);
}
