# Background model decision

Reviewed 2026-10-03. The request allowed applying suitable open source work instead of newly training on approximately 1,000 photos.

| Candidate | Evidence | Decision |
| --- | --- | --- |
| [U²-Net / U²-NetP](https://github.com/xuebinqin/U-2-Net) | Pretrained salient-object detection, Apache-2.0; a compact U²-NetP model is provided. | Use the 4,574,861-byte pretrained ONNX model for the first browser release. It detects foreground without limiting the UI to a person-only mask. |
| [rembg](https://github.com/danielgatis/rembg) | MIT background-removal project with U²-NetP normalization, public weights and checksum. | Reuse the documented model/preprocessing contract; implement the browser adapter and selected connected-component mask locally. |
| [BiRefNet](https://github.com/ZhengPeng7/BiRefNet) | High-resolution dichotomous segmentation; larger general-purpose models and a lite variant. | Candidate for a future measured quality tier. Not shipped: no demonstrated phone memory/performance budget for this release. |

The choice prioritizes downloadable size and a static, private browser implementation. It is **not a claim of best-in-class accuracy**. Current checks cover browser execution and mask handling, not a representative benchmark of cats, people and objects.

## Reproducibility

Weights: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx

Expected MD5 from [rembg session](https://github.com/danielgatis/rembg/blob/main/rembg/sessions/u2netp.py): `8e83ca70e441ab06c318d82300c84806` (verified after download).

Model input: 320×320 RGB, normalized by image maximum, ImageNet mean/std, NCHW float32. Normalize first output to [0,1], retain the connected component nearest the held point when given, feather low-confidence edge values and resize the mask to source dimensions. Existing transparency is multiplied, never overwritten opaque.

Runtime: `onnxruntime-web@1.30.0`, single-thread WASM inside a worker (works without cross-origin isolation headers). Bundled ESM, WASM loader and binary come from the pinned npm package. Model assets are loaded only after a user action. Cancellation terminates the worker; a later action can retry. Image data never leaves the browser.

## If fine-tuning becomes necessary

No training job or benchmark improvement is claimed. A sensible 1,000-pair experiment requires photos **and accurate foreground masks**, balanced cats/people/objects, licenses and consent for redistribution where relevant, duplicate-free train/validation/test splits, and explicit IoU/MAE/boundary-quality and latency targets. Keep the test split untouched; compare the pretrained baseline and fine-tuned result on it before replacing the shipped model. Do not scrape random photos and treat inferred masks as ground truth.
## Interface reference

The final workspace uses one persistent canvas, freely selectable side-panel tabs, a contextual corner toolbar, and a circular upload control. It draws interaction guidance from [Adobe's Contextual Task Bar](https://helpx.adobe.com/ca/photoshop/desktop/get-started/learn-the-basics/boost-workflows-with-the-contextual-task-bar.html): show relevant actions near the current selection. No Adobe UI, artwork or code is copied. We do not claim Facebook/Instagram conversion or engagement results without user research.
