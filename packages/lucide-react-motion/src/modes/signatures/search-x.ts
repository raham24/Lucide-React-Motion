import { compose } from "../compose";
import { searchModifierReveal } from "../motions/search-modifier-reveal";
import { searchScan } from "../motions/search-scan";

/**
 * search-x — loupe + handle wobble via `searchScan`; the two crossed
 * × strokes are External State Markers that draw in onto the loupe
 * via `searchModifierReveal` and then ride the wobble through
 * inherited rotation.
 */
export default compose({
  motions: [searchScan, searchModifierReveal],
  defaults: { duration: 1.2, easing: "easeInOut", stagger: 0 },
  transformOrigin: "11px 11px",
});
