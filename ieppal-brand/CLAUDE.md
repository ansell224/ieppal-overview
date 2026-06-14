# IEP Pal — Brand Workspace

The canonical design repository for IEP Pal — brand identity, voice, media production, and the live website. The React frontend (`IEPPAL-RASA-FE`) lives in `ieppal-software/` and may be referenced here for design work such as applying brand tokens or styling components.

**Start every session by reading the root `../CLAUDE.md`, then `../SESSIONS.md`, then `../STATUS.md`.** SESSIONS.md carries decisions and context from prior sessions. STATUS.md shows what's built vs. missing vs. on hold.

Read `BRAND.md` for the single source of truth on colors, typography, and logo. Read `voice/SKILL.md` before writing any IEP Pal copy.

---

## 🌐 Website session — startup routine

When the user says anything like:
- "let's work on the website"
- "make changes to the marketing site"
- "update the website"
- "look at / review the website"
- "Ian's website" / "the IEP Pal website"

**Claude must do the following immediately:**

1. **Tell the user to run the sync script** (Claude cannot run it directly — it runs on their Mac, not in the sandbox):
   ```
   bash ~/Desktop/ieppal-overview/ieppal-brand/website/scripts/sync-website.sh
   ```
   This checks GitHub SSH auth, then clones the repo fresh (if not present) or pulls the latest (if already cloned). The repo will be at `ieppal-brand/website/Ian-ieppal-website/`.

2. **While the script runs**, ask the user what they want to review or change.

3. **Once synced**, navigate to `ieppal-brand/website/Ian-ieppal-website/` and work from there.

**GitHub repo:** `https://github.com/I-ala-Wilson/Ian-ieppal-website`
**Local path after sync:** `ieppal-brand/website/Ian-ieppal-website/`

---

# IEPPAL-SYSTEM

For any deep context on a specific workspace, navigate to the folder listed below and read its SKILL.md. Each file contains a folder location map so you always know where you are in the project.

| Workspace | Entry point | Purpose |
|---|---|---|
| Brand system | `BRAND.md` | Colors, typography, logo — single source of truth |
| Voice & tone | `voice/SKILL.md` | How IEP Pal sounds — read before writing any copy |
| Brand assets | `assets/` | Illustration SVGs (Smile, Pat On Back, Loading Icon) — folder not yet committed to repo |
| Writing | `writing/SKILL.md` | Long-form copy production (drafts → final) |
| LinkedIn posts | `linkedin posts/SKILL.md` | Short-form LinkedIn skill — workflow, post types, and carousel/video pairing rules |
| Carousels | `carousel/SKILL.md` | LinkedIn carousel skill — **uses Canva MCP** |
| Slides | `slides/SKILL.md` | Slide deck generation — **on hold until brand palette locks** |
| Video | `video/SKILL.md` | Video production skill — Remotion (code-driven) and Hyperframes (HTML/CSS/GSAP) |
| Frontend app | `../ieppal-software/IEPPAL-RASA-FE/` | React + Vite + Tailwind production frontend (lives in ieppal-software; reference here for design work only) |
| Website | `website/Ian-ieppal-website/` | Live marketing website — git repo synced via `website/scripts/sync-website.sh` |

---

## Token management

Each workspace skill declares the minimum context it needs. Load only what is listed — do not load other workspaces unless they are explicitly named.

**Quick reference — what to load for each task:**

