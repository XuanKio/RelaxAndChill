import { DEFAULT_TOOL_STYLE, tintPixels, validateToolStyle } from './tool-style.js';
import { paintStamp } from './paint.js';
import { draftStore } from './draft.js';
import QRCode from './vendor/qrcode.esm.js';
import { createGifExport } from './gif-export.js';
import { isolateHandFrames } from './hand-frames.js';
import { coverRect, stageSize } from './scene-layout.js';
import { createGroomingAudio } from './grooming-audio.js';
import { dashPose, drawDashSmoke, drawScooterRide, DASH_DURATION } from './dash.js';
import { createToolCutout } from './tool-cutout.js';
import { alphaBounds } from './background.js';
import { ASSETS, COLORS, PRESETS } from './assets.js?v=20261004-comb105';
import { smallImage, packScene, unpackScene, sceneURL, validateScene } from './share.js?v=20261004-background';
import { createGrooming, tickGrooming, springFactor } from './grooming.js';
import { sampleCoat, furCount, makeFur, advanceFur, drawFur } from './fur.js?v=20261004';
let styledHand = null, styledSprite = null, styledFrames = [], toolLoadSequence = 0;
const modeTools = new Map();
let handSprite = null, furCarry = 0, petCycle = 0;
let grooming = createGrooming(), travel = 0, keyboard = false, smooth = {x:470,y:270}, particles = [], lastParticle = 0;
const $ = id => document.getElementById(id);
const homePreview = new URLSearchParams(location.search).has('home');
document.body.classList.toggle('home-preview',homePreview);
const sounds=createGroomingAudio($('toggle-sound'));
let dashAge=-1,engineFired=false,scooter=null;
const canvas = $('canvas'), ctx = canvas.getContext('2d'), SIDE = 900;
const state = { mode: 'brush', bg: 'mint', catKey: 'cat.tabby', toolKey: 'tool.brush', step: 1, reached: 1, original: null, image: null, bounds: null, hand: null, handOriginal: null, toolStyle: {...DEFAULT_TOOL_STYLE,rotation:105}, defaultHand: null, flip: false, method: 'auto', tool: 'erase', history: [], busy: false, count: 0, selection: null, sampling: false };
Object.assign(state,{background:null,bgOriginal:null,bgHistory:[],subjectScale:1});
let holdTimer = null, holdPoint = null, lastPanel = 1;
let dirty = true, drawing = false, pressed = false, pointerId = null, lastPoint = null, pointer = { x: 470, y: 270 }, energy = 0, phase = 0, autoUntil = 0, worker = null, workerTimer = null, loadSequence = 0;
const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const clone = c => { const n = makeCanvas(c.width, c.height); n.getContext('2d').drawImage(c, 0, 0); return n; };
const notify = message => { $('status').textContent = message; };
const imageData = () => state.image.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, state.image.width, state.image.height);
function measure() { if (!state.image) return; const data = imageData(); state.hitPixels = data.data; state.bounds = alphaBounds(data.data, data.width, data.height); dirty = true; updateButtons(); }
const editImage=()=>state.step===5?state.background:state.image;
const editHistory=()=>state.step===5?state.bgHistory:state.history;
function checkpoint() { if(state.step!==5)state.catKey=null;const c=editImage(),history=editHistory();history.push(c.getContext('2d').getImageData(0,0,c.width,c.height));if(history.length>6)history.shift();$('undo').disabled=false; }
function updateButtons() {
  $('undo').disabled=state.busy||!editHistory().length;
  for(const id of ['toggle-tools','close-tools','resume-play','save-edit','share','lift'])$(id).disabled=state.busy||!state.image;
  document.querySelectorAll('.steps button').forEach(b=>b.disabled=state.busy);
}
function fit() {
  if (!state.image) return null;
  const editing = state.step === 2;
  const source = editing ? { x: 0, y: 0, width: state.image.width, height: state.image.height } : state.bounds;
  if (!source) return null;
  const scale = Math.min((editing ? 820 : 760) / source.width, (editing ? 820 : 700) / source.height) * (editing?1:state.subjectScale);
  const w = source.width * scale, h = source.height * scale;
  return { x: (SIDE - w) / 2, y: editing ? (SIDE - h) / 2 : (SIDE - h) / 2 + 25, w, h, scale, source };
}
function point(event) { const r = canvas.getBoundingClientRect(), size = Math.min(r.width, r.height); return { x: (event.clientX - r.left - (r.width - size) / 2) * SIDE / size, y: (event.clientY - r.top - (r.height - size) / 2) * SIDE / size }; }
function toImage(p) { const f = fit(); if (!f) return null; const x = (p.x - f.x) / f.scale + f.source.x, y = (p.y - f.y) / f.scale + f.source.y; return { x, y, inside: x >= 0 && y >= 0 && x < state.image.width && y < state.image.height }; }
function release() { sounds.stop();keyboard=false;travel=0;furCarry=0; clearTimeout(holdTimer); holdTimer = null; holdPoint = null; $('stage').classList.remove('holding'); drawing = false; pressed = false; pointerId = null; lastPoint = null; $('brush-cursor').hidden = true; if (state.image) measure(); }
const titles = ['Chọn nhân vật', 'Tách nền & vẽ', 'Chọn dụng cụ', '', 'Thiết kế nền'];
const descriptions = ['Ảnh của bạn, góc chill của bạn.', 'Giữ lên chủ thể để tách nền.', 'Thêm một chút cá tính.'];
const hints = ['Ảnh chỉ xử lý trên thiết bị.', 'Giữ vào giữa chủ thể khoảng nửa giây.', 'Sẵn sàng để chill.'];
function go(step, announce = true) {
  if(state.busy||step<1||step>5)return false;
  setToolSettings(false);
  if(dashAge>=0){dashAge=-1;grooming=createGrooming(state.mode);}
  release();particles=[];if(step!==4)lastPanel=step;state.step=step;state.selection=null;state.sampling=false;energy=0;
  document.body.dataset.currentStep=step;document.body.classList.toggle('tools-open',step!==4);
  $('tool-panel').hidden=step===4;$('toggle-tools').setAttribute('aria-expanded',String(step!==4));
  $('save-edit').hidden=![2,5].includes(step);$('resume-play').hidden=[2,5].includes(step);
  const editPanel=document.querySelector(step===5?'#background-tools':'[data-panel="2"]');
  editPanel.prepend($('manual-controls'));editPanel.append($('edit-history'));
  document.querySelector('[data-tool="select"]').hidden=step===5;
  if(step===5){ensureBackground();setMethod('manual');selectTool('draw');}
  document.querySelector('.canvas-tools').hidden=step!==2;
  document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=Number(p.dataset.panel)!==step);
  document.querySelectorAll('[data-step]').forEach(b=>{if(Number(b.dataset.step)===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  $('panel-title').textContent=titles[step-1]||'Góc chill';$('panel-description').textContent=descriptions[step-1]||'';
  $('hint').textContent=step===4?'Giữ & rê nhẹ · hoặc giữ phím cách':step===5?'Vẽ lên nền, nhân vật giữ nguyên.':hints[step-1];
  $('preview-label').textContent=step===4?'':step===2?'CHỈNH SỬA CHỦ THỂ':'NHÂN VẬT CỦA BẠN';
  canvas.setAttribute('aria-label',step===4?'Giữ và rê trên nhân vật để chơi, hoặc giữ phím cách.':'Ảnh chỉnh sửa. Giữ chủ thể để tách nền, hoặc chọn cọ và vẽ.');$('stage').classList.toggle('editing',step===2);$('comfort-chip').hidden=step!==4;$('counter').hidden=step!==4;
  if(announce)notify('');updateButtons();dirty=true;
  if(step!==4){$('tool-panel').scrollTop=0;document.querySelector('.panel-body').scrollTop=0;document.querySelector('.brush-settings').scrollTop=0;if(matchMedia('(max-width:760px)').matches)window.scrollTo({top:0,behavior:'instant'});}
  return true;
}
$('toggle-tools').onclick=()=>go(state.step===4?lastPanel:4);$('close-tools').onclick=$('resume-play').onclick=()=>go(4);
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>go(Number(b.dataset.step)));
function setToolSettings(open, focus = false) {
  document.body.classList.toggle('tool-settings-open', open);
  $('tool-picker').hidden=open;$('tool-settings').hidden=!open;
  $('open-tool-settings').setAttribute('aria-expanded',String(open));
  $('tool-panel').scrollTop=0;document.querySelector('.panel-body').scrollTop=0;document.querySelector('.brush-settings').scrollTop=0;
  if(focus)$(open?'back-tool-picker':'open-tool-settings').focus({preventScroll:true});
}
$('open-tool-settings').onclick=()=>setToolSettings(true,true);
$('back-tool-picker').onclick=()=>setToolSettings(false,true);
$('tool-panel').addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('tool-settings-open')){e.preventDefault();setToolSettings(false,true);}});
async function loadImage(url) { const img = new Image(); img.src = url; await img.decode(); return img; }
loadImage('assets/sh-scooter.png').then(img=>{scooter=img;}).catch(()=>{});
function ensureBackground(){if(!state.background){const r=$('stage').getBoundingClientRect(),s=Math.min(1,1200/Math.max(r.width,r.height));state.background=makeCanvas(Math.max(1,Math.round(r.width*s)),Math.max(1,Math.round(r.height*s)));state.bgOriginal=clone(state.background);}}
function backgroundFit(){return coverRect(state.background.width,state.background.height,canvas.width,canvas.height);}
function backgroundPoint(p){const f=backgroundFit(),x=(p.x-f.x)/f.scale,y=(p.y-f.y)/f.scale;return{x,y,inside:x>=0&&y>=0&&x<state.background.width&&y<state.background.height};}
$('background-file').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file||state.busy)return;
  if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>20*1024*1024){notify('Chọn ảnh JPG, PNG hoặc WEBP dưới 20 MB.');return;}
  const url=URL.createObjectURL(file);setBusy(true);
  try{const img=await loadImage(url);if(img.width*img.height>40000000)throw new Error('Ảnh quá lớn.');const scale=Math.min(1,1600/Math.max(img.width,img.height));state.background=makeCanvas(Math.round(img.width*scale),Math.round(img.height*scale));state.background.getContext('2d').drawImage(img,0,0,state.background.width,state.background.height);state.bgOriginal=clone(state.background);state.bgHistory=[];dirty=true;notify('Đã chọn nền. Vẽ thêm rồi bấm Lưu.');}catch{notify('Không đọc được ảnh nền. Thử ảnh nhỏ hơn.');}finally{URL.revokeObjectURL(url);setBusy(false);}
};
$('background-upload').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('background-file').click();}};
$('clear-background').onclick=()=>{if(state.busy)return;ensureBackground();checkpoint();state.background.getContext('2d').clearRect(0,0,state.background.width,state.background.height);dirty=true;notify('Đã xóa nền riêng. Có thể hoàn tác.');};
function setImage(img, name) { state.catKey = null;
  cancelWorker(false); const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  state.original = makeCanvas(Math.round(img.width * scale), Math.round(img.height * scale)); state.original.getContext('2d').drawImage(img, 0, 0, state.original.width, state.original.height);
  state.image = clone(state.original); state.history = []; state.count = 0; state.reached = 1; $('counter').textContent = '0 cái xoa'; $('image-name').textContent = name; $('empty').hidden = true; measure(); go(1, false); grooming=createGrooming(state.mode);particles=[];notify('Ảnh đã sẵn sàng.');
}
async function readFile(file, isHand = false) {
  if (!file || state.busy) return;
  const valid = /^image\/(jpeg|png|webp)$/;
  if (!valid.test(file.type)) { notify('Hãy chọn ảnh JPG, PNG hoặc WEBP.'); return; }
  if (file.size > 20 * 1024 * 1024) { notify('Ảnh quá lớn. Chọn ảnh dưới 20 MB.'); return; }
  const sequence = ++loadSequence, url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url); if (sequence !== loadSequence) return;
    if (img.width * img.height > 40000000) { notify('Ảnh quá lớn. Giảm xuống dưới 40 megapixel rồi thử lại.'); return; }
    if (isHand) {
      ++toolLoadSequence;
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height)); const hand = makeCanvas(Math.round(img.width * scale), Math.round(img.height * scale)); hand.getContext('2d').drawImage(img, 0, 0, hand.width, hand.height);
      state.hand = hand; state.handOriginal = clone(hand); state.toolKey = null; state.flip = false; state.toolStyle = {...DEFAULT_TOOL_STYLE}; refreshTool(); $('hand-note').textContent = `Đang dùng: ${file.name}`; dirty = true; notify('Đã chọn dụng cụ riêng.');
    } else setImage(img, file.name);
  } catch { notify('Không đọc được ảnh. Hãy thử một ảnh khác.'); } finally { URL.revokeObjectURL(url); }
}
for (const id of ['file', 'capture']) $(id).onchange = e => { readFile(e.target.files[0]); e.target.value = ''; };
$('hand-file').onchange = e => { readFile(e.target.files[0], true); e.target.value = ''; };
for (const [label, input] of [['dropzone', 'file'], ['hand-upload', 'hand-file']]) $(label).onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(input).click(); } };
for (const name of ['dragenter', 'dragover']) $('dropzone').addEventListener(name, e => { e.preventDefault(); $('dropzone').classList.add('drag'); });
for (const name of ['dragleave', 'drop']) $('dropzone').addEventListener(name, e => { e.preventDefault(); $('dropzone').classList.remove('drag'); if (name === 'drop') readFile(e.dataTransfer.files[0]); });
async function demo() { if (state.busy) return; const sequence = ++loadSequence; try { const img = await loadImage('cat.png'); if (sequence !== loadSequence) return; setImage(img, 'Mèo mẫu'); state.catKey = 'cat.tabby'; notify('Mèo mẫu đã tách nền.'); } catch { $('empty').hidden = true === !!state.image; notify('Không tải được mèo mẫu. Hãy chọn ảnh của bạn.'); } }

