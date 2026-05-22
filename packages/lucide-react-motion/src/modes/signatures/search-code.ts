import { codeSymbol } from "../motions/code-symbol";
import { compose } from "../compose";
import { searchModifierReveal } from "../motions/search-modifier-reveal";
import { searchScan } from "../motions/search-scan";

/**
 * `search-code` — loupe + handle wobble via `searchScan`; the `</>`
 * chevrons inside the loupe pinch via `codeSymbol`. Code motion
 * placed FIRST so the chevrons are claimed by the pinch before
 * `searchModifierReveal`'s wildcard would draw them on as External
 * State Markers (the previous behaviour — corrected here because
 * `code` is a Tier 2 subject per the Round-2 table, not a state
 * marker).
 */
export default compose({
  motions: [codeSymbol, searchScan, searchModifierReveal],
  defaults: { duration: 1.0, easing: "easeInOut", stagger: 0 },
  transformOrigin: "11px 11px",
});
