import Runtime from './Runtime';
import RangeControl from './RangeControl';
import BrushPicker from './BrushPicker';

export default function Editor({playOnly=false}){return <>
<header className="site-header"><a className="brand" href="./" aria-label="RelaxAndChill — về trang chủ"><img src="favicon.svg" width="36" height="36" alt="" /><span>RelaxAndChill</span></a></header>
<main data-play-only={playOnly ? "true" : undefined}>
<div className="workspace-toolbar"><div className="play-modes" role="group" aria-label="Chế độ chơi"><button data-mode="brush" aria-pressed="true">Chải lông</button><button data-mode="pet" aria-pressed="false">Xoa đầu</button></div>
</div>
<div className="studio"><div className="preview-column"><div className="preview-meta"><span id="preview-label">ẢNH CỦA BẠN</span><span id="image-name">Mèo mẫu</span></div>
<div id="stage" className="stage"><a id="create-own" className="create-own primary" href="create/?new" target="_top" hidden>Tạo của riêng bạn <span aria-hidden="true">↗</span></a><button id="toggle-tools" aria-label="Bật hoặc tắt công cụ chỉnh sửa" className="stage-edit" aria-expanded="false" aria-controls="tool-panel">✎ <span>Chỉnh sửa</span></button><button id="toggle-sound" className="stage-sound" aria-label="Tắt âm thanh" aria-pressed="true">🔊</button><canvas id="canvas" width="900" height="900" tabIndex="0" aria-label="Ảnh xem trước. Ở bước tách nền, giữ và kéo để chỉnh ảnh."></canvas><button id="share" aria-label="Gửi bạn: QR hoặc GIF" title="Gửi bạn" className="share-plane stage-share"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" /></svg></button>
<button id="toggle-endless" className="stage-endless" aria-label="Chế độ vô cực" aria-pressed="false" title="Xoa / chải không giới hạn" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12C9 8 8 7 6 7a5 5 0 0 0 0 10c2 0 3-1 6-5s4-5 6-5a5 5 0 0 1 0 10c-2 0-3-1-6-5Z"/><path className="endless-slash" d="m4 20 16-16"/></svg></button>
<div className="comfort-chip" id="comfort-chip"><span id="mood">Đang đợi bạn</span><span id="comfort-value">0%</span><progress id="comfort" max="100" value="0" aria-label="Độ thư giãn"></progress></div>
<span id="reward" hidden>♡ Mê lắm rồi!</span><div id="empty" className="empty" hidden>Chọn một ảnh để bắt đầu</div>
<div id="busy-overlay" className="busy-overlay" hidden><span className="spinner"></span><span>Đang xử lý…</span><button id="cancel-auto" className="secondary">Hủy</button></div>
<div id="view-controls" className="view-controls" role="group" aria-label="Góc nhìn ảnh" hidden>
<button id="view-out" aria-label="Thu nhỏ" title="Thu nhỏ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></button>
<button id="view-reset" aria-label="Đặt lại góc nhìn" title="Vừa khung · đặt lại xoay">100%</button>
<button id="view-in" aria-label="Phóng to" title="Phóng to"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
<span className="view-divider" aria-hidden="true"></span>
<button id="view-left" aria-label="Xoay trái 15 độ" title="Xoay trái"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></svg></button>
<button id="view-right" aria-label="Xoay phải 15 độ" title="Xoay phải"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10a8 8 0 1 0-1 8M20 4v6h-6"/></svg></button>
</div>
<div id="brush-cursor" className="brush-cursor" hidden></div>
</div>
<div className="preview-footer"><p id="hint">Ảnh chỉ xử lý trên thiết bị.</p><span id="counter" hidden></span></div>
</div>

<aside className="control-panel" id="tool-panel" hidden><div className="panel-topbar"><button id="close-tools" className="close-tools" aria-label="Đóng công cụ">×</button><nav className="steps" aria-label="Thanh công cụ"><button data-step="1" aria-current="step">Ảnh</button><button data-step="2">Tách nền</button><button data-step="3">Lược</button><button data-step="5">Nền</button></nav></div>

<div className="panel-body"><div className="panel-heading"><span id="step-kicker" className="eyebrow">BƯỚC 01 / 03</span><h1 id="panel-title">Chọn nhân vật</h1><p id="panel-description">Ảnh của bạn, góc chill của bạn.</p></div>

<section data-panel="1"><label className="name-label" htmlFor="scene-name">Tên nhân vật</label>
<input id="scene-name" type="text" maxLength="30" defaultValue="Bạn nhỏ" autoComplete="off" /><label className="range-label" htmlFor="subject-size">Kích thước nhân vật <output id="subject-size-value">100%</output></label>
<RangeControl id="subject-size" min="40" max="160" defaultValue="100" /><div className="photo-actions" role="group" aria-label="Chọn ảnh nhân vật"><label className="photo-action" id="dropzone" tabIndex="0" role="button" aria-label="Tải ảnh nhân vật" title="Tải ảnh nhân vật"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5M5 16v4h14v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path></svg><input id="file" type="file" accept="image/jpeg,image/png,image/webp" hidden /></label><button id="camera" className="photo-action" aria-label="Chụp ảnh nhân vật" title="Chụp ảnh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 5 10 3h4l2 2h4a2 2 0 0 1 2 2v12H2V7a2 2 0 0 1 2-2h4Z"/><circle cx="12" cy="12" r="4"/></svg></button><input id="capture" type="file" accept="image/*" capture="environment" hidden /></div>
</section>

<section data-panel="2" hidden><div className="cutout-modes"><div className="canvas-tool-buttons" role="group" aria-label="Cách tách nền"><button id="lift" className="canvas-tool" data-method="auto" aria-pressed="true" title="Tách tự động">✦ Tách</button><button className="canvas-tool" data-method="manual" aria-pressed="false" title="Dùng cọ sửa">◌ Cọ sửa</button></div>
</div>
<div id="manual-controls" hidden><div className="tool-options" role="group" aria-label="Công cụ"><button id="undo" className="secondary" disabled aria-label="Hoàn tác" title="Hoàn tác"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m8 4-5 5 5 5M3 9h11a6 6 0 0 1 0 12h-3"></path></svg></button><button data-tool="erase" aria-pressed="true" aria-label="Xóa" title="Xóa"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6-11 11H6l-4-4L15 3Z"></path><path d="m8 10 6 6M10 20h11"></path></svg></button><button data-tool="restore" aria-pressed="false" aria-label="Cọ khôi phục" title="Cọ khôi phục ảnh gốc"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6 4 4M9 15l9-9a2 2 0 0 1 3 3l-9 9M9 15c-4-1-5 3-5 5 4 1 7-1 7-3M3 9a6 6 0 0 1 8-6M3 3v6h6"/></svg></button><button data-tool="draw" aria-pressed="false" aria-label="Vẽ" title="Vẽ"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m14 5 4 4M9 14 19 4a2 2 0 0 1 3 3L12 17M9 14c-3-1-5 1-5 4 0 2-2 3-2 3 5 1 9-1 9-4Z"></path></svg></button><button data-tool="select" aria-pressed="false" aria-label="Giữ vùng" title="Giữ vùng"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17C0 12 3 4 12 4s12 9 5 13c-3 2-8 2-11 0Zm0 0c-3 3 2 7 5 3"></path></svg></button></div>
<div className="brush-settings"><p id="tool-help" className="help">Vẽ lên phần muốn xóa.</p><label className="range-label" htmlFor="brush">Cỡ cọ <output id="brush-value">36 px</output></label>
<RangeControl id="brush" min="4" max="100" defaultValue="36" /><button id="keep-selection" className="secondary full" hidden>Giữ vùng đã khoanh</button><div id="paint-controls" hidden><label className="range-label" htmlFor="paint-shape">Kiểu cọ</label>
<BrushPicker /><div className="paint-swatches" role="group" aria-label="Bảng màu cọ"><input id="paint-color" type="color" defaultValue="#ef7293" aria-label="Chọn màu cọ khác" title="Chọn màu khác" /><button data-paint-color="#ef7293" style={{"--paint": "#ef7293"}} aria-label="Hồng" aria-pressed="true"></button><button data-paint-color="#f8d393" style={{"--paint": "#f8d393"}} aria-label="Vàng" aria-pressed="false"></button><button data-paint-color="#73a6db" style={{"--paint": "#73a6db"}} aria-label="Xanh" aria-pressed="false"></button><button data-paint-color="#ffffff" style={{"--paint": "#ffffff"}} aria-label="Trắng" aria-pressed="false"></button><button data-paint-color="#333333" style={{"--paint": "#333333"}} aria-label="Đen" aria-pressed="false"></button></div>
<label className="range-label" htmlFor="paint-opacity">Độ đậm <output id="paint-opacity-value">100%</output></label>
<RangeControl id="paint-opacity" min="10" max="100" defaultValue="100" /></div>
</div>
</div>
<div id="auto-controls"><p className="help">Giữ lên chủ thể hoặc chạm ✦ Tách.</p><details><summary>Nền đơn sắc</summary><button id="remove" className="secondary full">Xóa theo màu</button><label className="range-label" htmlFor="tolerance">Mức xóa <output id="tolerance-value">38</output></label>
<RangeControl id="tolerance" min="5" max="110" defaultValue="38" /><button id="sample" className="text-button full">Chọn màu nền trên ảnh</button></details>
</div>
<div className="edit-actions" id="edit-history"><button id="restore-all" className="secondary" hidden aria-label="Khôi phục ảnh ban đầu" title="Ảnh ban đầu"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9a8 8 0 1 1 0 7M4 4v5h5"></path></svg></button></div>
</section>

<section data-panel="3" hidden>
<div id="tool-picker">
 <div className="tool-choices" role="group" aria-label="Chọn dụng cụ">
  <button data-mode="pet" aria-pressed="false"><span className="tool-choice-image"><img src="assets/pet-hand.png" alt="" /></span><strong>Tay</strong><small>Xoa đầu</small></button>
  <button data-mode="brush" aria-pressed="true"><span className="tool-choice-image"><img src="assets/jjaemu-comb.png" alt="" /></span><strong>Lược</strong><small>Chải lông</small></button>
 </div>

<label className="range-label" htmlFor="hand-size"><span id="tool-size-label">Kích thước lược</span> <output id="hand-size-value">75%</output></label>
<RangeControl id="hand-size" min="35" max="120" defaultValue="75" /> <button id="open-tool-settings" className="secondary full" aria-expanded="false" aria-controls="tool-settings">Tùy chỉnh thêm <span aria-hidden="true">→</span></button>
</div>

<div id="tool-settings" hidden>
 <div className="tool-settings-heading"><button id="back-tool-picker" className="text-button" aria-label="Quay lại chọn dụng cụ" title="Quay lại"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"></path></svg></button><h2 id="tool-settings-title">Chỉnh lược</h2></div>

 <div className="tool-direction" role="group" aria-label="Hướng dụng cụ"><button data-hand="classic" aria-pressed="true">Hướng gốc</button><button data-hand="flipped" aria-pressed="false">Lật ngang</button></div>

<label className="range-label" htmlFor="tool-rotation">Góc xoay <output id="tool-rotation-value">0°</output></label>
<RangeControl id="tool-rotation" min="-180" max="180" defaultValue="0" step="1" />
<details className="tool-color-controls"><summary>Màu sắc</summary><label className="range-label" htmlFor="tool-hue">Sắc màu <output id="tool-hue-value">0°</output></label>
<RangeControl id="tool-hue" min="-30" max="30" defaultValue="0" /><label className="range-label" htmlFor="tool-saturation">Độ đậm <output id="tool-saturation-value">100%</output></label>
<RangeControl id="tool-saturation" min="60" max="140" defaultValue="100" /><label className="range-label" htmlFor="tool-brightness">Độ sáng <output id="tool-brightness-value">100%</output></label>
<RangeControl id="tool-brightness" min="80" max="120" defaultValue="100" /></details>
<button id="tool-reset-style" className="text-button full">Đặt lại góc và màu</button><label className="range-label" htmlFor="soft">Độ mềm <output id="soft-value">55%</output></label>
<RangeControl id="soft" min="10" max="100" defaultValue="55" /><details className="tool-photo-controls"><summary>Ảnh &amp; tách nền</summary><label className="hand-upload secondary full" tabIndex="0" role="button" id="hand-upload">＋ Ảnh dụng cụ riêng<input id="hand-file" type="file" accept="image/jpeg,image/png,image/webp" hidden /></label>
<p id="hand-note" className="help">JPG, PNG hoặc WEBP.</p><div className="edit-actions"><button id="tool-cutout" className="secondary" disabled>Tách nền</button><button id="tool-default" className="secondary">Dùng mẫu</button></div>
<p id="tool-cutout-note" className="help">Mẫu đã trong suốt. Tải ảnh để sửa nền.</p></details>
<div className="swatches" role="group" aria-label="Màu nền"><button data-bg="mint" style={{"--color": "#cde8dc"}} aria-label="Bạc hà" aria-pressed="true"></button><button data-bg="peach" style={{"--color": "#f5d6c7"}} aria-label="Đào" aria-pressed="false"></button><button data-bg="blue" style={{"--color": "#cbdff0"}} aria-label="Xanh trời" aria-pressed="false"></button><button data-bg="cream" style={{"--color": "#f4e8cf"}} aria-label="Kem" aria-pressed="false"></button></div>
</div>
</section>

<section data-panel="5" hidden><div className="background-actions"><label id="background-upload" className="secondary" tabIndex="0" role="button" aria-label="Tải ảnh nền" title="Tải ảnh nền"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="16" height="16" rx="3"></rect><circle cx="8" cy="10" r="1"></circle><path d="m4 18 5-5 4 4 3-3 3 3M19 2v6M16 5h6"></path></svg><input id="background-file" type="file" accept="image/jpeg,image/png,image/webp" hidden /></label>
<button id="clear-background" className="secondary" aria-label="Xóa nền riêng" title="Xóa nền riêng"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"></path></svg></button></div>
<div id="background-tools"></div>
</section>
<p id="status" className="status" role="status" aria-live="polite"></p></div><div className="panel-footer"><button id="save-edit" className="primary full" hidden>Lưu</button><button id="resume-play" className="primary full resume-play">Chơi tiếp ♡</button></div></aside>
</div>
</main>
<dialog id="share-dialog" className="share-sheet" aria-labelledby="share-heading">
<form method="dialog"><button className="dialog-close icon-button" aria-label="Đóng chia sẻ">×</button></form>
<div className="share-emblem" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" /></svg></div>
<h2 id="share-heading">Gửi một chút chill</h2>
<div id="share-choices" className="share-choices">
<button id="share-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6zM12 3v9H3M12 15v6M18 12h3" /></svg><strong>QR / Link</strong><span>Rủ bạn chơi cùng</span></button>
<button id="share-gif"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="4"/><path d="m10 8 6 4-6 4V8Z"/></svg><strong>Tải GIF</strong><span>Tạm biệt bất ngờ</span></button>
</div>
<div id="share-link-panel" hidden><button id="share-back" className="share-back" aria-label="Quay lại lựa chọn chia sẻ" title="Quay lại">←</button><img id="share-qr" alt="Mã QR mở cảnh chơi của bạn" hidden/><label className="sr-only" htmlFor="share-url">Link chia sẻ</label><div className="share-link-field"><img src="favicon.svg" width="25" height="25" alt=""/><input id="share-url" readOnly/></div><button id="copy-link" className="primary full">Sao chép link</button><button id="native-share" className="text-button full" hidden>Gửi qua ứng dụng</button><p id="share-status" className="small" role="status"></p></div>
<p className="share-privacy">Tạo QR sẽ lưu cảnh trực tuyến. Ai có link đều chơi được.</p>
</dialog>

<Runtime src="app.js?v=canvas-endless" />
</>;}
