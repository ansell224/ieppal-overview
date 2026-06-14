# Research → Post Pipeline — Detailed Reference

> This file contains the full step-by-step workflow for Path B in `../SKILL.md`:
> topic research → post generation → LinkedIn draft via Playwright.
>
> Prerequisites: load `../../voice/SKILL.md`, `../../voice/references/founder-voice.md`,
> and `./personal-story.md` before running this workflow.

---

## Step 1 — Topic intake

Before researching, lock in the topic frame. Ask (or infer from context):

| Question | Why it matters |
|---|---|
| What is the topic? | Determines search terms |
| What angle does Ansel have on it? | Prevents generic takes |
| Which post type fits? (opinion, reference-and-riff, field research, how-to, milestone, product update) | Sets structure before writing |
| Is there a personal story or proof point that connects? | Load from `./personal-story.md` |
| Is this standalone or paired with a carousel/video? | Affects caption length and hook choice |

---

## Step 2 — Research (web + Reddit)

### Web research

Use `WebSearch` and `mcp__workspace__web_fetch` to gather signal. Target 3–5 sources. Prioritize:

1. **Primary data / studies** — research papers, reports, government education data. These become proof hooks.
2. **Recent news and announcements** — triggers reference-and-riff posts (react to someone's published work).
3. **Practitioner writing** — teacher blogs, edu-consultant newsletters, LinkedIn posts from educators or edtech founders.
4. **Policy and regulation** — IDEA (US), SEND (UK), MOE guidance (Singapore). Good for framing stakes.

Search query patterns that produce useful results:

```
"[topic]" site:edweek.org OR site:hechingereport.org
"[topic]" reddit
"IEP [topic]" research 2024 OR 2025
"special education [topic]" teacher experience
```

### Reddit research

Reddit surfaces what practitioners actually think — unfiltered, specific, often more honest than polished journalism. Priority subreddits:

| Subreddit | Signal type |
|---|---|
| r/specialed | SpEd teacher frustrations, wins, tools they use |
| r/Teachers | General teacher experience — good for broad education topics |
| r/SLP | Speech-language pathology — IEP goal writing, related services |
| r/schoolpsychology | Assessment, eligibility, compliance |
| r/edtech | Tool adoption, skepticism, what actually works in classrooms |
| r/singapurianteachers | Singapore-specific education context |

Use `WebSearch` with query: `site:reddit.com/r/specialed "[topic]"` or fetch thread URLs directly.

**What to extract from Reddit:**
- Specific pain points stated in plain language (these become hooks — "Stop doing X" or emotional agreement hooks)
- Verbatim quotes that feel true (paraphrase in the post, don't quote directly)
- Recurring themes across multiple threads (signals field research legitimacy)
- Surprising contradictions (good for controversial statement hooks)

### Synthesis checklist

After research, before writing, answer these:

- [ ] What is the most surprising or specific thing I found?
- [ ] What did teachers say that most people don't know?
- [ ] What would Ansel's reaction to this be, given his personal story?
- [ ] Which proof point from `./personal-story.md` is genuinely relevant?
- [ ] Is there a named source to credit and tag (author, report, subreddit theme)?

---

## Step 3 — Post generation

### Structure reminder

Follow the five-part shape from `../../voice/references/founder-voice.md`:

1. Hook (1–2 lines)
2. Context or story (2–4 short paragraphs)
3. Insight or framework
4. IEP Pal mention (optional, once)
5. Community question

### Injecting personal story

After the research synthesis, map one proof point or narrative thread from `./personal-story.md` to the post. The injection should feel earned, not bolted on. The test: would the post be weaker without it? If not, cut it.

Examples of good injection:

- Research topic is "teachers don't trust edtech tools" → pull the "400 educator interviews before writing code" proof point → opens as a field research story
- Research topic is "IEP goal quality varies wildly" → pull the AP Research paper on self-efficacy → opens as intellectual journey ("my own research taught me...")
- Research topic is "founder decisions under pressure" → pull the SAF SIT story → opens as vulnerability/field story hybrid

Injection phrasing patterns (match to Ansel's existing voice):
- "Two weeks ago, I sat with [specifics]..."
- "When we were building [context], I found..."
- "I've now spoken with [number] educators across [countries]..."
- "A year ago, I would have said X. Here's what changed."

### Draft prompt (for Claude to use internally)

When generating the post, run this mental checklist:

```
Topic: [X]
Key research finding: [most surprising thing]
Hook type: [pick from: vulnerability / mirror / field research story / controversial statement / unexplained contrast / value promise / proof / fear / emotional agreement]
Personal story angle: [thread from personal-story.md]
Post type: [opinion / reference-and-riff / field research / how-to / milestone / product update]
IEP Pal mention: [yes/no — if yes, one sentence, where?]
Community question: [draft the question]
```

Then draft the full post. Produce **3 hook variants** before writing the body. Label each by hook type. The best hook often surfaces itself when you see all three together.

### Generate 3 hook variants before writing the body

Label each attempt:

```
Hook A (vulnerability): ...
Hook B (proof): ...
Hook C (emotional agreement): ...
```

Pick the one that feels most like Ansel would actually say it. Then write the full post body under the chosen hook.

---

## Step 4 — Self-review before Playwright

Run the full sanity check from `../SKILL.md` before posting. In addition:

- [ ] Read the post aloud. If you stumble, restructure.
- [ ] Is the IEP Pal mention exactly one sentence? Does it name the URL (`iep-pal.com`)?
- [ ] Is the community question one the reader can actually answer from experience?
- [ ] Are hashtags right for the post type? (4 tags for topic/how-to; 0–2 for milestone)
- [ ] Is the post 150–300 words? Count it. LinkedIn cuts off at ~220 characters before "see more."

---

## Step 5 — Save draft file

Before running Playwright, save the approved post to `../01-drafts/[slug].md` with the standard header:

```markdown
# [Human-readable title]

**Post type:** [type]
**Hook type used:** [type]
**Source(s):** [article / Reddit thread / report that informed the post]
**Personal story thread:** [which thread from personal-story.md]
**Pairs with:** [carousel / video / long-form piece — or "standalone"]
**Status:** ready for Playwright

---

[Post body — exactly as it will be posted, including line breaks and hashtags]
```

---

## Step 6 — Run Playwright to save as LinkedIn draft

See `./playwright-linkedin.md` for the full script.

Quick invocation after content is approved:

```bash
npx playwright@latest test linkedin-draft.spec.js
```

Or run the standalone Node script:

```bash
node linkedin-draft.js "$(cat path/to/post-content.txt)"
```

The script navigates to linkedin.com, opens the post composer, pastes the content, and exits the modal to trigger the "Save as draft" dialog. Confirm at the prompt. Full details in `./playwright-linkedin.md`.
