import test from 'node:test';
import assert from 'node:assert/strict';
import { removeConnectedBackground, alphaBounds } from '../dist/background.js';
function fixture(rows) {
  const colors = { '.': [250, 250, 250, 255], '#': [25, 35, 45, 255], ' ': [0, 0, 0, 0] };
  return { width: rows[0].length, height: rows.length, data: new Uint8ClampedArray(rows.join('').split('').flatMap(x => colors[x])) };
}
test('automatic mode removes edge background and preserves an enclosed same-color detail', () => {
  const input = fixture(['.....', '.###.', '.#.#.', '.###.', '.....']);
  const result = removeConnectedBackground(input);
  assert.equal(result.removed, 16); assert.equal(result.data[(2 * 5 + 2) * 4 + 3], 255);
  assert.equal(input.data[3], 255); // The undo source stays untouched.
  assert.deepEqual(alphaBounds(result.data, 5, 5), { x: 1, y: 1, width: 3, height: 3 });
});
test('sampled background only removes its connected region', () => {
  const result = removeConnectedBackground({ ...fixture(['..#..', '..#..', '..#..']), seed: { x: 0, y: 0 } });
  assert.equal(result.removed, 6); assert.equal(result.data[(4 * 4) + 3], 255);
});
test('transparent input remains transparent without errors', () => {
  const input = fixture(['   ', '   ']); const result = removeConnectedBackground(input);
  assert.equal(result.removed, 0); assert.equal(alphaBounds(result.data, 3, 2), null);
});
test('a one-pixel-wide image has valid boundary handling', () => {
  const result = removeConnectedBackground(fixture(['.', '#', '.']));
  assert.equal(result.removed, 2); assert.equal(result.data[7], 255);
});
test('invalid dimensions and out-of-bounds seeds are rejected', () => {
  assert.throws(() => removeConnectedBackground({ data: new Uint8ClampedArray(3), width: 1, height: 1 }));
  assert.throws(() => removeConnectedBackground({ ...fixture(['..']), seed: { x: -1, y: 0 } }));
});
