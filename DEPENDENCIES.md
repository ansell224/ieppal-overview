# IEP Pal — Dependency Graph

When any file in this workspace changes, read its entry here to know exactly what else needs checking or updating. This is the propagation reference — Claude reads it after making any change to a workflow, skill, or configuration file.

**How to use:**
1. Change a file.
2. Find that file in the graph below.
3. Read its **Downstream dependents** — every file listed there may have stale content.
4. Open each downstream file and verify or update the specific things listed under **What breaks**.
5. Log the change and propagation results in `SESSIONS.md`.

---

## Graph conventions

```
→   this file reads / loads
←   this file is read by / referenced by
```

Each entry has:
- **Reads (upstream):** what this file loads or summarizes
- **Read by (downstream):** what files reference or summarize this file
- **What breaks:** the specific content that goes stale in each downstream file

---

## Brand files

---

### `ieppal-brand/brand/voice/SKILL.md`

**Reads (upstream):** nothing — this is a leaf node (source of truth, no dependencies)

**Read by (downstream):**

| File | What breaks when voice/SKILL.md changes |
|---|---|
| `ieppal-brand/media/writing/SKILL.md` | "Voice rules" summary section — 5 bullet reminders pulled from voice guide |
| `ieppal-brand/media/carousel/SKILL.md` | Voice application notes in Step 1 (hook types, headline limits, community question close) |
| `ieppal-brand/media/linkedin posts/linkedin.md` | Sanity checks section (adapted from voice guide Section 9); post type table |
| `ieppal-brand/media/slides/SKILL.md` | (On hold — check when unblocked) |
| `ieppal-brand/media/video/CLAUDE.md` | "Add for brand/copy alignment" context load instruction |
| `ieppal-brand/CLAUDE.md` | Token management table — "Write any IEP Pal copy" row |
| `CLAUDE.md` (root) | Token management table — "Write any IEP Pal copy" row; Brand quick-reference voice paragraph |

**Change triggers:** Section added, hook type added/removed, voice rule changed, channel table updated, sanity check list changed, vocabulary list updated (prefer/avoid words)

---

### `ieppal-brand/BRAND.md`

**Reads (upstream):**
- `ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` → Frontend Sync table (summarizes active tokens)

**Read by (downstream):**

| File | What breaks when BRAND.md changes |
|---|---|
| `CLAUDE.md` (root) | Brand quick-reference section: "Colors (intended direction)" and "Typography (intended)" blocks |
| `ieppal-brand/CLAUDE.md` | Token management table — "Write with visual brand alignment" and "Build a carousel" rows |
| `ieppal-brand/media/carousel/SKILL.md` | Pastel accent guidance (which pastels mean what); color accuracy notes in Step 3 |
| `ieppal-brand/media/writing/SKILL.md` | "Load only when visual brand alignment is needed" context note |
| `ieppal-brand/media/slides/SKILL.md` | (On hold — check when unblocked) |
| `ieppal-brand/media/video/CLAUDE.md` | "Add for brand/copy alignment" context load instruction |
| `STATUS.md` | Brand row — palette/typography in-flux status |

**Change triggers:** Palette token added/changed/renamed; typography decision made; gradient updated; semantic role changed; accessibility guidance updated; Frontend Sync table updated

---

### `ieppal-software/IEPPAL-RASA-FE/tailwind.config.js`

**Reads (upstream):** nothing — source of truth for deployed tokens

**Read by (downstream):**

| File | What breaks when tailwind.config.js changes |
|---|---|
| `ieppal-brand/BRAND.md` | Frontend Sync → "Current implementation" table (token names, hex values, BRAND.md mapping column) |
| `CLAUDE.md` (root) | Brand quick-reference → "Colors (currently in code)" line; "Typography (currently in code)" line |
| `STATUS.md` | Brand row — "verify vs tailwind.config.js" note may need updating |

**Change triggers:** Any color added, removed, or renamed; font family changed; new plugin added

**Propagation rule:** When tailwind.config.js changes, always update BRAND.md's Frontend Sync table first, then update root CLAUDE.md's "currently in code" quick-reference line to match.

