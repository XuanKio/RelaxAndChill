export const ASSETS = Object.freeze({
  'cat.mochi': { src: 'assets/mochi.png', label: 'Mochi', type: 'cat' },
  'cat.tabby': { src: 'cat.png', label: 'Mướp', type: 'cat' },
  'tool.hand': { src: 'hand.png', label: 'Bàn tay', type: 'tool', contact: [0.48, 0.56], rotation: -1.35 },
  'tool.brush': { src: 'assets/brush.png', label: 'Lược chải', type: 'tool', contact: [0.26, 0.34] }
});
export const PRESETS = Object.freeze({
  mochi: { v: 1, name: 'Mochi', cat: 'cat.mochi', mode: 'brush', tool: 'tool.brush', bg: 'mint', size: 70, soft: 50, flip: false },
  tabby: { v: 1, name: 'Mướp', cat: 'cat.tabby', mode: 'pet', tool: 'tool.hand', bg: 'peach', size: 75, soft: 55, flip: false }
});
export const COLORS = Object.freeze({ mint: '#cde8dc', peach: '#f5d6c7', blue: '#cbdff0', cream: '#f4e8cf', lilac: '#dcd7ef' });
