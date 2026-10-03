import Runtime from './Runtime';

export default function Home(){return <>
<header className="topbar"><a className="brand" href="./"><img src="favicon.svg" alt="" width="38" height="38" /><span>RelaxAndChill<span className="brand-tag">a little pause, a little purr.</span></span></a><a className="github-link" href="https://github.com/XuanKio/RelaxAndChill" target="_blank" rel="noreferrer" aria-label="Mã nguồn GitHub">GitHub ↗</a></header>

<main><section id="menu" className="menu-view" aria-label="Menu chính"><div className="menu-copy"><span className="eyebrow">GÓC NHỎ CỦA BẠN</span><h1>Thả lỏng một chút.<br /><em>Mèo ở đây rồi.</em></h1><p>Chải lông. Xoa đầu. Chẳng cần vội.</p><div className="menu-actions"><a className="primary" href="create/">Tạo ngay <span aria-hidden="true">↗</span></a></div>
<div className="preset-picker" role="group" aria-label="Chọn mèo mẫu"><button data-preset="mochi" aria-pressed="true"><img src="assets/mochi.png" alt="" /><span>Mochi</span></button><button data-preset="tabby" aria-pressed="false"><img src="cat.png" alt="" /><span>Mướp</span></button></div>
</div>
<div className="menu-scene"><iframe id="home-game" src="p/?home#preset=mochi" title="Chơi cùng Mochi" loading="eager"></iframe></div>
<p className="menu-footnote">Chuột, ngón tay hoặc phím cách. <a href="credits.html">Nguồn ảnh</a></p></section>

</main>


<Runtime src="play.js?v=short-links" />
</>;}
