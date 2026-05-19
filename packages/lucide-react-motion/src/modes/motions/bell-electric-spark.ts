import { matchPathD, type Motion } from "../compose";
import { BELL_ELECTRIC_BODY_KEYFRAMES } from "./bell-electric-body";

/**
 * The central spark for `bell-electric` — Lucide's degenerate
 * `M9 9h.01` path that renders as a single round-capped dot at the
 * bell's center. Tier 1 marker: visually it's a state indicator (the
 * activation point of the electric mechanism), not a physical
 * phenomenon, so the motion is a quiet flash rather than bespoke
 * physics.
 *
 * **Motion**: opacity-only flash with the same two-pulse cadence as
 * the signal arcs so the flash and the radiation feel synchronised.
 * An earlier version paired the opacity flash with a `scale: [1,
 * 1.6, 0.9, 1.4, 1, 1.2, 1]` burst — the dot sits exactly on the
 * signature's `transformOrigin` (9px, 9px) so the scale didn't
 * displace it, but the peaks above 1 violated principle 3 anyway.
 * Brightness alone reads as a spark because a real spark's perceived
 * variation is intensity (the arc lights up, then dims), not size.
 *
 * **Rocks with the host body**: rotation piggybacks on
 * `bellElectricBody`'s buzz for cohesion (it has no visible effect
 * on a point at the rotation center, but keeps the inheritance
 * pattern consistent across the family).
 */
const SPARK_D = "M9 9h.01";

export const bellElectricSpark: Motion = {
  matches: matchPathD(SPARK_D),
  factory: (ctx) => ({
    rest: { opacity: 1, rotate: 0 },
    active: {
      opacity: [1, 1, 0.4, 1, 0.7, 1, 1],
      rotate: BELL_ELECTRIC_BODY_KEYFRAMES.rotate,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        opacity: {
          inherit: true,
          ease: "easeOut",
          times: [0, 0.08, 0.22, 0.38, 0.55, 0.75, 1],
        },
        rotate: {
          inherit: true,
          ease: BELL_ELECTRIC_BODY_KEYFRAMES.ease,
          times: BELL_ELECTRIC_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
