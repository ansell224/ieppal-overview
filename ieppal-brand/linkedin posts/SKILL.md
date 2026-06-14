# IEP Pal LinkedIn Posts — Skill

> **Location:** `ieppal-brand/linkedin posts/SKILL.md`
> ```
> ieppal-brand/
> └── linkedin posts/
>     ├── SKILL.md         ← you are here
>     ├── 01-drafts/
>     ├── 02-final/
>     ├── references/
>     │   ├── personal-story.md       ← Ansel's story & proof points
>     │   ├── research-to-post.md     ← full research + post generation workflow
>     │   └── playwright-linkedin.md  ← Playwright script to save LinkedIn drafts
>     ├── assets/
>     └── scripts/
>         └── linkedin-draft.js       ← Playwright automation script
> ```
> For the full workspace structure see `../../CLAUDE.md`. Voice rules live in `../voice/SKILL.md` — always load that first.

---

## Two paths

**Path A — Writing from existing content** (carousel, video, long-form piece)
Post is a caption layer for something already built. Start at [Path A](#path-a--writing-from-existing-content).

**Path B — Research → Write → LinkedIn draft** (the full pipeline)
No existing content. Claude researches the topic, writes the post in Ansel's voice using his personal story, and saves it as a LinkedIn draft via Playwright. Start at [Path B](#path-b--research--write--linkedin-draft).

Both paths use the same post types, voice rules, and sanity checks. They diverge only in how the raw material arrives.

---

## Revision workflow

**Forward (normal):** Write in `01-drafts/` → Ansel approves → move to `02-final/`.

**Backward (revision):** If a finalized post needs editing, move it from `02-final/` back to `01-drafts/` before making any changes. Never edit directly in `02-final/`.

**Learning from edits:** Every time Ansel edits a draft — or sends a post back from `02-final/` for revision — compare the before and after carefully. Note what changed: word choices swapped, sentences cut, structure reordered, tone shifted. These are live calibrations to his voice and standards. Before the session ends, surface the key patterns to Ansel ("I noticed you replaced X with Y and cut Z — should I treat this as a standing rule?"). If he confirms, log it in `references/personal-story.md` (for voice/tone patterns) or `references/research-to-post.md` (for structural/process patterns). Do not store inferences silently — always confirm first.

---

## Context to load

**Always (both paths):**
- `../voice/SKILL.md` — voice rules, hook types, structural patterns
- `../voice/references/founder-voice.md` — first-person patterns, post architecture, hashtag rules

**Path B only:**
- `references/personal-story.md` — Ansel's founder story and proof points
- `references/research-to-post.md` — detailed research + generation workflow

**When pairing with a visual:**
- `../BRAND.md` — colors, typography, illustration

**When adapting from existing media:**
- `../writing/02-final/[file]` — long-form piece to compress
- `../carousel/[file]` — carousel to introduce
- `../video/[project]/` — video to announce

**Never load `01-drafts/` or `../writing/01-drafts/`** for a conversion task.

---

## Path A — Writing from existing content

### When to use
A piece already exists in `02-final/` (writing, carousel, or video) and needs a LinkedIn caption.

### Step 1 — Identify the source
Load only the final version of the source asset. Determine the post type from the asset type:

| Source | Default post type | Hook source |
|---|---|---|
| Long-form piece (`../writing/02-final/`) | Opinion / reference-and-riff | Most quotable sentence in the piece |
| Carousel (`../carousel/`) | How-to / framework | First slide — paraphrase, don't repeat verbatim |
| Video (`../video/`) | Product update / opinion | Most surprising moment in first 5 seconds |

### Step 2 — Write the post
Follow the five-part shape in `../voice/references/founder-voice.md`:
1. Hook → 2. Context → 3. Insight → 4. IEP Pal mention (optional, once) → 5. Community question

- Post should make sense **without** the asset (skimmable on its own) but reward clicking through.
- Include the asset's runtime for videos ("a 45-second walkthrough").
- For long-form: link the piece in the caption body ("Full piece here: [link]").

### Step 3 — Save and link
Save to `01-drafts/[slug].md`. Header must note: post type, source asset filename, what visual it pairs with.

### Step 4 — Move to final
When approved, move (don't copy) to `02-final/[slug].md`.

---

## Path B — Research → Write → LinkedIn draft

Full detail in `references/research-to-post.md`. Summary:

### Step 1 — Lock the topic frame
Before researching: confirm topic, Ansel's angle on it, post type, and which personal story thread connects (from `references/personal-story.md`).

### Step 2 — Research (web + Reddit)

**Web:** Use `WebSearch` and `mcp__workspace__web_fetch`. Target 3–5 sources: primary research, recent news, practitioner writing, or policy documents.

**Reddit:** Surface what practitioners actually think. Priority subreddits:
- `r/specialed` — SpEd teacher frustrations, tools, wins
- `r/Teachers` — general teacher experience
- `r/SLP` — speech-language pathology, IEP goals
- `r/edtech` — tool adoption and skepticism

Search pattern: `site:reddit.com/r/specialed "[topic]"` or fetch threads directly.

After research, answer before writing: What's the most surprising finding? What proof point from `references/personal-story.md` is genuinely relevant? Is there a source to credit and tag?

### Step 3 — Generate 3 hook variants, then write

Produce three hook attempts labeled by type (vulnerability / proof / emotional agreement / etc.) before writing the body. The best hook surfaces when you see all three together. Then write the full five-part post.

### Step 4 — Self-review
Run sanity checks below. Confirm: IEP Pal mentioned once, community question is specific, hashtags match post type, length is 150–300 words.

### Step 5 — Save draft file
Save to `01-drafts/[slug].md` with standard header (post type, hook type used, sources, personal story thread used, pairs-with, status: ready for Playwright). Post body goes below a `---` separator — exactly as it will be posted.

### Step 6 — Run Playwright to save LinkedIn draft

```bash
# First time only — install browser:
npx playwright install chromium

# Run the draft script:
node "ieppal-brand/linkedin posts/scripts/linkedin-draft.js" \
  "ieppal-brand/linkedin posts/01-drafts/your-slug.md"
```

The script strips the header from the draft file, opens a persistent Chrome session logged into LinkedIn, pastes the content, and triggers the "Save as draft" dialog. Full script and troubleshooting in `references/playwright-linkedin.md`.

---

## Post types

Six recurring shapes. Hook types and structural patterns are in `../voice/references/founder-voice.md`.

| Type | Purpose | Hook style | Close |
|---|---|---|---|
| Opinion / reflection | Share a perspective you've earned | Vulnerability, mirror, or controversial statement | Community question |
| Reference-and-riff | React to someone else's idea (book, podcast, paper, post) | Credit the source, tag the author | Community question — "what would you add?" |
| Field research | Share what educators told you | Time-anchored field story | Community question — "what would you add?" |
| How-to / framework | Teach a process | Direct problem-solution or value promise | Practical CTA or self-aware humor |
| Milestone / personal update | Mark a meaningful moment | Personal anchor ("Today I…", "Last week was…") | Gratitude or forward intent — no community question |
| Product update | Announce or contextualize an IEP Pal change | Declarative statement or surprise feedback | Soft CTA + invitation to feedback |

---

## Interconnection with other media

LinkedIn posts are rarely standalone — they're the *door* readers walk through to reach something else.

### Carousel → LinkedIn post (default direction)
1. Generate carousel in `../carousel/` per `../carousel/SKILL.md`.
2. Draft matching LinkedIn post in `01-drafts/[slug].md` — hook from slide 1 (paraphrased), body teases the framework, close on carousel's call-to-engage or a community question.
3. Link carousel filename in the draft header.

### Video → LinkedIn post
1. Render video in `../video/`.
2. Draft post in `01-drafts/[slug].md` — hook from the most surprising first-5-second moment, include runtime in caption, close on community question or soft CTA for product updates.
3. Link video project folder in draft header.

### Long-form → LinkedIn post
1. Pull the most shareable thread from `../writing/02-final/[file]`.
2. Compress to 150–300 words. Link the piece in the caption.
3. Link source file in draft header.

### LinkedIn post → Carousel (reverse direction)
If a draft has a list, framework, or numbered process worth visualizing: generate a carousel from it in `../carousel/`, then update the post body to tease the framework without listing every step.

---

## Filename convention

`[topic-slug].md` — kebab-case, descriptive, no dates.

- `data-talks-ep9-coaching-curiosity.md`
- `iep-goal-quality-field-research.md`
- `400-educators-what-i-learned.md`
- `ns-completion-update.md`

---

## Sanity checks before Playwright or publishing

1. Would a teacher at 3:47pm on a Wednesday actually stop scrolling for this hook?
2. Did I name the frustration / surprise / question before the takeaway?
3. Did I credit the source if reacting to someone else's idea? Did I tag them?
4. Did I end on the reader — community question or gratitude — not on the product?
5. Is the IEP Pal mention (if any) a single sentence? Does it include the URL?
6. Are hashtags right for the post type? (4 tags for topic/how-to; 0–2 lowercase for milestone)
7. If paired with a carousel or video, is the pairing noted in the draft header?
8. Is the post 150–300 words?
9. **Clarity (case-by-case):** Does the post explain any technical concepts, tools, processes, or terminology that a non-specialist might not know? If yes — are those concepts explained in plain English rather than assumed? Apply this whenever the post involves software features, AI tools, or any workflow that requires specialist knowledge to follow. The bar is not "avoid jargon entirely" — it's "explain what you use."

### Variant: thought-leadership / off-topic posts

For posts that don't target IEP Pal's teacher audience — e.g. posts about Claude, AI tooling, productivity workflows, or general professional topics:

1. Replace check #1 with: *Would a smart, non-developer professional stop scrolling for this hook?*
2. Skip check #5 — no IEP Pal mention required. These posts build Ansel's personal brand, not the product.
3. Skip check #6's education hashtag guidance — use topic-appropriate tags instead (e.g. `#AI #Productivity #ClaudeAI`).
4. Apply check #9 (clarity) — these posts are especially likely to involve technical concepts that need plain-language explanation.
5. Everything else (length, hook, structure, community question) applies as normal.

---

## References

| File | When to load |
|---|---|
| `../voice/SKILL.md` | Always — load first |
| `../voice/references/founder-voice.md` | Always — post architecture, hook types, hashtag rules |
| `references/personal-story.md` | Path B — Ansel's story and proof points |
| `references/research-to-post.md` | Path B — full research + generation workflow |
| `references/playwright-linkedin.md` | Path B — Playwright script, setup, troubleshooting |
| `../BRAND.md` | When pairing with a carousel or video |
| `../carousel/SKILL.md` | When generating a carousel to pair with this post |
| `../video/SKILL.md` | When announcing a video |
| `../writing/SKILL.md` | When compressing a long-form piece into a post |

---

## ↓ When this file changes

Check and update the following files. Full dependency graph in `../../DEPENDENCIES.md`.

| File | What to check |
|---|---|
| `../../CLAUDE.md` (root) | Token management → "Write a LinkedIn post" row |
| `../CLAUDE.md` (ieppal-brand) | Token management — LinkedIn rows |
| `../carousel/SKILL.md` | Step referencing paired LinkedIn caption workflow |
| `../video/SKILL.md` | "Pairing with a LinkedIn post" section |
| `../writing/SKILL.md` | Handoff table mention of the LinkedIn pipeline |

---

## Changelog

- **v2 — 2026-05-25** — Major update: added Path B (research → write → LinkedIn draft via Playwright). Added `references/personal-story.md`, `references/research-to-post.md`, `references/playwright-linkedin.md`, and `scripts/linkedin-draft.js`. Fixed stale location header (was pointing to `linkedin.md`). Condensed existing Path A content. All detailed workflow documentation moved to `references/`.
- **v1 — 2026-05-25** — Initial SKILL.md replacing the earlier `linkedin.md` entry point. Full workflow for writing from existing content, post types, filename convention, interconnection with other media, and sanity checks.
