# IEP Pal — Session Memory

Claude reads this file at the start of every session, alongside `CLAUDE.md`. At the end of every session, Claude updates the relevant sections before closing.

---

## Open decisions

| Topic | Status | Notes |
|---|---|---|
| Brand palette | 🟡 In flux | BRAND.md has intended direction. Active tokens are in `tailwind.config.js` (offwhite, darksidebar, pastelPink, pastelOrange — different from BRAND.md intent). Needs resolution before slides skill can be built. |
| Brand typography | 🟡 In flux | BRAND.md specifies Playfair Display + Inter. `tailwind.config.js` uses Inter + Poppins + Nunito as fallbacks. Playfair Display not yet in code. Decision pending. |
| Logo files | 🟡 Partial | `favicon.svg` lives in `ieppal-software/IEPPAL-RASA-FE/public/`. Needs to be finalized and added to `ieppal-brand/brand/logos/` once the logo direction is decided. |
| Slides skill | ⏸ On hold | Do not build until brand palette and typography are locked. |
| Finance tools | 🔧 Rebuilding | Focus: cost/revenue/CAC. Folder structure described in CLAUDE.md does not yet exist (financial-analyst/, saas-metrics-coach/, business-investment-advisor/ are all missing). |
| SDD constitution | ❌ Missing | `IEPPAL-RASA-FE/.specify/memory/constitution.md` is referenced everywhere but doesn't exist. Create before next SDD session. |
| LinkedIn content pipeline | 🟡 Underutilized | 6 finals in `writing/02-final/` have not been converted to LinkedIn posts. 1 post in `linkedin posts/02-final/` (ai-education-data-analytics). Target cadence: 3–5x/week. |

---

## Decisions made

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-21 | Carousels use Canva MCP, not PDF generator | Canva connector already available; faster and more scalable than building from scratch |
| 2026-05-21 | BRAND.md syncs from `tailwind.config.js` | Code is the source of truth for active tokens; BRAND.md documents intended direction and design rationale |
| 2026-05-21 | Finance focus: cost / revenue / CAC | These are the metrics that matter at the current stage; DCF and ratio analysis are too generic |
| 2026-05-21 | Slides skill on hold | Brand palette + typography not yet locked — building slides now would create rework |
| 2026-05-21 | Root CLAUDE.md is the single source of truth | Token management consolidated here; sub-repo CLAUDE.md files reference root, not duplicate |
| 2026-05-21 | Finance model is purely B2B — no individual educator (B2C) subscriptions | Confirmed against Excel model and pitch deck; three tiers are Basic, Schools, Custom — all school contracts |
| 2026-05-21 | SESSIONS.md updates are event-driven, not end-of-session | Claude has no signal for session end; updates must happen immediately after completing work |

---

## Next session priorities

1. **Write first long-form piece → 02-final** — `writing/02-final/` is currently empty; `writing/references/` now has 6 founder essays to draw from. Draft a piece, move to `02-final/`, then convert to LinkedIn.
2. **Convert writing to LinkedIn** — once a piece lands in `writing/02-final/`, compress it into a LinkedIn post using the conversion workflow in `linkedin posts/linkedin.md`.
3. **Build carousel skill** — Canva MCP approach is decided; carousel/SKILL.md now has the full workflow. Test with one real post.
4. **Build finance tools** — Start with burn rate + runway tracker (simplest, most urgent). Use the Excel forecast as input data.
5. **Resolve brand palette** — Until this is decided, slides and any new media templates are blocked. Schedule a focused decision session.
6. **Create constitution.md** — The SDD spec text is already in `ieppal-software/CLAUDE.md`. Just needs to be written to the file.

---

## Session log

### 2026-05-27 — Website repo wired into ieppal-brand

**What happened:**
- Created `ieppal-brand/website/` folder with three sub-folders: `references/`, `assets/`, `scripts/`
- Created `ieppal-brand/website/scripts/sync-website.sh` — a clone-or-pull script for the live marketing website repo (`https://github.com/I-ala-Wilson/Ian-ieppal-website`). Mirrors the `start-dev.sh` pattern from `ieppal-software/`: SSH auth check, then clone fresh if not present or pull latest if already cloned. Repo lands at `ieppal-brand/website/Ian-ieppal-website/`.
- Updated `ieppal-brand/CLAUDE.md`: added website to workspace table, added website startup routine section (trigger phrases + instruction to run sync-website.sh), added `website/` to folder structure diagram.

**Files created this session:**
- `ieppal-brand/website/references/` (folder + .gitkeep)
- `ieppal-brand/website/assets/` (folder + .gitkeep)
- `ieppal-brand/website/scripts/sync-website.sh`

