---
name: ieppal-writing
description: IEP Pal's writing skill — generates long-form and short-form copy (blog posts, founder LinkedIn posts, email outreach, scripts, thought-leadership pieces, social captions) that is on-brand and ready to publish or hand off to another media skill. Use this skill whenever the primary deliverable is a written piece, not a visual asset or video.
---

# IEP Pal Writing

> **Location:** `IEPPAL-Design/media/writing/SKILL.md`
> ```
> IEPPAL-Design/
> └── media/
>     └── writing/
>         ├── SKILL.md      ← you are here
>         ├── 01-ideas/     ← raw ideas, outlines, prompts
>         ├── 02-drafts/    ← working drafts
>         └── 03-final/     ← finished pieces (source for other media skills)
> ```
> For the full folder structure see `IEPPAL-Design/CLAUDE.md`.

---

## Context

**Always load:**
- `brand/voice/SKILL.md` — governs all IEP Pal copy; required for every writing task

**Load only when visual brand alignment is needed** (e.g. writing for a slide or carousel):
- `BRAND.md` — colors, typography, illustration notes

**Do not load unless explicitly requested:**
- `media/carousel/`, `media/slides/`, `media/video/`
- `IEPPAL-RASA-FE-mvp/`, `Wesbite/`

---

## Writing pipeline

Work moves left to right. Each stage is a folder.

| Stage | Folder | What goes here |
|---|---|---|
| Ideation | `01-ideas/` | Bullet outlines, raw prompts, angle notes |
| Drafting | `02-drafts/` | In-progress pieces — iterate here |
| Final | `03-final/` | Approved, publish-ready pieces |

**`03-final/` is the handoff point.** When another skill (carousel, slides, video) needs a written source, it loads from `03-final/` only — not from `01-ideas/` or `02-drafts/`.

---

## Writing types

| Type | Length | Notes |
|---|---|---|
| Long-form post | 600–1200 words | LinkedIn articles, blog posts, thought-leadership |
| Short-form post | 150–300 words | LinkedIn updates, social captions |
| Email outreach | 100–200 words | Demo requests, follow-ups, partnership asks |
| Voiceover script | Varies by video length | Written for ear, not eye — see conversion note below |
| Founder story | 400–800 words | Personal, first-person, ends on the reader |
| Educator tip | 200–400 words | Practical, specific, one clear takeaway |

---

## Voice rules

All writing follows `brand/voice/SKILL.md` exactly. Key reminders:

- Warm, calm, competent — in that order of feel.
- Name the frustration before you pitch the fix.
- Italicize *you* when the sentence needs to feel personal — at most once per 300 words.
- End on the educator or the student, not on the product.
- No hype words: revolutionary, seamless, empower, best-in-class.
- One exclamation mark per page max.

---

## Handing off to another media skill

When a finished piece in `03-final/` is being converted:

- **→ Carousel:** load `03-final/[filename]` + `media/carousel/SKILL.md` + `BRAND.md` + `brand/voice/SKILL.md`
- **→ Slides:** load `03-final/[filename]` + `media/slides/SKILL.md` + `BRAND.md` + `brand/voice/SKILL.md`
- **→ Video:** load `03-final/[filename]` + `media/video/CLAUDE.md` only. Add `BRAND.md` if the video needs visual brand alignment; add `brand/voice/SKILL.md` only if writing new voiceover (not adapting existing text).

Keep the context window to these files. Do not load other media skill files.
