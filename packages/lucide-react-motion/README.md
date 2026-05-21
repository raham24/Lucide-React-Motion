# lucide-react-motion

Lucide icons as animated React components, powered by [Motion](https://motion.dev).

## Features

- **Byte-identical to Lucide's static SVG at rest** — no leftover `pathLength` or `stroke-dasharray` attributes, no geometry drift on closed-loop icons (gear, cloud, heart).
- **1,700+ icons**, generated from `lucide-static`, individually importable so the bundler tree-shakes anything you don't use.
- **Six triggers**: `hover`, `click`, `mount`, `in-view`, `parent-hover`, `manual` (with an imperative `ref` handle).
- **Per-icon character animations** via `mode="signature"` — a heart beats, a bell rings, a clock ticks. Falls back to the default stroke-on draw for icons without a registered signature.
- **RSC-safe** — generated icons carry no per-file `"use client"`; the directive lives on the published bundle once so server components can import the package without breaking the boundary.
- **Full Motion escape hatch** — pass `variants` or a `mode` factory to take over animation entirely with the resolved timing context (`duration`, `delay`, `stagger`, `easing`, `repeat`, plus the path's measured `pathLength`).
- **Reduced-motion aware** — respects the OS preference by default, with `reducedMotion="always" | "never"` overrides.

## Install

```bash
npm install lucide-react-motion motion react react-dom
```

`motion`, `react`, and `react-dom` are peer dependencies.

## Usage

```tsx
import { Heart, Settings, Bell } from "lucide-react-motion";

export function Demo() {
  return (
    <>
      <Heart trigger="hover" size={32} />
      <Settings mode="signature" trigger="hover" />
      <Bell trigger="click" onLeave="snap" />
    </>
  );
}
```

App-wide defaults via `MotionIconConfig`:

```tsx
import { MotionIconConfig } from "lucide-react-motion";

<MotionIconConfig trigger="hover" mode="signature" duration={0.45}>
  <App />
</MotionIconConfig>;
```

See the [documentation site](https://lucide-react-motion.dev) for the full API, gallery, and playground.
