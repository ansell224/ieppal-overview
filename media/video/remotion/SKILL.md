---
name: ieppal-remotion
description: STUB — not yet shipped. Build me out before using. Purpose is to generate on-brand IEP Pal software animations and explainer videos using Remotion (React-based video framework), with the right colors, fonts, illustration system, and voiceover scripts that follow the voice guide.
---

# IEP Pal Remotion Animations — Skill Stub

> **Location:** `IEPPAL-Design/media/remotion/SKILL.md`
> ```
> IEPPAL-Design/
> └── media/
>     └── remotion/
>         └── SKILL.md  ← you are here
> ```
> For the full folder structure see `IEPPAL-Design/CLAUDE.md`.

> **Status:** stub. Do not use this skill as-is.

## What this skill will do once built

Produce short, on-brand product/marketing animations using [Remotion](https://www.remotion.dev) — typically MP4 renders, 1920×1080 or 1080×1080 (square for social), 15–60 seconds.

Deliverables the skill should handle:
- **Product UI walk-throughs** — annotated screen recordings or recreated UI in React, with tasteful motion to draw the eye.
- **Concept animations** — e.g., "five tabs collapsing into one place," "a goal being drafted" — illustration-driven.
- **Testimonial / quote cards** — animated Playfair headlines with sunshine or sprout backgrounds.
- **Social loops** — 8–15 second square renders for LinkedIn / IG.

## Build instructions (for the next session)

1. Read `BRAND.md` and `skills/voice/SKILL.md`.
2. Scaffold a Remotion project in `skills/remotion/project/`:
   ```
   npm init video@latest
   ```
3. Build shared components in `project/src/components/`:
   - `<IEPPalBackground />` — cream or pastel-gradient backgrounds
   - `<Headline />` — Playfair animated headline (stagger by word)
   - `<Eyebrow />` — uppercase Inter eyebrow
   - `<CTA />` — ink-filled button entrance animation
   - `<PastelCard />` — rounded card using the pastel palette
   - `<Illustration />` — loads SVGs from `../../../Assets/`
4. Build 2–3 `<Composition />`s as starting templates (product-walkthrough, quote-card, concept-animation).
5. Add a short README explaining how to preview (`npm start`) and render (`npx remotion render`).
6. Voiceover scripts must pass `skills/voice/SKILL.md` — draft first, check against voice rules, then record.

## Open questions for the user

- Do you want TTS-generated voiceover, or will a person narrate?
- What's the first animation we actually need (a real use case to anchor the skill)?
- Do we want captions burned in by default? (Recommended — accessibility + muted autoplay on LinkedIn.)

## Links

- `../../BRAND.md`
- `../voice/SKILL.md`
- Remotion docs: https://www.remotion.dev/docs
