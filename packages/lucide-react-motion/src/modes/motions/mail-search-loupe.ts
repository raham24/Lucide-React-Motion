import { matchPathDOneOf, type Motion } from "../compose";
import type { ModeContext } from "../types";
import { MAIL_FLAP_KEYFRAMES } from "./mail-flap";

/**
 * The magnifying-glass loupe in `mail-search` — Lucide ships
 * three elements for it:
 *
 * - `<path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z">` (the circle
 *   drawn explicitly as a path)
 * - `<circle cx=18 cy=18 r=3>` (the same circle as a `<circle>`
 *   element — Lucide ships both for renderer compatibility)
 * - `m22 22-1.5-1.5` (the small loupe handle in the lower-right
 *   corner)
 *
 * **Real-life motion**: a magnifying glass scans — the loupe
 * head pulses gently as if zooming/focusing. A subtle scale
 * contraction + opacity dip on all three elements, in step with
 * the envelope body's opacity rhythm so the loupe reads as
 * cohesive with the rest of the icon while having its own
 * "scanning" character.
 *
 * Scale contraction-only per principle 3. The loupe's farthest
 * point is the handle tip near (22, 22) at radius ≈ 14.14 from
 * (12, 12), so a small contraction stays well inside the
 * viewBox.
 */
const LOUPE_PATHS = [
  "M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "m22 22-1.5-1.5",
];

const matchLoupePath = matchPathDOneOf(...LOUPE_PATHS);

function isLoupeCircle(ctx: ModeContext): boolean {
  return (
    ctx.pathTag === "circle" &&
    String(ctx.pathAttrs.cx) === "18" &&
    String(ctx.pathAttrs.cy) === "18" &&
    String(ctx.pathAttrs.r) === "3"
  );
}

export const mailSearchLoupe: Motion = {
  matches: (ctx) => matchLoupePath(ctx) || isLoupeCircle(ctx),
  factory: (ctx) => ({
    rest: { scale: 1, opacity: 1 },
    active: {
      scale: [1, 0.85, 1, 1],
      opacity: MAIL_FLAP_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        scale: {
          inherit: true,
          ease: "easeInOut",
          times: MAIL_FLAP_KEYFRAMES.times,
        },
        opacity: {
          inherit: true,
          ease: "easeInOut",
          times: MAIL_FLAP_KEYFRAMES.times,
        },
      },
    },
  }),
};
