---
description: Pick the next high-priority pending Lucide signature family and author it end-to-end via the lucide-signature skill.
---

Invoke the `lucide-signature` skill. It will:

1. Read `docs/signatures.md` end-to-end.
2. Run `pnpm --filter lucide-react-motion status --json` and pick the next target — highest-priority partial or pending family per the section 7 roadmap, or a one-off decorative icon if all priority families are done.
3. Author every pending variant in the picked family following the doc's workflow (three principles, two-tier rule with host coupling, `inherit: true` on per-value transitions, scale contractions within viewBox).
4. Validate (`pnpm generate` → `pnpm typecheck` → `pnpm --filter lucide-react-motion test`), commit on the current branch, and hand back for visual review in `/playground`.

Stop after one family. Do not start the next one without explicit user approval.
