import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";
import { dotReveal } from "../motions/dot-reveal";

/**
 * Bell rings; the notification dot pops in mid-ring (opacity + small
 * scale punch). Uses `dotReveal` because the dot is a `<circle>`, not a
 * `<path>` — needs geometry-based matching, not `d`-string matching.
 */
export default compose({
  motions: [bellClapper, bellShell, dotReveal],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",
});
