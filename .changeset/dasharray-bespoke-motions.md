---
"lucide-react-motion": patch
---

Internal: migrate every bespoke signature motion (modifier-reveals, EKG pulse line, volume sound waves, wifi pen-write, wifi signal waves) off Motion's `pathLength` shortcut and onto the same `strokeDasharray` / `strokeDashoffset` pattern the default `draw` mode now uses. Every signed icon at rest now renders with no `pathLength="1"` or `stroke-dasharray="1 1"` attributes on the DOM — consistent with the byte-identical-to-Lucide guarantee. No visual or timing changes to the animations themselves.
