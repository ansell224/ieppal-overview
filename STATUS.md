# IEP Pal — Workspace Status

Last updated: 2026-05-27

Quick reference for what exists, what's in progress, and what's described but not yet built. Read before starting any new skill, workflow, or session. Update when anything changes.

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Shipped and working |
| 🟡 | Partially built / in progress |
| ⏸ | On hold (blocked — see reason) |
| ❌ | Described but not yet built |
| 🚫 | Archived / do not use |

---

## Brand (`ieppal-brand/`)

| Asset / Skill | Status | Notes |
|---|---|---|
| `BRAND.md` | 🟡 In flux | Palette + typography not finalized. Blocks: slides skill, any new media templates. See Frontend Sync section in BRAND.md for active token location. |
| `brand/voice/SKILL.md` | ✅ Shipped | v4 (2026-05-12). Load before any IEP Pal copy. |
| `brand/assets/` | ✅ Present | Smile 1.svg, Pat On Back.svg, Loading Icon 2.svg |
| `brand/logos/` | 🟡 Partial | favicon.svg is in `ieppal-software/IEPPAL-RASA-FE/public/`. Not yet in brand folder. See `brand/logos/README.md`. |
| `writing/` | 🟡 Active | 1 piece in `02-final/` (nasa-framework-growthbeans). 6 founder essays in `references/` (style reference only — not handoff source). |
| `writing/references/` | ✅ Present | 6 founder-authored essays added 2026-05-22. See `writing/SKILL.md` for full file list and usage rules. |
| `linkedin posts/` | 🟡 Active | 1 draft, 0 finals. Target cadence: 3–5x/week. No writing/02-final pieces ready to convert yet. |
| `media/carousel/SKILL.md` | 🟡 Building | Canva MCP approach documented. Not yet tested end-to-end. |
| `media/slides/SKILL.md` | ⏸ On hold | Waiting for brand palette + typography to lock. |
| `media/video/CLAUDE.md` | 🟡 Stub | Tool-chooser guide exists. Remotion: placeholder only, not scaffolded. Hyperframes: not scaffolded. |
| `Wesbite/` | ❌ Empty | No work started. Folder name typo is pre-existing. |

---

## Software (`ieppal-software/`)

| Asset / Skill | Status | Notes |
|---|---|---|
| `IEPPAL-RASA-FE/` | ✅ Active | React + Vite + Tailwind git repo. Run `start-dev.sh` to start. |
| `IEPPAL-RASA-BE/` | ✅ Active | Node.js REST API git repo (port 3001). |
| `.specify/memory/constitution.md` | ❌ Missing | Referenced in CLAUDE.md as mandatory SDD first-read. Spec text is in `ieppal-software/CLAUDE.md` — just needs to be written to the file. |
| `specs/` | ❌ Missing | No features formally specced via SDD yet. |
| `IEPPAL-RASA-FE-mvp/` | 🚫 Archive | Old manually-downloaded zip snapshot. Do not use for active work. |

---

## Finance (`ieppal-finances/`)

| Asset / Skill | Status | Notes |
|---|---|---|
| `CLAUDE.md` | 🟡 Updated | Now reflects cost/revenue/CAC focus (updated 2026-05-21). |
| `Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx` | ✅ Present | Working financial model. Use as input for future finance tools. |
| `financial-analyst/` | ❌ Missing | Folder and scripts described in CLAUDE.md do not exist. |
| `saas-metrics-coach/` | ❌ Missing | Folder and scripts described in CLAUDE.md do not exist. |
| `business-investment-advisor/` | ❌ Missing | Folder described in CLAUDE.md does not exist. |

**Priority build order for finance tools:**
1. Burn rate + runway tracker (most urgent; inputs available from Excel forecast)
2. Revenue breakdown by tier (Basic / Schools / Custom school contracts + grants — no B2C subscriptions)
3. CAC by channel tracker (LinkedIn, outreach, referral, etc.)

---

## Cross-repo workflows

| Workflow | Status | Notes |
|---|---|---|
| Writing → LinkedIn post | 🟡 Defined, unused | Workflow in `linkedin.md`. 6 pieces ready to convert. |
| LinkedIn post → Carousel | 🟡 Defined, untested | Carousel skill now uses Canva MCP. Not yet tested end-to-end. |
| Carousel → LinkedIn caption | 🟡 Defined, untested | Documented in `linkedin.md` and carousel SKILL.md. |
| Video → LinkedIn caption | 🟡 Defined, unused | Documented in `video/CLAUDE.md` and `linkedin.md`. No videos rendered yet. |
| Brand token → Frontend (tailwind) | 🟡 Manual | BRAND.md documents intent; tailwind.config.js holds active tokens. Sync is manual — see BRAND.md Frontend Sync section. |
| SDD (spec → implement) | 🟡 Defined, unused | Full 6-step workflow in `ieppal-software/CLAUDE.md`. Constitution file missing. |
