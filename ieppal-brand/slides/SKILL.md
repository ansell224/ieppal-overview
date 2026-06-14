---
name: ieppal-slides
description: STUB — not yet shipped. Build me out before using. Purpose is to generate on-brand IEP Pal slide decks (.pptx) with the right colors, fonts, illustration system, and voice. Should cover internal all-hands decks, investor decks, sales/demo decks, and educator-facing conference decks.
---

# IEP Pal Slides — Skill Stub

> **Location:** `ieppal-brand/slides/SKILL.md`
> ```
> ieppal-brand/
> └── slides/
>     └── SKILL.md  ← you are here
> ```
> For the full folder structure see `ieppal-brand/CLAUDE.md`.

> **Status:** stub. Do not use this skill as-is for deck generation. See `../BRAND.md` and `../voice/SKILL.md` and make the deck by hand until this skill is filled in.

---

## Context

**Always load:**
- `../BRAND.md` — colors, typography, illustration assets
- `../voice/SKILL.md` — voice & tone for all slide copy

**When based on existing writing (load the source piece only):**
- `../writing/02-final/[filename]` (long-form) or `../linkedin posts/02-final/[filename]` (short-form)

**When adapting from a carousel:**
- `../carousel/[filename]` — source carousel only (not the carousel SKILL.md)

**Do not load:**
- `../carousel/SKILL.md`, `../video/`, `../writing/01-drafts/`, `../linkedin posts/01-drafts/`

---

## What this skill will do once built

Generate IEP Pal slide decks in .pptx that are on-brand by default:
- Use the palette in `BRAND.md` (cream backgrounds, ink text, one pastel accent per slide)
- Use Playfair Display for slide titles, Inter for body
- Include pre-built layouts for the four common deck types (see below)
- Pull voice/tone from `../voice/SKILL.md` when drafting copy
- Insert illustrations from `../assets/` (Smile, Pat on Back, Loading) — folder not yet committed to repo

## Deck types to support

1. **Investor deck** — 10–12 slides. Problem → market → product → traction → ask. Competent-primary register.
2. **Sales / demo deck** — 6–8 slides. Hook → problem for educators → product walkthrough → pricing → CTA.
3. **Internal all-hands** — flexible. Prioritize clarity, data-first.
4. **Educator / conference talk** — 15–25 slides. Story-first, lots of breathing room, pastel accents, few words per slide.

## Build instructions (for the next session)

1. Read `../BRAND.md` and `../voice/SKILL.md` fully before writing the skill body.
2. Look at the `pptx` skill (available in the Claude skills directory — find it via `mcp__skills__list_skills` or check Settings → Capabilities → Skills) for the underlying generation mechanics. This IEP Pal skill should *compose on top of* that skill, not replace it.
3. Build a Python helper (`scripts/build_deck.py`) that takes a structured outline (JSON or markdown) and emits an on-brand .pptx, using python-pptx.
4. Ship a `templates/` folder with a master .pptx for each deck type.
5. Write 3 test prompts and run the full skill-creator loop.

## Open questions for the user

- Do we want one master .pptx template, or one per deck type?
- Is there an existing deck (pitch, sales) we should pattern-match against?
- Should the skill default to 16:9 or 4:3?

## Links

- `../BRAND.md`
- `../voice/SKILL.md`
- `pptx` base skill — locate via Settings → Capabilities → Skills or `mcp__skills__list_skills`
