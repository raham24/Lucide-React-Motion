import { compose } from "../compose";
import { arrowGlide } from "../motions/arrow-glide";
import { arrowSortContent } from "../motions/arrow-sort-content";

/**
 * `arrow-up-wide-narrow` — the arrow shaft + head on the left glides in the
 * indicated sort direction (`arrowGlide`) while the labelled
 * content on the right (letters / numbers / divider lines) stays
 * anchored with a subtle opacity dip (`arrowSortContent`).
 * `arrowSortContent` placed FIRST so the content paths are
 * claimed before `arrowGlide`'s matchAnyPath would translate
 * them.
 */
export default compose({
  motions: [arrowSortContent, arrowGlide],
  defaults: { duration: 0.6, easing: "easeOut", stagger: 0 },
});
