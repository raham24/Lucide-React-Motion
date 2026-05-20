import { matchAnyPath, type Motion } from "../compose";
import { MAIL_FLAP_KEYFRAMES } from "./mail-flap";

/**
 * Wildcard pulse for the mail family's Tier 1 markers: `+`, `−`,
 * `✓`, `×`, `!` exclamation stem + dot, `?` question curve + dot.
 * Placed LAST in the compose `motions` list since it's
 * `matchAnyPath` — more specific motions (envelope body, V-flap,
 * search loupe) get tried first.
 *
 * Markers stay visible at rest. Plus/minus/check/x/question pulse
 * like UI status badges mounted on the envelope; warning blinks more
 * sharply like an alert indicator. Uniform scale preserves marker
 * shape, and opacity follows the flap rhythm so the marker remains
 * kinetically attached without becoming a draw-on animation.
 */
export const mailModifierPulse: Motion = {
  matches: matchAnyPath,
  factory: (ctx) => {
    const isWarning = ctx.iconName === "mail-warning";

    return {
      rest: {
        scale: 1,
        opacity: 1,
        transformBox: "fill-box",
        transformOrigin: "center",
      },
      active: {
        scale: isWarning ? [1, 0.82, 1, 0.9] : [1, 0.9, 1, 0.96],
        opacity: isWarning
          ? [1, 0.18, 1, 0.38]
          : [1, MAIL_FLAP_KEYFRAMES.opacity[1], 1, 0.82],
        transformBox: "fill-box",
        transformOrigin: "center",
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
    };
  },
};
