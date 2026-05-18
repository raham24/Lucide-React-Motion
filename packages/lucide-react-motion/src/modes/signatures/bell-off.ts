import { compose } from "../compose";
import { bellClapper } from "../motions/bell-clapper";
import { bellShell } from "../motions/bell-shell";
import { modifierReveal } from "../motions/modifier-reveal";

/**
 * Bell still tries to ring (shell + clapper physics preserved), and the
 * diagonal slash strikes through mid-ring via `modifierReveal`. The
 * "bell is silenced" semantics come from the slash appearing on top.
 */
export default compose({
  motions: [bellClapper, bellShell, modifierReveal],
  defaults: { duration: 1.0, easing: "easeOut", stagger: 0 },
  transformOrigin: "12px 4px",
});
