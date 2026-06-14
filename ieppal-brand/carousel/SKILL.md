---
name: ieppal-carousel
description: Generate on-brand IEP Pal LinkedIn carousels using the Canva MCP. Use this skill when the user asks to create a carousel, turn a post or article into a carousel, or build a LinkedIn visual. Always pairs with a LinkedIn caption draft on completion.
---

# IEP Pal LinkedIn Carousel — Canva MCP Workflow

> **Location:** `ieppal-brand/carousel/SKILL.md`
> **Status:** Building — Canva MCP approach. Test end-to-end before marking shipped.

---

## Context to load

**Always:**
- `../voice/SKILL.md` — voice & tone for all slide copy
- `../BRAND.md` — design intent (colors, typography, illustration)
- `../../ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` — active tokens for color accuracy

**When adapting from existing content (load only the source):**
- `../writing/02-final/[filename]` — long-form piece to compress into carousel
- `../linkedin posts/02-final/[filename]` — if expanding a post into slides

**After carousel is generated:**
- `../linkedin posts/linkedin.md` — to draft the paired LinkedIn caption

**Do not load:**
- `../slides/SKILL.md`, `../video/`, `../writing/01-drafts/`, `../linkedin posts/01-drafts/`

---

## Carousel specs

| Property | Value |
|---|---|
| Format | Canva design, exported as PDF (LinkedIn renders as swipeable carousel) |
| Slide count | 8–12 slides |
| Aspect ratio | 4:5 (1080 × 1350px) — LinkedIn crops best to this |
| First slide | Hook + problem statement. Must stop the scroll. |
| **Slide 5 (LOCKED)** | **🔒 CTA slide — NEVER modify. Always kept as-is from template.** Soft CTA: follow, share, or book demo. Never a hard sell. |
| Last slide | Final thought or closing. Complements CTA but does not repeat it. |
| Middle slides | One idea per slide. Big headline + short body (≤ 25 words). |
| Pastel accent | One per carousel: sunshine (encouragement), mint (privacy/calm), sprout (progress/growth) |

---

## Canva MCP workflow

### Step 0 — Ask about formatting preferences (required, before any outline work)

Before planning any slide structure, ask Ansel how he wants the content laid out. Do not proceed to Step 1 until you have his answers. Use the `AskUserQuestion` tool to present the choices.

**Always ask:**

1. **Slide density** — for content that has multiple items (terms, steps, tips, principles): should each item get its own slide, or should items be grouped (e.g. two slides with three items each, or three items per slide as a bullet list)?
2. **Body format per slide** — for each content slide, should the body be:
   - A bullet list (scannable, parallel)
   - A two-sentence prose summary (more narrative, warmer)
   - A single punchy sentence (high-contrast, minimal)
   - Something else for this specific carousel

**Tailor the questions to the content at hand.** If the source has six key terms, ask: "Each term on its own slide (six slides), or grouped — e.g. two slides of three terms?" If it's a how-to piece with eight steps, ask: "One step per slide, or do any steps naturally pair?" If it's a data/insight piece, ask about data vs. narrative balance.

**Example AskUserQuestion framing:**
- "This post references six key terms. How would you like to spread them across slides?" with options like: each term its own slide / two slides with three terms each / three slides with two terms each
- "For the body copy on each slide, do you prefer a bullet list, a two-sentence summary, or a single punchy line?"

Record Ansel's answers before proceeding. These decisions shape the entire outline in Step 1.

---

### Step 1 — Plan the carousel structure

Before touching Canva, draft the carousel outline:

1. **Hook slide** — the single most surprising or specific claim from the content
2. **Problem slide** — the frustration the educator already feels
3. **Content slides (5–8)** — one idea each, in logical sequence
4. **CTA slide** — follow, share, or a soft product mention

Apply voice rules from `../voice/SKILL.md`:
- Hook types: credibility, proof, fear, emotional agreement, value promise, contrast
- Headlines: ≤ 8 words (display-level)
- Body: 1–2 sentences, Inter weight
- End on the reader, not the product

### Step 2 — Find or create the Canva design

**Option A — Use an existing brand template (preferred once templates exist):**
```
mcp: search-brand-templates → filter for IEP Pal carousel templates
mcp: create-design-from-brand-template → templateId, populate with outline content
```
> **If this step fails:** Check that Canva is connected in Settings → Extensions. If you see an auth error or "unauthorized," ask the user to reauthenticate: "Your Canva connection needs to be refreshed. Go to Settings → Extensions → Canva and reconnect." Then retry. If the error is "template not found," fall through to Option B.

**Option B — Generate from prompt (use until templates exist):**
```
mcp: generate-design-structured → pass slide-by-slide content as structured input
```
> **If this step fails:** If Canva returns an auth error, ask the user to reauthenticate (see Option A note above). If the error is a generation failure or timeout, retry once with a simpler prompt. If it fails again, fall through to Option C and note that structured generation is unavailable.

Prompt structure for `generate-design-structured`:
- Style: clean, warm, minimal — cream/sand backgrounds, ink text, one pastel accent
- Typography: serif display headline (Playfair Display if available, or similar), sans body
- Layout: large headline top, short body below, generous whitespace
- Illustrations: use Smile, Pat On Back, or Loading Icon on appropriate slides (celebratory, encouraging, waiting)