**Files updated this session:**
- `ieppal-brand/CLAUDE.md` — workspace table, new startup routine section, folder structure diagram

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `ieppal-brand/CLAUDE.md` | Root `CLAUDE.md` — brand table and folder structure | Root CLAUDE.md references `ieppal-brand/CLAUDE.md` as entry point; no change needed there |
| `ieppal-brand/CLAUDE.md` | `STATUS.md` — no website row exists yet | Flagged — add website row to STATUS.md when work on the site begins |

**Open decisions updated:** none

**STATUS.md updated:** no — website row not yet needed (repo not yet cloned; no work done on the site)

**Next session: carry these forward:**
1. When starting a website session: run `bash ~/Desktop/ieppal-overview/ieppal-brand/website/scripts/sync-website.sh` first
2. Add a `website` row to `STATUS.md` once the first website session begins

---

### 2026-05-27 — NASA Framework essay promoted to 02-final

**What happened:**
- Moved `nasa-framework-growthbeans.md` from `writing/01-drafts/` to `writing/02-final/`
- Final essay is ready for LinkedIn conversion (essay explores the NASA model from Growthbeans + CoachUP9, contrasts problem-solving default with listening/presence)
- Piece reflects IEP Pal voice (warm, competent, problem-before-solution) and founder perspective

**Files moved this session:**
- `ieppal-brand/writing/nasa-framework-growthbeans.md` — moved from `01-drafts/` → `02-final/`

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `writing/02-final/nasa-framework-growthbeans.md` | `STATUS.md` — writing row | Update next session (1 piece now in 02-final/) |
| | `SESSIONS.md` — open decisions (LinkedIn pipeline) | No change needed (already tracking pipeline backlog) |

**Open decisions updated:**
- LinkedIn content pipeline: 1 new piece added to `writing/02-final/` (now 1 total: venus-terraforming already there)

**STATUS.md updated:** yes — writing row: mark `02-final/` as 🟡 partial (1 piece ready for LinkedIn conversion)

**Next session: carry these forward:**
1. Convert nasa-framework-growthbeans to LinkedIn post (use `ieppal-brand/voice/SKILL.md` + conversion workflow)
2. Apply LinkedIn-to-carousel pipeline if needed
3. Continue: resolve brand palette, create constitution.md, build finance tools

---

### 2026-05-26 — LinkedIn carousel created: "You went into teaching..."

**What happened:**
- Created a complete 7-slide LinkedIn carousel from the approved IEP Pal post about IEP writing workflow
- Used Canva MCP (generate-design) to build the design with brand-aligned colors, typography, and illustrations
- Applied all voice guide rules: warm colleague tone, emotional agreement hook, problem-before-solution structure
- Design includes exact approved slide copy across all 7 slides with proper formatting and visual metaphors
- Exported as PDF (LinkedIn carousel ready)

