import { defineConfig } from "tsup";

const shared = {
  format: ["esm", "cjs"] as const,
  dts: true,
  sourcemap: true,
  splitting: false,
  external: ["react", "react-dom", "motion", "motion/react"],
};

export default defineConfig([
  // Main entry: client-side (uses hooks, Motion). The banner re-adds
  // "use client" because esbuild strips source-level directives when
  // bundling, and RSC needs the directive to mark the client boundary.
  {
    entry: { index: "src/index.ts" },
    clean: true,
    banner: { js: '"use client";' },
    ...shared,
  },
  // Manifest entry: pure data, safely importable from server components.
  // No "use client" so it doesn't force a client boundary.
  {
    entry: { manifest: "src/manifest.ts" },
    clean: false,
    ...shared,
  },
]);
