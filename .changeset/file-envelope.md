---
"lucide-react-motion": minor
---

Add `fileEnvelope` motion + base `file` signature. First Round-1 host primitive (per the primitives-first roadmap in the signature-authoring skill) — covers the file body and folded corner shared across 50 catalog icons (`file`, `file-text`, `file-code`, `file-search`, `file-archive`, ..., plus `shredder`). The body settles subtly (gentle scale dip + 0.3px y bob) and the corner does a dog-ear flick (-10° rotation around its fold hinge at viewBox position `(14, 2)`). Exports `FILE_ENVELOPE_KEYFRAMES` so future file-family motions can phase-lock with the host via per-value `inherit: true`.

Authoring this primitive first means future composite file-* signatures (file-code, file-search, file-cog, ...) just list `fileEnvelope` in their `compose({ motions: [...] })` to inherit the host motion — no duplication. Base `file` icon now ships with a signature; composites land as their badge-subject primitives (`code`, `search`, `cog`, ...) get authored in Round 2.
