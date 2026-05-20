import { compose } from "../compose";
import { mailEnvelope } from "../motions/mail-envelope";
import { mailFlap } from "../motions/mail-flap";
import { mailSearchLoupe } from "../motions/mail-search-loupe";

/**
 * Mail-search — envelope + flap-raise gesture, plus the
 * magnifying-glass loupe (path circle + `<circle>` + handle line)
 * pulsing via `mailSearchLoupe` (scale contraction + opacity dip)
 * for a "scanning" character that shares the envelope's rhythm.
 */
export default compose({
  motions: [mailEnvelope, mailFlap, mailSearchLoupe],
  defaults: { duration: 1.0, easing: "easeInOut", stagger: 0 },
  transformOrigin: "12px 7px",
});
