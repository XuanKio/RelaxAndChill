# Photo asset provenance

Verified 2026-10-03. All active cat and tool assets come from real photographs; no generative AI imagery is used. Game names are display labels, not the photographed animals' identities.

## Mochi / assets/mochi.png

Original photograph © Marie-Lan Nguyen / Wikimedia Commons, CC BY 2.5; transparent derivative by Tesseractic, CC BY-SA 4.0.

[Original photograph](https://commons.wikimedia.org/wiki/File:Golden_tabby_and_white_kitten_n01.jpg) · [Transparent derivative](https://commons.wikimedia.org/wiki/File:Orange_and_white_tabby_kitten_(no_background).png) · [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

Changes: Distributed cutout unchanged, 482 × 379. Upstream uploader used remove.bg; the subject is a real photographed cat, not generated art.

## Mướp / cat.png

Photograph by Cassie J, CC BY 2.0; background removal by YukiKoKo, CC BY-SA 4.0.

[Original photograph](https://commons.wikimedia.org/wiki/File:Grey_classic_tabby.jpg) · [Transparent derivative](https://commons.wikimedia.org/wiki/File:DSH_blotched_transparent.png) · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

Changes: Removed disconnected alpha debris, cropped and added 12 px transparent margin. This modified cutout is distributed under CC BY-SA 4.0.

## Lược chải / assets/brush.png

Hairbrush with metal bristles.jpg by Klaus Post, CC BY 2.0.

[Commons source](https://commons.wikimedia.org/wiki/File:Hairbrush_with_metal_bristles.jpg) · [Original Flickr photo](https://www.flickr.com/photos/klauspost/92782973/) · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)

Changes: White background removed with this project's removeConnectedBackground (tolerance 46), mirrored horizontally, cropped, padded by 12 px and converted from JPEG to transparent PNG. Small source shadows remain at the handle edge.

## Bàn tay / hand.png

Right Hand Palm.png by Eyefive45, CC BY-SA 4.0.

[Commons source](https://commons.wikimedia.org/wiki/File:Right_Hand_Palm.png) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

Changes: Resized to 636 × 1000 before removal; white background removed with removeConnectedBackground (tolerance 27), cropped and padded by 12 px. This modified cutout is distributed under CC BY-SA 4.0.

## Reproduction

Download originals from the linked Commons description pages. Preserve supplied alpha for cat cutouts. Decode brush and hand to RGBA and invoke `dist/background.js` export `removeConnectedBackground` using the stated tolerances. Encode its returned pixels as PNG, crop and pad. Tabby cleanup retains the largest connected alpha component. This is local color flood fill, not a learned model. No generation or subject repainting.

CC BY-SA terms apply to the indicated image adaptations. Credits do not imply endorsement by the photographers.


## Active PetPet hand — 2026-10-04

`assets/pet-hand.png` (first frame) and `assets/pet-hand-strip.png` (1120 × 112): ten existing photographic hand frames from [camprevail/pet-pet-gif, pinned commit 28a4a5d18b312bcb84e6dcd461c0e16fc6d2bf16](https://github.com/camprevail/pet-pet-gif/tree/28a4a5d18b312bcb84e6dcd461c0e16fc6d2bf16), `petpetgif/img/pet0.gif` through `pet9.gif`. Repository copyright (c) 2021 camprevail, MIT. Full notice retained in `assets/PETPET-LICENSE.txt`. The repository does not identify the original photographer. Converted GIF frames to RGBA PNG and assembled horizontally; no generation or repainting. Supersedes the open-palm default; legacy photo and its attribution remain available.

## Active black comb — 2026-10-04

`assets/jjaemu-comb.png`: exact brush texture from [Brushing a jjaemu](https://www.brushjjaemu.org/brushjjaemu/index.html), requested explicitly by Xuân. The HTML embeds `https://pub-0ba721e1607c472c8a86577caa6292e8.r2.dev/brushjjaemu/index.html`; that document references public `index.pck`. Resource `.godot/imported/brush.PNG-1b46a544cf7abd088f26b6de110c06f8.ctex` corresponds to `art/brush.PNG`. Decoded its embedded lossless WebP to a 452 × 478 PNG, retaining transparency and orientation unchanged. No generation or repainting. Original individual artist and reuse license are not specified in the supplied page/bundle; this asset is not represented as MIT, CC, or owned by this project. Source attribution remains in the user-facing credits. No game code or cat photographs were copied. See audio sources below.


## Grooming audio (2026-10-04)
- `assets/audio/brushing.mp3`: `art/BrushingSound.mp3`, extracted byte-for-byte from the public Brush Jjaemu `index.pck` AudioStreamMP3 resource, at Xuân’s explicit request. Original creator and reuse license unspecified in the bundle; no ownership or MIT claim. Source: https://www.brushjjaemu.org/brushjjaemu/index.html .
- `assets/audio/purring.mp3`: real cat recording by Mysid, public domain, https://commons.wikimedia.org/wiki/File:Purring_cat.oga . Converted Ogg to mono 22.05 kHz MP3 at 64 kbps for browser compatibility. This is a separate recording, not an extracted purr from Jjaemu.

## Scooter finale
`assets/sh-scooter.png`: photograph supplied directly by Xuân in the chat attachment `codex-clipboard-ad7f6cdc-b8ba-466e-a44c-41dcb7074c04.png`. The supplied 2363×1575 PNG already contains alpha. Cropped transparent padding and downsampled to 1080×690; no generation or repainting. Used at the user's explicit request. Original photographer/license not provided; no ownership or MIT claim. Engine effect is procedural Web Audio, not a sampled real SH engine.
