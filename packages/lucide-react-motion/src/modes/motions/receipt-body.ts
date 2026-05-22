import { matchPathD, type Motion } from "../compose";

/**
 * Receipt body — the host motion for every icon built around the
 * Lucide receipt outline (10 icons today: `receipt`, plus the eight
 * currency variants `receipt-{cent,dollar-sign,euro,indian-rupee,
 * japanese-yen,pound-sterling,russian-ruble,swiss-franc,turkish-
 * lira}` and `receipt-text`).
 *
 * The scalloped zigzag outline is byte-identical across all 10 —
 * one `matchPathD` covers the entire family.
 *
 * **Real-life referent — receipt dangling from a thermal printer.**
 * A printed receipt hangs from the slot it just emerged from at
 * the top; the bottom dangles loose and sways slightly. The
 * signature gesture is a damped ±3° rotation around the receipt's
 * top edge (10, 2) — the imagined print slot — paired with a
 * phase-locked opacity dip so the surface reads as catching less
 * light when angled away. The bottom-edge scallops sway the most
 * (furthest from the pivot), the top scallops barely move — reads
 * as the receipt swinging on its print-slot anchor.
 *
 * Pivot at `(10, 2)`: top edge centre of the receipt. Top scallops
 * stay near the pivot; bottom scallops swing through the biggest
 * arc.
 *
 * ViewBox safety. The bottom corners at (4, 22) and (20, 22) swing
 * to roughly (5.06, 22.29) and (21.03, 21.45) at ±3°; with stroke
 * radius 1 the outer edge sits inside the 24×24 viewBox at any
 * peak. Width margin is ~2 units on the right side.
 *
 * Sub-icons inherit BOTH rotate and opacity via the family
 * modifier-reveal so currency symbols and text lines sway with the
 * receipt rather than sitting statically over the dangling paper
 * (principle 2 — cohesion).
 *
 * Exports `RECEIPT_BODY_KEYFRAMES` so the family modifier-reveal
 * can inherit both curves directly.
 *
 * Closed cycle: rotate and opacity both start AND end at rest.
 */
const RECEIPT_BODY_D =
  "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z";

export const RECEIPT_BODY_KEYFRAMES = {
  rotate: [0, -3, 2, -1, 0],
  opacity: [1, 0.78, 1, 0.9, 1],
  times: [0, 0.25, 0.5, 0.75, 1],
};

export const receiptBody: Motion = {
  matches: matchPathD(RECEIPT_BODY_D),
  factory: (ctx) => ({
    rest: { rotate: 0, opacity: 1 },
    active: {
      rotate: RECEIPT_BODY_KEYFRAMES.rotate,
      opacity: RECEIPT_BODY_KEYFRAMES.opacity,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        ease: "easeInOut",
        times: RECEIPT_BODY_KEYFRAMES.times,
      },
    },
  }),
};
