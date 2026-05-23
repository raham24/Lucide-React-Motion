import { compose } from "../compose";
import { typewriterStamp } from "../motions/typewriter-stamp";

/**
 * `a-large-small` — small `a` and large `A`. Both stamp via
 * `typewriterStamp` with per-iconName stagger (0.14) wired into the
 * stamp motion so the two letters cascade one by one instead of in
 * unison.
 */
export default compose({
  motions: [typewriterStamp],
  defaults: { duration: 0.7, easing: "easeInOut", stagger: 0.14 },
});
