---
name: relax-and-chill-ui
description: Extend RelaxAndChill menus, grooming interactions, canvas tools, and motion while keeping the playfield clear and phone layouts compact.
---

# RelaxAndChill interface

Read `dist/index.html`, `dist/create.html`, `dist/app.js`, `dist/grooming.js` and styles before editing. Keep Canvas rendering separate from the pure grooming simulation and share schema.

The main menu has two primary actions: play a preset or create a scene. The player has one mode selector, one comfort indicator, and small menu/share actions. Use one persistent workspace canvas in `create.html`; the side tool panel opens/closes without resetting play progress. Prefer selected icons with accessible labels over repeated explanatory paragraphs.

Do not restore a forced multi-step wizard. Photo, cutout and tool are freely selectable tabs in the side panel. Put a circular upload icon inside the image. Put automatic cutout and manual brush in the image corner; show brush options only after selection. Holding a subject triggers segmentation after 550 ms; moving or releasing cancels the hold. Preserve erase, restore, undo, camera, own-tool upload, and keyboard operation.

Use brief transitions for screen changes, spring easing for tool movement, and contact-driven reactions for the cat. Stop scoring on release, blur, hidden tabs, menu entry, or dialogs. Respect reduced motion. Use elapsed seconds, not frames, for gameplay and smoothing. Avoid progress from a held stationary cursor or a tool outside the cat.

Verify at 390×844 and 1366×900, plus a narrow 320 px check. Menus and gameplay should fit the viewport; the creator may scroll. Test touch-equivalent dragging, keyboard input, pause/resume, return to menu, and the exact shared URL in a fresh page. Invalid or excessive share payloads must show a recoverable message and leave the menu usable.

Publish to the user-selected provider. GitHub Pages deployments must use relative asset URLs and ship only `dist/`; never put credentials or user uploads in the public repository. A share link includes its scene data and is accessible to anyone who receives it; reflect that in the share UI.
