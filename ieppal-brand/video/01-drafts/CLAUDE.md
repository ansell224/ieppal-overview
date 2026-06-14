# HyperFrames Composition Projects

> This file applies to **all projects in `01-drafts/`**. Do NOT create per-project `CLAUDE.md` or `AGENTS.md` files — this shared file covers all of them automatically.

---

## Skills — USE THESE FIRST

**Always invoke the relevant skill before writing or modifying compositions.** Skills encode framework-specific patterns (`window.__timelines` registration, `data-*` attribute semantics, shader-compatible CSS rules) that are NOT in generic web docs. Skipping them produces broken compositions.

| Skill | Command | When to use |
|---|---|---|
| **hyperframes** | `/hyperframes` | Creating or editing HTML compositions, captions, TTS, audio-reactive animation, marker highlights |
| **hyperframes-cli** | `/hyperframes-cli` | Dev-loop CLI: init, lint, inspect, preview, render, doctor |
| **hyperframes-media** | `/hyperframes-media` | Asset preprocessing: tts (Kokoro), transcribe (Whisper), remove-background (u2net) |
| **hyperframes-registry** | `/hyperframes-registry` | Installing blocks and components via `hyperframes add` |
| **website-to-hyperframes** | `/website-to-hyperframes` | Capturing a URL and turning it into a video — full website-to-video pipeline |
| **tailwind** | `/tailwind` | Tailwind v4 browser-runtime styles for projects created with `hyperframes init --tailwind` |
| **gsap** | `/gsap` | GSAP animations for HyperFrames — tweens, timelines, easing, performance |
| **animejs** | `/animejs` | Anime.js animations registered on `window.__hfAnime` |
| **css-animations** | `/css-animations` | CSS keyframes that HyperFrames can pause and seek |
| **lottie** | `/lottie` | `lottie-web` and dotLottie players registered on `window.__hfLottie` |
| **three** | `/three` | Three.js scenes rendered from HyperFrames `hf-seek` events |
| **waapi** | `/waapi` | Web Animations API motion driven through `document.getAnimations()` |

> **Skills not available?** Ask the user to run `npx hyperframes skills` and restart their agent session, or install manually: `npx skills add heygen-com/hyperframes`.

---

## CLI Commands

For scaffold, dev loop, render, archive, and all flag variants → see `../scripts/scripts.md`.

Quick reference:

```bash
npm run dev      # start preview server — LONG-RUNNING, always run in background
npm run check    # lint + validate + inspect (run this after every change)
npm run render   # render to MP4
npm run publish  # publish and get a shareable link
```

> **`npm run dev` is a long-running server, not a one-shot command.** Always run it with `run_in_background: true`. Never run it in the foreground — it will time out and kill the server, breaking the browser preview.

---

## Project Structure

```
<project-name>/
├── index.html          — main composition (root timeline)
├── compositions/       — sub-compositions (referenced via data-composition-src)
├── assets/             — media files (video, audio, images)
├── meta.json           — project metadata (id, name)
└── transcript.json     — whisper word-level transcript (if generated)
```

---

## Linting — ALWAYS RUN AFTER CHANGES

After creating or editing **any** `.html` composition, always run the full check before presenting the result:

```bash
npm run check
```

Fix all errors. Review inspect warnings before rendering. Do not consider a task complete until check passes clean.

---

## Key Rules

1. Every timed element needs `data-start`, `data-duration`, and `data-track-index`
2. Elements with timing **MUST** have `class="clip"` — the framework uses this for visibility control
3. Timelines must be paused and registered on `window.__timelines`:
   ```js
   window.__timelines = window.__timelines || {};
   window.__timelines["composition-id"] = gsap.timeline({ paused: true });
   ```
4. Videos use `muted` with a separate `<audio>` element for the audio track
5. Sub-compositions use `data-composition-src="compositions/file.html"`
6. Only deterministic logic — no `Date.now()`, no `Math.random()`, no network fetches

---

## Documentation

```bash
npx hyperframes docs <topic>   # local CLI docs — no network required
```

Topics: `data-attributes`, `gsap`, `compositions`, `rendering`, `examples`, `troubleshooting`

Full docs: https://hyperframes.heygen.com/introduction
Machine-readable index for AI tools: https://hyperframes.heygen.com/llms.txt
