# IEP Pal — Design Repo

The canonical place for IEP Pal brand, voice, and Claude-ready media production skills.

## Start here

1. **[`BRAND.md`](./BRAND.md)** — single source of truth. Colors, typography, logo rules, file structure.
2. **[`brand/colors/palette-preview.html`](./brand/colors/palette-preview.html)** — open in a browser to see every color on every surface. Always preview here before locking a palette change.
3. **[`brand/voice/SKILL.md`](./brand/voice/SKILL.md)** — how IEP Pal sounds. Read this before writing any IEP Pal copy.

## How to use this repo with Claude

Point Claude at `CLAUDE.md` at the start of any session — it contains the full workspace index and token management rules (what to load for each task type).

For branded output (deck, carousel, email, video), say:
> "Read CLAUDE.md, then follow the context rules for [task type]."

## Repo layout

```
IEPPAL-Design/
├── CLAUDE.md                    ← system entry point + token management rules
├── BRAND.md                     ← brand system (colors, typography, logo)
├── README.md                    ← this file
├── brand/                       ← brand identity assets
│   ├── voice/SKILL.md           ← voice & tone (SHIPPED) — load before any copy
│   ├── assets/                  ← illustration SVGs
│   ├── colors/                  ← palette preview HTML (open in browser)
│   ├── fonts/                   ← font specimens (future)
│   └── logos/                   ← logo exports (future)
├── media/                       ← production outputs
│   ├── writing/                 ← long-form & short-form copy
│   │   ├── SKILL.md             ← writing skill
│   │   ├── 01-ideas/            ← raw ideas and outlines
│   │   ├── 02-drafts/           ← working drafts
│   │   └── 03-final/            ← finished pieces — handoff point for other media
│   ├── carousel/SKILL.md        ← LinkedIn carousels (STUB)
│   ├── slides/SKILL.md          ← slide deck generation (STUB)
│   └── video/                   ← Remotion video project
│       ├── CLAUDE.md            ← video workspace entry point
│       └── create-class-demo/   ← Remotion composition project (git repo)
├── IEPPAL-RASA-FE-mvp/          ← production React frontend (Vite + Tailwind)
└── Wesbite/                     ← live website source (note: folder name typo is pre-existing)
```

## Open decisions

- **Logo.** The site has two logos (`logo.svg`, `logo-new.svg`). We should pick one as primary and document fallbacks in `brand/logos/`.
- **Deck and carousel examples.** Before filling in those skills, we need 1–2 real examples (existing pitch deck, best LinkedIn post) to pattern-match against.

## Changelog

- **2026-04-26** — Restructured: `skills/` renamed to `media/`; `voice/` moved to `brand/voice/`; `writing/` added with `01-ideas/02-drafts/03-final` pipeline; token management rules added to CLAUDE.md and all SKILL.md files.
- **2026-04-22** — Initial scaffold. BRAND.md, palette preview, voice skill (shipped), three skill stubs.
