import { alphaBounds } from './background.js';
const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d'), SIDE = 900;
const state = { step: 1, reached: 1, original: null, image: null, bounds: null, hand: null, defaultHand: null, flip: false, method: 'auto', tool: 'erase', history: [], busy: false, count: 0, selection: null, sampling: false };
let dirty = true, drawing = false, pressed = false, pointerId = null, lastPoint = null, pointer = { x: 470, y: 270 }, energy = 0, phase = 0, autoUntil = 0, worker = null, workerTimer = null, loadSequence = 0;
const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const clone = c => { const n = makeCanvas(c.width, c.height); n.getContext('2d').drawImage(c, 0, 0); return n; };
const notify = message => { $('status').textContent = message; };
const imageData = () => state.image.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, state.image.width, state.image.height);
function measure() { if (!state.image) return; const data = imageData(); state.bounds = alphaBounds(data.data, data.width, data.height); dirty = true; updateButtons(); }
function checkpoint() { state.history.push(imageData()); if (state.history.length > 6) state.history.shift(); $('undo').disabled = false; }
function updateButtons() { $('next').disabled = state.busy || !state.image || !state.bounds; $('undo').disabled = state.busy || !state.history.length; document.querySelectorAll('.steps button').forEach(b => b.disabled = state.busy || Number(b.dataset.step) > state.reached); }
function fit() {
  if (!state.image) return null;
  const editing = state.step === 2;
  const source = editing ? { x: 0, y: 0, width: state.image.width, height: state.image.height } : state.bounds;
  if (!source) return null;
  const scale = Math.min((editing ? 820 : 640) / source.width, (editing ? 820 : 630) / source.height);
  const w = source.width * scale, h = source.height * scale;
  return { x: (SIDE - w) / 2, y: editing ? (SIDE - h) / 2 : 775 - h, w, h, scale, source };
}
function point(event) { const r = canvas.getBoundingClientRect(), size = Math.min(r.width, r.height); return { x: (event.clientX - r.left - (r.width - size) / 2) * SIDE / size, y: (event.clientY - r.top - (r.height - size) / 2) * SIDE / size }; }
function toImage(p) { const f = fit(); if (!f) return null; const x = (p.x - f.x) / f.scale + f.source.x, y = (p.y - f.y) / f.scale + f.source.y; return { x, y, inside: x >= 0 && y >= 0 && x < state.image.width && y < state.image.height }; }
function release() { drawing = false; pressed = false; pointerId = null; lastPoint = null; $('brush-cursor').hidden = true; if (state.image) measure(); }
const titles = ['Chọn nhân vật', 'Giữ đúng chủ thể', 'Chọn một bàn tay', 'Xoa đầu thôi nào'];
const descriptions = ['Một chiếc mèo, bạn thân, hoặc chính bạn.', 'Tự động với nền đơn giản, hoặc tự sửa bằng cọ.', 'Tay quen thuộc hay một bàn tay của riêng bạn?', 'Mọi thứ đã sẵn sàng để được cưng chiều.'];
const hints = ['Chọn ảnh riêng hoặc tiếp tục với mèo mẫu.', 'Phần ô vuông là nền trong suốt.', 'Bàn tay sẽ đi theo chuột hoặc ngón tay ở bước tiếp theo.', 'Giữ & rê để xoa · Phím cách cũng xoa được.'];
function go(step, announce = true) {
  if (state.busy || step < 1 || step > 4) return false;
  if (step > 1 && !state.image) { notify('Chọn một ảnh trước nhé.'); return false; }
  if (step > 2 && !state.bounds) { notify('Ảnh đã bị xóa hết. Hãy hoàn tác hoặc khôi phục trước.'); return false; }
  release(); state.step = step; state.reached = Math.max(state.reached, step); state.selection = null; state.sampling = false; autoUntil = 0; energy = 0;
  document.body.dataset.currentStep = step;
  document.querySelectorAll('[data-panel]').forEach(p => p.hidden = Number(p.dataset.panel) !== step);
  document.querySelectorAll('[data-step]').forEach(b => { const n = Number(b.dataset.step); if (n === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.classList.toggle('complete', n < step); });
  $('panel-title').textContent = titles[step - 1]; $('panel-description').textContent = descriptions[step - 1]; $('step-kicker').textContent = `BƯỚC 0${step} / 04`; $('hint').textContent = hints[step - 1]; $('preview-label').textContent = ['NHÂN VẬT CỦA BẠN', 'CHỈNH SỬA CHỦ THỂ', 'BÀN TAY CỦA BẠN', 'SÂN KHẤU XOA XOA'][step - 1];
  $('stage').classList.toggle('editing', step === 2); $('back').hidden = step === 1; $('next').hidden = step === 4; $('counter').hidden = step !== 4; $('next').textContent = ['Tiếp: tách nền', 'Tiếp: chọn bàn tay', 'Bắt đầu xoa đầu'][step - 1] || '';
  if (announce) notify(`Bước ${step}/4 · ${titles[step - 1]}.`);
  updateButtons(); dirty = true; return true;
}
$('next').onclick = () => go(state.step + 1); $('back').onclick = () => go(state.step - 1); $('restart').onclick = () => go(1);
document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go(Number(b.dataset.step)));
async function loadImage(url) { const img = new Image(); img.src = url; await img.decode(); return img; }
function setImage(img, name) {
  cancelWorker(false); const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  state.original = makeCanvas(Math.round(img.width * scale), Math.round(img.height * scale)); state.original.getContext('2d').drawImage(img, 0, 0, state.original.width, state.original.height);
  state.image = clone(state.original); state.history = []; state.count = 0; state.reached = 1; $('counter').textContent = '0 cái xoa'; $('image-name').textContent = name; $('empty').hidden = true; measure(); go(1, false); notify('Ảnh đã sẵn sàng. Tiếp tục để chọn cách tách nền.');
}
async function readFile(file, isHand = false) {
  if (!file || state.busy) return;
  const valid = isHand ? /^image\/(png|webp)$/ : /^image\/(jpeg|png|webp)$/;
  if (!valid.test(file.type)) { notify(isHand ? 'Chọn PNG hoặc WEBP cho bàn tay.' : 'Hãy chọn ảnh JPG, PNG hoặc WEBP.'); return; }
  if (file.size > 20 * 1024 * 1024) { notify('Ảnh quá lớn. Chọn ảnh dưới 20 MB.'); return; }
  const sequence = ++loadSequence, url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url); if (sequence !== loadSequence) return;
    if (img.width * img.height > 40000000) { notify('Ảnh quá lớn. Giảm xuống dưới 40 megapixel rồi thử lại.'); return; }
    if (isHand) {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height)); const hand = makeCanvas(Math.round(img.width * scale), Math.round(img.height * scale)); hand.getContext('2d').drawImage(img, 0, 0, hand.width, hand.height);
      state.hand = hand; state.flip = false; document.querySelectorAll('[data-hand]').forEach(b => b.setAttribute('aria-pressed', 'false')); $('hand-note').textContent = `Đang dùng: ${file.name}`; dirty = true; notify('Đã chọn bàn tay riêng.');
    } else setImage(img, file.name);
  } catch { notify('Không đọc được ảnh. Hãy thử một ảnh khác.'); } finally { URL.revokeObjectURL(url); }
}
for (const id of ['file', 'capture']) $(id).onchange = e => { readFile(e.target.files[0]); e.target.value = ''; };
$('hand-file').onchange = e => { readFile(e.target.files[0], true); e.target.value = ''; };
for (const [label, input] of [['dropzone', 'file'], ['hand-upload', 'hand-file']]) $(label).onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(input).click(); } };
for (const name of ['dragenter', 'dragover']) $('dropzone').addEventListener(name, e => { e.preventDefault(); $('dropzone').classList.add('drag'); });
for (const name of ['dragleave', 'drop']) $('dropzone').addEventListener(name, e => { e.preventDefault(); $('dropzone').classList.remove('drag'); if (name === 'drop') readFile(e.dataTransfer.files[0]); });
async function demo() { if (state.busy) return; const sequence = ++loadSequence; try { const img = await loadImage('cat.png'); if (sequence !== loadSequence) return; setImage(img, 'Mèo mẫu'); notify('Mèo mẫu đã trong suốt. Có thể đi tiếp mà không cần xóa nền.'); } catch { $('empty').hidden = true === !!state.image; notify('Không tải được mèo mẫu. Hãy chọn ảnh của bạn.'); } }
$('demo').onclick = demo;
function setMethod(method) {
  release(); state.method = method; state.sampling = false; state.selection = null; $('auto-controls').hidden = method !== 'auto'; $('manual-controls').hidden = method !== 'manual';
  document.querySelectorAll('[data-method]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.method === method))); $('hint').textContent = method === 'manual' ? 'Vẽ trực tiếp lên ảnh để xóa hoặc khôi phục.' : 'Xóa nền tự động, hoặc chạm vào vùng màu muốn bỏ.'; dirty = true;
}
document.querySelectorAll('[data-method]').forEach(b => b.onclick = () => setMethod(b.dataset.method));
document.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => {
  state.tool = b.dataset.tool; state.selection = null; document.querySelectorAll('[data-tool]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('keep-selection').hidden = state.tool !== 'select'; $('tool-help').textContent = { erase: 'Giữ và kéo trên phần ảnh muốn xóa. Dùng Khôi phục nếu lỡ tay.', restore: 'Tô để lấy lại phần đã xóa từ ảnh ban đầu.', select: 'Kéo một khung quanh chủ thể, rồi bấm Giữ vùng đã khoanh. Có thể hoàn tác.' }[state.tool]; dirty = true;
});
function setBusy(value) { state.busy = value; $('busy-overlay').hidden = !value; $('remove').disabled = value; $('restore-all').disabled = value; $('back').disabled = value; $('sample').disabled = value; updateButtons(); }
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
$('undo').onclick = () => { if (state.busy || !state.history.length) return; const data = state.history.pop(); state.image.getContext('2d').putImageData(data, 0, 0); state.selection = null; measure(); notify('Đã hoàn tác thay đổi vừa rồi.'); };
$('restore-all').onclick = () => { if (!state.image || state.busy) return; checkpoint(); state.image = clone(state.original); measure(); notify('Đã khôi phục ảnh ban đầu. Có thể hoàn tác thao tác này.'); };
$('keep-selection').onclick = () => {
  if (!state.selection) { notify('Kéo một khung quanh chủ thể trước nhé.'); return; }
  const a = toImage(state.selection.a), b = toImage(state.selection.b);
  const x = Math.max(0, Math.min(a.x, b.x)), y = Math.max(0, Math.min(a.y, b.y)); const r = Math.min(state.image.width, Math.max(a.x, b.x)), bottom = Math.min(state.image.height, Math.max(a.y, b.y));
  if (r - x < 5 || bottom - y < 5) { notify('Vùng chọn quá nhỏ hoặc nằm ngoài ảnh.'); return; }
  checkpoint(); const c = state.image.getContext('2d'); c.clearRect(0, 0, state.image.width, y); c.clearRect(0, bottom, state.image.width, state.image.height - bottom); c.clearRect(0, y, x, bottom - y); c.clearRect(r, y, state.image.width - r, bottom - y); state.selection = null; measure(); notify('Đã giữ phần trong khung. Có thể xóa nền hoặc dùng cọ để sửa tiếp.');
};
function brush(p) {
  const f = fit(), v = toImage(p); if (!v) return; const r = Number($('brush').value) / f.scale;
  const c = state.image.getContext('2d'); c.save(); c.beginPath(); c.arc(v.x, v.y, r, 0, Math.PI * 2); c.clip();
  c.clearRect(v.x - r, v.y - r, r * 2, r * 2); if (state.tool === 'restore') c.drawImage(state.original, 0, 0); c.restore(); dirty = true;
}
canvas.onpointerdown = e => {
  if (!state.image || state.busy || pointerId !== null) return;
  const p = point(e), v = toImage(p); if (!v) return;
  if (state.step === 2) {
    if (state.sampling) { if (v.inside) { state.sampling = false; removeBackground({ x: Math.floor(v.x), y: Math.floor(v.y) }); } return; }
    if (state.method !== 'manual') return;
    if (!v.inside && state.tool !== 'select') return;
    drawing = true; if (state.tool === 'select') state.selection = { a: p, b: p }; else { checkpoint(); brush(p); }
  } else if (state.step === 4) { pressed = true; energy = .75; state.count++; $('counter').textContent = state.count + ' cái xoa'; } else return;
  e.preventDefault(); pointerId = e.pointerId; canvas.setPointerCapture(e.pointerId); canvas.focus({ preventScroll: true }); pointer = p; lastPoint = p; dirty = true;
};
canvas.onpointermove = e => {
  const p = point(e);
  if (state.step === 2 && state.method === 'manual' && state.tool !== 'select' && e.pointerType !== 'touch') {
    const r = canvas.getBoundingClientRect(), size = Math.min(r.width, r.height); const cursor = $('brush-cursor'); cursor.hidden = false; cursor.style.left = (e.clientX - r.left) + 'px'; cursor.style.top = (e.clientY - r.top) + 'px'; cursor.style.width = cursor.style.height = Number($('brush').value) * 2 * size / SIDE + 'px';
  }
  if (pointerId !== e.pointerId) return;
  if (drawing) {
    if (state.tool === 'select') { state.selection.b = p; dirty = true; }
    else { const distance = Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y); const n = Math.max(1, Math.ceil(distance / Math.max(2, Number($('brush').value) / 3))); for (let i = 1; i <= n; i++) brush({ x: lastPoint.x + (p.x - lastPoint.x) * i / n, y: lastPoint.y + (p.y - lastPoint.y) * i / n }); }
  } else if (pressed) energy = Math.min(1, energy + Math.hypot(p.x - pointer.x, p.y - pointer.y) * .013);
  pointer = p; lastPoint = p; dirty = true;
};
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, e => { if (e.pointerId === pointerId) release(); });
canvas.onpointerleave = () => $('brush-cursor').hidden = true; window.addEventListener('blur', release);
function pet() { if (!state.bounds || state.step !== 4 || state.busy) return false; autoUntil = performance.now() + 1600; state.count++; $('counter').textContent = state.count + ' cái xoa'; dirty = true; return true; }
$('pet').onclick = pet; canvas.onkeydown = e => { if (e.code === 'Space' && state.step === 4) { e.preventDefault(); if (!e.repeat) pet(); } };
for (const [input, output, suffix] of [['tolerance', 'tolerance-value', ''], ['brush', 'brush-value', ' px'], ['hand-size', 'hand-size-value', '%'], ['soft', 'soft-value', '%']]) $(input).oninput = () => { $(output).textContent = $(input).value + suffix; dirty = true; };
document.querySelectorAll('[data-hand]').forEach(b => b.onclick = () => { state.hand = state.defaultHand; state.flip = b.dataset.hand === 'flipped'; document.querySelectorAll('[data-hand]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('hand-note').textContent = 'Đã chọn: ' + (state.flip ? 'Tay bên kia.' : 'Tay quen thuộc.'); dirty = true; });
document.querySelectorAll('[data-bg]').forEach(b => b.onclick = () => { $('stage').style.backgroundColor = b.dataset.bg; $('stage').style.color = b.dataset.bg === '#282c28' ? '#f4ffe2' : '#29351e'; document.querySelectorAll('[data-bg]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
let lastFrame = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(t) {
  const dt = Math.min((t - lastFrame) / 16.667 || 1, 3); lastFrame = t; const auto = state.step === 4 && t < autoUntil;
  if (document.hidden) { requestAnimationFrame(frame); return; }
  if (dirty || energy > .002 || auto) {
    ctx.clearRect(0, 0, SIDE, SIDE); const f = fit();
    if (f) {
      if (auto) { pointer = { x: 470 + Math.sin(t * .011) * 90, y: f.y + 65 }; energy = .85; }
      phase += .22 * dt; energy *= Math.pow(pressed ? .97 : .87, dt);
      ctx.save();
      if (state.step === 4) { const squash = energy * Number($('soft').value) / 100 * (.12 + .08 * Math.abs(Math.sin(phase))) * (reducedMotion ? .45 : 1); ctx.translate(450, 775); ctx.transform(1 + squash * .5, 0, Math.sin(phase) * energy * .022, 1 - squash, 0, 0); ctx.drawImage(state.image, f.source.x, f.source.y, f.source.width, f.source.height, f.x - 450, f.y - 775, f.w, f.h); }
      else ctx.drawImage(state.image, f.source.x, f.source.y, f.source.width, f.source.height, f.x, f.y, f.w, f.h);
      ctx.restore();
      if (state.step === 2 && state.selection) { const { a, b } = state.selection; ctx.strokeStyle = '#7752d8'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y); ctx.setLineDash([]); ctx.fillStyle = '#7851dc22'; ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); }
      if (state.step >= 3 && state.hand) {
        const w = Number($('hand-size').value) * 5.5, h = w * state.hand.height / state.hand.width;
        const x = (pressed || auto) && state.step === 4 ? pointer.x : 485, y = (pressed || auto) && state.step === 4 ? pointer.y : f.y + 45;
        ctx.save(); ctx.translate(x, y + Math.sin(phase) * energy * 12); ctx.rotate(-.04 + Math.sin(phase) * energy * .04); if (state.flip) ctx.scale(-1, 1); ctx.drawImage(state.hand, -w * .78, -h * .85, w, h); ctx.restore();
      }
    }
    dirty = false;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
loadImage('hand.png').then(img => { state.hand = state.defaultHand = img; dirty = true; }).catch(() => notify('Không tải được bàn tay mẫu. Bạn có thể chọn ảnh bàn tay riêng ở bước 3.'));
go(1, false); demo();
const cameraDialog = document.createElement('dialog'); cameraDialog.className = 'camera-dialog'; cameraDialog.setAttribute('aria-label', 'Chụp ảnh chủ thể'); cameraDialog.innerHTML = '<h2>Chụp nhân vật của bạn</h2><video autoplay playsinline muted></video><p role="status">Đang mở máy ảnh…</p><div class="row"><button class="secondary" data-close>Đóng</button><button class="primary" data-snap disabled>Chụp ảnh</button></div>'; document.body.append(cameraDialog);
let stream = null, cameraSession = 0; const video = cameraDialog.querySelector('video'), cameraStatus = cameraDialog.querySelector('p'), snap = cameraDialog.querySelector('[data-snap]');
function closeCamera() { cameraSession++; stream?.getTracks().forEach(t => t.stop()); stream = null; video.srcObject = null; cameraDialog.close(); }
cameraDialog.querySelector('[data-close]').onclick = closeCamera; cameraDialog.addEventListener('cancel', e => { e.preventDefault(); closeCamera(); }); window.addEventListener('pagehide', () => { closeCamera(); cancelWorker(false); });
$('camera').onclick = async () => { if (state.busy) return; if (!navigator.mediaDevices?.getUserMedia) { $('capture').click(); return; } const session = ++cameraSession; cameraDialog.showModal(); snap.disabled = true; cameraStatus.textContent = 'Cho phép dùng máy ảnh để chụp. Ảnh chỉ xử lý trên thiết bị.'; try { const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }); if (session !== cameraSession) { next.getTracks().forEach(t => t.stop()); return; } stream = next; video.srcObject = stream; await video.play(); snap.disabled = false; cameraStatus.textContent = 'Đưa chủ thể vào khung hình, rồi bấm Chụp ảnh.'; } catch { cameraStatus.textContent = 'Không mở được máy ảnh. Kiểm tra quyền truy cập hoặc đóng và chọn ảnh có sẵn.'; } };
snap.onclick = () => { if (!video.videoWidth) return; const photo = makeCanvas(video.videoWidth, video.videoHeight); photo.getContext('2d').drawImage(video, 0, 0); closeCamera(); ++loadSequence; setImage(photo, 'Ảnh vừa chụp'); };
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  const tool = { name: 'pet_image', description: 'Start a short petting animation when the studio is on step 4 with an image ready.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false }, execute(input) { if (!input || typeof input !== 'object' || Object.keys(input).length) throw new Error('Expected an empty object'); if (!pet()) throw new Error('Complete the studio setup and open step 4 first'); return { started: true, pets: state.count }; } };
  try { Promise.resolve(modelContext.registerTool(tool)).catch(() => {}); } catch { /* Optional browser capability. */ }
}
