# IEP Pal — Software Workspace

The software development repository for IEP Pal — the production React frontend and Node.js backend.

**Start every session by reading the root `../CLAUDE.md`, then `../SESSIONS.md`, then `../STATUS.md`.** SESSIONS.md carries decisions and context from prior sessions. STATUS.md shows what's built vs. missing vs. on hold.

For brand and design context (colors, typography, voice), read `../ieppal-brand/BRAND.md` and `../ieppal-brand/brand/voice/SKILL.md`.

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

2. **While the script runs, load context** — read this file and ask the user what they want to build or change.

3. **Once they describe the feature**, assess its scope:
   - **Multi-component or new UI pattern** → use the **SDD workflow** (`/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`). Full details below.
   - **Single-file fix or copy tweak** → navigate to the relevant files in `IEPPAL-RASA-FE/src/` and propose a plan directly.

4. **All edits go into `IEPPAL-RASA-FE/`** — never `IEPPAL-RASA-FE-mvp/` (that is the old zip snapshot, do not touch it).

**The script handles:** GitHub pull (latest code), `npm install`, BE on `localhost:3001`, FE on `http://127.0.0.1:5173`, VSCode open.

---

## 🧭 Spec-Driven Development (SDD) with Spec Kit

Use this for any feature touching more than one component or introducing new UI patterns. For single-file bug fixes or copy tweaks, the standard dev flow is sufficient.

IEP Pal follows **Spec-Driven Development** — specifications are the primary artifact, code is their expression. Before implementing any feature that touches more than one component, define *what* to build and *why* using Spec Kit's structured workflow. This prevents wasted implementation from underspecified features and keeps Claude consistently aligned with educator intent.

