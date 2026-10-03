# Short scene links

The static Next.js website remains on GitHub Pages. `share-worker.js` is the
separate immutable scene service at https://relax-chill-links.nhtlinn.chatgpt.site.
Sites project: `appgprj_6ac148b4522881918ccfcb7295b8e8a6`.

- POST `/scenes` validates the same bounded scene schema as the player, limits
  request bytes, applies a per-isolate/IP burst limit, and stores JSON in R2.
- GET `/scenes/:id` loads a content-addressed 16-character ID. There is no list,
  replace or update endpoint. This is public link access, not private storage.
- CORS allows the GitHub Pages origin and the local development origins.
- The burst limit is best-effort per isolate, not a global quota. Before high
  traffic, use platform rate limiting and storage lifecycle/abuse controls.

Bundle with esbuild into the Sites worker starter's `worker/index.js`; preserve
its project ID and use hosting `r2: "BUCKET"`. The portable checkout for this
deployment is `work/share-service` (ignored). Build with `node scripts/build.mjs`
and validate with `node scripts/validate-artifact.mjs`. On Windows the Sites
packager requires Git Bash ahead of WSL Bash and GNU tar `TAR_OPTIONS=--force-local`.
Publish with the Sites source workflow. Never commit credentials or visitor data.

New links open `/p/`; `/create/` is the editor. Old `/create.html` URLs retain
their query/hash, normalize to the new route and remain usable. The client hides
editing for shared scenes, while the server's immutable API ensures recipients
cannot overwrite the original. This does not prevent recipients saving visible
images or using their own software to make copies.
