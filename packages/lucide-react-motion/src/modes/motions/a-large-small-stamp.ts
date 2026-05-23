import { matchAnyPath, type Motion } from "../compose";
import { TYPEWRITER_STAMP_KEYFRAMES } from "./typewriter-stamp";

/**
 * `a-large-small` — small `a` and large `A`, each composed of a
 * triangle outline + a horizontal crossbar. Per-glyph grouping: the
 * crossbar must move WITH its parent triangle (same delay), not
 * staggered by ctx.index alone.
 *
 * Group key inferred from each path's `d`:
 * - small `a`: `m15 16 ...` triangle + `M15.697 14h5.606` crossbar
 * - large `A`: `m2 16 ...` triangle + `M3.304 13h6.392` crossbar
 *
 * Small `a` stamps first, large `A` follows after the stagger.
 * Uses the same `scale` / `opacity` / `y` shape as `typewriterStamp`.
 */
function glyphGroup(d: string): 0 | 1 {
  // Anything that starts with x=15 (small a's triangle/crossbar)
  if (d.startsWith("m15 ") || d.startsWith("M15")) return 0;
  // Large A (x=2/3)
  return 1;
}

const GLYPH_STAGGER = 0.14;

export const aLargeSmallStamp: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const group = glyphGroup(String(ctx.pathAttrs.d));
    return {
      rest: { y: 0, scale: 1, opacity: 1 },
      active: {
        y: [0, 1, 0],
        scale: TYPEWRITER_STAMP_KEYFRAMES.scale,
        opacity: TYPEWRITER_STAMP_KEYFRAMES.opacity,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay + group * GLYPH_STAGGER,
          repeat: ctx.repeat,
          y: {
            inherit: true,
            ease: "easeInOut",
            times: TYPEWRITER_STAMP_KEYFRAMES.times,
          },
          scale: {
            inherit: true,
            ease: "easeInOut",
            times: TYPEWRITER_STAMP_KEYFRAMES.times,
          },
          opacity: {
            inherit: true,
            ease: "easeInOut",
            times: TYPEWRITER_STAMP_KEYFRAMES.times,
          },
        },
      },
    };
  },
};