**Source:** [github/spec-kit](https://github.com/github/spec-kit)

---

### One-time setup

Requires `uv` (Python package manager) and Python 3.11+.

```bash
# 1. Install uv if not present
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install the specify CLI (replace vX.Y.Z with latest from github.com/github/spec-kit/releases)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z

# 3. Verify installation
specify version

# 4. Initialize spec-kit inside the frontend repo
cd ~/Desktop/ieppal-overview/ieppal-software/IEPPAL-RASA-FE
specify init . --integration claude
```

This creates a `.specify/` folder inside `IEPPAL-RASA-FE/` with templates, scripts, and slash commands wired to Claude.

---

### IEP Pal constitution

The constitution lives at `IEPPAL-RASA-FE/.specify/memory/constitution.md`. It encodes the non-negotiables that every feature must respect. **Claude must read this file before generating any implementation plan.**

Run this once after `specify init` to set the constitution:

```
/speckit.constitution React + Vite + Tailwind stack only — no additional frameworks without explicit approval. Inter for body text, Playfair Display for display headings — never substitute. Brand tokens only for color (ink, charcoal, ash, linen, cream, sand, lilac, sunshine, mint, sprout, accent-warm) — no arbitrary hex values. Warm-calm-competent UI voice — read ieppal-brand/brand/voice/SKILL.md before writing any in-app copy. Shared UI components go in src/components/, page-level components in src/pages/ — no one-off inline styles. Simplicity gate: max 3 new files per feature unless justified in the spec. Test-first: write acceptance criteria in the spec before implementation begins. No speculation: every feature must trace to a named educator user story.
```

| Principle | Rule |
|---|---|
| Tech stack | React + Vite + Tailwind — no new frameworks without approval |
| Typography | Inter (body) · Playfair Display (headings) — no substitutions |
| Colors | Brand tokens only — see `../ieppal-brand/BRAND.md` |
| Voice | Warm · calm · competent — read `../ieppal-brand/brand/voice/SKILL.md` before any copy |
| Components | Shared → `src/components/` · Pages → `src/pages/` |
| Simplicity gate | Max 3 new files per feature unless spec justifies more |
| Test-first | Acceptance criteria written in spec before implementation |
| No speculation | Every feature traces to an educator user story |

---

### The 6-step SDD workflow

Use this for any feature touching more than one component or introducing new UI patterns. For single-file bug fixes or copy tweaks, the standard dev flow below is sufficient.

**Step 1 — Specify** *(describe the educator need, not the tech)*

```
/speckit.specify [describe what to build and why — focus on the teacher workflow]
```

Example:
```
/speckit.specify IEP goal progress tracker: teachers need to log weekly progress notes against each goal and see a visual trend over the last 8 weeks without leaving the student's IEP page.
```

**Step 2 — Clarify** *(resolve ambiguities before touching code)*

```
/speckit.clarify [focus areas: accessibility, data model, edge cases]
```

Example:
```
/speckit.clarify How many goals can a student have? Does progress logging replace or append to prior entries? Should the 8-week chart be visible to admins only or all teachers?
```

**Step 3 — Checklist** *(optional but recommended — validates spec completeness)*

```
/speckit.checklist
```

**Step 4 — Plan** *(lock in the technical approach)*

```
/speckit.plan [your stack context and constraints]
```

Example:
```
/speckit.plan React component using Recharts (already in dependencies). Progress notes stored via existing REST API at localhost:3001. No new routes needed — extend the existing IEP goals endpoint. Tailwind + brand tokens for styling.
```

**Step 5 — Tasks** *(break the plan into an executable task list)*

```
/speckit.tasks
```

Generates `specs/[branch-name]/tasks.md` with ordered, parallelizable tasks ready for implementation.

**Step 6 — Implement**

```
/speckit.implement
```

Or hand `tasks.md` to Claude as context and work through tasks manually for finer control.

> **Tip:** For large features, implement in phases — core functionality first, then layers. Validate each phase before continuing.

---

### Spec artifacts

All spec artifacts live inside the feature branch under `IEPPAL-RASA-FE/specs/`. Spec Kit auto-detects the active feature from the current Git branch name.

```
IEPPAL-RASA-FE/specs/
└── 001-goal-progress-tracker/    ← branch: 001-goal-progress-tracker
    ├── spec.md                   ← what to build + why (user stories, acceptance criteria)
    ├── plan.md                   ← technical approach, component breakdown, API contracts
    ├── tasks.md                  ← ordered task list for implementation
    ├── data-model.md             ← data shapes and state structure
    ├── research.md               ← library comparisons, technical tradeoffs
    └── contracts/                ← API contract definitions
```

Switch features by switching Git branches — the active spec follows automatically.

---

### When to use SDD vs. quick edits

| Scenario | Workflow |
|---|---|
| New page or major component | SDD — full 6-step workflow |
| Feature touching 3+ files | SDD — full 6-step workflow |
| Redesign of existing component | SDD — start from Step 1 (constitution already set) |
| Single-file bug fix | Standard dev flow |
| Copy / UI text change | Standard dev flow + `brand/voice/SKILL.md` |
| Quick styling adjustment | Standard dev flow + `BRAND.md` |

---

## Dev environment (manual)

To start a local dev session manually, run from Terminal:

```bash
bash ieppal-software/start-dev.sh
```

This script will:
1. Set up / verify GitHub SSH auth (one-time on first run)
2. Clone or pull latest from both repos
3. Install dependencies
4. Start BE on `http://localhost:3001` and FE on `http://127.0.0.1:5173`
5. Open the workspace in VSCode

**FE repo:** `https://github.com/IEPPAL-SG/IEPPAL-RASA-FE.git`
**BE repo:** `https://github.com/IEPPAL-SG/IEPPAL-RASA-BE.git`

---

# IEPPAL-SYSTEM

| Workspace | Entry point | Purpose |
|---|---|---|
| Frontend app | `IEPPAL-RASA-FE/` | React + Vite + Tailwind production frontend |
| Backend API | `IEPPAL-RASA-BE/` | Node.js REST API on port 3001 |
| Brand system | `../ieppal-brand/BRAND.md` | Colors, typography, logo — reference for design work in the app |
| Voice & tone | `../ieppal-brand/brand/voice/SKILL.md` | How IEP Pal sounds — read before writing any in-app copy |

> **Note:** `IEPPAL-RASA-FE-mvp/` is the old manually-downloaded zip snapshot. The live git repos are `IEPPAL-RASA-FE/` and `IEPPAL-RASA-BE/`. Always work in the git repos.

---

## Token management

Load only what each task requires.

| Task | Load |
|---|---|
| Frontend feature work | `IEPPAL-RASA-FE/src/` (relevant file or folder) |
| Backend API work | `IEPPAL-RASA-BE/` (relevant route or controller) |
| Applying brand tokens / styling | above + `../ieppal-brand/BRAND.md` |
| Writing in-app copy or UI text | `../ieppal-brand/brand/voice/SKILL.md` |
| Full design + code alignment | both brand files above + the relevant component |
| SDD — new feature (spec phase) | `IEPPAL-RASA-FE/.specify/memory/constitution.md` |
| SDD — implementation phase | above + `IEPPAL-RASA-FE/specs/[branch]/tasks.md` + relevant `src/` files |

---

## Folder Structure

```
ieppal-software/
├── CLAUDE.md                              ← you are here (software entry point)
├── start-dev.sh                           ← run this to start local dev (pulls latest, starts servers, opens VSCode)
│
├── IEPPAL-RASA-FE/                        ← production React frontend (git repo — use this)
│   ├── .specify/                          ← Spec Kit artifacts (constitution, templates, scripts)
│   │   └── memory/constitution.md         ← IEP Pal architectural non-negotiables
│   ├── specs/                             ← per-feature spec artifacts (spec.md, plan.md, tasks.md…)
│   ├── src/
│   │   ├── App.jsx                        ← root app component and routing
│   │   ├── apiClient.js                   ← REST API client (defaults to localhost:3001)
│   │   ├── authLogoutBridge.js            ← auth logout bridge
│   │   ├── components/                    ← shared UI components (cards, modals, charts, etc.)
│   │   ├── pages/                         ← page-level components (goals, IEP forms, dashboard)
│   │   ├── context/                       ← React context providers (Auth, IEP, Theme, Permission)
│   │   ├── hooks/                         ← custom React hooks (useApi)
│   │   ├── data/                          ← static data, strategy library, Lucide icon maps
│   │   ├── assets/                        ← local fonts and icons
│   │   └── utils/                         ← utility functions, constants, PDF export
│   ├── public/                            ← static public assets
│   ├── index.html                         ← HTML entry point
│   ├── vite.config.js                     ← Vite config (dev server: 127.0.0.1:5173)
│   ├── tailwind.config.js                 ← Tailwind CSS configuration
│   ├── package.json                       ← dependencies and scripts
│   └── amplify.yml                        ← AWS Amplify deployment config
│
├── IEPPAL-RASA-BE/                        ← Node.js backend API (git repo — use this)
│   └── ...                               ← inspect after first clone
│
└── IEPPAL-RASA-FE-mvp/                   ← OLD zip snapshot (do not use for active work)
```