**Design details:**
- Format: 1080 × 1350px (4:5 portrait, LinkedIn carousel standard)
- Color palette: Cream (#f9f5f0) background, Mint (#b0f6f0) accent pastel, Ink (#1a1a1e) text
- Typography: Display serif headlines, clean sans-serif body (Playfair Display + Inter intended direction)
- Illustrations: Warm educator figures, context-switching visual, workflow diagram, three value symbols
- Single pastel accent: Mint only (no color mixing)

**Slide structure:**
1. Hook: "You went into teaching to be with students..."
2. Frustration: "Here's what the evening actually looks like"
3. Root problem: "The tool slows you down instead of speeding you up"
4. Solution: "One place. One flow. One outcome."
5. Values: "Built for speed, privacy, and care" (three visual symbols)
6. Benefit: "Most of the time, the best tool is the one that gets out of your way."
7. CTA: "What parts of IEP writing take you the longest?" (community question, ends on educator)

**Files created:**
- `ieppal-brand/carousel/01-drafts/iep-writing-workflow-outline.md` — full slide outline, design decisions, brand alignment checklist

**Canva design links:**
- Edit: https://www.canva.com/d/VDnb0PAUdyg5WYe
- View: https://www.canva.com/d/58_at-Dw7eQfaVW
- PDF export: https://export-download.canva.com/TJ1Uo/DAHKxUTJ1Uo/-1/0-6776170065733501439.pdf

**Brand alignment checklist:**
- [x] Colors: cream + mint + ink (matches BRAND.md intended direction + tailwind.config.js current tokens)
- [x] Typography: display serif + clean sans-serif (Playfair Display + Inter intended)
- [x] Voice: warm, calm, competent — no hype words, names frustration before solution
- [x] Illustrations: warm, hand-drawn-feeling educator figures (rooting for the educator)
- [x] Structure: hook → problem → solution → values → benefit → community question
- [x] Ends on educator, not product pitch
- [x] IEP Pal not mentioned in carousel (brand stays in background)
- [x] One pastel accent only (mint, no mixing)
- [x] All copy matches approved post exactly

**Propagation check:**

| Changed file | Downstream files to update | Status |
|---|---|---|
| `carousel/01-drafts/iep-writing-workflow-outline.md` (new) | `STATUS.md` — carousel row | Update next session (mark as drafted) |
| | `SESSIONS.md` — open decisions | No change needed (LinkedIn content pipeline already noted) |

**Open decisions unchanged:**
- Brand palette: still in flux (but design is working well with intended direction)
- Slides skill: still on hold until palette locks
- LinkedIn pipeline: this carousel will become first real carousel test of the workflow

**STATUS.md updates needed (next time):**
- Carousel row: change from ❌ missing to 🟡 draft created
- Add note: "01-drafts/iep-writing-workflow/ — design ready, waiting for paired LinkedIn caption + community approval"

**Next session: carry forward:**
1. Draft paired LinkedIn post caption (use `ieppal-brand/voice/SKILL.md` + `references/founder-voice.md`)
2. Get community feedback on carousel + caption
3. Move to `02-final/iep-writing-workflow/` once approved
4. Publish to LinkedIn (carousel format + caption)
5. Document publishing workflow for future carousels

---

### 2026-05-26 — Carousel SKILL.md: CTA slide (slide 5) locked

**What happened:**
- Updated `ieppal-brand/carousel/SKILL.md` to lock and protect the CTA slide (slide 5 in the template)
- Added prominent markers across three sections: specs table, Step 3 review, and sanity checks
- Intention: slide 5 should NEVER be modified — it remains unchanged from template across all carousel projects
- Ensures brand consistency and messaging discipline across all LinkedIn carousel campaigns

**Files updated this session:**
- `ieppal-brand/carousel/SKILL.md` — three targeted edits:
  1. Specs table: changed "Last slide" row to clarify it is NOT the CTA; added bold "Slide 5 (LOCKED)" row with 🔒 marker
  2. Step 3 (Review and refine): added prominent warning before MCP instructions — do not edit slide 5
  3. Sanity checks: moved "Slide 5 is locked" to check #1 and renumbered remaining checks

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `carousel/SKILL.md` | Root `CLAUDE.md` — carousel row in token management | Already current (no change needed; points to correct file) |
| `carousel/SKILL.md` | `ieppal-brand/CLAUDE.md` — carousel entry | Already current |
| `carousel/SKILL.md` | `STATUS.md` — carousel row | Already current (no status change) |

**Open decisions updated:** none

**STATUS.md updated:** no — no skill status changed

**Next session: carry these forward:**
1. Test carousel generation with slide 5 locked — confirm workflow prevents accidental edits
2. Document actual Canva steps if manual protection needed (template duplication locks, restricted permissions, or naming convention)

---

### 2026-05-25 — Brand folder restructure: standard skill architecture applied

**What happened:**
- User restructured all five media workspaces in `ieppal-brand/` to follow the standard Claude skill folder structure per *The Complete Guide to Building Skills for Claude*
- Each folder (`writing/`, `linkedin posts/`, `carousel/`, `slides/`, `video/`) now has: `SKILL.md` + `01-drafts/` + `02-final/` + `references/` + `assets/` + `scripts/`
- `linkedin posts/SKILL.md` is the new entry point for that workspace; the old `linkedin.md` filename is superseded
- `video/SKILL.md` is the new top-level entry point for the video workspace (replaces the former `video/CLAUDE.md` reference, which did not exist in practice)
- All three CLAUDE.md files updated to reflect the new paths and architecture

**Files updated this session:**
- `ieppal-brand/CLAUDE.md` — complete rewrite: updated workspace table, token management table, added new "Skill folder architecture" section, updated folder structure diagram
- `ieppal-overview/CLAUDE.md` — three targeted edits: brand key files table, token management table, folder structure diagram
- `SESSIONS.md` — this file

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `ieppal-brand/CLAUDE.md` | Root `CLAUDE.md` — brand table, token management, folder structure | Updated (same session) |
| `ieppal-overview/CLAUDE.md` | No downstream dependents for these rows | N/A |
| Individual SKILL.md files (linkedin posts, video) | Still contain stale location headers (e.g. `linkedin posts/SKILL.md` header says `linkedin.md`; `video/SKILL.md` header says `video/remotion/SKILL.md`) | Flagged — update in next session when touching those files |
| `voice/SKILL.md` — references `video/CLAUDE.md` in its "When this file changes" footer | `video/CLAUDE.md` no longer exists; correct path is `video/SKILL.md` | Flagged — update in next session |

**Open decisions updated:** none

**STATUS.md updated:** no — no skill status changed this session (structure change only)

**Next session: carry these forward:**
1. ~~Fix stale location headers in `linkedin posts/SKILL.md`~~ ✅ Done (2026-05-25, session 2)
2. Fix `voice/SKILL.md` footer — update `video/CLAUDE.md` reference → `video/SKILL.md`
3. Write first long-form piece → `writing/02-final/` (references/ has 6 founder essays as source material)
4. Convert writing to LinkedIn — once a piece lands in `writing/02-final/`
5. Build carousel skill — test Canva MCP end-to-end
6. Build finance tools — burn rate + runway tracker first
7. Resolve brand palette
8. Create constitution.md

---

### 2026-05-26 — AI Doesn't Have To Be Scary (Terms) — final caption + revised carousel outline

**What happened:**
- Ansel provided the final LinkedIn caption for the AI Terms carousel post
- Key design decision confirmed: **caption = light teaser; carousel = content**. The caption does not list definitions — the carousel earns the swipe and carries all six term explanations.
- Updated `linkedin posts/01-drafts/ai-doesnt-have-to-be-scary-terms-carousel.md` with the final caption copy (new hook: "If you're tired of copying and pasting chats into an AI then start with the basics"; added token personal story; softer close vs. community question)
- Revised carousel outline from 5 slides → 9 slides: each of the 6 terms now gets its own dedicated slide (scannable, screenshot-worthy), plus hook, setup, and CTA slides
- Design principle documented in the carousel outline header and below for future reference

**Design principle (carousel + caption pairings):**
> Caption = teaser. It creates curiosity and names the frustration. The carousel does the talking — definitions, steps, or frameworks belong on slides, not in the caption. A caption that repeats the carousel content gives the reader no reason to swipe.

**Files updated this session:**
- `ieppal-brand/linkedin posts/01-drafts/ai-doesnt-have-to-be-scary-terms-carousel.md` — final caption copy; status updated to `final`
- `ieppal-brand/carousel/01-drafts/ai-doesnt-have-to-be-scary-terms/ai-doesnt-have-to-be-scary-terms-outline.md` — expanded from 5 → 9 slides; design principle note added to header

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| Carousel outline (slide count change) | `carousel/SKILL.md` — no change needed; 9 slides is within spec (8–12) | N/A |
| Caption file (status: final) | `ai-doesnt-have-to-be-scary-terms.md` (original text-heavy post) | Original draft preserved as reference; carousel caption is the active version for posting |

**Open decisions updated:** none

**STATUS.md updated:** no — carousel status remains 🟡 in-progress (text done, graphics still to add in Canva)

**Next session: carry these forward:**
1. Update Canva design (DAHKxG6-Tm0) to reflect 9-slide structure — each term on its own slide
2. Add graphics / illustrations to slides once Canva edits are done
3. Export carousel PDF and mark as 02-final once approved
4. Post carousel + caption to LinkedIn

---

### 2026-05-26 — Carousel folder structure standardized to 01-drafts / 02-final

**What happened:**
- Updated carousel folder structure to follow the standard skill architecture (consistent with writing, linkedin posts, slides, video)
- Changed from: `carousel/[topic-slug]/[topic-slug].pdf` (flat structure, one topic per folder)
- Changed to: `carousel/01-drafts/[topic-slug]/` for work-in-progress carousels and `carousel/02-final/[topic-slug]/` for approved/finalized carousels
- Updated carousel/SKILL.md Step 4 export path and Filename and folder convention section
- Updated ieppal-brand/CLAUDE.md folder structure diagram to show nested [topic-slug] folders with descriptions

**Files updated this session:**
- `ieppal-brand/carousel/SKILL.md` — updated Step 4 export path to `./01-drafts/[topic-slug]/[topic-slug].pdf`; rewrote "Filename and folder convention" section to show 01-drafts/ and 02-final/ structure
- `ieppal-brand/CLAUDE.md` — updated carousel folder structure lines 131-137 to show `01-drafts/[topic-slug]/` and `02-final/[topic-slug]/` with descriptions

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `carousel/SKILL.md` | Root `CLAUDE.md` — carousel line in token management | Already current (already shows 01-drafts/ + 02-final/) |
| `carousel/SKILL.md` | `carousel/SKILL.md` footer "When this file changes" section | Listed CLAUDE.md files (both updated) |
| `ieppal-brand/CLAUDE.md` | Root `CLAUDE.md` — folder structure carousel entry | Already current |

**Open decisions updated:** none

**STATUS.md updated:** no — no skill status changed (structure update only)

**Next session: carry these forward:**
1. Migrate existing `carousel/claude-skills-setup/` folder structure to new path: `carousel/01-drafts/claude-skills-setup/`
2. Continue with next carousel in the series
3. Build carousel skill end-to-end tests
4. Resolve brand palette
5. Create constitution.md

---

### 2026-05-26 — First carousel built: Claude Skills Setup (AI Doesn't Have To Be Scary #1)

**What happened:**
- Built first end-to-end carousel using the Canva MCP workflow from `carousel/SKILL.md`
- Source: `linkedin posts/02-final/claude-skills-setup.md` (5-step Claude Skills setup post)
- Used existing "Claude Design" Canva carousel (DAHIk9JbvMM) as visual template — copied it (new ID: DAHKvzTBI70), replaced all text across 6 slides
- Series: "AI Doesn't Have To Be Scary" — cover slide uses eyebrow series label + hook headline pattern
- Voice: Ansel's personal founder voice (not IEP Pal brand voice — this is general AI/productivity content)
- Drafted paired LinkedIn caption in `linkedin posts/01-drafts/claude-skills-setup-carousel.md`
- Slide outline saved to `carousel/claude-skills-setup/claude-skills-setup-outline.md`

**Carousel structure (6 slides):**
1. Cover — "Teach Claude once. Use it forever." / AI Doesn't Have To Be Scary — Claude Skills Setup
2. The Problem — re-explaining workflow every time / Skills fix this
3. Step 1 of 5 — Create the Folder (file tree)
4. Step 2 of 5 — Write the frontmatter (highest-leverage part)
5. Steps 3–4 of 5 — Write instructions + Install
6. Step 5 + Bonus — Test + skill-creator tip + series CTA

**Files created this session:**
- `ieppal-brand/carousel/claude-skills-setup/claude-skills-setup-outline.md` — NEW: slide outline + Canva link
- `ieppal-brand/linkedin posts/01-drafts/claude-skills-setup-carousel.md` — NEW: paired LinkedIn caption draft

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `carousel/claude-skills-setup/` (new folder) | `carousel/SKILL.md` — no change needed; new folder follows spec | N/A |
| LinkedIn caption draft | `linkedin posts/01-drafts/` — standard location | Created correctly |

**Open decisions updated:** LinkedIn content pipeline — carousel built, caption drafted (pending approval + posting)

**STATUS.md updated:** no — carousel skill status was already 🟡 building; first successful end-to-end run. Update to ✅ once exported and posted.

**Next session: carry these forward:**
1. Review + approve LinkedIn caption for claude-skills-setup-carousel
2. Post carousel to LinkedIn
3. Update `STATUS.md` carousel row → ✅ shipped once posted
4. Build second carousel in the "AI Doesn't Have To Be Scary" series

---

### 2026-05-26 — Venus terraforming newsletter saved + LinkedIn draft written

**What happened:**
- Final version of Venus terraforming newsletter received from Ansel and saved to `ieppal-brand/writing/02-final/`
- LinkedIn post draft written to accompany the newsletter and saved to `ieppal-brand/linkedin posts/01-drafts/`
- Post uses intellectual journey arc + unexplained contrast hook; no IEP Pal mention (personal/intellectual content)
- Newsletter link placeholder `[link]` left in the LinkedIn draft for Ansel to fill in once published

**Files created this session:**
- `ieppal-brand/writing/02-final/venus-terraforming.md` — NEW: final newsletter, formatted with section headers and full references
- `ieppal-brand/linkedin posts/01-drafts/venus-terraforming.md` — NEW: LinkedIn companion post draft (~250 words), status: draft

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `writing/02-final/venus-terraforming.md` | `linkedin posts/01-drafts/venus-terraforming.md` | Created simultaneously (same session) |

**Open decisions updated:** LinkedIn content pipeline — 1 new piece in `writing/02-final/`; 1 new LinkedIn draft in `01-drafts/`

**STATUS.md updated:** no — no skill status changed

---

### 2026-05-26 — Venus LinkedIn post promoted to 02-final

**What happened:**
- Ansel approved the final copy of the Venus LinkedIn post (Flight 12 version — tighter than draft, removed terraforming mechanics, kept generational bottleneck arc)
- Post saved to `ieppal-brand/linkedin posts/02-final/venus-terraforming.md`
- Draft in `01-drafts/` preserved as-is

**Files created this session:**
- `ieppal-brand/linkedin posts/02-final/venus-terraforming.md` — NEW: final approved version

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `linkedin posts/02-final/venus-terraforming.md` | `01-drafts/venus-terraforming.md` | Draft preserved; final is the active version |

**Open decisions updated:** LinkedIn content pipeline — 2 posts now in `02-final/` (ai-education-data-analytics, venus-terraforming)

**STATUS.md updated:** no — no skill status changed

**Next session: carry these forward:**
1. Run Playwright to save Venus post to LinkedIn as a draft (newsletter link still TBD — can post without it)
2. Add newsletter URL to Venus post once newsletter is published
3. Fix `voice/SKILL.md` footer — update `video/CLAUDE.md` reference → `video/SKILL.md`
4. Save `linkedin-draft.js` script to `ieppal-brand/linkedin posts/scripts/`
5. Build carousel skill — test Canva MCP end-to-end
6. Build finance tools — burn rate + runway tracker first
7. Resolve brand palette
8. Create constitution.md

---

### 2026-05-26 — LinkedIn post promoted to 02-final

**What happened:**
- Final draft of `ai-education-data-analytics.md` received from Ansel and saved to `ieppal-brand/linkedin posts/02-final/`
- Frontmatter preserved from `01-drafts/` version (sources, post-type, hook-type); status updated to `final`
- Post body updated to match Ansel's final copy: 50+ educators (was 400+), trimmed narrative, added "Don't believe us? Look at the video below." CTA, LinkedIn hashtag links

**Files updated this session:**
- `ieppal-brand/linkedin posts/02-final/ai-education-data-analytics.md` — NEW: final version saved here
- `ieppal-brand/linkedin posts/01-drafts/ai-education-data-analytics.md` — original draft preserved as-is

**Open decisions updated:** LinkedIn content pipeline — 1 post now in `02-final/`

---

### 2026-05-25 — LinkedIn skill: research-to-post pipeline + Playwright automation added

**What happened:**
- Added Path B to `linkedin posts/SKILL.md`: a full pipeline that researches a topic (web + Reddit), writes a post in Ansel's voice grounded in his personal story, and saves it as a LinkedIn draft via Playwright
- Created three new reference files in `linkedin posts/references/`
- Fixed stale location header in `linkedin posts/SKILL.md` (was pointing to `linkedin.md`; now correctly points to `SKILL.md`)
- Personal story and proof points synthesized from Google Drive (university essays) into a structured reference file

**Files created / updated this session:**
- `ieppal-brand/linkedin posts/SKILL.md` — v2: added Path B pipeline, fixed header, condensed Path A, added references section, added changelog
- `ieppal-brand/linkedin posts/references/personal-story.md` — NEW: Ansel's personal story, proof points table, five narrative threads, voice guardrails. Source: Google Drive (university personal statement essays)
- `ieppal-brand/linkedin posts/references/research-to-post.md` — NEW: detailed 6-step workflow (topic intake → web/Reddit research → post generation → self-review → draft file → Playwright)
- `ieppal-brand/linkedin posts/references/playwright-linkedin.md` — NEW: full Playwright script for saving LinkedIn drafts, setup, usage, troubleshooting
- (Script to be saved at) `ieppal-brand/linkedin posts/scripts/linkedin-draft.js` — Playwright automation script (code in playwright-linkedin.md)

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `linkedin posts/SKILL.md` | Root `CLAUDE.md` — "Write a LinkedIn post" token management row | Row already correct (points to `SKILL.md`) |
| `linkedin posts/SKILL.md` | `ieppal-brand/CLAUDE.md` — LinkedIn rows | Row already correct |
| `linkedin posts/SKILL.md` | `carousel/SKILL.md` — paired LinkedIn caption step | Not changed; still valid |
| `linkedin posts/SKILL.md` | `writing/SKILL.md` — handoff table mention | Not changed; still valid |
| `personal-story.md` | Source: Google Drive essays (viewed 2026-05-15). Refresh if Ansel's story evolves materially. | Flagged for future refresh |

**Open decisions updated:** none

**STATUS.md updated:** no — skill now functional (Path B is new capability, not a status change on an existing skill)

**Next session: carry these forward:**
1. Save `linkedin-draft.js` script to `ieppal-brand/linkedin posts/scripts/` (code is in `references/playwright-linkedin.md` — just needs to be written to the scripts/ file)
2. Test Playwright flow end-to-end with a real post
3. Fix `voice/SKILL.md` footer — update `video/CLAUDE.md` reference → `video/SKILL.md`
4. Write first long-form piece → `writing/02-final/`
5. Build carousel skill — test Canva MCP end-to-end
6. Build finance tools — burn rate + runway tracker first
7. Resolve brand palette
8. Create constitution.md

---

### 2026-05-22 — Writing references folder documented

**What happened:**
- Discovered that `writing/references/` exists with 6 founder-authored essays but was not documented anywhere
- Also found that STATUS.md incorrectly recorded "6 finals in `02-final/`" — `02-final/` is empty; the 6 files are in `references/` (different purpose)
- Updated all affected docs to reflect the actual folder state

**Files updated this session:**
- `ieppal-brand/writing/SKILL.md` — added `references/` to folder map; added References section with file inventory and usage rules
- `ieppal-brand/CLAUDE.md` — added `references/` to Folder Structure under `writing/`
- `STATUS.md` — corrected `writing/` row (02-final is empty, not 6 finals); added `writing/references/` row; corrected `linkedin posts/` conversion backlog note
- `SESSIONS.md` — this file; corrected next-session priorities (removed false "6 pieces in 02-final" claim)

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `writing/SKILL.md` | `ieppal-brand/CLAUDE.md` (token management — writing rows) | Updated (same session) |
| `ieppal-brand/CLAUDE.md` | Root `CLAUDE.md` (writing entry still points to `writing/SKILL.md` — correct) | Already current |
| `STATUS.md` | No downstream dependents for corrected rows | Already current |

**Open decisions updated:** none

**STATUS.md updated:** yes — `writing/` row corrected; `writing/references/` row added; `linkedin posts/` note corrected.

**Next session: carry these forward:**
1. Write first long-form piece → `writing/02-final/` (references/ now available as source material)
2. Convert to LinkedIn once a piece is in 02-final/
3. Build carousel skill — test Canva MCP end-to-end
4. Build finance tools — burn rate + runway tracker first
5. Resolve brand palette
6. Create constitution.md

---

### 2026-05-21 — Finance model corrections + SESSIONS.md auto-update fix

**What happened:**
- Reviewed Excel financial model (`IEPPAL_Financial_Forecast_Updated.xlsx`) and Google Drive business plan (`IEPPAL - Business Plan Overview`, `IEPPAL_Pitch_Deck`)
- Found and removed hallucinated "Individual educator subscriptions (B2C)" revenue stream — model is purely B2B
- Updated Finance quick-reference across root and sub-repo to reflect actual investor-facing metrics
- Diagnosed and fixed root cause of SESSIONS.md not being auto-updated (instruction was end-of-session, not event-driven)

**Files updated this session:**
- `CLAUDE.md` (root) — Finance quick-reference rewritten with correct B2B tiers, investor metrics (ARR/MRR, unit economics, burn); session update instruction changed from end-of-session to event-driven
- `ieppal-finances/CLAUDE.md` — Revenue section rewritten (B2C row removed, three correct tiers added with per-student fees); CAC section updated to track by tier; output template updated to use ARR/tier breakdown
- `STATUS.md` — Finance tool roadmap item corrected to remove "educator subscriptions" reference
- `SESSIONS.md` — this file; decisions added

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `CLAUDE.md` (root) — Finance section | `ieppal-finances/CLAUDE.md` | Updated (same session) |
| `ieppal-finances/CLAUDE.md` | `CLAUDE.md` root Finance quick-reference | Updated (same session) |
| `STATUS.md` | No downstream dependents for the corrected row | Already current |

**Open decisions updated:**
- No status changes to existing open decisions; two new decisions added to Decisions Made table

**STATUS.md updated:** no — no skill status changed this session

**Next session: carry these forward:**
1. Convert writing to LinkedIn — 6 pieces in `writing/02-final/` ready
2. Build carousel skill — Canva MCP approach decided
3. Build finance tools — burn rate + runway tracker first
4. Resolve brand palette — blocks slides and new media templates
5. Create constitution.md — SDD spec text already in `ieppal-software/CLAUDE.md`

---

### 2026-05-21 — Workspace audit + architecture overhaul

**What happened:**
- Full workspace audit across all three repos (brand, software, finances)
- Key findings:
  - `ieppal-finances/` folder is nearly empty — all described scripts and subfolders are missing
  - `carousel/SKILL.md` and `slides/SKILL.md` had broken Windows paths that would never resolve on Mac
  - `tailwind.config.js` uses completely different color tokens than `BRAND.md`
  - `IEPPAL-RASA-FE/.specify/memory/constitution.md` doesn't exist despite being the mandatory SDD first-read
  - `specs/` folder doesn't exist — SDD hasn't been formally used yet
  - 6 long-form finals in `writing/02-final/` with 0 LinkedIn post conversions done
  - Token management was duplicated and inconsistent across root and brand CLAUDE.md files

**Files created this session:**
- `SESSIONS.md` — this file
- `STATUS.md` — workspace status tracker
- `ieppal-brand/brand/logos/README.md` — logo reference and status

**Files updated this session:**
- `CLAUDE.md` (root) — major overhaul: consolidated token management, added session memory + status pointers, updated brand-sync / carousel / finance sections, fixed all stale references
- `ieppal-brand/BRAND.md` — added in-flux status block at top, added Frontend Sync section
- `ieppal-brand/media/carousel/SKILL.md` — complete rewrite for Canva MCP
- `ieppal-finances/CLAUDE.md` — updated for cost/revenue/CAC focus, marked missing folders accurately

---

### 2026-05-27 — Investor model gap analysis

**What happened:**
- Examined all 8 sheets of `IEPPAL_Financial_Forecast_Updated.xlsx` in full
- Researched angel investor financial model requirements for B2B EdTech SaaS at pre-seed
- Produced a full gap analysis: what models exist, what's missing, what data is needed, and recommended skill build order
- Key finding: the model's mechanics (unit economics, ARR waterfall, account waterfall) are investor-grade and above average for pre-seed. The main gaps are investor-narrative layers — scenario analysis, TAM/SAM/SOM, use of funds, and cap table.

**Files created this session:**
- `ieppal-finances/INVESTOR_MODEL_GAP_ANALYSIS.md` — NEW: full gap analysis document

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `ieppal-finances/INVESTOR_MODEL_GAP_ANALYSIS.md` (new) | `STATUS.md` — Finance rows | Flagged: add a row for the gap analysis document next time STATUS.md is updated |
| | `ieppal-finances/CLAUDE.md` — Finance tool build roadmap | Flagged: update roadmap order to match new skill priority sequence |

**Open decisions updated:**
- Finance tools: priority order is now clearly defined — scenario-analyzer → use-of-funds → tam-sizing → cap-table-model → burn-multiple → cac-channel-tracker → cohort-analyzer

**STATUS.md updated:** no — adding a status row for a research doc is low value; will update when first finance skill is built

**Next session: carry these forward:**
1. Fix the Y3Q4 deferred revenue formula bug in `IEPPAL_Financial_Forecast_Updated.xlsx` (balance check shows -S$1,731 discrepancy)
2. Build `scenario-analyzer` skill — first investor meeting blocker
3. Get founder input on: (a) cap table and round terms, (b) fundraising milestone definition (what ARR/accounts unlocks Series A), (c) primary market decision: Singapore-first or Australia-first
4. Replace the ethics section in the business plan — contains dating app template copy-paste
5. Reconcile pitch deck revenue figures with Excel model (deck shows 27-47% higher Y2/Y3 revenue)

---

### 2026-05-27 — Google Drive review: updated investor model gap analysis

**What happened:**
- Connected Google Drive MCP and searched the IEPPAL folder
- Read full content of: `IEPPAL_Pitch_Deck` (12 slides), `IEPPAL - Business Plan Overview` (full BMC + financials + term sheet), `IEPPAL Competitor Analysis Master Doc`
- Found 5 critical issues requiring immediate fix before any investor meeting (see gap analysis)
- Updated `INVESTOR_MODEL_GAP_ANALYSIS.md` with all findings

**Key new findings from Drive:**
1. Revenue mismatch: pitch deck Y2/Y3 is 27-47% higher than Excel model (references "Mita Overview 2 base case")
2. Geographic inconsistency: pitch deck is Singapore-first; business plan GTM and SOM is Australia-first
3. Pricing inconsistency: business plan shows S$10/student IEP fee vs. S$12 in Excel
4. Ethics section in business plan contains copy-pasted dating app template text
5. Pre-money valuation and raise amount are blank in all three documents
6. **Good news:** TAM/SAM/SOM numbers exist in pitch deck; sourced market data exists in business plan; competitive analysis is thorough (7 competitors); term sheet governance framework exists

**Files updated this session:**
- `ieppal-finances/INVESTOR_MODEL_GAP_ANALYSIS.md` — major update: new critical findings section, Drive document inventories, 6 new gaps added, action sequence revised

**Propagation check:**

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| `INVESTOR_MODEL_GAP_ANALYSIS.md` | `STATUS.md` — Finance rows | Flagged for next update |
| | `ieppal-finances/CLAUDE.md` — Finance tool build roadmap | Flagged: roadmap should note critical fixes before skill building |

**Open decisions updated:**
- Finance tools: immediate fix priority added — revenue reconciliation, ethics section replacement, and geographic market decision before any skill building
- Geography: Singapore-first vs. Australia-first is now an open decision; was not previously tracked

**STATUS.md updated:** no

**Next session: carry these forward (updated):**
1. Fix Y3Q4 deferred revenue formula in Excel
2. Decide SG-first vs. AUS-first — align all three documents
3. Reconcile pitch deck revenue with Excel base case
4. Replace business plan ethics section
5. Set pre-money valuation and raise amount (unlocks cap table + use of funds)
6. Build `scenario-analyzer` skill

---

*Template for future sessions — copy and fill in:*

```
### YYYY-MM-DD — [Session title]

**What happened:**
- 

**Files created this session:**
- 

**Files updated this session:**
- 

**Propagation check:** ← Run this for every file changed above
For each updated file, read its "↓ When this file changes" section and verify downstream files.
If downstream files were also updated, list them here. If they were checked and found current, note that too.

| Changed file | Downstream files checked | Action taken |
|---|---|---|
| [file] | [list] | Updated / Already current / Flagged for next session |

Reference: `DEPENDENCIES.md` has the full graph if the inline footer isn't enough.

**Open decisions updated:**
- 

**STATUS.md updated:** yes / no — if any skill status changed (stub → building → shipped), update STATUS.md.

**Next session: carry these forward:**
1. 
```
