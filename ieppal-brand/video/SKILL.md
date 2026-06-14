---
name: ieppal-video
description: IEP Pal video production workspace. Covers the full pipeline from LinkedIn post or final writing to animated MP4 — using Hyperframes (HTML/CSS/GSAP) for content animations and Remotion (React-based) for UI walkthroughs. Load this skill before starting any video project.
---

# IEP Pal Video Production

> **Location:** `ieppal-brand/video/SKILL.md`
> ```
> ieppal-brand/video/
> ├── SKILL.md                  ← you are here
> ├── 01-drafts/                ← active Hyperframes / Remotion projects (in progress)
> │   └── <project-name>/       ← one folder per video, scaffolded with `npx hyperframes init`
> ├── 02-final/                 ← rendered MP4s only (one file per completed video)
> ├── references/               ← source HTMLs from step 1 of the pipeline (LinkedIn → HTML)
> ├── assets/                   ← shared media (logos, SVGs, audio, stock clips)
> ├── scripts/                  ← voiceover scripts and narration notes
> └── .agents/skills/           ← Hyperframes agent skill files (hyperframes, hyperframes-cli, gsap, etc.)
> ```

---

## Tool chooser — Hyperframes vs Remotion

| Signal | Use Hyperframes | Use Remotion |
|---|---|---|
| Source material | LinkedIn post, written piece, concept diagram | App UI walkthrough, screen recording |
| Output feel | Content animation, kinetic type, slide-style | Product demo, annotated UI, complex transitions |
| Code style | HTML + CSS + GSAP timeline | React components + `<Composition />` |
| Status | **Active — use this** | Stub only — not yet built |

**Default to Hyperframes** for all current IEP Pal content animations. Remotion is planned for product UI walkthroughs; see the stub notes at the bottom of this file.

---

## The repeatable pipeline

Every video follows this three-step pattern. Each step has a designated home in the folder structure.

### Pre-Step 1 — Confirm the video flow before writing any HTML

**Before drafting any HTML file, always ask Ansel how he envisions the video to flow.**

This means: what scenes or sections should appear, in what order, with what motion or pacing intent, and what the overall narrative arc is. If the flow description is unclear or feels underspecified (e.g. missing scene order, unclear transitions, ambiguous pacing), ask follow-up questions before proceeding. Do not assume or infer the flow — confirm it explicitly.

Only once the flow is understood and agreed should you move to Step 1.

---

### Step 1 — Source material → Standalone HTML

Take the final LinkedIn post, writing piece, or concept and build a matching standalone HTML visual. This is a design/layout file, not a Hyperframes project. It uses plain CSS and optionally GSAP for a quick preview of the motion intent.

**Output:** save to `references/<project-name>-source.html`

**What it captures:** the visual structure — one concept per card or section, brand colors and fonts applied, content arranged for 1920×1080.

**Loading:** read `../../BRAND.md` and `tailwind.config.js` before writing any CSS. Verify the color tokens in use against the "Current Implementation" table in BRAND.md.

---

### Step 2 — Standalone HTML → Hyperframes project

Init a new Hyperframes project in `01-drafts/` and port the standalone HTML into a proper composition. See `scripts/scripts.md` for the exact scaffold command.

Then:
1. Port CSS and layout from the source HTML into the new `index.html`.
2. Replace any CSS `animation` keyframes with a GSAP `gsap.timeline({ paused: true })`.
3. Register the timeline on `window.__timelines` (required by Hyperframes).
4. Add timing attributes (`data-start`, `data-duration`, `data-track-index`, `class="clip"`) to every timed element.
5. Add cursor motion, card entrances, or other motion on top of the static layout.
6. Run `npx hyperframes lint` and fix all errors before previewing.

**Output:** `01-drafts/<project-name>/` — a full Hyperframes project with `index.html`, `meta.json`, `package.json`, and `hyperframes.json`.

