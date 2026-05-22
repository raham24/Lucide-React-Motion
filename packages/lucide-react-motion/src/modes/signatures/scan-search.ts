import { compose } from "../compose";
import { scanCornersFrame } from "../motions/scan-corners-frame";
import { scanSearchLoupe } from "../motions/scan-search-loupe";

/**
 * `scan-search` — viewfinder brackets lock on while the magnifier
 * wobbles, inspecting the subject. Same rhythm as the canonical
 * `searchScan` primitive (`rotate: [0, -10, 8, -5, 2, 0]`) but
 * pivoted at the scan-search loupe's own centre (12, 12) instead
 * of the base search loupe's (11, 11).
 */
export default compose({
  motions: [scanCornersFrame, scanSearchLoupe],
  defaults: { duration: 1.2, easing: "easeInOut", stagger: 0 },
  transformOrigin: "12px 12px",
});
