---
name: ieppal-carousel
description: STUB — not yet shipped. Build me out before using. Purpose is to generate on-brand IEP Pal LinkedIn carousels (PDF or image set) with the right colors, fonts, and voice, sized correctly for LinkedIn's document/carousel viewer.
---

# IEP Pal LinkedIn Carousel — Skill Stub

> **Location:** `IEPPAL-Design/media/carousel/SKILL.md`
> ```
> IEPPAL-Design/
> └── media/
>     └── carousel/
>         └── SKILL.md  ← you are here
> ```
> For the full folder structure see `IEPPAL-Design/CLAUDE.md`.

> **Status:** stub. Do not use this skill as-is.

---

## Context

**Always load:**
- `BRAND.md` — colors, typography, illustration assets
- `brand/voice/SKILL.md` — voice & tone for all copy

**When based on existing writing (load the source piece only):**
- `media/writing/03-final/[filename]`

**Do not load:**
- `media/slides/`, `media/video/`, `media/writing/01-ideas/`, `media/writing/02-drafts/`
- `IEPPAL-RASA-FE-mvp/`, `Wesbite/`

---

## What this skill will do once built

Generate LinkedIn carousels as a multi-page PDF (the format LinkedIn actually renders as a swipeable carousel) or a sequence of images, on-brand by default.

- 1080 × 1350 (4:5) per slide — the size LinkedIn crops best to
- 8–12 slides ideal
- First slide: hook + name the problem. Last slide: soft CTA (follow, book demo, share).
- Middle slides: one idea each. Big Playfair headline + short Inter body.
- One pastel accent per carousel (pick based on topic: sunshine for encouragement, mint for privacy, sprout for progress/growth stories).
- Voice follows `brand/voice/SKILL.md` exactly — first-person founder posts end on a question, not a pitch.

## Build instructions (for the next session)

1. Read `BRAND.md` and `brand/voice/SKILL.md` fully.
2. Decide format: PDF (LinkedIn preferred) vs image sequence (more flexible). Default to PDF.
3. Build a generator — either reuse the `pdf` skill or render HTML templates with Playwright and export.
4. Ship `templates/` with 3 pre-built carousel shapes:
   - **Founder story** (10 slides, warm, first-person)
   - **Educator tip** (8 slides, practical, 1–2 words per headline)
   - **Data / insight** (10 slides, one chart-style slide in the middle)
5. Write 3 test prompts and run the full skill-creator loop.

## Open questions for the user

- Founder voice (Ansel first-person) vs IEP Pal brand voice — both? Selectable?
- Is there an existing LinkedIn post we should pattern-match?

## Links

- `../../BRAND.md`
- `../../brand/voice/SKILL.md`
- pdf skill: `C:\Users\User\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\1100e2c3-49e9-45f0-be01-9c78169116d5\a961fba5-a4de-4736-9cf3-619f768ba794\skills\pdf\SKILL.md`
