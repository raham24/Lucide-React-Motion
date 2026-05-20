import { matchPathD, type Motion } from "../compose";

/**
 * The degenerate dot at (2, 20) in every signal variant — the
 * zero-strength indicator that's always rendered, even in
 * `signal-zero` where no bars are present. Fades in ahead of the
 * bar cascade so the icon has a kinetic starting moment even when
 * the variant only ships the dot.
 *
 * Plain opacity only — the dot sits on the signature's baseline
 * pivot (y=20) where `scaleY` would compress its stroke caps
 * unnaturally; opacity is the clean choice for a round-capped dot.
 */
export const signalDot: Motion = {
  matches: matchPathD("M2 20h.01"),
  factory: (ctx) => ({
    rest: { opacity: 1 },
    active: {
      opacity: [0, 1, 1],
      transition: {
        duration: ctx.duration,
        delay: ctx.delay + ctx.index * ctx.stagger,
        repeat: ctx.repeat,
        ease: "easeOut",
        times: [0, 0.15, 1],
      },
    },
  }),
};
