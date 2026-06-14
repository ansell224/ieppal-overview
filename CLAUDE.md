# IEP Pal — Workspace Index

The root of the combined IEP Pal working folder. Three sub-repositories live here.

**Start every session by reading this file, then `SESSIONS.md`, then `STATUS.md`.** SESSIONS.md carries decisions and context from prior sessions. STATUS.md shows what's built vs. missing vs. on hold.

| Folder | What it contains |
|---|---|
| `ieppal-brand/` | Brand identity, voice, media production, video skills |
| `ieppal-finances/` | Finance focus: cost/revenue/CAC and working forecast files |
| `ieppal-software/` | React frontend + Node.js backend (git repos) |

---

## Session memory and workspace status

| File | Purpose | When to read |
|---|---|---|
| `SESSIONS.md` | Cross-session memory: open decisions, decisions made, next-session priorities, change log | Every session start |
| `STATUS.md` | Honest status of every skill/asset: ✅ built / 🟡 partial / ❌ missing | Before starting any new skill or workflow |
| `DEPENDENCIES.md` | Full dependency graph — which files reference which, and what breaks when any file changes | After changing any workflow, skill, or config file |
| `HISTORY.md` | Full project history timeline — key events, decisions, pivots, team evolution | When starting a new feature, when onboarding, or when context is needed |

**After completing any meaningful work** (file changes, decisions made, tasks completed): update `SESSIONS.md` immediately — do not wait for the end of the conversation. Log what changed, run the propagation check (see template in SESSIONS.md), update open decisions, and set next-session priorities. This is how context survives across sessions.

> **Why immediately, not at session end:** Claude has no signal for when a conversation ends. If updates are deferred to "end of session," they never happen. Update SESSIONS.md as soon as a unit of work is done.

**When you change a workflow or skill file:** read that file's `↓ When this file changes` section at the bottom, then check each listed downstream file. If a downstream file doesn't have enough detail, consult `DEPENDENCIES.md` for the full picture.

---

## 🚀 Software dev session — trigger phrases & startup routine

When the user says anything like:
- "I want to make changes to the FE / UI / frontend"
- "help me vibe code some features"
- "let's work on the app"
- "start up the dev environment"
- "let's spec out a feature" / "I want to spec this"
- "run the SDD workflow" / "use spec-kit"

**Claude must do all of the following immediately, in order:**

1. **Tell the user to run the dev script** (Claude cannot run it directly — it runs on their Mac, not in the sandbox):
   ```
   bash ~/Desktop/ieppal-overview/ieppal-software/start-dev.sh
   ```
   This pulls latest from GitHub, installs deps, starts BE on `localhost:3001` and FE on `http://127.0.0.1:5173`, and opens VSCode.

2. **While the script runs, load context** — read `ieppal-software/CLAUDE.md` and ask the user what they want to build or change.

3. **Once they describe the feature**, assess its scope:
   - **Multi-component or new UI pattern** → use the **SDD workflow** (`/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`). Full details in `ieppal-software/CLAUDE.md`.
   - **Single-file fix or copy tweak** → navigate to the relevant files in `ieppal-software/IEPPAL-RASA-FE/src/` and propose a plan directly.

4. **All edits go into `ieppal-software/IEPPAL-RASA-FE/`** — never `IEPPAL-RASA-FE-mvp/` (that is the old zip snapshot, do not touch it).

---

## Sub-repo entry points

### Brand & Design → `ieppal-brand/CLAUDE.md`

Full workspace index for brand, voice, and media production.

Key files inside `ieppal-brand/`:

| File / Folder | Purpose |
|---|---|
| `BRAND.md` | Design intent: colors, typography, logo rules. **In flux — verify active tokens against tailwind.config.js.** |
| `voice/SKILL.md` | Voice & tone guide — load before writing any IEP Pal copy |
| `assets/` | Illustration SVGs (Smile 1, Pat On Back, Loading Icon 2) — folder not yet committed to repo |
| `logos/` | Logo reference — see `README.md` inside for current location of logo files |
| `writing/SKILL.md` | Long-form copy skill — `01-drafts/` → `02-final/` + `references/` + `assets/` + `scripts/` |
| `linkedin posts/SKILL.md` | Short-form LinkedIn skill — workflow, post types, and carousel/video pairing rules |
| `carousel/SKILL.md` | LinkedIn carousel skill — **uses Canva MCP** |
| `slides/SKILL.md` | Slide deck generation skill — **on hold until brand palette locks** |
| `video/SKILL.md` | Video production skill — Remotion (code-driven) and Hyperframes (HTML/CSS/GSAP) tool-chooser |

