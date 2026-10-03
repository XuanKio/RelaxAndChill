# Canvas tools and endless play

- The tool tab, heading and size label follow the selected mode: Tay or Lược.
- Tách / Cọ sửa is a full-width horizontal switch inside the cutout panel. Manual tools appear only when Cọ sửa is selected. Subject and background editing share a horizontal, horizontally scrollable icon rail; settings scroll independently below it.
- Restore paints source pixels back into the subject. A 22% original-image guide is drawn behind it only while that brush is selected. The guide is never baked into saved scenes or GIFs.
- Subject/background editing supports pointer-anchored wheel zoom, right/middle mouse pan, Shift + right mouse rotation, and two-finger pan/pinch/twist. Five compact controls provide zoom, rotation and reset without gestures. View transforms are temporary and reset when leaving the panel; they do not change exported image geometry.
- A second touch cancels the provisional first-finger stroke, including its undo checkpoint and preset identity. Navigation consumes the remaining contacts until all fingers lift. Blur clears stale stroke rollback state.
- The infinity button is available in play, including shared scenes and the home player. Off has a red slash; on has a dark green background. Endless mode still counts strokes, purrs and lets comfort decay on pause, but never starts a farewell. Switching it resets the current round. GIF export retains its finite random farewell sequence.

## Checks

45 Node tests include transformed brush coordinates, anchored zoom, combined pinch/rotation/pan, gesture interruption, undo-history preservation and continuous endless grooming for both modes. Browser checks cover correct mode labels, restored pixels after 125% zoom / 15° rotation, 320px and 390px layouts, both horizontal rails, and endless mode reaching 100% / 182 strokes without departure. Physical multi-touch is covered by pointer-event tests, not a physical phone session.

Gesture references: [Procreate](https://help.procreate.com/procreate/handbook/5.3/interface-gestures/gestures), [Krita](https://docs.krita.org/en/user_manual/getting_started/navigation.html).