| Task | Load |
|---|---|
| Write a piece | `voice/SKILL.md` |
| Write with visual brand alignment | `voice/SKILL.md` + `BRAND.md` |
| Write a LinkedIn post | `voice/SKILL.md` + `linkedin posts/SKILL.md` |
| LinkedIn post paired with a visual (carousel, image, video thumbnail) | above + `BRAND.md` |
| Build a carousel | `carousel/SKILL.md` + `voice/SKILL.md` + `BRAND.md` |
| Build a carousel from existing writing | above + `writing/02-final/[file]` |
| Build a carousel (auto-pair LinkedIn caption) | above + `linkedin posts/SKILL.md` |
| Build a slide deck | **On hold** — brand palette not locked; see `slides/SKILL.md` stub for context |
| Build slides from existing writing | **On hold** — see `slides/SKILL.md` stub |
| Generate a video (choose tool first) | `video/SKILL.md` |
| Remotion video | above + `video/.agents/skills/remotion-best-practices/SKILL.md` |
| Hyperframes video | above + `video/.agents/skills/hyperframes/SKILL.md` + `video/.agents/skills/hyperframes-cli/SKILL.md` |
| Convert website URL → video | above (Hyperframes) + `video/.agents/skills/website-to-hyperframes/SKILL.md` |
| Convert writing → video | `writing/02-final/[file]` + `video/SKILL.md` + tool skill |
| Video for LinkedIn (auto-pair caption) | above + `linkedin posts/SKILL.md` |
| Any video with brand visuals | above + `BRAND.md` |
| Any video with new voiceover copy | above + `voice/SKILL.md` |

**Rule:** `02-final/` is the only handoff point between writing and other media. Never load `01-drafts/` for a conversion task.

---

## Skill folder architecture

All five media workspaces (`writing/`, `linkedin posts/`, `carousel/`, `slides/`, `video/`) follow the **standard Claude skill folder structure** as defined in *The Complete Guide to Building Skills for Claude*.

**Progressive disclosure layers — what gets loaded and when:**

| Component | When loaded | What it contains |
|---|---|---|
| `SKILL.md` frontmatter | Always in context | Name, description, trigger phrases — governs when Claude loads the skill |
| `SKILL.md` body | When Claude judges the skill relevant | Full workflow instructions, conventions, context-load rules |
| `references/` | On demand, as needed | Supplementary docs — deep examples, field guides, extended references not needed every run |
| `assets/` | When creating deliverables | Media files, templates, illustration sources, brand files |
| `scripts/` | When running automation | Python, Bash, or JS scripts for generation, export, and validation |

**Content pipeline (IEP Pal-specific — not part of the skill spec itself):**

| Folder | Purpose |
|---|---|
| `01-drafts/` | Working drafts — iterate here |
| `02-final/` | Approved, publish-ready outputs — **the only handoff point for other skills** |

**SKILL.md size rule:** Keep each `SKILL.md` under 5,000 words. If it's getting long, extract detailed docs into a `references/` file and link to it from the SKILL.md body. This keeps core context tight and loads depth only when needed.

---

## Brand token sync

**The active brand tokens live in the frontend code, not in BRAND.md.**

When doing any brand or design work:

1. **Read `../ieppal-software/IEPPAL-RASA-FE/tailwind.config.js`** — this has the colors and font families currently deployed in the app.
2. **Read `BRAND.md`** — this has the intended design direction, palette rationale, and typography principles.
3. **The gap is intentional**: BRAND.md documents where the design is going; `tailwind.config.js` documents where it is now.

**When `tailwind.config.js` is updated:** update the "Current Implementation" table in `BRAND.md` to match.

**When BRAND.md decisions are finalized:** update `tailwind.config.js` to implement them. Treat this as a standard styling task through the SDD workflow if it touches multiple components.

---

## Folder Structure

Each media folder (`writing/`, `linkedin posts/`, `carousel/`, `slides/`, `video/`) follows the standard skill folder structure: `SKILL.md` + `references/` + `assets/` + `scripts/` + `01-drafts/` + `02-final/`. The `voice/` folder is an exception — it is a reference skill (no content pipeline) with `SKILL.md` + `references/` only.

