import { compose } from "../compose";
import { chartAxes } from "../motions/chart-axes";
import { chartBarsVertical } from "../motions/chart-bars-vertical";
import { chartRectBars } from "../motions/chart-rect-bars";

/**
 * `chart-bar-stacked` — two thick rounded horizontal bars (rects)
 * with two short vertical stack-divider strokes + L-axes. Rects
 * contract uniformly toward the y-axis baseline; dividers contract
 * via `chartBarsVertical`'s `scaleY`. Wave staggered through both.
 */
export default compose({
  motions: [chartBarsVertical, chartRectBars, chartAxes],
  defaults: { duration: 1.1, easing: "easeInOut", stagger: 0.08 },
  transformOrigin: "5px 12px",
});
