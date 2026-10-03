import test from 'node:test';
import assert from 'node:assert/strict';
import { packScene, unpackScene, validateScene, MAX_LINK_DATA } from '../dist/share.js';
import { PRESETS } from '../dist/assets.js';
test('a shared preset round-trips with Unicode names and settings', async () => {
  const input = { ...PRESETS.mochi, name: 'Mèo của Xuân 🐾', flip: true, size: 90 }; const encoded = await packScene(input); assert.deepEqual(await unpackScene(encoded), input);
});
test('custom raster data is preserved in the share schema', async () => {
  const input = { ...PRESETS.mochi, cat: 'data:image/webp;base64,UklGRg==' }; assert.deepEqual(await unpackScene(await packScene(input)), input);
});
test('unsafe URLs, wrong asset types, and invalid ranges are rejected', () => {
  for (const patch of [{ cat: 'https://example.com/image.png' }, { cat: 'data:image/svg+xml,<svg/>' }, { tool: 'cat.mochi' }, { size: 200 }, { bg: '__proto__' }, { mode: 'unknown' }]) assert.throws(() => validateScene({ ...PRESETS.mochi, ...patch }));
});
test('malformed and excessive share links fail safely', async () => {
  await assert.rejects(unpackScene('g$bad')); await assert.rejects(unpackScene('xabc')); await assert.rejects(unpackScene('j' + 'a'.repeat(MAX_LINK_DATA)));
});
