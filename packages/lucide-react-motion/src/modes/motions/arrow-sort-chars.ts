import type { Motion } from "../compose";

/**
 * Cascading reveal for the two characters in the digit / letter
 * sort variants: `arrow-{up,down}-{0-1,1-0,a-z,z-a}`. Each icon
 * has two characters stacked on the right side (top character at
 * y ≤ 12, bottom at y > 12). The cascade direction matches the
 * arrow:
 *
 * - `arrow-down-*` — top character reveals first, bottom second.
 * - `arrow-up-*` — bottom character reveals first, top second.
 *
 * Reads as the sort being demonstrated: items revealed in the
 * order the arrow indicates.
 *
 * Each character is a group of 1+ elements:
 *
 * - `"0"` is a single `<rect>` (x = 15).
 * - `"1"` is two paths (a vertical stroke + a horizontal base).
 * - `"A"` is two paths (the upper peak `M15 10V6.5...` + a
 *   crossbar `M20 8h-5`).
 * - `"Z"` is a single path (`M15 14h5l-5 6h5` or `M15 4h5l-5 6h5`).
 *
 * All elements in the same character group share the same cascade
 * slot (matched by their y-coordinate group). Reveal mechanism
 * branches by element type:
 *
 * - `<path>` → dasharray + dashoffset draw-in over `ctx.pathLength`
 *   (cleared on `transitionEnd`).
 * - `<rect>` → scale-from-0 pivoted at fill-box centre + opacity.
 *
 * Two slots, each 0.2 wide of the cycle: slot 0 = `t ∈ [0, 0.2]`,
 * slot 1 = `t ∈ [0.2, 0.4]`. Both characters revealed by `t = 0.4`,
 * leaving the rest of the cycle for the arrow glide to settle.
 *
 * Place this FIRST in each digit/letter sort variant's compose
 * list so the characters are claimed before `arrowSortContent`'s
 * geometric predicate would treat them as static.
 *
 * Closed cycle: scale/opacity end at 1; dasharray cleared via
 * `transitionEnd`.
 */
const CHAR_SORT_ICONS = new Set([
  "arrow-down-0-1",
  "arrow-down-1-0",
  "arrow-down-a-z",
  "arrow-down-z-a",
  "arrow-up-0-1",
  "arrow-up-1-0",
  "arrow-up-a-z",
  "arrow-up-z-a",
]);

const firstYFromPath = (d: string): number | null => {
  const m = d.match(/^[mM]\s*-?\d+(?:\.\d+)?[\s,]+(-?\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
};

const isCharElement = (ctx: {
  iconName: string;
  pathTag: string;
  pathAttrs: Record<string, string | number>;
}): boolean => {
  if (!CHAR_SORT_ICONS.has(ctx.iconName)) return false;
  if (ctx.pathTag === "rect") {
    return Number(ctx.pathAttrs.x ?? 0) >= 10;
  }
  if (ctx.pathTag === "path") {
    const d = String(ctx.pathAttrs.d ?? "");
    const m = d.match(/^[mM]\s*(-?\d+(?:\.\d+)?)/);
    if (!m) return false;
    return Number(m[1]) >= 10;
  }
  return false;
};

const cascadeSlot = (
  iconName: string,
  isTopGroup: boolean
): number => {
  const isDown = iconName.startsWith("arrow-down-");
  // arrow-down → top first (slot 0), bottom second (slot 1)
  // arrow-up   → bottom first (slot 0), top second (slot 1)
  if (isDown) return isTopGroup ? 0 : 1;
  return isTopGroup ? 1 : 0;
};

export const arrowSortChars: Motion = {
  matches: isCharElement,
  factory: (ctx) => {
    // Determine top vs bottom group by first y coordinate.
    let y: number | null = null;
    if (ctx.pathTag === "rect") {
      y = Number(ctx.pathAttrs.y ?? 0);
    } else if (ctx.pathTag === "path") {
      y = firstYFromPath(String(ctx.pathAttrs.d ?? ""));
    }
    const isTopGroup = y !== null && y <= 12;
    const slot = cascadeSlot(ctx.iconName, isTopGroup);
    const start = slot * 0.2;
    const end = start + 0.2;

    if (ctx.pathTag === "rect") {
      return {
        rest: {
          scale: 1,
          opacity: 1,
          transformBox: "fill-box",
          transformOrigin: "center",
        },
        active: {
          scale: [0, 0, 1, 1],
          opacity: [0, 0, 1, 1],
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: {
            duration: ctx.duration,
            delay: ctx.delay,
            repeat: ctx.repeat,
            scale: { inherit: true, ease: "easeOut", times: [0, start, end, 1] },
            opacity: { inherit: true, ease: "easeOut", times: [0, start, end, 1] },
          },
        },
      };
    }

    return {
      rest: {
        strokeDasharray: 0,
        strokeDashoffset: 0,
        opacity: 1,
      },
      active: {
        strokeDasharray: ctx.pathLength,
        strokeDashoffset: [ctx.pathLength, ctx.pathLength, 0, 0],
        opacity: [0, 0, 1, 1],
        transition: {
          duration: ctx.duration,
          delay: ctx.delay,
          repeat: ctx.repeat,
          strokeDasharray: { duration: 0 },
          strokeDashoffset: {
            inherit: true,
            ease: "easeOut",
            times: [0, start, end, 1],
          },
          opacity: {
            inherit: true,
            ease: "easeOut",
            times: [0, start, end, 1],
          },
        },
        transitionEnd: {
          strokeDasharray: 0,
          strokeDashoffset: 0,
        },
      },
    };
  },
};
