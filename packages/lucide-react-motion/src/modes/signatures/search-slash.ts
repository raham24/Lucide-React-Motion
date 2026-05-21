import { compose } from "../compose";
import { searchModifierReveal } from "../motions/search-modifier-reveal";
import { searchScan } from "../motions/search-scan";

/**
 * search-slash — loupe + handle wobble via `searchScan`; the
 * diagonal slash is an External State Marker that draws in onto
 * the loupe via `searchModifierReveal` and then rides the wobble
 * through inherited rotation.
 */
export default compose({
  motions: [searchScan, searchModifierReveal],
  defaults: { duration: 1.2, easing: "easeInOut", stagger: 0 },
  transformOrigin: "11px 11px",
});