```
ieppal-brand/
├── CLAUDE.md                              ← you are here (system entry point)
├── BRAND.md                               ← single source of truth: colors, typography, logo
│
├── voice/                                 ← brand voice & tone (reference skill — no pipeline)
│   ├── SKILL.md                           ← voice & tone guide (SHIPPED) — load before any copy
│   └── references/
│       ├── founder-voice.md               ← LinkedIn post architecture + hook types
│       └── before-after-examples.md       ← copy examples by channel
│
├── writing/                               ← long-form copy production
│   ├── SKILL.md                           ← writing skill (SHIPPED) — generates on-brand long-form copy
│   ├── 01-drafts/                         ← working drafts
│   ├── 02-final/                          ← finished pieces — handoff point for other media
│   ├── references/                        ← founder-authored essays (style + topic reference; not handoff source)
│   ├── assets/                            ← images and attachments for writing pieces
│   └── scripts/                           ← writing automation scripts
│
├── linkedin posts/                        ← short-form LinkedIn copy
│   ├── SKILL.md                           ← LinkedIn post skill (BUILDING) — workflow, post types, pairing rules
│   ├── 01-drafts/                         ← in-progress LinkedIn posts
│   ├── 02-final/                          ← approved, publish-ready posts — handoff point
│   ├── references/                        ← post examples and templates
│   ├── assets/                            ← paired visuals and video thumbnails
│   └── scripts/                           ← posting automation scripts
│
├── carousel/                              ← LinkedIn carousels via Canva MCP
│   ├── SKILL.md                           ← carousel skill (BUILDING) — Canva MCP 5-step workflow
│   ├── 01-drafts/[topic-slug]/            ← in-progress carousels: PDF + outline + notes
│   ├── 02-final/[topic-slug]/             ← approved carousels: PDF + outline + learnings (ready to share)
│   ├── references/                        ← Canva design references and layout examples
│   ├── assets/                            ← illustration sources and brand assets for Canva
│   └── scripts/                           ← Canva export and automation scripts
│
├── slides/                                ← presentation deck generation
│   ├── SKILL.md                           ← slides skill (STUB) — on hold until brand palette locks
│   ├── 01-drafts/                         ← in-progress deck outlines
│   ├── 02-final/                          ← completed decks
│   ├── references/                        ← existing decks for pattern-matching
│   ├── assets/                            ← illustration sources and brand template files
│   └── scripts/                           ← deck generation scripts (build_deck.py planned)
│
└── video/                                 ← video production workspace
    ├── SKILL.md                           ← video skill (BUILDING) — tool-chooser + workflow entry point
    ├── 01-drafts/                         ← in-progress scripts and storyboards
    ├── 02-final/                          ← completed renders + paired LinkedIn captions
    ├── references/                        ← style references and video examples
    ├── assets/                            ← source footage, voiceover recordings, B-roll
    ├── scripts/                           ← video build and render scripts
    ├── .agents/skills/                    ← tool-specific Claude skills (loaded by video/SKILL.md as needed)
    │   ├── remotion-best-practices/       ← Remotion best-practice rules
    │   ├── hyperframes/                   ← Hyperframes composition authoring
    │   ├── hyperframes-cli/               ← Hyperframes CLI (init, lint, render…)
    │   ├── hyperframes-registry/          ← Hyperframes component registry
    │   ├── website-to-hyperframes/        ← convert a website URL → video
    │   └── gsap/                          ← GSAP animation reference (Hyperframes)
    └── remotion/                          ← Remotion compositions (React/TypeScript)
        ├── SKILL.md                       ← Remotion skill (STUB)
        └── create-class-demo/             ← classroom UI walkthrough demo (placeholder; not yet scaffolded)
│
└── website/                               ← live marketing website workspace
    ├── Ian-ieppal-website/                ← git repo (cloned/pulled by sync-website.sh)
    ├── references/                        ← website design references and copy docs
    ├── assets/                            ← source assets for the website
    └── scripts/
        └── sync-website.sh               ← run this at session start to pull latest from GitHub
```

Note: The active frontend repo is `../ieppal-software/IEPPAL-RASA-FE/` — reference it from there for design work. `IEPPAL-RASA-FE-mvp` is the old zip snapshot; do not use it.

---

## Design → implementation handoff

When a design decision (brand token, component style, copy change) needs to be translated into frontend code, the software team uses **Spec-Driven Development**. The SDD workflow lives in `../ieppal-software/CLAUDE.md`.

Handoff rule: finalize any design in `writing/02-final/` or as a confirmed brand token before handing off to the SDD pipeline. The SDD spec should reference the brand source file (e.g. `BRAND.md` section, voice example) rather than restating design decisions inline.
