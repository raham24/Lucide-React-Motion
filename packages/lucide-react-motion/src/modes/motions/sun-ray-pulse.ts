import { matchAnyPath, type Motion } from "../compose";

/**
 * Sunray pulse — Tier 2 motion for a sun's body and its radiating
 * rays. Used as the wildcard catch-all in every sun-family
 * signature.
 *
 * **Real-life motion**: a real sun emits light continuously; the
 * impression of "alive" sunlight comes from brightness fluctuations,
 * not from the rays physically getting longer or shorter. Modeled
 * here as an opacity flare (`[1, 0.45, 1]`) cascaded across the
 * paths via `ctx.index * ctx.stagger` so the rays light up in
 * sequence rather than all at once — a wave of light radiating
 * outward from the surface, expressed as intensity not extension.
 *
 * Earlier versions also pushed a `scale: [1, 1.06, 1]` outward on
 * each ray, which read more literally as "the ray extends" but
 * violated principle 3 (scale ≤ 1 to stay within the viewBox). The
 * brightness-only model matches the moon's reflective glow pattern
 * (`moonGlow`) but with a stagger to keep the radiation cascade.
 *
 * Pivot point: the signature's `transformOrigin` should still be the
 * sun's actual centre — for `sun-dim` and `sun-medium` that's the
 * icon centre (12, 12); for `sun-snow` the sun sits on the left so
 * the signature pivots at (10, 12). Even without a transform on this
 * motion, the pivot matters because OTHER motions in the family may
 * use it.
 *
 * The central circle is first in Lucide's path order for `sun-dim`
 * and `sun-medium`, so the cascade reads as the sun's centre flaring
 * first and the rays following.
 */
export const sunRayPulse: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => ({
    rest: { opacity: 1 },
    active: {
      opacity: [1, 0.45, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        ease: ctx.easing,
        repeat: ctx.repeat,
      },
    },
  }),
};
