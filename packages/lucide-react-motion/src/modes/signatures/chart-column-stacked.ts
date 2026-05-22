import { compose } from "../compose";
import { chartAxes } from "../motions/chart-axes";
import { chartBarsHorizontal } from "../motions/chart-bars-horizontal";
import { chartRectBars } from "../motions/chart-rect-bars";

/**
 * `chart-column-stacked` — two thick rounded vertical bars (rects)
 * with two short horizontal stack-divider strokes + L-axes. Rects
 * contract uniformly; dividers contract via `chartBarsHorizontal`'s
 * `scaleX`. Wave staggered through both.
 */
export default compose({
  motions: [chartBarsHorizontal, chartRectBars, chartAxes],
  defaults: { duration: 1.1, easing: "easeInOut", stagger: 0.08 },
  transformOrigin: "12px 21px",
});
