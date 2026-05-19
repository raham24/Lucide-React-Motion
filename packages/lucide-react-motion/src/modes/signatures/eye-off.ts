import { compose } from "../compose";
import { eyeBlink } from "../motions/eye-blink";
import { eyeOffSlash } from "../motions/eye-off-slash";

/**
 * Eye-off — the eye still tries to blink (both eye-shape fragments
 * and the pupil arc collapse vertically via `eyeBlink`'s scaleY) and
 * the diagonal slash strikes through mid-blink via `eyeOffSlash`,
 * scaling with the host so it stays anchored to the rest of the
 * icon's motion. The "silenced" reading comes from the slash
 * appearing on top, not from disabling the blink.
 *
 * Compose order matters here: `eyeOffSlash` matches the slash by `d`
 * FIRST so its dedicated reveal claims it; the remaining three eye
 * fragments and the pupil arc fall through to the `eyeBlink`
 * wildcard last in the list.
 *
 * Default duration is longer than the base `eye` signature (0.6 vs
 * 0.3) — the slash needs room to draw in after the eye begins to
 * close, so squeezing it into a 0.3 s blink reads as flickering
 * rather than as a deliberate silencing strike.
 */
export default compose({
  motions: [eyeOffSlash, eyeBlink],
  defaults: { duration: 0.6, easing: "easeInOut", stagger: 0 },
});
