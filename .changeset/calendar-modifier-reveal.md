---
"lucide-react-motion": minor
---

Calendar-family modifier-reveal + 9 calendar state-marker signatures. `calendarModifierReveal` mirrors the `fileModifierReveal` template — `matchAnyPath` placed last in each composite's compose list, draws the marker stroke on at the body's settle peak (t = 0.4), inherits `CALENDAR_FRAME_KEYFRAMES.bodyY` so markers bob with the calendar through the landing.

New signatures: `calendar-plus`, `calendar-plus-2`, `calendar-minus`, `calendar-minus-2`, `calendar-check`, `calendar-check-2`, `calendar-x`, `calendar-x-2`, `calendar-off`. The `-2` variants place the marker inside the body rather than the cut-corner badge; `calendar-off` uses the diagonal slash. All are `compose({ motions: [calendarFrame, calendarModifierReveal] })`.

`calendarFrame` also extended to match `calendar-off`'s split body fragments (`M21 15.5V6...`) and split divider stubs (`M3 10h7`, `M21 10h-5.5`) so they bob with the rest of the frame, leaving only the slash for the wildcard reveal.
