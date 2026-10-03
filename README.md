# RelaxAndChill

A small browser playground: brush a real cat, pet an uploaded character, and send a playable scene to a friend.

**Play:** https://xuankio.github.io/RelaxAndChill/

## Run locally

Node.js 20+:

```sh
npm run dev
```

Open http://127.0.0.1:8765/. Runtime assets are vendored, so npm installation is not required just to run or test. `npm ci` is only needed when updating the pinned ONNX Runtime dependency.

```sh
npm run check
npm run check:assets
npm test
```

## One canvas for play and editing

1. Choose **Chơi ngay** or **Tự tạo**. The same workspace supports both playing and editing.
2. Use the circular ↑ on the photo to upload JPG/PNG/WebP up to 20 MB. Camera and sample live under **Chỉnh sửa → Ảnh → Tùy chọn ảnh**.
3. Open **Chỉnh sửa → Tách nền**. Hold a subject for 550 ms, or use **✦ Tách** in the photo corner. **Cọ sửa** opens erase/restore/keep-region and brush size. Undo remains available.
4. **Tay / lược** selects direction or a custom transparent tool. Extra settings include size, softness and background. Close the panel to play immediately; no forced sequence and no navigation away from the canvas.
5. **Gửi bạn** copies a playable scene. Drag with mouse/finger, or hold Space on the focused canvas to play. On phones, the contextual panel sits below the canvas to keep both reachable.

## Background removal

- U²-NetP, pretrained open source salient-object segmentation, runs through ONNX Runtime Web in a cancellable worker. The 4.57 MB model and approximately 14.3 MB WASM runtime load only when automatic cutout is used. Photos stay on the device.
- Pressing a subject retains its connected predicted region. A button run keeps all predicted foreground. This is not Apple's model and cannot guarantee perfect separation of touching objects, hair or low-contrast edges.
- Simple color flood fill remains under **Nền đơn sắc**. Manual erase, restore, rectangular keep and six undo checkpoints remain available.
- No new training on 1,000 photos was performed. We applied existing pretrained work as requested; a credible fine-tune needs licensed image/mask pairs and a separate held-out evaluation. See [model decision](docs/background-model.md).

## Share links and privacy

Built-in scenes have short links. Custom cutouts are resized to at most 256 px and encoded as WebP in the URL fragment; they are not uploaded to a server. Anyone with the link can view that image. Custom links can be long, and some messaging apps truncate them. The recipient needs a current browser supporting gzip streams for compressed links. Invalid, oversized and unsupported payloads are rejected.

## Project structure

- `dist/index.html`, `style.css`, `play.js`: compact menu and preset entry.
- `dist/create.html`, `editor.css`, `app.js`: unified player, side tools, camera and canvas editing.
- `dist/grooming.js`: time-based interaction simulation, independent of rendering.
- `dist/share.js`: versioned, bounded scene schema and encoding.
- `dist/assets.js`: stable asset keys and normalized tool contact points.
- `dist/subject-worker.js`, `segmentation.js`: model inference and selected-region mask.
- `dist/background.js`: lightweight connected-color removal.
- `.agents/skills/relax-and-chill-assets` and `relax-and-chill-ui`: reusable photo-asset and UI workflows.

Only `dist/` is published by GitHub Actions. Pushes to `main` run checks/tests and deploy to GitHub Pages. No user uploads, keys or training images belong in the repository.

## Credits

All active cat, brush and hand assets are real photographs. See [credits](dist/credits.html) and [sources, licenses and changes](dist/assets-provenance.md). Image licenses apply independently to each asset and its adaptations. No reference-game artwork or code was copied.

U²-Net by Xuebin Qin and collaborators (Apache-2.0), ONNX weights distributed by rembg; ONNX Runtime by Microsoft (MIT). License texts ship beside their vendored artifacts. Background preprocessing follows the documented U²-NetP normalization used by rembg; see the model decision for sources and checksum.
