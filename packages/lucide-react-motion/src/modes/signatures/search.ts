import { compose } from "../compose";
import { searchScan } from "../motions/search-scan";

/**
 * search — magnifier wobbles around its loupe centre via
 * `searchScan`. All paths (loupe circle, handle, in-loupe content)
 * share the rotation directly so the marker, code brackets, or
 * empty loupe all tilt cohesively with the inspection gesture.
 */
export default compose({
  motions: [searchScan],
  defaults: { duration: 1.2, easing: "easeInOut", stagger: 0 },
  transformOrigin: "11px 11px",
});
