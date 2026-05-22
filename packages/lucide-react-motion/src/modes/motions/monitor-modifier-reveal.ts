import { matchAnyPath, type Motion } from "../compose";
import { MONITOR_SCREEN_KEYFRAMES } from "./monitor-chassis";

/**
 * Monitor-family wildcard reveal — a delayed reveal for every
 * non-chassis path so payloads and state markers stamp on at the
 * display's wake apex instead of floating statically over a flashing
 * screen.
 *
 * Catches whatever's left after `monitorChassis` claims the screen
 * and stand:
 *
 * - State markers: `monitor-check`'s tick, `monitor-x`'s strokes,
 *   `monitor-up` / `monitor-down`'s arrows.
 * - Payload glyphs: `monitor-cog`'s teeth + hub circle,
 *   `monitor-cloud`'s cloud body, `monitor-dot`'s notification dot,
 *   `monitor-play`'s triangle, `monitor-pause`'s two bars,
 *   `monitor-stop`'s filled rect, `monitor-off`'s diagonal slash.
 * - Composite second-device anatomy: `monitor-smartphone`'s phone
 *   rect + stand, `monitor-speaker`'s speaker tower + dots.
 *
 * Branches by element type:
 *
 * - `<path>` / `<line>` → `strokeDasharray` + `strokeDashoffset`
 *   draw-in over the measured `ctx.pathLength` (cleared on
 *   `transitionEnd` so rest is byte-identical to Lucide's static
 *   SVG, per `src/modes/draw.ts`).
 * - `<circle>` / `<rect>` → `scale` from 0 + `opacity` from 0,
 *   pivoted at the element's own fill-box centre so the reveal
 *   stamps in place rather than sliding from the signature's
 *   screen-centre pivot.
 *
 * Reveal completes at `t = 0.3` — exactly when the chassis hits its
 * wake apex. Marker/payload appears AS the screen lights up, then
 * holds drawn through the recovery.
 *
 * Opacity piggybacks on `MONITOR_SCREEN_KEYFRAMES.opacity` after the
 * initial reveal so the payload pulses with the screen wake — every
 * non-chassis path shares the same display heartbeat. The first half
 * of the cycle is the reveal (0 → 1); the second half mirrors the
 * screen's full opacity curve so the kinetic life persists across
 * the rest of the cycle.
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath` is
 * greedy and would otherwise claim the chassis.
 */
export const monitorModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const isShape = ctx.pathTag === "circle" || ctx.pathTag === "rect";
    if (isShape) {
      return {
        rest: {
          scale: 1,
          opacity: 1,
          transformBox: "fill-box",
          transformOrigin: "center",
        },
        active: {
          scale: [0, 0, 1],
          opacity: [0, 0, 1],
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: {
            duration: ctx.duration,
            delay: ctx.delay + ctx.index * ctx.stagger,
            repeat: ctx.repeat,
            scale: { inherit: true, ease: "easeOut", times: [0, 0.1, 0.3] },
            opacity: { inherit: true, ease: "easeOut", times: [0, 0.1, 0.3] },
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
        strokeDashoffset: [ctx.pathLength, ctx.pathLength, 0],
        opacity: [0, 0, 1],
        transition: {
          duration: ctx.duration,
          delay: ctx.delay + ctx.index * ctx.stagger,
          repeat: ctx.repeat,
          strokeDasharray: { duration: 0 },
          strokeDashoffset: { inherit: true, ease: "easeOut", times: [0, 0.1, 0.3] },
          opacity: { inherit: true, ease: "easeOut", times: [0, 0.1, 0.3] },
        },
        transitionEnd: {
          strokeDasharray: 0,
          strokeDashoffset: 0,
        },
      },
    };
  },
};