**Rules:**
- Every project must have a `DESIGN.md` (or `visual-style.md`) before any composition HTML is written — see the visual identity gate in `.agents/skills/hyperframes/SKILL.md`.
- Build the static end-state layout first. Add GSAP entrances/exits after.
- Always lint before previewing. See `scripts/scripts.md` for the full dev-loop commands.
- **Do NOT create `CLAUDE.md` or `AGENTS.md` inside individual project folders.** A shared `01-drafts/CLAUDE.md` covers all Hyperframes projects and is loaded automatically by Claude Code for every project in that folder. Creating per-project copies causes duplication and drift.

---

### Step 3 — Preview → Render → archive

Preview in the browser studio and tune timing, then render to MP4. See `scripts/scripts.md` for the exact commands. When the render is approved, move the MP4 to `02-final/` — the Hyperframes project stays in `01-drafts/` indefinitely as the source of truth for re-renders or variations.

**Output:** `02-final/<project-name>.mp4`

---

## Folder rules — quick reference

| What | Where |
|---|---|
| Hyperframes project (in progress or complete) | `01-drafts/<project-name>/` |
| Standalone HTML from step 1 (source reference) | `references/<project-name>-source.html` |
| Rendered MP4 (approved and done) | `02-final/<project-name>.mp4` |
| Voiceover scripts | `scripts/<project-name>.md` |
| Shared assets (logos, SVGs, audio) | `assets/` |
| Shared HyperFrames agent context (skills, rules, linting) | `01-drafts/CLAUDE.md` — **one file, never duplicated per project** |

**Never** put a Hyperframes project directly in `02-final/`. Only rendered MP4s go there.

---

## Completed videos

| Video | Source | Hyperframes project | Rendered MP4 |
|---|---|---|---|
| NASA Framework | `references/nasa-framework-source.html` | `01-drafts/nasa-framework/` | `02-final/nasa-framework.mp4` |

---

## Brand alignment checklist (run before any composition)

- [ ] Read `../../BRAND.md` — design intent, palette rationale
- [ ] Read `../../ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` — active tokens in code
- [ ] Read `../../voice/SKILL.md` — if the video has text overlays or voiceover
- [ ] Colors use the IEP Pal palette: `#f9f5f0` (offwhite/linen), `#1a1a1e` (ink), `#F97316` (accent-warm), pastels (sunshine `#f6eca7`, mint `#b0f6f0`, sprout `#bce784`)
- [ ] Typography: Inter for body/captions, Playfair Display for hero headlines

---

## Hyperframes skill files

These live in `.agents/skills/` and are loaded automatically when working inside a Hyperframes project. Reference them directly when writing or editing compositions:

| Skill | When to use |
|---|---|
| `hyperframes` | Authoring compositions — timing, layout, GSAP, captions, audio-reactive motion |
| `hyperframes-cli` | CLI commands: init, lint, inspect, preview, render |
| `gsap` | GSAP tweens, timelines, easing — loaded by the hyperframes skill |
| `website-to-hyperframes` | Capturing a URL and converting it to a video |
| `hyperframes-registry` | Installing blocks via `hyperframes add` |

---

## Remotion — stub (not yet built)

Remotion is reserved for product UI walkthroughs and annotated screen recordings. It is not yet scaffolded. When building the Remotion skill:

1. Scaffold inside `01-drafts/<project-name>/` — see `scripts/scripts.md` for the command
2. Build shared components: `<IEPPalBackground />`, `<Headline />` (Playfair), `<Eyebrow />`, `<PastelCard />`
3. Render and move the MP4 to `02-final/` following the same convention as Hyperframes

Open questions before building:
- TTS voiceover or human narrator?
- First real use case (UI walkthrough of which feature)?
- Captions burned in by default? (Recommended — accessibility + muted autoplay)

---

## Links

- `scripts/scripts.md` — all bash/CLI commands for the pipeline (scaffold, lint, preview, render, archive)
- `../../BRAND.md` — design intent
- `../../voice/SKILL.md` — voice and tone
- `../../../ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` — active brand tokens
- `.agents/skills/hyperframes/SKILL.md` — full Hyperframes composition guide
- `.agents/skills/hyperframes-cli/SKILL.md` — CLI reference
