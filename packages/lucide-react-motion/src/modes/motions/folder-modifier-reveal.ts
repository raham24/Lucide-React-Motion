import { matchAnyPath, type Motion } from "../compose";
import { FOLDER_BODY_KEYFRAMES } from "./folder-body";

/**
 * Folder-family wildcard reveal — every non-body path reveals at
 * the body's first tilt apex, then inherits BOTH the body's rotate
 * and opacity for the rest of the cycle so payloads tilt and dim
 * WITH the folder (principle 2 — cohesion; monitor and mail are the
 * existing precedents).
 *
 * Catches whatever's left after `folderBody` claims the outline:
 *
 * - State markers: `-check` tick, `-x` strokes, `-plus` / `-minus`,
 *   `-up` / `-down` arrows.
 * - Payload glyphs: `-bookmark` ribbon, `-closed` divider line,
 *   `-code` chevrons, `-kanban` bars, `-archive` lines + circle,
 *   `-clock` arm + circle, `-cog` teeth + hub, `-git` connectors +
 *   circles, `-git-2` curve + circles, `-heart` curve, `-input` /
 *   `-output` / `-symlink` arrows + dividers, `-key` shackle +
 *   circle, `-lock` shackle + rect, `-pen` body, `-root` post +
 *   circle, `-search` / `-search-2` loupe + handle + circle,
 *   `-sync` arrows, `-dot` / `-open-dot` notification dots.
 *
 * Branches by element type:
 *
 * - `<path>` / `<line>` → `strokeDasharray` + `strokeDashoffset`
 *   draw-in over the measured `ctx.pathLength` (cleared on
 *   `transitionEnd`).
 * - `<circle>` / `<rect>` → `scale` from 0, pivoted at the
 *   element's own `fill-box` centre.
 *
 * Reveal completes at `t = 0.25` — exactly when the folder reaches
 * its first tilt apex. Opacity tracks `FOLDER_BODY_KEYFRAMES.opacity`
 * from 0 — `[0, 0, 0.78, 1, 0.9, 1]` — so the payload emerges into
 * the folder's first dim and breathes with the body through the
 * rest of the cycle.
 *
 * `rotate` inherits the body's tilt directly (uniform in-plane
 * rotation around a fixed pivot is safe to direct-inherit per
 * principle 2's first branch — no orientation distortion).
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath` is
 * greedy and would otherwise claim the body.
 */
export const folderModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const isShape = ctx.pathTag === "circle" || ctx.pathTag === "rect";
    if (isShape) {
      return {
        rest: {
          scale: 1,
          opacity: 1,
          rotate: 0,
          transformBox: "fill-box",
          transformOrigin: "center",
        },
        active: {
          scale: [0, 0, 1],
          opacity: [0, 0, 0.78, 1, 0.9, 1],
          rotate: FOLDER_BODY_KEYFRAMES.rotate,
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: {
            duration: ctx.duration,
            delay: ctx.delay + ctx.index * ctx.stagger,
            repeat: ctx.repeat,
            scale: { inherit: true, ease: "easeOut", times: [0, 0.1, 0.25] },
            opacity: {
              inherit: true,
              ease: "easeOut",
              times: [0, 0.1, 0.25, 0.5, 0.75, 1],
            },
            rotate: {
              inherit: true,
              ease: "easeInOut",
              times: FOLDER_BODY_KEYFRAMES.times,
            },
          },
        },
      };
    }
    return {
      rest: {
        strokeDasharray: 0,
        strokeDashoffset: 0,
        opacity: 1,
        rotate: 0,
      },
      active: {
        strokeDasharray: ctx.pathLength,
        strokeDashoffset: [ctx.pathLength, ctx.pathLength, 0],
        opacity: [0, 0, 0.78, 1, 0.9, 1],
        rotate: FOLDER_BODY_KEYFRAMES.rotate,
        transition: {
          duration: ctx.duration,
          delay: ctx.delay + ctx.index * ctx.stagger,
          repeat: ctx.repeat,
          strokeDasharray: { duration: 0 },
          strokeDashoffset: { inherit: true, ease: "easeOut", times: [0, 0.1, 0.25] },
          opacity: {
            inherit: true,
            ease: "easeOut",
            times: [0, 0.1, 0.25, 0.5, 0.75, 1],
          },
          rotate: {
            inherit: true,
            ease: "easeInOut",
            times: FOLDER_BODY_KEYFRAMES.times,
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
