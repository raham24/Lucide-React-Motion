import { compose } from "../compose";
import { searchModifierReveal } from "../motions/search-modifier-reveal";
import { searchScan } from "../motions/search-scan";

/**
 * search-alert — loupe + handle wobble via `searchScan`; the
 * exclamation stem and its dot are both External State Markers
 * that draw in onto the loupe via `searchModifierReveal` (the dot
 * being a tiny-h stroke renders mostly via the opacity reveal) and
 * then ride the wobble through inherited rotation.
 */
export default compose({
  motions: [searchScan, searchModifierReveal],
  defaults: { duration: 1.2, easing: "easeInOut", stagger: 0 },
  transformOrigin: "11px 11px",
});
