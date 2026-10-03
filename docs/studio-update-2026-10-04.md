# Studio update — 2026-10-04

- Canvas fills the stage's aspect ratio. Pointer coordinates, background cover mapping and rendering use the same 900-unit short edge.
- Subject cutout/drawing and backgrounds have separate undo histories. Round, soft and marker brushes support color and opacity. Save writes full-resolution PNG blobs and restore sources to a single local IndexedDB draft. `create.html?edit` resumes that draft; explicit preset/shared links take priority.
- Subject size is 40–160%; existing tool size is now directly visible. Background and subject scale are optional backward-compatible share fields. Uploaded images stay local; bounded WebP copies are carried in shared links.
- GIF generation uses vendored gifenc 1.0.3 (MIT) in a cancellable worker: 400×400, 40 frames, 80 ms/frame, infinite loop. Captures subject edits, scale, tool tint/rotation/flip and custom background. GIF has no audio. Save/share controls appear after generation.
- Homepage embeds the same player in `?home` mode; both presets support brushing/petting. No duplicate simulation.
- Hand frames are isolated at native size before scaling, eliminating neighboring sprite columns. Default comb rotation is -15 degrees.
- Brush audio extracted from the user-specified public reference bundle; purr is a public-domain real recording. See user-facing credits. Playback starts with a gesture, follows contact motion, stops on release/blur/dialog and can be muted. Completed brushing boards the supplied SH scooter, rides off with smoke and a synthesized rev, and resets after 3.2 s; reduced motion fades instead.

## Validation

- Syntax/local file check, asset checks and unit tests.
- UI checks at 320×740, 390×844 and 1366×900: drawing, separate background layer, undo availability, draft save/reload, shared background/scale, homepage preset/mode switching and grooming, edge-to-edge pointer movement, clean hand frame edges, audio loading/mute, full-meter dash/return.
- Downloaded browser-generated GIF decoded with Pillow: 400×400, 40 differing frames, 3200 ms total, loop=0.
- Private-window storage restrictions may prevent draft persistence; failure leaves the current edit intact and shows an error. File sharing depends on Web Share support; downloading is always offered.
