# Video Workspace

> **Location:** `IEPPAL-Design/media/video/CLAUDE.md`
> ```
> IEPPAL-Design/
> └── media/
>     └── video/
>         ├── CLAUDE.md          ← you are here
>         ├── skills-lock.json   ← all tool skills tracked here
>         ├── .agents/skills/
>         │   ├── remotion-best-practices/   ← Remotion skill
>         │   ├── hyperframes/               ← Hyperframes composition authoring
>         │   ├── hyperframes-cli/           ← Hyperframes CLI (init, lint, render…)
>         │   ├── hyperframes-registry/      ← Hyperframes component registry
>         │   ├── website-to-hyperframes/    ← convert a website URL → video
>         │   └── gsap/                      ← GSAP animation reference (Hyperframes)
>         ├── .claude/settings.local.json
>         ├── remotion/          ← Remotion compositions (React/TypeScript)
>         │   └── create-class-demo/
>         └── hyperframes/       ← Hyperframes projects (HTML/CSS/GSAP)
> ```
> For the full repo structure see `IEPPAL-Design/CLAUDE.md`.

---

## Pick your tool

| Goal | Use |
|---|---|
| Video authored in React/TypeScript, component model | **Remotion** |
| Reuse existing frontend React components in video | **Remotion** |
| Complex programmatic animation, data-driven video | **Remotion** |
| HTML/CSS-first video, simpler authoring surface | **Hyperframes** |
| Quick iteration, content-creator-friendly workflow | **Hyperframes** |
| Convert a website URL into a video | **Hyperframes** (`website-to-hyperframes`) |
| TTS narration or transcription workflow | **Hyperframes** |
| Scenes with GSAP animations and beat-sync | **Hyperframes** |

Both tools are code-driven and render to video files. The difference is stack: Remotion is React; Hyperframes is HTML + GSAP.

---

## Context to load

### Remotion task
- This file
- `.agents/skills/remotion-best-practices/SKILL.md`

### Hyperframes task
- This file
- `.agents/skills/hyperframes/SKILL.md` — composition authoring (always)
- `.agents/skills/hyperframes-cli/SKILL.md` — CLI commands (always, pair with above)

**Add only if the task requires it:**
- `.agents/skills/gsap/SKILL.md` — writing complex GSAP animations
- `.agents/skills/hyperframes-registry/SKILL.md` — using registry components
- `.agents/skills/website-to-hyperframes/SKILL.md` — converting a URL to video

**Add for brand/copy alignment (either tool):**
- `BRAND.md` — visual brand alignment (colors, typography, illustration)
- `brand/voice/SKILL.md` — writing new voiceover copy from scratch

**Converting from writing (load only):**
- `media/writing/03-final/[filename]` — the source piece
- This file + the relevant tool skills above

**Never load unless explicitly requested:**
- `media/carousel/`, `media/slides/`, `media/writing/01-ideas/`, `media/writing/02-drafts/`
- `IEPPAL-RASA-FE-mvp/`, `Wesbite/`

---

## Production pipeline (tool-agnostic)

| Folder | Purpose |
|---|---|
| `01-scripts/` | Voiceover scripts, scene outlines |
| `02-specs/` | Composition specs — timing, layout, copy per scene |
| `03-builds/` | Rendered output files (MP4, WebM) |

These folders are tool-agnostic — use them for either Remotion or Hyperframes projects.

---

## Remotion

Projects live in `remotion/`. Each subfolder is a standalone Remotion composition with its own git repo and `package.json`.

**Existing projects:**
- `remotion/create-class-demo/` — classroom UI walkthrough demo

---

## Hyperframes

Projects live in `hyperframes/`. Each subfolder is scaffolded with `npx hyperframes init [name]`.

**Workflow:** init → author HTML → lint → inspect → preview → render

Before writing any composition HTML, Hyperframes requires a `DESIGN.md` in the project folder defining colors, fonts, and motion rules. If one doesn't exist, create it first (or the skill will ask you to).
