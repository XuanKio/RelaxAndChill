---
name: relax-and-chill-assets
description: Source licensed real photographs, isolate and register cat and grooming-tool cutouts for RelaxAndChill while preserving anchors and share-link compatibility.
---

# RelaxAndChill photo assets

Read `dist/assets.js`, `dist/background.js`, `dist/assets-provenance.md` and `scripts/check-assets.mjs` first. Asset keys are part of shared-link compatibility: keep existing keys working when replacing images.

## Source photographs only

Use real photographs from Wikimedia Commons or another source with explicit reuse permission. Do not use imagegen, generative fill, synthetic subjects, AI redraws or generated raster art. Inspect the source photograph and description page before downloading. Record the actual photographer, derivative editor, source URL, license URL and modifications; credit both original and derivative where relevant. A pre-existing transparent cutout is allowed when its subject is a real photograph; disclose upstream background-removal methods. Never assume an inspiration site's images may be reused.

## Prepare the cutout

Preserve existing alpha when sound. For plain photo backgrounds, use this project's `removeConnectedBackground` from `dist/background.js`: decode to RGBA, pass dimensions and a reviewed tolerance or seed, then encode returned pixels as PNG. This local flood fill is color segmentation, not a trained model. For complex backgrounds use the project’s pretrained U²-NetP worker (`dist/subject-worker.js`) and manual erase/restore fallback. Do not claim that pretrained model is newly trained in this project. Normal crop, resize, mirror and removal of disconnected alpha debris are allowed. Never repaint or generate missing subject parts.

Keep a small transparent margin, clear cat silhouette and visible back. Tools need consistent contact points. Do not bake a new background, UI or shadow into images. Inspect alpha composited on both light and dark colors; a viewer may display hidden RGB in fully transparent pixels.

## Register and credit

Write runtime PNGs to paths registered in `dist/assets.js`. Tune normalized `contact` coordinates there and correct labels to describe the photographed tool. Update `dist/assets-provenance.md` and user-facing `dist/credits.html` with author, source, license and changes. License modified CC BY-SA image derivatives under the required compatible license. Preserve direct links to originals.

Run `node scripts/check-assets.mjs` and inspect replaced images in the menu and playfield at phone and laptop sizes. Confirm no active key points to generated imagery.

Shared custom images must remain bounded raster data under `dist/share.js`; never accept SVG, remote URLs, arbitrary asset paths, scripts or HTML as scene data. Runtime Canvas deformation and particles do not change the photograph-only sourcing requirement.