---

### `ieppal-brand/media/carousel/SKILL.md`

**Reads (upstream):**
- `ieppal-brand/brand/voice/SKILL.md`
- `ieppal-brand/BRAND.md`
- `ieppal-software/IEPPAL-RASA-FE/tailwind.config.js`
- `ieppal-brand/media/linkedin posts/linkedin.md` (for Step 5 pairing)
- Source content from `media/writing/02-final/[file]` or `media/linkedin posts/02-final/[file]`

**Read by (downstream):**

| File | What breaks when carousel/SKILL.md changes |
|---|---|
| `CLAUDE.md` (root) | Token management table — "Build a carousel" row (loading instructions); sub-repo table — carousel entry description |
| `ieppal-brand/CLAUDE.md` | Token management table — carousel rows |
| `ieppal-brand/media/writing/SKILL.md` | Handoff table — "→ Carousel" row (loading instructions) |
| `ieppal-brand/media/linkedin posts/linkedin.md` | "Carousel → LinkedIn post" workflow section (step references) |
| `STATUS.md` | Brand row — carousel status |
| `SESSIONS.md` | Open decisions / decisions-made (if workflow decision changed) |

**Change triggers:** Loading instructions change; Canva MCP steps change; slide specs change (count, format, dimensions); LinkedIn pairing step changes; new Canva template added

---

### `ieppal-brand/media/linkedin posts/linkedin.md`

**Reads (upstream):**
- `ieppal-brand/brand/voice/SKILL.md` (always)
- `ieppal-brand/BRAND.md` (when pairing with visuals)

**Read by (downstream):**

| File | What breaks when linkedin.md changes |
|---|---|
| `CLAUDE.md` (root) | Token management table — "Write a LinkedIn post" row |
| `ieppal-brand/CLAUDE.md` | Token management table — LinkedIn rows |
| `ieppal-brand/media/carousel/SKILL.md` | Step 5 (draft paired LinkedIn caption) — references linkedin.md workflow |
| `ieppal-brand/media/video/CLAUDE.md` | "Pairing with a LinkedIn post" section |
| `ieppal-brand/media/writing/SKILL.md` | Handoff table mentions linkedin posts pipeline |

**Change triggers:** Post types added/removed; pipeline steps changed; pairing rules changed (Carousel → LinkedIn, Video → LinkedIn, Writing → LinkedIn); sanity checks updated; filename convention changed

---

### `ieppal-brand/media/writing/SKILL.md`

**Reads (upstream):**
- `ieppal-brand/brand/voice/SKILL.md` (always)
- `ieppal-brand/BRAND.md` (when visual alignment needed)

**Read by (downstream):**

| File | What breaks when writing/SKILL.md changes |
|---|---|
| `ieppal-brand/CLAUDE.md` | Token management table — writing rows |
| `CLAUDE.md` (root) | Token management table (writing is implicit — part of voice tasks) |

**Change triggers:** Writing types table changed; handoff instructions changed; pipeline stages changed

---

### `ieppal-brand/media/video/CLAUDE.md`

**Reads (upstream):**
- `.agents/skills/remotion-best-practices/SKILL.md`
- `.agents/skills/hyperframes/SKILL.md`
- `.agents/skills/hyperframes-cli/SKILL.md`
- `ieppal-brand/BRAND.md` (for visual alignment)
- `ieppal-brand/brand/voice/SKILL.md` (for new voiceover)
- `ieppal-brand/media/linkedin posts/linkedin.md` (for LinkedIn pairing)

**Read by (downstream):**

| File | What breaks when video/CLAUDE.md changes |
|---|---|
| `CLAUDE.md` (root) | Token management table — "Generate a video" row; sub-repo table — video entry |
| `ieppal-brand/CLAUDE.md` | Token management table — video rows |
| `STATUS.md` | Brand row — video status |

**Change triggers:** Tool-chooser table updated; new tool added; LinkedIn pairing workflow changed; production pipeline stages changed

---

## Software files

---

### `ieppal-software/CLAUDE.md`

