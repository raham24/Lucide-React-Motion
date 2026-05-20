import { matchPathDOneOf, type Motion } from "../compose";

/**
 * Signal-strength bars in `signal`, `signal-high`, `signal-medium`,
 * `signal-low`. Each bar grows from the common baseline (y=20) up
 * to its full height while fading in — the canonical "signal
 * acquired" cascade you see when a phone reconnects to a network.
 *
 * The signature pivots at `"12px 20px"` so `scaleY` operates from
 * the baseline regardless of which x each bar lives at; short bars
 * and tall bars grow with the same gesture. Per-path stagger
 * (Lucide orders the bars by ascending x in the `nodes` array, so
 * `ctx.index` produces the bar-by-bar cascade naturally).
 *
 * One of Lucide's bars (`M22 4v16` in the full `signal` icon) is
 * stored top-to-bottom rather than bottom-to-top. The `scaleY`-from-
 * baseline approach normalises the growth direction across all
 * four bars regardless of Lucide's stored stroke direction — every
 * bar visibly grows upward.
 *
 * Exports `SIGNAL_BAR_KEYFRAMES` so any future family modifier can
 * inherit the same apex timing and share kinetic life with the
 * bars.
 */
export const SIGNAL_BAR_KEYFRAMES: {
  scaleY: number[];
  opacity: number[];
  times: number[];
} = {
  scaleY: [0, 0, 1],
  opacity: [0, 1, 1],
  times: [0, 0.1, 0.7],
};

const BAR_PATHS = ["M7 20v-4", "M12 20v-8", "M17 20V8", "M22 4v16"];

export const signalBar: Motion = {
  matches: matchPathDOneOf(...BAR_PATHS),
  factory: (ctx) => ({
    rest: { scaleY: 1, opacity: 1 },
    active: {
      scaleY: SIGNAL_BAR_KEYFRAMES.scaleY,
      opacity: SIGNAL_BAR_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        scaleY: {
          inherit: true,
          ease: "easeOut",
          times: SIGNAL_BAR_KEYFRAMES.times,
        },
        opacity: {
          inherit: true,
          ease: "easeOut",
          times: SIGNAL_BAR_KEYFRAMES.times,
        },
      },
    },
  }),
};