**Option C — Generate from natural language:**
```
mcp: generate-design → describe the carousel topic, tone, and brand direction
```
> **If this step fails:** If Canva returns an auth error, ask the user to reauthenticate: "Your Canva connection needs to be refreshed. Go to Settings → Extensions → Canva and reconnect, then we can continue." If generation fails after one retry, stop and let the user know — do not attempt to create the design through another tool.

### Step 3 — Review and refine

**🔒 Important: Do NOT edit or modify Slide 5 (the CTA slide). This slide is locked and must remain unchanged from the template.**

```
mcp: get-design-content → inspect slide text and layout (review only; do not edit slide 5)
mcp: perform-editing-operations → adjust copy, swap colors, fix layout issues (all slides EXCEPT 5)
```
> **If `get-design-content` fails:** The design may not have saved yet — wait a few seconds and retry once. If it still fails, ask the user to check that Canva is still connected (Settings → Extensions → Canva) and reauthenticate if prompted.

> **If `perform-editing-operations` fails:** Note the specific operation that failed and skip it rather than retrying in a loop. Tell the user what couldn't be changed automatically and what they can adjust manually in Canva directly.

Check against brand spec before exporting:
- [ ] One pastel accent color only (no mixing sunshine + mint on same carousel)
- [ ] Ink (`#1a1a1e` or closest equivalent) for body text — never white text on pastels
- [ ] Hook slide would stop the scroll at 3:47pm on a Wednesday
- [ ] Last slide ends on the reader, not a product pitch
- [ ] IEP Pal mentioned at most once (last slide or middle CTA, not first slide)

### Step 4 — Export

```
mcp: export-design → format: pdf (for LinkedIn carousel) or png (for individual slides)
```
> **If export fails:** Retry once. If it fails again, share the Canva design link with the user so they can export manually: "I wasn't able to export automatically — here's your design link so you can download it directly from Canva." Do not proceed to Step 5 without the exported file or a confirmed manual download.

Save exported file to: `./01-drafts/[topic-slug]/[topic-slug].pdf`

### Step 5 — Draft the paired LinkedIn caption

Every carousel is paired with a LinkedIn caption. Do not consider the carousel complete without it.

1. Draft the caption in `../linkedin posts/01-drafts/[topic-slug].md`
2. Hook from the first slide — paraphrase, don't repeat verbatim
3. Caption must make sense without opening the carousel (skimmable standalone)
4. Tease the framework without listing every slide
5. Close with a community question (opinion carousels) or practical CTA (how-to carousels)
6. Include hashtags per voice guide Section 8 rules
7. Add a note in the draft header linking to the carousel file

---

## Filename and folder convention

```
carousel/
├── 01-drafts/
│   └── [topic-slug]/
│       ├── [topic-slug].pdf          ← exported carousel (work in progress)
│       ├── [topic-slug]-outline.md   ← the slide outline (Step 1 output)
│       └── notes.md                  ← decisions, what worked, what to change next time
└── 02-final/
    └── [topic-slug]/
        ├── [topic-slug].pdf          ← finalized carousel (approved, ready to share)
        ├── [topic-slug]-outline.md   ← final slide outline
        └── notes.md                  ← learnings from this carousel
```

Linked LinkedIn draft goes in: `linkedin posts/01-drafts/[topic-slug].md` (paired with 01-drafts carousel)

---

## Sanity checks before exporting

1. **🔒 Slide 5 (CTA) is LOCKED and unchanged from the template** — verify you have NOT modified this slide
2. Does the hook slide stop the scroll? (Test: would you swipe on this at 3:47pm on a Wednesday?)
3. Is there one — and only one — pastel accent color in the whole carousel?
4. Does each middle slide contain exactly one idea?
5. Does the last slide end on the educator or the student, not on IEP Pal?
6. Is the LinkedIn caption drafted and linked?

---

## Open questions (resolve before marking skill shipped)

- Once brand palette is locked, create Canva brand kit with official tokens
- Build 3 reusable Canva brand templates (founder story / educator tip / data insight) — then switch to Option A as default
- Confirm: founder voice (Ansel first-person) vs. IEP Pal brand voice — both allowed, selectable by post type

---

## ↓ When this file changes

Check and update the following files for stale content. Full details in `../../../../DEPENDENCIES.md`.

| File | What to check |
|---|---|
| `CLAUDE.md` (root) | Token management → "Build a carousel" row (loading instructions); sub-repo table → carousel entry |
| `ieppal-brand/CLAUDE.md` | Token management table — carousel rows |
| `writing/SKILL.md` | Handoff table → "→ Carousel" row |
| `linkedin posts/linkedin.md` | "Carousel → LinkedIn post" workflow section |
| `STATUS.md` | Carousel row status |
| `SESSIONS.md` | Open decisions / decisions-made if a workflow choice changed |

---

## Related files

- `../voice/SKILL.md` — voice rules (load first)
- `../BRAND.md` — visual identity (load for color + type decisions)
- `../linkedin posts/linkedin.md` — LinkedIn caption pairing workflow
- `../writing/SKILL.md` — source material for carousel conversion