function setMethod(method) {
  if(state.busy)return;release(); state.method = method; state.sampling = false; state.selection = null; $('auto-controls').hidden = method !== 'auto'; $('manual-controls').hidden = method !== 'manual';
  document.querySelectorAll('[data-method]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.method === method))); $('hint').textContent = method === 'manual' ? 'Vẽ để xóa hoặc khôi phục.' : 'Giữ vào giữa chủ thể khoảng nửa giây.'; dirty = true;
}
document.querySelectorAll('[data-method]').forEach(b => b.onclick = () => setMethod(b.dataset.method));
function selectTool(tool){state.tool=tool;state.selection=null;document.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tool===tool)));$('keep-selection').hidden=tool!=='select';$('paint-controls').hidden=tool!=='draw';$('tool-help').textContent={erase:'Vẽ lên phần muốn xóa.',restore:'Tô để lấy lại phần đã xóa.',select:'Khoanh phần muốn giữ.',draw:'Vẽ trực tiếp lên ảnh.'}[tool];dirty=true;}
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{if(!state.busy)selectTool(b.dataset.tool);});
function setBusy(value) { state.busy = value; $('busy-overlay').hidden = !value; $('remove').disabled = value; $('restore-all').disabled = value;  $('sample').disabled = value; updateButtons(); }
function cancelWorker(message = true) { worker?.terminate(); worker = null; clearTimeout(workerTimer); setBusy(false); if (message) notify('Đã hủy tách nền. Ảnh chưa thay đổi.'); }
$('cancel-auto').onclick = () => cancelWorker();
function removeBackground(seed = null) {
  if (!state.image || state.busy) return;
  const data = imageData(); setBusy(true); notify('Đang xử lý ảnh trên máy…');
  try {
    worker = new Worker(new URL('./background-worker.js', import.meta.url), { type: 'module' });
    workerTimer = setTimeout(() => { cancelWorker(false); notify('Xử lý quá lâu. Thử lại hoặc dùng cọ xóa.'); }, 15000);
    worker.onmessage = ({ data: result }) => {
      cancelWorker(false);
      if (result.error) { notify('Không xử lý được ảnh. Hãy dùng cọ xóa.'); return; }
      if (result.removed === 0) { notify('Không có vùng nền phù hợp để xóa. Ảnh có thể đã trong suốt; bạn có thể dùng cọ.'); return; }
      checkpoint(); state.image.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(result.buffer), data.width, data.height), 0, 0); measure();
      notify(state.bounds ? 'Đã xóa vùng nền. Có thể dùng cọ để sửa thêm hoặc đi tiếp.' : 'Đã xóa hết ảnh. Bấm Hoàn tác và giảm Mức xóa.');
    };
    worker.onerror = () => { cancelWorker(false); notify('Không khởi động được tách nền. Hãy tải lại trang hoặc dùng cọ xóa.'); };
    worker.postMessage({ buffer: data.data.buffer, width: data.width, height: data.height, tolerance: Number($('tolerance').value), seed }, [data.data.buffer]);
  } catch { cancelWorker(false); notify('Trình duyệt chưa chạy được tách nền tự động. Bạn vẫn có thể dùng cọ xóa.'); }
}
$('remove').onclick = () => removeBackground(); $('sample').onclick = () => { state.sampling = !state.sampling; $('hint').textContent = state.sampling ? 'Chạm vào phần nền bạn muốn xóa trên ảnh.' : hints[1]; notify(state.sampling ? 'Đang chọn màu nền: chạm vào ảnh.' : 'Đã hủy chọn màu nền.'); };
$('undo').onclick=()=>{if(state.busy||!editHistory().length)return;editImage().getContext('2d').putImageData(editHistory().pop(),0,0);state.selection=null;measure();notify('Đã hoàn tác thay đổi vừa rồi.');};
$('restore-all').onclick=()=>{if(!state.image||state.busy)return;checkpoint();if(state.step===5)state.background=clone(state.bgOriginal);else state.image=clone(state.original);measure();notify('Đã khôi phục ảnh ban đầu. Có thể hoàn tác.');};
$('keep-selection').onclick = () => {
  if (!state.selection) { notify('Kéo một khung quanh chủ thể trước nhé.'); return; }
  const a = toImage(state.selection.a), b = toImage(state.selection.b);
  const x = Math.max(0, Math.min(a.x, b.x)), y = Math.max(0, Math.min(a.y, b.y)); const r = Math.min(state.image.width, Math.max(a.x, b.x)), bottom = Math.min(state.image.height, Math.max(a.y, b.y));
  if (r - x < 5 || bottom - y < 5) { notify('Vùng chọn quá nhỏ hoặc nằm ngoài ảnh.'); return; }
  checkpoint(); const c = state.image.getContext('2d'); c.clearRect(0, 0, state.image.width, y); c.clearRect(0, bottom, state.image.width, state.image.height - bottom); c.clearRect(0, y, x, bottom - y); c.clearRect(r, y, state.image.width - r, bottom - y); state.selection = null; measure(); notify('Đã giữ phần trong khung. Có thể xóa nền hoặc dùng cọ để sửa tiếp.');
};
function brush(p) {
  const f=state.step===5?backgroundFit():fit(),v=state.step===5?backgroundPoint(p):toImage(p);if(!v)return;const r=Number($('brush').value)/f.scale,c=editImage().getContext('2d');
  if(state.tool==='draw'){paintStamp(c,v.x,v.y,r,{shape:$('paint-shape').value,color:$('paint-color').value,opacity:Number($('paint-opacity').value)/100});dirty=true;return;}
  c.save();c.beginPath();c.arc(v.x,v.y,r,0,Math.PI*2);c.clip();c.clearRect(v.x-r,v.y-r,r*2,r*2);if(state.tool==='restore')c.drawImage(state.step===5?state.bgOriginal:state.original,0,0);c.restore();dirty=true;
}
canvas.onpointerdown = e => {
  if (!state.image || state.busy || pointerId !== null ||dashAge>=0) return;
  const p = point(e), v = state.step===5?backgroundPoint(p):toImage(p); if (!v) return;
  if (state.step === 2 || state.step===5) {
    if (state.sampling) { if (v.inside) { state.sampling = false; removeBackground({ x: Math.floor(v.x), y: Math.floor(v.y) }); } return; }
    if (state.method !== 'manual') { if (!v.inside) return; e.preventDefault(); pointerId = e.pointerId; canvas.setPointerCapture(e.pointerId); holdPoint = p; $('stage').classList.add('holding'); holdTimer = setTimeout(() => { release(); liftSubject({ x: Math.floor(v.x), y: Math.floor(v.y) }); }, 550); return; }
    if (!v.inside && state.tool !== 'select') return;
    drawing = true; if (state.tool === 'select') state.selection = { a: p, b: p }; else { checkpoint(); brush(p); }
  } else if (state.step === 4) { pressed = true; smooth={...p};sounds.prime(state.mode); } else return;
  e.preventDefault(); pointerId = e.pointerId; canvas.setPointerCapture(e.pointerId); canvas.focus({ preventScroll: true }); pointer = p; lastPoint = p; dirty = true;
};
canvas.onpointermove = e => {
  const p = point(e);
  if (holdPoint && Math.hypot(p.x-holdPoint.x,p.y-holdPoint.y)>25) release();
  if ((state.step === 2 ||state.step===5) && state.method === 'manual' && state.tool !== 'select' && e.pointerType !== 'touch') {
    const r = canvas.getBoundingClientRect(), size = Math.min(r.width, r.height); const cursor = $('brush-cursor'); cursor.hidden = false; cursor.style.left = (e.clientX - r.left) + 'px'; cursor.style.top = (e.clientY - r.top) + 'px'; cursor.style.width = cursor.style.height = Number($('brush').value) * 2 * size / SIDE + 'px';
  }
  if (pointerId !== e.pointerId) return;
  if (drawing) {
    if (state.tool === 'select') { state.selection.b = p; dirty = true; }
    else { const distance = Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y); const n = Math.max(1, Math.ceil(distance / Math.max(2, Number($('brush').value) / 3))); for (let i = 1; i <= n; i++) brush({ x: lastPoint.x + (p.x - lastPoint.x) * i / n, y: lastPoint.y + (p.y - lastPoint.y) * i / n }); }
  } else if (pressed && isContact(p) && isContact(pointer)) travel += Math.hypot(p.x-pointer.x,p.y-pointer.y)/SIDE;
  pointer = p; lastPoint = p; dirty = true;
};
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, e => { if (e.pointerId === pointerId) release(); });
canvas.onpointerleave = () => $('brush-cursor').hidden = true; window.addEventListener('blur', release);
canvas.onkeydown=e=>{if(e.code!=='Space')return;e.preventDefault();if(state.step===2&&state.method==='auto'&&!e.repeat)liftSubject();else if(state.step===4&&!state.busy&&dashAge<0&&!$('share-dialog').open&&!toolCutout.active&&!gifExport.active){keyboard=true;pressed=true;if(!e.repeat)sounds.prime(state.mode);}};
window.addEventListener('keyup',e=>{if(e.code==='Space')release();});document.addEventListener('visibilitychange',release);
for (const [input, output, suffix] of [['tolerance', 'tolerance-value', ''], ['brush', 'brush-value', ' px'], ['hand-size', 'hand-size-value', '%'], ['soft', 'soft-value', '%']]) $(input).oninput = () => { $(output).textContent = $(input).value + suffix; dirty = true; };
$('subject-size').oninput=()=>{state.subjectScale=Number($('subject-size').value)/100;$('subject-size-value').textContent=$('subject-size').value+'%';dirty=true;};
$('paint-opacity').oninput=()=>{$('paint-opacity-value').textContent=$('paint-opacity').value+'%';};
function syncPaintColor(){document.querySelectorAll('[data-paint-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paintColor===$('paint-color').value)));}
$('paint-color').oninput=syncPaintColor;
document.querySelectorAll('[data-paint-color]').forEach(b=>b.onclick=()=>{$('paint-color').value=b.dataset.paintColor;syncPaintColor();});
function refreshTool(recolor = true) {
  if(!state.hand)return;
  if(recolor){
  const tint = source => {const output=makeCanvas(source.width,source.height),c=output.getContext('2d');c.drawImage(source,0,0);const pixels=c.getImageData(0,0,output.width,output.height);pixels.data.set(tintPixels(pixels.data,state.toolStyle));c.putImageData(pixels,0,0);return output;};
  const neutral=state.toolStyle.hue===0&&state.toolStyle.saturation===100&&state.toolStyle.brightness===100;
  styledHand=neutral?state.hand:tint(state.hand);styledSprite=state.toolKey==='tool.hand'&&handSprite?(neutral?handSprite:tint(handSprite)):null;
  styledFrames=styledSprite?isolateHandFrames(styledSprite,makeCanvas):[];
  }
  for(const key of Object.keys(DEFAULT_TOOL_STYLE)){$('tool-'+key).value=state.toolStyle[key];$('tool-'+key+'-value').textContent=state.toolStyle[key]+(['rotation','hue'].includes(key)?'°':'%');}
  $('tool-cutout').disabled=state.toolKey!==null;
  $('tool-cutout-note').textContent=state.toolKey?'Mẫu đã trong suốt. Tải ảnh để sửa nền.':'Tách tự động hoặc dùng cọ sửa.';
  document.querySelectorAll('[data-hand]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.hand==='flipped')===state.flip)));
  dirty=true;
}
const toolCutout=createToolCutout(image=>{state.hand=image;state.toolKey=null;refreshTool();notify('Đã cập nhật nền dụng cụ.');});
$('tool-cutout').onclick=()=>{if(state.busy||!state.hand||state.toolKey)return;release();toolCutout.open(state.hand,state.handOriginal);};
for(const key of Object.keys(DEFAULT_TOOL_STYLE))$('tool-'+key).oninput=()=>{state.toolStyle[key]=Number($('tool-'+key).value);refreshTool(key!=='rotation');};
$('tool-default').onclick=()=>{modeTools.delete(state.mode);state.hand=null;$('hand-note').textContent='JPG, PNG hoặc WEBP.';selectMode(state.mode);};
function defaultToolStyle(){return {...DEFAULT_TOOL_STYLE,rotation:state.toolKey==='tool.brush'?105:0};}
$('tool-reset-style').onclick=()=>{state.toolStyle=defaultToolStyle();refreshTool();};
async function selectMode(mode) {
  dashAge=-1;
  if (state.busy) return; const toolSequence=++toolLoadSequence; if(state.hand)modeTools.set(state.mode,{hand:state.hand,original:state.handOriginal,key:state.toolKey,style:{...state.toolStyle},flip:state.flip}); release();energy=0;particles=[];petCycle=0;state.mode = mode; grooming=createGrooming(mode);state.toolKey = mode === 'brush' ? 'tool.brush' : 'tool.hand';
  const key = state.toolKey;
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.mode === mode)));
  $('tool-settings-title').textContent=mode==='brush'?'Chỉnh lược':'Chỉnh tay';
  const saved=modeTools.get(mode);
  if(saved){state.hand=saved.hand;state.handOriginal=saved.original;state.toolKey=saved.key;state.toolStyle={...saved.style};state.flip=saved.flip;refreshTool();return;}
  state.toolStyle=defaultToolStyle();state.flip=false;state.handOriginal=null;state.hand=null;styledHand=null;styledSprite=null;dirty=true;
  try { const img = await loadImage(ASSETS[key].src); if(key === 'tool.hand' && !handSprite)handSprite = await loadImage(ASSETS[key].sprite); if(toolSequence!==toolLoadSequence || state.toolKey !== key)return; state.hand = state.defaultHand = img; refreshTool(); } catch { notify('Không tải được dụng cụ. Thử lại nhé.'); }
}
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => selectMode(b.dataset.mode));
document.querySelectorAll('[data-hand]').forEach(b => b.onclick = () => { if(state.busy)return; state.flip = b.dataset.hand === 'flipped'; document.querySelectorAll('[data-hand]').forEach(x => x.setAttribute('aria-pressed',String(x===b))); dirty = true; });
document.querySelectorAll('[data-bg]').forEach(b => b.onclick = () => { state.bg=b.dataset.bg; $('stage').style.backgroundColor=COLORS[state.bg]; document.querySelectorAll('[data-bg]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); });
function currentScene() {
 return {v:1,name:$('scene-name').value.trim()||'Bạn nhỏ',cat:state.catKey||smallImage(state.image,state.bounds),tool:state.toolKey||smallImage(state.hand),mode:state.mode,bg:state.bg,size:Number($('hand-size').value),soft:Number($('soft').value),flip:state.flip,subjectScale:state.subjectScale,toolStyle:{...state.toolStyle},...(state.background?{background:smallImage(state.background,null,192)}:{})};
}
const canvasBlob=source=>new Promise((resolve,reject)=>{const c=clone(source);c.toBlob(blob=>blob?resolve(blob):reject(new Error('Không lưu được ảnh.')),'image/png');});
$('save-edit').onclick=async()=>{
  if(state.busy||!state.bounds)return;release();setBusy(true);
  try{
    const settings={v:1,name:$('scene-name').value.trim()||'Bạn nhỏ',cat:state.catKey||'cat.mochi',tool:state.toolKey||'tool.hand',mode:state.mode,bg:state.bg,size:Number($('hand-size').value),soft:Number($('soft').value),flip:state.flip,subjectScale:state.subjectScale,toolStyle:{...state.toolStyle}};
    const [image,original,hand,handOriginal]=await Promise.all([canvasBlob(state.image),canvasBlob(state.original),canvasBlob(state.hand),canvasBlob(state.handOriginal||state.hand)]);
    const background=state.background?await canvasBlob(state.background):null,bgOriginal=state.bgOriginal?await canvasBlob(state.bgOriginal):null;
    await draftStore({settings,image,original,hand,handOriginal,background,bgOriginal,catKey:state.catKey,toolKey:state.toolKey});
    setBusy(false);go(4);$('share').classList.add('share-ready');$('share').focus({preventScroll:true});notify('Đã lưu. Chạm máy bay để gửi bạn.');
  }catch{setBusy(false);notify('Chưa lưu được trên thiết bị. Ảnh vẫn ở đây; hãy thử lại.');}
};
const gifExport=createGifExport(async()=>{
  if(!state.bounds||!state.hand)throw new Error('Chưa có ảnh.');
  const b=state.bounds,anchor=ASSETS[state.toolKey]?.contact||[.5,.5];
  const images=await Promise.all([createImageBitmap(state.image),createImageBitmap(styledHand||state.hand),state.toolKey==='tool.hand'&&handSprite?createImageBitmap(styledSprite||handSprite):null]);
  return {image:images[0],hand:images[1],sprite:images[2],scooter:await createImageBitmap(scooter||await loadImage('assets/sh-scooter.png')),backdrop:state.background?await createImageBitmap(state.background):null,bounds:{...b},subjectScale:state.subjectScale,background:COLORS[state.bg],mode:state.mode,size:Number($('hand-size').value),soft:Number($('soft').value),flip:state.flip,rotation:(ASSETS[state.toolKey]?.rotation||0)+state.toolStyle.rotation*Math.PI/180,anchor,coat:sampleCoat(state.hitPixels,state.image.width,state.image.height,b.x+b.width*.5,b.y+b.height*.35)};
},release);
$('share-gif').onclick=()=>{if(!state.busy){$('share-dialog').close();gifExport.open();}};
function shareChoice(){ $('share-choices').hidden=false;$('share-link-panel').hidden=true;$('share-heading').textContent='Gửi một chút chill'; }
$('share').onclick=()=>{if(state.busy||!state.bounds||!state.hand)return;release();shareChoice();$('share-dialog').showModal();$('share').classList.remove('share-ready');};
$('share-back').onclick=shareChoice;
$('share-link').onclick=async()=>{
 $('share-link').disabled=true;
 try{
  const scene=currentScene(),fullURL=sceneURL(await packScene(scene));let qrURL=fullURL,compact=false;
  if(qrURL.length>2200){
   for(const size of [96,64,48,32,24]){
    const qrScene={...scene,cat:state.catKey||smallImage(state.image,state.bounds,size),tool:state.toolKey||smallImage(state.hand,null,size),...(state.background?{background:smallImage(state.background,null,size)}:{})};
    qrURL=sceneURL(await packScene(qrScene));compact=true;if(qrURL.length<=2200)break;
   }
  }
  $('share-url').value=fullURL;$('share-choices').hidden=true;$('share-link-panel').hidden=false;$('share-heading').textContent='Quét để chơi cùng';
  $('share-qr').hidden=true;
  if(qrURL.length<=2900){$('share-qr').src=await QRCode.toDataURL(qrURL,{width:420,margin:4,errorCorrectionLevel:'L',color:{dark:'#244c3eff',light:'#ffffffff'}});$('share-qr').hidden=false;}
  $('share-status').textContent=qrURL.length>2900?'Ảnh quá chi tiết cho QR. Bạn vẫn có thể sao chép link.':compact?'QR dùng ảnh thu nhỏ. Link giữ ảnh rõ hơn.':'Quét QR hoặc sao chép link.';
  $('native-share').hidden=!navigator.share;
 }catch(error){$('share-status').textContent=error.message;$('share-choices').hidden=true;$('share-link-panel').hidden=false;}finally{$('share-link').disabled=false;}
};
$('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($('share-url').value);$('share-status').textContent='Đã sao chép. Gửi cho một người bạn nhé!';}catch{$('share-url').focus();$('share-url').select();$('share-status').textContent='Chạm giữ hoặc Ctrl+C để sao chép.';}};
$('native-share').onclick=async()=>{try{await navigator.share({title:'Một chút RelaxAndChill',url:$('share-url').value});}catch(error){if(error.name!=='AbortError')$('share-status').textContent='Hãy dùng nút sao chép link.';}};
$('share-dialog').addEventListener('close',release);
function liftSubject(seed = null) {
  if(!state.image || state.busy)return;
  const data=imageData(); setBusy(true);notify('Lần đầu cần tải bộ tách nền. Ảnh vẫn ở trên thiết bị.');
  try {
    worker=new Worker(new URL('./subject-worker.js',import.meta.url),{type:'module'});
    workerTimer=setTimeout(()=>{cancelWorker(false);notify('Chưa xử lý kịp. Bạn có thể thử lại hoặc dùng cọ sửa.');},60000);
    worker.onmessage=({data:result})=>{
      if(result.status){notify(result.status);return;}
      cancelWorker(false);if(result.error){notify(result.error);return;}
      const output=new ImageData(new Uint8ClampedArray(result.buffer),result.width,result.height);
      if(!alphaBounds(output.data,output.width,output.height)){notify('Chưa thấy chủ thể. Thử giữ giữa vật hoặc dùng cọ sửa.');return;}
      checkpoint();state.image.getContext('2d').putImageData(output,0,0);measure();
      $('stage').classList.add('lifted');setTimeout(()=>$('stage').classList.remove('lifted'),750);notify('Đã tách nền.');
    };
    worker.onerror=()=>{cancelWorker(false);notify('Không chạy được tách nền. Bạn vẫn có thể dùng cọ sửa.');};
    worker.postMessage({buffer:data.data.buffer,width:data.width,height:data.height,seed},[data.data.buffer]);
  }catch{cancelWorker(false);notify('Trình duyệt chưa hỗ trợ. Hãy dùng cọ sửa.');}
}
$('lift').onclick=()=>{setMethod('auto');liftSubject();};
let lastFrame=0;
new ResizeObserver(()=>{const r=$('stage').getBoundingClientRect();if(!r.width||!r.height)return;const size=stageSize(r.width,r.height);canvas.width=size.width;canvas.height=size.height;dirty=true;}).observe($('stage'));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function isContact(p){const f=fit();if(!f||!state.image)return false;const x=Math.floor((p.x-f.x)/f.scale+f.source.x),y=Math.floor((p.y-f.y)/f.scale+f.source.y);if(x<0||y<0||x>=state.image.width||y>=state.image.height)return false;return state.hitPixels?.[(y*state.image.width+x)*4+3]>40;}
function frame(t){
 const dt=Math.min(.05,(t-lastFrame)/1000||.016);lastFrame=t;
 if(!document.hidden&&!$('share-dialog').open&&!toolCutout.active&&!gifExport.active&&(dirty||state.step===4)){
  const offsetX=(canvas.width-SIDE)/2,offsetY=(canvas.height-SIDE)/2;
  ctx.setTransform(1,0,0,1,offsetX,offsetY);ctx.clearRect(-offsetX,-offsetY,canvas.width,canvas.height);
  if(state.background&&state.step!==2){const bg=backgroundFit();ctx.drawImage(state.background,bg.x,bg.y,bg.w,bg.h);}
  const f=fit();
  if(f){
   if(state.step===4&&!state.busy){
    if(keyboard){const p={x:450+Math.sin(t*.0028)*f.w*.22,y:f.y+f.h*.48};if(isContact(p)&&isContact(pointer))travel+=Math.hypot(p.x-pointer.x,p.y-pointer.y)/SIDE;pointer=p;}
    const distance=travel;travel=0;const contact=isContact(pointer);grooming=tickGrooming(grooming,{dt,distance,contact,active:pressed});
    if(grooming.completed&&dashAge<0){dashAge=0;engineFired=false;release();particles=[];}
    if(dashAge>=0){dashAge+=dt;if(dashAge>1.2&&!engineFired){engineFired=true;sounds.engine();}if(dashAge>=DASH_DURATION){dashAge=-1;grooming=createGrooming(state.mode);}}
    sounds.tick(state.mode,pressed&&contact&&distance>.0001&&dashAge<0,grooming.comfort,dt);
    const desired=pressed&&contact?Math.min(1,distance/dt*2):0;energy+=(desired-energy)*springFactor(dt,10);smooth.x+=(pointer.x-smooth.x)*springFactor(dt,22);smooth.y+=(pointer.y-smooth.y)*springFactor(dt,22);
    petCycle += dt * 15 * energy;
    const squash=reducedMotion?0:energy*Number($('soft').value)/100*(state.mode==='pet'?(.06 + .09 * Math.sin((petCycle % 10) / 10 * Math.PI)):.035),breathe=reducedMotion?0:Math.sin(t*.0017)*.005;
    if(dashAge>=0&&scooter){drawScooterRide(ctx,{age:dashAge,reduced:reducedMotion,image:state.image,bounds:state.bounds,fit:f,scooter,viewWidth:canvas.width});}
    else{
    const dash=dashAge>=0?dashPose(dashAge,reducedMotion):{progress:0,stretch:1,alpha:1};
    ctx.save();ctx.globalAlpha=dash.alpha;ctx.translate(450+(reducedMotion?0:dash.progress*(canvas.width+f.w)),f.y+f.h);ctx.transform((1+squash*.35)*dash.stretch,0,reducedMotion?0:Math.sin(t*.007)*energy*.012,(1-squash+breathe)/dash.stretch,0,0);ctx.drawImage(state.image,f.source.x,f.source.y,f.source.width,f.source.height,f.x-450,-f.h,f.w,f.h);ctx.restore();
    if(dashAge>=0&&!reducedMotion)drawDashSmoke(ctx,dashAge,f.x+f.w*.5,f.y+f.h*.88);
    }
    if(!reducedMotion && state.mode==='brush'){
     const emission=furCount(furCarry,distance,pressed,contact,Math.max(0,80-particles.length));furCarry=emission.carry;
     for(let i=0;i<emission.count;i++){
      const position={x:pointer.x+(Math.random()-.5)*22,y:pointer.y+(Math.random()-.5)*16};
      const source=toImage(position),color=sampleCoat(state.hitPixels,state.image.width,state.image.height,source.x,source.y);
      if(color)particles.push(makeFur(position.x,position.y,color,Math.sign(pointer.x-smooth.x)));
     }
    }else if(!reducedMotion&&desired>.1&&t-lastParticle>180&&particles.length<25){particles.push({kind:'heart',x:smooth.x,y:smooth.y,vx:(Math.random()-.5)*45,life:1});lastParticle=t;}
    $('comfort').value=grooming.comfort;$('comfort-value').textContent=Math.floor(grooming.comfort)+'%';$('mood').textContent=dashAge>=0?'Vút! 💨':{ready:grooming.comfort>40?'Thư giãn quá ♡':grooming.comfort>0?'Rừ rừ…':'Đang đợi bạn',gentle:'Rừ rừ…',fast:'Nhẹ hơn chút nha',happy:'Vút! 💨'}[grooming.reaction];$('counter').textContent=grooming.strokes+(state.mode==='brush'?' lượt chải':' cái xoa');$('reward').hidden=true;
   }else{ctx.drawImage(state.image,f.source.x,f.source.y,f.source.width,f.source.height,f.x,f.y,f.w,f.h);$('reward').hidden=true;}
   for(const p of particles){
    if(p.kind==='fur'){advanceFur(p,dt);drawFur(ctx,p);}
    else{p.life-=dt*1.5;p.x+=p.vx*dt;p.y-=45*dt;ctx.globalAlpha=Math.max(0,p.life)*.8;ctx.fillStyle='#fffef1';ctx.font='24px Segoe UI';ctx.fillText('♡',p.x,p.y);}
   }particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;
   if(state.step===2&&state.selection){const{a,b}=state.selection;ctx.strokeStyle='#7752d8';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.setLineDash([]);ctx.fillStyle='#7851dc22';ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);}
   if([3,4].includes(state.step)&&state.hand&&dashAge<0){
    const animated=state.toolKey==='tool.hand'&&handSprite;
    const w=Number($('hand-size').value)*(animated?5.4:state.mode==='brush'?2.9:3),h=w*state.hand.height/state.hand.width;
    const p=state.step===4?smooth:{x:470,y:f.y+f.h*.3};
    ctx.save();ctx.translate(p.x,p.y);if(state.flip)ctx.scale(-1,1);
    ctx.rotate((ASSETS[state.toolKey]?.rotation||0)+state.toolStyle.rotation*Math.PI/180+(reducedMotion?0:Math.sin(t*.006)*energy*.04));
    const anchor=ASSETS[state.toolKey]?.contact||[.5,.5];
    if(animated){const frameIndex=reducedMotion||energy<.02?0:Math.floor(petCycle)%ASSETS['tool.hand'].frames;ctx.drawImage(styledFrames[frameIndex]||styledHand||state.hand,-w*anchor[0],-h*anchor[1],w,h);}
    else ctx.drawImage(styledHand||state.hand,-w*anchor[0],-h*anchor[1],w,h);
    ctx.restore();
   }
  }dirty=false;
 }requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
async function boot(){
 try{
  modeTools.clear();state.hand=null;state.handOriginal=null;state.background=null;state.bgOriginal=null;state.bgHistory=[];
  const saved=!location.hash&&new URLSearchParams(location.search).has('edit')?await draftStore().catch(()=>null):null;
  let scene=saved?.settings||(location.hash.startsWith('#play=')?await unpackScene(location.hash.slice(6)):PRESETS[location.hash.slice(8)]||PRESETS.mochi);scene=validateScene(scene);state.subjectScale=scene.subjectScale??1;$('subject-size').value=Math.round(state.subjectScale*100);$('subject-size-value').textContent=Math.round(state.subjectScale*100)+'%';
  const img=await loadImage(ASSETS[scene.cat]?.src||scene.cat);setImage(img,scene.name);state.catKey=ASSETS[scene.cat]?scene.cat:null;$('scene-name').value=scene.name;
  if(scene.background){state.background=clone(await loadImage(scene.background));state.bgOriginal=clone(state.background);}
  await selectMode(scene.mode);if(!ASSETS[scene.tool]){state.hand=await loadImage(scene.tool);state.toolKey=null;}else{state.hand=await loadImage(ASSETS[scene.tool].src);state.toolKey=scene.tool;}
  state.flip=scene.flip;state.toolStyle=validateToolStyle(scene.toolStyle||defaultToolStyle());state.handOriginal=state.toolKey?null:state.hand;refreshTool();state.bg=scene.bg;$('stage').style.backgroundColor=COLORS[scene.bg];$('hand-size').value=scene.size;$('soft').value=scene.soft;$('hand-size-value').textContent=scene.size+'%';$('soft-value').textContent=scene.soft+'%';
  document.querySelectorAll('[data-hand]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.hand==='flipped')===state.flip)));document.querySelectorAll('[data-bg]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bg===state.bg)));
  go(new URLSearchParams(location.search).has('edit')?1:4,false);notify('');
  if(saved){
    const [image,original,hand,handOriginal]=await Promise.all([saved.image,saved.original,saved.hand,saved.handOriginal].map(blob=>createImageBitmap(blob)));
    state.image=clone(image);state.original=clone(original);state.hand=clone(hand);state.handOriginal=clone(handOriginal);[image,original,hand,handOriginal].forEach(img=>img.close());
    state.catKey=saved.catKey;state.toolKey=saved.toolKey;measure();refreshTool();notify('Đã mở bản chỉnh đã lưu trên thiết bị.');
    if(saved.background){const bg=await createImageBitmap(saved.background),original=await createImageBitmap(saved.bgOriginal||saved.background);state.background=clone(bg);state.bgOriginal=clone(original);bg.close();original.close();dirty=true;}
  }
 }catch{history.replaceState(null,'',location.pathname+'?edit');await demo();await selectMode('brush');notify('Link bị thiếu hoặc hỏng. Bạn có thể chọn lại ảnh.');}
}
boot();
window.addEventListener('hashchange',()=>{if(!state.busy)boot();});
const cameraDialog = document.createElement('dialog'); cameraDialog.className = 'camera-dialog'; cameraDialog.setAttribute('aria-label', 'Chụp ảnh chủ thể'); cameraDialog.innerHTML = '<h2>Chụp nhân vật của bạn</h2><video autoplay playsinline muted></video><p role="status">Đang mở máy ảnh…</p><div class="row"><button class="secondary" data-close>Đóng</button><button class="primary" data-snap disabled>Chụp ảnh</button></div>'; document.body.append(cameraDialog);
let stream = null, cameraSession = 0; const video = cameraDialog.querySelector('video'), cameraStatus = cameraDialog.querySelector('p'), snap = cameraDialog.querySelector('[data-snap]');
function closeCamera() { cameraSession++; stream?.getTracks().forEach(t => t.stop()); stream = null; video.srcObject = null; cameraDialog.close(); }
cameraDialog.querySelector('[data-close]').onclick = closeCamera; cameraDialog.addEventListener('cancel', e => { e.preventDefault(); closeCamera(); }); window.addEventListener('pagehide', () => { closeCamera(); cancelWorker(false); });
$('camera').onclick = async () => { if (state.busy) return; if (!navigator.mediaDevices?.getUserMedia) { $('capture').click(); return; } const session = ++cameraSession; cameraDialog.showModal(); snap.disabled = true; cameraStatus.textContent = 'Cho phép dùng máy ảnh để chụp. Ảnh chỉ xử lý trên thiết bị.'; try { const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }); if (session !== cameraSession) { next.getTracks().forEach(t => t.stop()); return; } stream = next; video.srcObject = stream; await video.play(); snap.disabled = false; cameraStatus.textContent = 'Đưa chủ thể vào khung hình, rồi bấm Chụp ảnh.'; } catch { cameraStatus.textContent = 'Không mở được máy ảnh. Kiểm tra quyền truy cập hoặc đóng và chọn ảnh có sẵn.'; } };
snap.onclick = () => { if (!video.videoWidth) return; const photo = makeCanvas(video.videoWidth, video.videoHeight); photo.getContext('2d').drawImage(video, 0, 0); closeCamera(); ++loadSequence; setImage(photo, 'Ảnh vừa chụp'); };
