import { validateToolStyle } from './tool-style.js';
import { ASSETS, COLORS } from './assets.js?v=20261004-comb';
export const MAX_LINK_DATA = 62000;
const MAX_JSON = 78000;
const imagePattern = /^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/;
export function validateScene(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.v !== 1) throw new Error('Link này không đúng định dạng.');
  const image = (item, type) => {
    if (typeof item !== 'string') throw new Error('Ảnh trong link không hợp lệ.');
    if (Object.hasOwn(ASSETS, item) && ASSETS[item].type === type) return item;
    if (item.length < 26000 && imagePattern.test(item)) return item;
    throw new Error('Ảnh trong link không được hỗ trợ.');
  };
  const bounded = (number, min, max) => {
    if (!Number.isFinite(number) || number < min || number > max) throw new Error('Thiết lập trong link không hợp lệ.');
    return number;
  };
  if (!['brush', 'pet'].includes(value.mode) || !Object.hasOwn(COLORS, value.bg) || typeof value.flip !== 'boolean') throw new Error('Chế độ trong link không hợp lệ.');
  if(value.background!==undefined&&(typeof value.background!=='string'||value.background.length>=26000||!imagePattern.test(value.background)))throw new Error('Ảnh nền trong link không hợp lệ.');
  const subjectScale=value.subjectScale===undefined?{}:{subjectScale:bounded(value.subjectScale,.4,1.6)};
  return { v: 1, name: typeof value.name === 'string' ? value.name.slice(0, 30) : 'Bạn nhỏ', cat: image(value.cat, 'cat'), tool: image(value.tool, 'tool'), mode: value.mode, bg: value.bg, size: bounded(value.size, 35, 120), soft: bounded(value.soft, 10, 100), flip: value.flip, ...(value.toolStyle === undefined ? {} : { toolStyle: validateToolStyle(value.toolStyle) }),...(value.background===undefined?{}:{background:value.background}),...subjectScale };
}
function encode(bytes) { let raw = ''; for (const b of bytes) raw += String.fromCharCode(b); return btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); }
function decode(text) { if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('Link bị thiếu hoặc hỏng.'); return Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), x => x.charCodeAt(0)); }
export async function packScene(input) {
  const scene = validateScene(input), bytes = new TextEncoder().encode(JSON.stringify(scene));
  if (bytes.length > MAX_JSON) throw new Error('Ảnh quá lớn để tạo link. Hãy chọn ảnh đơn giản hơn.');
  let result;
  if (typeof CompressionStream === 'function') {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
    result = 'g' + encode(new Uint8Array(await new Response(stream).arrayBuffer()));
  } else result = 'j' + encode(bytes);
  if (result.length > MAX_LINK_DATA) throw new Error('Link quá dài. Hãy dùng ảnh nhỏ hơn.');
  return result;
}
export async function unpackScene(text) {
  if (typeof text !== 'string' || text.length > MAX_LINK_DATA || text.length < 2) throw new Error('Link quá dài hoặc không hợp lệ.');
  const bytes = decode(text.slice(1)); let content;
  if (text[0] === 'g') {
    if (typeof DecompressionStream !== 'function') throw new Error('Cần trình duyệt mới hơn để mở link này.');
    const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
    const chunks = []; let size = 0;
    try {
      while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > MAX_JSON) throw new Error('Dữ liệu trong link quá lớn.'); chunks.push(value); }
    } catch (error) { await reader.cancel().catch(() => {}); throw error; }
    const combined = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; } content = new TextDecoder().decode(combined);
  } else if (text[0] === 'j') { if (bytes.length > MAX_JSON) throw new Error('Dữ liệu quá lớn.'); content = new TextDecoder().decode(bytes); }
  else throw new Error('Phiên bản link không được hỗ trợ.');
  return validateScene(JSON.parse(content));
}
export function sceneURL(packed) { const url = new URL('./create.html', location.href); url.hash = 'play=' + packed; return url.href; }

/** Export a bounded raster copy. Never upload private images to the repository. */
export function smallImage(source, bounds = null, maxSide = 256) {
  const area = bounds || { x: 0, y: 0, width: source.width, height: source.height };
  for (const size of [maxSide, 192, 144, 96]) {
    const scale = Math.min(1, size / Math.max(area.width, area.height)); const output = document.createElement('canvas'); output.width = Math.max(1, Math.round(area.width * scale)); output.height = Math.max(1, Math.round(area.height * scale));
    output.getContext('2d').drawImage(source, area.x, area.y, area.width, area.height, 0, 0, output.width, output.height);
    const data = output.toDataURL('image/webp', 0.62);
    if (imagePattern.test(data) && data.length < 19000) return data;
  }
  throw new Error('Không thu nhỏ được ảnh. Hãy thử ảnh khác.');
}
