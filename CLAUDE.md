# IEPPAL-Design

The canonical design repository for IEP Pal — brand identity, voice, media production, the live website, and the React frontend.

Read `BRAND.md` for the single source of truth on colors, typography, and logo. Read `brand/voice/SKILL.md` before writing any IEP Pal copy.

---

# IEPPAL-SYSTEM

For any deep context on a specific workspace, navigate to the folder listed below and read its CLAUDE.md or SKILL.md. Each file contains a folder location map so you always know where you are in the project.

| Workspace | Entry point | Purpose |
|---|---|---|
| Brand system | `BRAND.md` | Colors, typography, logo — single source of truth |
| Voice & tone | `brand/voice/SKILL.md` | How IEP Pal sounds — read before writing any copy |
| Brand assets | `brand/` | Illustrations, color palette preview, fonts, logos |
| Writing | `media/writing/SKILL.md` | Long-form & short-form copy production |
| Carousels | `media/carousel/SKILL.md` | LinkedIn carousel generation |
| Slides | `media/slides/SKILL.md` | Slide deck generation |
| Video | `media/video/CLAUDE.md` | Video production — Remotion (code-driven) and Hyperframes (AI avatar) |
| Frontend app | `IEPPAL-RASA-FE-mvp/` | React + Vite + Tailwind production frontend |
| Website | `Wesbite/` | Static landing page (HTML/CSS; folder name typo is pre-existing) |

---

## Token management

Each workspace skill declares the minimum context it needs. Load only what is listed — do not load other workspaces unless they are explicitly named.

**Quick reference — what to load for each task:**

| Task | Load |
|---|---|
| Write a piece | `brand/voice/SKILL.md` |
| Write with visual brand alignment | `brand/voice/SKILL.md` + `BRAND.md` |
| Build a carousel | `BRAND.md` + `brand/voice/SKILL.md` |
| Build a carousel from existing writing | above + `media/writing/03-final/[file]` |
| Build a slide deck | `BRAND.md` + `brand/voice/SKILL.md` |
| Build slides from existing writing | above + `media/writing/03-final/[file]` |
| Generate a video (choose tool in CLAUDE.md) | `media/video/CLAUDE.md` |
| Remotion video | above + `.agents/skills/remotion-best-practices/SKILL.md` |
| Hyperframes video | above + `.agents/skills/hyperframes/SKILL.md` + `.agents/skills/hyperframes-cli/SKILL.md` |
| Convert website URL → video | above (Hyperframes) + `.agents/skills/website-to-hyperframes/SKILL.md` |
| Convert writing → video | `media/writing/03-final/[file]` + `media/video/CLAUDE.md` + tool skill |
| Any video with brand visuals | above + `BRAND.md` |
| Any video with new voiceover copy | above + `brand/voice/SKILL.md` |

**Rule:** `03-final/` is the only handoff point between writing and other media. Never load `01-ideas/` or `02-drafts/` for a conversion task.

---

## Folder Structure

```
IEPPAL-Design/
├── CLAUDE.md                              ← you are here (system entry point)
├── BRAND.md                               ← single source of truth: colors, typography, logo
├── README.md                              ← repo overview and Claude usage guide
│
├── brand/                                 ← brand identity assets (inputs for all media)
│   ├── voice/
│   │   └── SKILL.md                       ← voice & tone guide (SHIPPED) — load before any copy
│   ├── assets/                            ← illustration SVGs (Smile, Pat On Back, Loading Icon)
│   ├── colors/                            ← color palette preview HTML (open in browser)
│   ├── fonts/                             ← font specimens (future)
│   └── logos/                             ← logo exports (future)
│
├── media/                                 ← production outputs (carousels, slides, video, writing)
│   ├── writing/
│   │   ├── SKILL.md                       ← writing skill (context: brand/voice only)
│   │   ├── 01-ideas/                      ← raw ideas and outlines
│   │   ├── 02-drafts/                     ← working drafts
│   │   └── 03-final/                      ← finished pieces — handoff point for other media
│   ├── carousel/
│   │   └── SKILL.md                       ← LinkedIn carousel skill (STUB)
│   ├── slides/
│   │   └── SKILL.md                       ← slide deck generation skill (STUB)
│   └── video/                             ← video production workspace (Remotion + Hyperframes)
│       ├── CLAUDE.md                      ← video entry point + tool-chooser guide
│       ├── skills-lock.json               ← locked skill versions for all tools
│       ├── .agents/
│       │   └── skills/
│       │       ├── remotion-best-practices/  ← Remotion best-practice rules
│       │       ├── hyperframes/              ← Hyperframes composition authoring
│       │       ├── hyperframes-cli/          ← Hyperframes CLI (init, lint, render…)
│       │       ├── hyperframes-registry/     ← Hyperframes component registry
│       │       ├── website-to-hyperframes/   ← convert a website URL → video
│       │       └── gsap/                     ← GSAP animation reference (Hyperframes)
│       ├── .claude/
│       │   └── settings.local.json        ← Claude Code settings for this workspace
│       ├── remotion/                      ← Remotion compositions (React/TypeScript)
│       │   └── create-class-demo/         ← classroom UI walkthrough demo (git repo)
│       │       ├── src/
│       │       │   ├── Root.tsx           ← Remotion root compositions
│       │       │   ├── Composition.tsx
│       │       │   ├── components/        ← ClassroomCard, Cursor, Sidebar
│       │       │   └── scenes/            ← AppScreen, IntroCard, ModalScene, SuccessScene
│       │       └── public/                ← static assets for video renders
│       └── hyperframes/                   ← Hyperframes projects (HTML/CSS/GSAP → video)
│
├── IEPPAL-RASA-FE-mvp/                    ← production React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── App.jsx                        ← root app component and routing
│   │   ├── components/                    ← shared UI components (cards, modals, charts, etc.)
│   │   ├── pages/                         ← page-level components (goals, IEP forms, dashboard)
│   │   ├── context/                       ← React context providers (Auth, IEP, Theme, Permission)
│   │   ├── hooks/                         ← custom React hooks (useApi)
│   │   ├── data/                          ← static data, strategy library, Lucide icon maps
│   │   └── utils/                         ← utility functions, constants, PDF export
│   └── public/                            ← static public assets
│
└── Wesbite/                               ← static landing page (note: pre-existing folder name typo)
    ├── index.html                         ← website entry point
    └── logo-new.svg                       ← primary IEP Pal logo mark
```
