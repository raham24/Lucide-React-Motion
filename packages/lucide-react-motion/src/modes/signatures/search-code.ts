import { compose } from "../compose";
import { searchModifierReveal } from "../motions/search-modifier-reveal";
import { searchScan } from "../motions/search-scan";

/**
 * search-code — loupe + handle wobble via `searchScan`; the two
 * `</>` bracket strokes are External State Markers that draw in
 * onto the loupe via `searchModifierReveal` and then ride the
 * wobble through inherited rotation. Under the family rule, code
 * brackets are treated the same as the other state markers (not as
 * contained payload riding the wobble rigidly).
 */
export default compose({
  motions: [searchScan, searchModifierReveal],
  defaults: { duration: 1.2, easing: "easeInOut", stagger: 0 },
  transformOrigin: "11px 11px",
});
