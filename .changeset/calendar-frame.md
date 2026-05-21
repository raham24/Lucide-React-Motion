---
"lucide-react-motion": minor
---

Add `calendarFrame` motion + base `calendar` signature. Second Round-1 host primitive in the primitives-first roadmap — covers the calendar body (canonical rect + 13 partial-body paths + notepad-text rect), both pins (`M8 2v4`, `M16 2v4`), and the top divider (`M3 10h18`) shared across 23 catalog icons (`calendar`, `calendar-1`, `calendar-clock`, `calendar-search`, ..., plus the `notepad-text` family which shares the pinned-at-top idiom). The pins pluck UP while the body and divider settle DOWN — reads as a calendar being pinned to a wall. Exports `CALENDAR_FRAME_KEYFRAMES` (`bodyY`, `pinY`, `times`) so future calendar-family motions can phase-lock via per-value `inherit: true`.

Authoring this primitive first means future composite calendar-* signatures (calendar-search, calendar-cog, calendar-clock, calendar-heart, ...) just list `calendarFrame` in their `compose({ motions: [...] })` to inherit the host motion. Base calendar icon now ships with a signature; composites land as their badge-subject primitives (`searchLoupe`, `cogGear`, `clockFace`, `heartBeat`, ...) get authored in Round 2.
