import { matchPathD, type Motion } from "../compose";

/**
 * Book body — the host motion for every icon built around the
 * Lucide closed-book shape (17 hosts: `book`, `book-marked`,
 * `book-check`, `book-heart`, `book-key`, ..., plus markers like
 * `book-a`, `book-text`). The book is depicted as a single
 * closed-cover outline with the binding spine on the left and a
 * small step at the bottom-left indicating the back cover.
 *
 * The shape is one path — no separate pages, no separate covers —
 * so the motion is deliberately small: a subtle scale-and-y settle
 * reads as the book being placed onto a surface. No seam-attachment
 * issues (single anatomy), so a centre-pivoted scale is safe.
 *
 * **Real-life physics**: a book landing on a shelf or desk. The
 * cover compresses ~1.5% as the spine takes the impact, while the
 * whole book bobs down a third of a pixel. Both return cleanly to
 * rest on a shared `times` schedule.
 *
 * Out of scope: `book-open` / `book-open-text` / `book-open-check`
 * (separate two-page anatomy with a spine line, deserve their own
 * motion), `bookmark*` (different shape entirely), `book-copy` and
 * `book-dashed` (currently use different path data).
 *
 * Exports `BOOK_BODY_KEYFRAMES` so a future `bookModifierReveal`
 * can phase-lock its draw-in with the body's settle.
 */
const BOOK_SPINE_D =
  "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20";

export const BOOK_BODY_KEYFRAMES = {
  // Cover compresses subtly as the book lands — closed cycle.
  scale: [1, 0.985, 1],
  // Settle down a third of a pixel as the book hits the surface.
  y: [0, 0.3, 0],
  // Shared timing so the compression and settle read as one beat.
  times: [0, 0.4, 1],
};

export const bookBody: Motion = {
  matches: matchPathD(BOOK_SPINE_D),
  factory: (ctx) => ({
    rest: { scale: 1, y: 0 },
    active: {
      scale: BOOK_BODY_KEYFRAMES.scale,
      y: BOOK_BODY_KEYFRAMES.y,
      transition: {
        duration: ctx.duration,
        delay: ctx.delay,
        repeat: ctx.repeat,
        ease: "easeInOut",
        times: BOOK_BODY_KEYFRAMES.times,
      },
    },
  }),
};
