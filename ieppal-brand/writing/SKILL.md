---
name: ieppal-writing
description: IEP Pal's writing skill — generates long-form and short-form copy (blog posts, founder LinkedIn posts, email outreach, scripts, thought-leadership pieces, social captions) that is on-brand and ready to publish or hand off to another media skill. Use this skill whenever the primary deliverable is a written piece, not a visual asset or video.
---

# IEP Pal Writing

> **Location:** `ieppal-brand/writing/SKILL.md`
> ```
> ieppal-brand/
> └── writing/
>     ├── SKILL.md        ← you are here
>     ├── 01-drafts/      ← working drafts
>     ├── 02-final/       ← finished pieces (source for other media skills)
>     └── references/     ← founder-authored source essays (style + topic reference)
> ```
> For the full folder structure see `ieppal-brand/CLAUDE.md`.
>
> Short-form LinkedIn posts live in a separate pipeline at `ieppal-brand/linkedin posts/` with the same `01-drafts/` → `02-final/` structure.

---

## Context

**Always load:**
- `../voice/SKILL.md` — governs all IEP Pal copy; required for every writing task

**Load only when visual brand alignment is needed** (e.g. writing for a slide or carousel):
- `../BRAND.md` — colors, typography, illustration notes

**Do not load unless explicitly requested:**
- `../carousel/`, `../slides/`, `../video/`

---

## Writing pipeline

Work moves left to right. Each stage is a folder.

| Stage | Folder | What goes here |
|---|---|---|
| Drafting | `01-drafts/` | Outlines, in-progress pieces — iterate here |
| Final | `02-final/` | Approved, publish-ready pieces |

**`02-final/` is the handoff point.** When another skill (carousel, slides, video) needs a written source, it loads from `02-final/` only — not from `01-drafts/`.

Short-form LinkedIn posts have their own parallel pipeline in `../linkedin posts/` (same `01-drafts/` → `02-final/` shape). Long-form pieces stay here.

---

## References folder

`references/` contains founder-authored essays and thought pieces. These are **not IEP Pal branded outputs** — they are source material that informs voice, style, and topic selection when writing new pieces.

Current files (as of 2026-05-22):

| File | Topic |
|---|---|
| `schools-must-double-down-on-prompting.md` | AI in education — prompting as a core skill |
| `schools-teach-rhetorical-analysis-what-about-public-policy.md` | Curriculum gaps in civic reasoning |
| `the-building-blocks-of-learning-ai-or-lego.md` | Learning scaffolding — LEGO analogy |
| `the-dangers-of-reflection-by-proxy.md` | Self-reflection and learning authenticity |
| `the-missing-word-in-learning.md` | Language and cognition in education |
| `what-does-it-mean-to-love-someone.md` | Personal essay — founder voice reference |

**When to load a reference file:** load one or two when drafting a new piece that shares its theme or needs to match the founder's personal essay voice. Do not load references wholesale — pick the most thematically relevant one.

**References are never the handoff source.** Only `02-final/` files are handed off to carousel, slides, or video skills.

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

All writing follows `../voice/SKILL.md` exactly. Key reminders:

- Warm, calm, competent — in that order of feel.
- Name the frustration before you pitch the fix.
- Italicize *you* when the sentence needs to feel personal — at most once per 300 words.
- End on the educator or the student, not on the product.
- No hype words: revolutionary, seamless, empower, best-in-class.
- One exclamation mark per page max.

---

## Handing off to another media skill

When a finished piece in `02-final/` is being converted:

- **→ Carousel:** load `02-final/[filename]` + `../carousel/SKILL.md` + `../BRAND.md` + `../voice/SKILL.md`
- **→ Slides:** load `02-final/[filename]` + `../slides/SKILL.md` + `../BRAND.md` + `../voice/SKILL.md`
- **→ Video:** load `02-final/[filename]` + `../video/CLAUDE.md` only. Add `../BRAND.md` if the video needs visual brand alignment; add `../voice/SKILL.md` only if writing new voiceover (not adapting existing text).

Keep the context window to these files. Do not load other media skill files.

---

## ↓ When this file changes

Check and update the following files for stale content. Full details in `../../../../DEPENDENCIES.md`.

| File | What to check |
|---|---|
| `ieppal-brand/CLAUDE.md` | Token management — writing rows |
| `CLAUDE.md` (root) | Token management (writing tasks are implicit — part of voice-load tasks) |

If the **handoff table** changes (how writing hands off to carousel, slides, or video), also check the receiving skill's context-load instructions to confirm they still match.
