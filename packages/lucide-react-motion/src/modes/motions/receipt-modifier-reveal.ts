import { matchAnyPath, type Motion } from "../compose";
import { RECEIPT_BODY_KEYFRAMES } from "./receipt-body";

/**
 * Receipt-family wildcard reveal — every non-body path is a
 * currency symbol or text line printed on the receipt. Each draws
 * in at the body's first sway apex, then inherits BOTH the body's
 * rotate and opacity so the printed content sways and dims WITH
 * the dangling paper (principle 2 — cohesion).
 *
 * `strokeDasharray` + `strokeDashoffset` against `ctx.pathLength`,
 * cleared on `transitionEnd`. Reveal completes at `t = 0.25`
 * (the first sway apex). Opacity tracks
 * `RECEIPT_BODY_KEYFRAMES.opacity` from 0 — `[0, 0, 0.78, 1, 0.9,
 * 1]`. Rotate inherits the body's sway directly.
 *
 * Every receipt variant's non-body anatomy is a `<path>`, so no
 * shape branch is needed — there are no `<circle>` / `<rect>`
 * markers in the family.
 *
 * Place this LAST in the compose `motions` list — `matchAnyPath`
 * is greedy.
 */
export const receiptModifierReveal: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
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
      rotate: RECEIPT_BODY_KEYFRAMES.rotate,
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
          times: RECEIPT_BODY_KEYFRAMES.times,
        },
      },
      transitionEnd: {
        strokeDasharray: 0,
        strokeDashoffset: 0,
      },
    },
  }),
};
