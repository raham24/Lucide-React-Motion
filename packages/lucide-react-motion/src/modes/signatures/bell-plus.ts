import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";
import { modifierReveal } from "../motions/modifier-reveal";

/**
 * Bell rings (shared `bellClapper` + `bellShell`), and the + sign reveals
 * itself mid-ring via `modifierReveal`. The reveal sits last in the
 * motions list so the clapper and shell match their specific paths first.
 */
export default compose({
  motions: [bellClapper, bellShell, modifierReveal],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",
});