**Reads (upstream):**
- `ieppal-brand/BRAND.md` (for design reference)
- `ieppal-brand/brand/voice/SKILL.md` (for in-app copy)
- `ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` (for active tokens)

**Read by (downstream):**

| File | What breaks when ieppal-software/CLAUDE.md changes |
|---|---|
| `CLAUDE.md` (root) | Software sub-repo entry; SDD startup routine; token management SDD rows |

**Change triggers:** SDD workflow steps changed; dev script changed; folder structure changed; constitution location changed

---

### `ieppal-software/IEPPAL-RASA-FE/.specify/memory/constitution.md`

> Status: **MISSING** — file does not yet exist.

**Will be read by (downstream):**

| File | What breaks when constitution.md changes |
|---|---|
| `ieppal-software/CLAUDE.md` | SDD workflow step 1 reference |
| `CLAUDE.md` (root) | Token management — "SDD — spec a new feature" row |

---

## Finance files

---

### `ieppal-finances/CLAUDE.md`

**Reads (upstream):**
- `ieppal-finances/Forecasts/IEPPAL_Financial_Forecast_Updated.xlsx` (primary data source)

**Read by (downstream):**

| File | What breaks when finance/CLAUDE.md changes |
|---|---|
| `CLAUDE.md` (root) | Finance quick-reference section (metric definitions, 3-metric list); Finance sub-repo entry |

**Change triggers:** Metric definitions changed; build roadmap updated; output format changed; primary data source changed

---

## Root / meta files

---

### `CLAUDE.md` (root)

**Reads (upstream):** Summarizes all sub-repo CLAUDE.mds, BRAND.md, tailwind.config.js, voice/SKILL.md

**Read by (downstream):** Everything — this is the session entry point. It is read first; downstream files are opened from here.

**What breaks when CLAUDE.md changes:** Nothing automatically — but SESSIONS.md should log the change, and sub-repo CLAUDE.md files should be checked if the token management table or sub-repo entries changed.

---

### `SESSIONS.md`

**Reads (upstream):** nothing — it is written to, not read from (except at session start)

**Read by (downstream):** Read at every session start. Its open decisions and next-session priorities inform which files get touched.

**What breaks when SESSIONS.md changes:** Nothing downstream — but stale open decisions can cause Claude to re-do resolved work. Keep it current.

---

### `STATUS.md`

**Reads (upstream):** Summarizes the status of every skill/asset across all repos.

**Read by (downstream):**

| File | What breaks when STATUS.md changes |
|---|---|
| `SESSIONS.md` | Open decisions may be resolved; next-session priorities may shift |
| `CLAUDE.md` (root) | "Note:" callouts for missing files (constitution, specs) |

---

## Propagation rules (quick reference)

These are the most common change → propagation chains. When in doubt, run the full check using the tables above.

| Change made | Files to check and update |
|---|---|
| `tailwind.config.js` token added/changed | BRAND.md → Frontend Sync table; CLAUDE.md → "Colors currently in code" |
| BRAND.md palette decision finalized | tailwind.config.js (implement it); CLAUDE.md → "Colors intended" quick-ref; carousel/SKILL.md pastel guidance |
| `voice/SKILL.md` rule updated | writing/SKILL.md voice summary; carousel/SKILL.md voice notes; linkedin.md sanity checks |
| `carousel/SKILL.md` workflow changed | CLAUDE.md token table; ieppal-brand/CLAUDE.md token table; writing/SKILL.md handoff table; linkedin.md carousel pairing section; STATUS.md carousel row |
| `linkedin.md` workflow changed | carousel/SKILL.md Step 5; video/CLAUDE.md pairing section; CLAUDE.md token table |
| `video/CLAUDE.md` tool or workflow changed | CLAUDE.md token table; ieppal-brand/CLAUDE.md token table; STATUS.md video row |
| Finance metric definition changed | CLAUDE.md finance quick-reference |
| Any skill status changes (stub → shipped) | STATUS.md; SESSIONS.md (close the open decision) |
| Any file path or folder renamed | CLAUDE.md folder structure map; ieppal-brand/CLAUDE.md folder structure; every SKILL.md that references the path |
