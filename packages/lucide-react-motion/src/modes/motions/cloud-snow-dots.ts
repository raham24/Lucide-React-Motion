import { matchPathDOneOf, type Motion } from "../compose";
import { CLOUD_BODY_KEYFRAMES } from "./cloud-body";

/**
 * Snowflakes in `cloud-snow` and the smaller round pieces in
 * `cloud-hail`. Lucide draws each as a degenerate `M{x} {y}h.01`
 * path that renders as a single round-capped dot.
 *
 * Tier 2 motion: snowflakes fall slower than rain, drift sideways
 * in air currents, and dim subtly as they cross light. Modeled as
 * a gentle Y descent (smaller range than rain — snow is slower)
 * layered with an X flutter (the sideways drift) and an opacity
 * envelope that fades flakes in at the top of their fall and out
 * before they clip the viewBox floor. Per-path stagger from the
 * signature offsets each flake's phase so the snow reads as
 * continuous rather than synchronised.
 *
 * Single-cycle gesture: opacity returns to 0 at the cycle boundary
 * so the Y/X resets are invisible if a consumer opts into
 * `repeat: Infinity`. Default plays once on hover.
 *
 * Hail's small round pieces (`cloud-hail`'s lower row at y≈20-22)
 * use the same fall behaviour — they read as smaller hailstones
 * falling alongside the bigger vertical chunks handled by
 * {@link cloudRainDrops}.
 *
 * **Couples to the cloud body**: scale piggybacks on
 * `cloudBody`'s gentle pulse via `inherit: true`.
 *
 * Earlier implementation was a scale-contraction twinkle, which
 * read as snow flickering in place rather than falling. Twinkle
 * is a stillness gesture; falling snow needs translation.
 */
const SNOW_PATHS = [
  // cloud-snow — six flakes
  "M8 15h.01",
  "M8 19h.01",
  "M12 17h.01",
  "M12 21h.01",
  "M16 15h.01",
  "M16 19h.01",
  // cloud-hail — three round pieces (small hailstones)
  "M16 20h.01",
  "M8 20h.01",
  "M12 22h.01",
];

export const cloudSnowDots: Motion = {
  matches: matchPathDOneOf(...SNOW_PATHS),
  factory: (ctx) => ({
    rest: { x: 0, y: 0, opacity: 1, scale: 1 },
    active: {
      // Smaller Y range than rain — snow falls slower. Range chosen
      // so the bottom-row hail pieces (y=22) don't clip the viewBox
      // even at the cycle peak; opacity is already fading to 0 by
      // then so any residual edge contact is imperceptible.
      y: [-2, -0.75, 0.75, 2],
      // Side drift with an asymmetric profile so the flake leans
      // one way more than the other rather than swinging like a
      // metronome.
      x: [0, 0.8, -0.4, 0],
      opacity: [0, 1, 1, 0],
      scale: CLOUD_BODY_KEYFRAMES.scale,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        y: { inherit: true, ease: "linear", times: [0, 0.15, 0.85, 1] },
        // X flutter runs on its own slower curve so the side drift
        // doesn't lock-step with the descent.
        x: { inherit: true, ease: "easeInOut", times: [0, 0.3, 0.7, 1] },
        opacity: { inherit: true, ease: "easeInOut", times: [0, 0.15, 0.85, 1] },
        scale: {
          inherit: true,
          ease: ctx.easing,
          times: CLOUD_BODY_KEYFRAMES.times,
        },
      },
    },
  }),
};
