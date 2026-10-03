# Next.js studio and sharing

- Next.js 16.3.8 static export preserves `create.html` and all existing URL fragments. React owns the slider and brush-selection controls; the tested canvas/worker runtime starts after hydration. Full document navigation deliberately gives game listeners/workers a clean lifecycle.
- Fixed tabs, a separate left tool rail, scrolling brush settings, and a fixed save footer avoid overlapping controls. Native range inputs retain keyboard support and gain thin tracks, value badges and circular handles. Reduced motion is respected.
- The home page has one **Tạo ngay** action. Upload/camera live in the photo panel. One paper plane inside the stage opens **QR / Link** or **Tải GIF**. Save stores the full local draft and highlights the plane.
- QR encoding is local (node-qrcode, MIT). For large custom scenes, QR receives smaller thumbnails; the copied URL keeps its larger images. Excessively detailed scenes retain the copy-link fallback. No image hosting backend is introduced.
- GIF exports have 100 frames at 80 ms, 400×400, and no audio: 4.8 seconds of petting/brushing followed by the 3.2-second shared scooter animation. Palette samples include the scooter. No animation model was trained; frames use the actual edited assets and game animation.
- `npm ci`, `npm run check`, `npm run check:assets`, `npm test`, `npm run build`. Set `NEXT_PUBLIC_BASE_PATH=/RelaxAndChill` for Pages. Only `out/` is deployed; `public/` holds source runtime/assets and `app/`, `components/` hold the Next interface.