### Software → `ieppal-software/CLAUDE.md`

Frontend application code. New features follow the Spec-Driven Development workflow.

Key files inside `ieppal-software/`:

| File / Folder | Purpose |
|---|---|
| `IEPPAL-RASA-FE/` | React + Vite + Tailwind production frontend (active git repo) |
| `IEPPAL-RASA-FE/tailwind.config.js` | **Active brand tokens** — source of truth for colors/fonts currently in the app |
| `IEPPAL-RASA-FE/src/components/` | Shared UI components |
| `IEPPAL-RASA-FE/src/pages/` | Page-level components |
| `IEPPAL-RASA-FE/.specify/memory/constitution.md` | IEP Pal architectural non-negotiables (**missing — create before next SDD session**) |
| `IEPPAL-RASA-FE/specs/` | Per-feature spec artifacts (**missing — no features formally specced yet**) |
| `IEPPAL-RASA-BE/` | Node.js REST API on port 3001 (active git repo) |

### Finance → `ieppal-finances/CLAUDE.md`

Finance focus: cost/revenue/CAC. Working forecast files and future Python analysis tools.

Key files inside `ieppal-finances/`:

| File / Folder | Purpose |
|---|---|
| `CLAUDE.md` | Finance workspace index + metric definitions |
| `Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx` | Working financial model — primary input for analysis |

**Note:** Finance skill subfolders (`financial-analyst/`, `saas-metrics-coach/`, `business-investment-advisor/`) are described in earlier docs but **do not exist yet**. See `STATUS.md` for build priority order.

---

## Brand token sync

**The active brand tokens live in the frontend code, not in BRAND.md.**

When doing any brand or design work:

1. **Read `ieppal-software/IEPPAL-RASA-FE/tailwind.config.js`** — this has the colors and font families currently deployed in the app.
2. **Read `ieppal-brand/BRAND.md`** — this has the intended design direction, palette rationale, and typography principles.
3. **The gap is intentional**: BRAND.md documents where the design is going; `tailwind.config.js` documents where it is now.

**When `tailwind.config.js` is updated:** update the "Current Implementation" table in `BRAND.md` to match.

**When BRAND.md decisions are finalized:** update `tailwind.config.js` to implement them. Treat this as a standard styling task through the SDD workflow if it touches multiple components.

---

## Token management — canonical table

Load only what each task requires. This is the definitive reference. Sub-repo CLAUDE.md files reference this — they do not duplicate it.

| Task | Load |
|---|---|
| Write any IEP Pal copy | `ieppal-brand/voice/SKILL.md` |
| Write with visual brand alignment | above + `ieppal-brand/BRAND.md` + `ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` |
| Write a LinkedIn post | voice SKILL.md + `ieppal-brand/linkedin posts/SKILL.md` |
| Build a carousel | voice SKILL.md + `ieppal-brand/BRAND.md` + `ieppal-brand/carousel/SKILL.md` |
| Build a carousel from existing writing | above + `ieppal-brand/writing/02-final/[file]` |
| Build a slide deck | **On hold** — brand palette not locked. See STATUS.md. |
| Generate a video | `ieppal-brand/video/SKILL.md` (see tool-chooser inside) |
| Frontend feature work | `ieppal-software/IEPPAL-RASA-FE/src/` (relevant file or folder) |
| Apply brand tokens to frontend | above + `tailwind.config.js` + `ieppal-brand/BRAND.md` |
| Write in-app copy or UI text | `ieppal-brand/voice/SKILL.md` |
| SDD — spec a new feature | `ieppal-software/IEPPAL-RASA-FE/.specify/memory/constitution.md` + `ieppal-software/CLAUDE.md` |
| SDD — implement from tasks | above + `ieppal-software/IEPPAL-RASA-FE/specs/[branch]/tasks.md` + relevant `src/` files |
| Finance analysis | `ieppal-finances/CLAUDE.md` + `ieppal-finances/Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx` |

**Rule:** `ieppal-brand/writing/02-final/` is the only handoff point between writing and other media (carousel, video, slides). Never load `01-drafts/` for a conversion task.

---

## What IEP Pal is

A support tool for educators who write and manage Individualized Education Programs (IEPs). Built for **speed, privacy, and care**. One-liner: *"Learning support all in one place."*

**Audience:** special education teachers, classroom teachers supporting IEP students, instructional coaches, school administrators.

**Personality in three words:** warm, calm, competent.

---

## Brand quick-reference

Full details in `ieppal-brand/BRAND.md`. Always verify active tokens against `tailwind.config.js`.

