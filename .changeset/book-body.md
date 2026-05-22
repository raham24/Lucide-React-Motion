---
"lucide-react-motion": minor
---

Add `bookBody` motion + base `book` signature. Third Round-1 host primitive in the primitives-first roadmap — matches the canonical closed-book spine `d` shared across 17 hosts (`book`, `book-marked`, `book-check`, `book-heart`, `book-text`, `book-image`, ...). The book is one path (closed cover with the binding spine baked in), so the motion is deliberately small: a subtle `scale: [1, 0.985, 1]` + `y: [0, 0.3, 0]` reads as the book landing on a shelf. Exports `BOOK_BODY_KEYFRAMES` so a future `bookModifierReveal` (for `book-plus` / `-minus` / `-check` / `-x` / `-alert`) can phase-lock its draw-in with the body's settle.

Out of scope for now: `book-open*` (two-page-spread anatomy with a separate spine line), `bookmark*` (different shape entirely), and `book-search` / `book-key` / `book-lock` / `book-copy` / `book-dashed` (use different body `d`s — future work).
