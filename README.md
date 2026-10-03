# RelaxAndChill

A small browser playground: brush a real cat, pet an uploaded character, and send a playable scene to a friend.

**Play:** https://xuankio.github.io/RelaxAndChill/

## Run locally

Node.js 22+:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:8765/. The interface uses Next.js App Router and React controls. Run `npm run build` for a static export in `out/`, then `npm run preview` to verify the published shape. Existing `create.html` links are preserved.

```sh
npm run check
npm run check:assets
npm test
```

## One canvas for play and editing

1. Play directly on the home page, or choose **Tạo ngay**. The same workspace supports both playing and editing.
2. Use **Chỉnh sửa → Ảnh**: the upload and camera icons choose JPG/PNG/WebP up to 20 MB.
3. Open **Chỉnh sửa → Tách nền**. Hold a subject for 550 ms, or use **✦ Tách** in the photo corner. **Cọ sửa** opens erase/restore/keep-region and brush size. Undo remains available.
4. **Tay / lược → Tùy chỉnh thêm** accepts JPG/PNG/WebP tools. Custom tools have their own automatic cutout, erase/restore brush, six undo checkpoints and original-image reset. Rotation (±180°), hue (±30°), saturation (60–140%) and brightness (80–120%) are non-destructive; reset restores neutral angle/color. Each play mode keeps its tool edits during the session. Extra settings include size, softness and background. Close the panel to play immediately; no forced sequence and no navigation away from the canvas.
5. The paper plane inside the scene opens **QR / Link** or **Tải GIF**. GIF exports are 400×400, 8-second silent loops that include grooming, one of five random goodbyes (SH, skateboard, shaka, cartoon explosion or waving), and the return. Drag with mouse/finger, or hold Space on the focused canvas to play. On phones, editing keeps the preview above a separately scrolling tool panel, so direction, rotation and color changes remain visible. Tool thumbnails fit their entire image.

## Background removal

- U²-NetP, pretrained open source salient-object segmentation, runs through ONNX Runtime Web in a cancellable worker. The 4.57 MB model and approximately 14.3 MB WASM runtime load only when automatic cutout is used. Photos stay on the device.
- Pressing a subject retains its connected predicted region. A button run keeps all predicted foreground. This is not Apple's model and cannot guarantee perfect separation of touching objects, hair or low-contrast edges.
- Simple color flood fill remains under **Nền đơn sắc**. Manual erase, restore, rectangular keep and six undo checkpoints remain available.
- No new training on 1,000 photos was performed. We applied existing pretrained work as requested; a credible fine-tune needs licensed image/mask pairs and a separate held-out evaluation. See [model decision](docs/background-model.md).

## Share links and privacy

Tool cutouts and angle/color settings survive sharing. Legacy links without tool appearance settings keep their original defaults. Built-in scenes have short links. Custom cutouts are resized to bounded WebP images, then saved to the dedicated Sites R2 service when QR / Link is selected. The GitHub repository never receives visitor photos. Built-in scenes use readable preset hashes; uploaded scenes use 16-character immutable content IDs. Anyone with the link can play. Shared routes hide editing; the completion action starts a separate new scene. Legacy compressed links still open.

## Project structure

- `app/page.jsx`, `components/Home.jsx`: Next.js home with one create action.
- `app/create/page.jsx`, `components/Editor.jsx`: statically rendered editor.
- `components/RangeControl.jsx`, `BrushPicker.jsx`: React controls; `public/studio.css` styles the fixed toolbar and scrolling settings.
- `public/app.js`: retained canvas, workers, camera and scene runtime; loaded after hydration.
- `public/grooming.js`: time-based interaction simulation, independent of rendering.
- `public/share.js`: versioned, bounded scene schema and encoding.
- `public/assets.js`: stable asset keys and normalized tool contact points.
- `public/subject-worker.js`, `segmentation.js`: model inference and selected-region mask.
- `public/background.js`: lightweight connected-color removal.
- `.agents/skills/relax-and-chill-assets` and `relax-and-chill-ui`: reusable photo-asset and UI workflows.

Only Next.js static output `out/` is published by GitHub Actions. Pushes to `main` run checks/tests and deploy to GitHub Pages. No user uploads, keys or training images belong in the repository.

## Credits

All active cat, brush and hand assets are real photographs. See [credits](public/credits.html) and [sources, licenses and changes](public/assets-provenance.md). Image licenses apply independently to each asset and its adaptations. Reference comb and brushing audio are documented separately in the credits; gameplay code is implemented locally.

U²-Net by Xuebin Qin and collaborators (Apache-2.0), ONNX weights distributed by rembg; ONNX Runtime by Microsoft (MIT). License texts ship beside their vendored artifacts. Background preprocessing follows the documented U²-NetP normalization used by rembg; see the model decision for sources and checksum.

QR is generated on-device from the same short URL used by Copy Link. The image service runs separately on Sites/Cloudflare R2; see server/README.md. No animation model was trained. The skateboard is generated at the owner’s explicit request; cat photographs are unchanged.

Progress grows during contact motion in either mode, waits one second when idle, then drains at 12 percentage points per second. Both modes purr; brushing mixes a quieter brushing track. Completion randomly selects a different farewell from the previous one.

The public menu is https://xuankio.github.io/RelaxAndChill/nlinn/ with `/nlinn/create/` and `/nlinn/p/`. The export nests all resources under `out/nlinn/` and leaves legacy redirects at the original paths, preserving query strings and fragments. GIF’s dice icon rerolls to a different ending.