**Colors (intended direction — in flux)**
- Neutrals: `--ink` `#1a1a1e` · `--charcoal` `#52525b` · `--ash` `#a1a1aa` · `--linen` `#fefcf9`
- Surface tones: `--cream` `#f9f5f0` · `--sand` `#f0ebe4` · `--lilac` `#e2d1e6`
- Personality pastels: `--sunshine` `#f6eca7` · `--mint` `#b0f6f0` · `--sprout` `#bce784`
- Hero accent: `--accent-warm` `#F97316`

**Colors (currently in code — from tailwind.config.js)**
- `offwhite` `#f9f5f0` · `darksidebar` `#111827` · `pastelPink` `#FF758C` · `pastelOrange` `#FF7EB3`

**Typography (intended — in flux)**
- Display: Playfair Display (headlines, mission quotes)
- Body: Inter (everything else)

**Typography (currently in code)**
- `font-sans`: Inter, Poppins, Nunito (Playfair Display not yet added)

**Voice**
Warm, calm, competent. Name the frustration before offering the fix. Never hype, never say "revolutionize." Italicize *you* when the sentence needs to feel personal.

---

## Finance quick-reference

Full details in `ieppal-finances/CLAUDE.md`. The metrics investors will look at:

1. **ARR / MRR growth** — primary investor signal; three B2B tiers (all school contracts — no individual B2C subscriptions exist):
   - Basic: S$3,000/yr base + S$12/student IEP + S$15/student AI (applied to 50% of IEP students)
   - Schools: S$5,000/yr base + S$12/student IEP + S$12/student AI
   - Custom: S$20,000/yr base + S$12/student IEP + S$10/student AI (white-label, enterprise)
   - Add-ons: Strategy Library (S$99/educator/mo), PD Offerings (S$150/educator/mo), Custom Feature Dev, White-Label Licensing
   - Non-operating: Government grants (non-recurring — track separately from ARR)
   - **ARR trajectory (modelled):** Y1 S$15K → Y2 S$81K → Y3 S$220K | **MRR:** Y1 S$1,771 → Y3 S$18,302

2. **Unit economics** — the four numbers investors probe:
   - LTV:CAC by tier (target >3× by Y2Q3)
   - CAC payback period (target <12 months — best-in-class B2B EdTech benchmark)
   - Gross margin (~93–97% variable COGS)
   - NRR — Net Revenue Retention (target >100% by Y2Q3; signals expansion ARR exceeds churn)

3. **Cost / burn rate** — net monthly burn, runway months, quarterly headcount cost; modelled on S$185K pre-seed raise (SGD). Quarterly gross churn assumption: 5%.

All figures in SGD. 1 SGD ≈ 0.74 USD (as at Jun 2026).

Primary data source: `ieppal-finances/Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx`

---

## Folder structure

```
ieppal-overview/
├── CLAUDE.md                          ← you are here (root entry point — source of truth)
├── SESSIONS.md                        ← session memory (read every start; update every end)
├── STATUS.md                          ← workspace status tracker
│
├── ieppal-brand/
│   ├── CLAUDE.md
│   ├── BRAND.md                       ← design intent (in flux — verify vs tailwind.config.js)
│   ├── voice/                         ← voice & tone (SKILL.md + references/)
│   │   └── SKILL.md                   ← load before any copy
│   ├── writing/                       ← SKILL.md + 01-drafts/ + 02-final/ + references/ + assets/ + scripts/
│   ├── linkedin posts/                ← SKILL.md + 01-drafts/ + 02-final/ + references/ + assets/ + scripts/
│   ├── carousel/                      ← SKILL.md + 01-drafts/ + 02-final/ + references/ + assets/ + scripts/
│   ├── slides/                        ← SKILL.md (STUB, ON HOLD) + 01-drafts/ + 02-final/ + references/ + assets/ + scripts/
│   └── video/                         ← SKILL.md + 01-drafts/ + 02-final/ + references/ + assets/ + scripts/ + .agents/skills/
│
├── ieppal-software/
│   ├── CLAUDE.md
│   ├── start-dev.sh
│   ├── IEPPAL-RASA-FE/
│   │   ├── tailwind.config.js         ← ACTIVE brand tokens (read this for design work)
│   │   ├── .specify/memory/constitution.md  ← MISSING
│   │   ├── specs/                     ← MISSING
│   │   └── src/
│   └── IEPPAL-RASA-BE/
│
└── ieppal-finances/
    ├── CLAUDE.md
    └── Forecasts/
        └── IEPPAL_Financial_Forecast_Updated.xlsx
```
