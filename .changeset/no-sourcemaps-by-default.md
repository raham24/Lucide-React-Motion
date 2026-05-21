---
"lucide-react-motion": patch
---

Drop sourcemaps from the published tarball by default. The two `.map` files (`index.js.map` + `index.cjs.map`) were ~5 MB of the ~9 MB unpacked package size and are never read by consumers shipping minified bundles. Set `SOURCEMAP=true pnpm build` locally if you need them for debugging or release inspection.
