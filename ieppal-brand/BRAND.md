# IEP Pal — Brand System

> **⚠ Status: In flux.** The palette and typography in this file represent the intended design direction, not the current deployed state. Before using any color or font value from this file, read `../ieppal-software/IEPPAL-RASA-FE/tailwind.config.js` to see what is actually in the app. See the **Frontend Sync** section below for how to keep these aligned.
>
> **What is locked:** Voice & tone (see `voice/SKILL.md`). Illustration assets. Logo mark concept.
> **What is in flux:** Palette token names and hex values. Typography (Playfair Display + Inter is the direction, but not yet implemented in code).

---

## Frontend Sync

The active brand tokens — the colors and fonts that actually render in the app — live in:

```
ieppal-software/IEPPAL-RASA-FE/tailwind.config.js
```

**Current implementation (last synced 2026-05-21):**

| Token name (code) | Hex | Maps to BRAND.md intent |
|---|---|---|
| `offwhite` | `#f9f5f0` | `--cream` (surface tone) |
| `darksidebar` | `#111827` | Near `--ink` (slightly cooler) |
| `pastelPink` | `#FF758C` | No BRAND.md equivalent — legacy, retiring |
| `pastelOrange` | `#FF7EB3` | No BRAND.md equivalent — legacy, retiring |

**Current font stack (code):** Inter, Poppins, Nunito. Playfair Display not yet added.

**How to sync:**
- When `tailwind.config.js` is updated, update the table above to match.
- When a BRAND.md decision is finalized (palette token locked), implement it in `tailwind.config.js` — treat as a styling task through the SDD workflow if it touches multiple components.
- Never update this file to match `tailwind.config.js` automatically without confirming the code change was intentional.

---

The intended design direction for how IEP Pal looks, sounds, and feels.
Any deck, carousel, animation, email, or document should be checkable against this file.

---

## 1. What IEP Pal is

A support tool for educators who write and manage Individualized Education Programs (IEPs).
Built for **speed, privacy, and care**. The one-liner: *"Learning support all in one place."*

**Audience:** special education teachers, classroom teachers supporting IEP students, instructional coaches, school administrators.

**Personality in three words:** warm, calm, competent.

---

## 2. Colors

### Philosophy

The palette has four layers:
1. **Neutrals** do the structural work (backgrounds, text, borders).
2. **Surface tones** are warm, hue-tinted backgrounds that shift the mood of a section without activating a pastel's emotional charge. Cream, sand, and lilac live here.
3. **Personality pastels** carry the emotional tone — warmth, calm, growth. These *mean* something; don't use them just for decoration.
4. **Ink** is the primary call-to-action color. Pastels are too soft to drive action; ink is a quiet, confident anchor that lets the pastels breathe.

Keep the ratio roughly **70% neutrals + surface tones / 25% pastels / 5% ink**. If a page starts feeling loud, it has too much pastel.

### Does this palette actually work together?

Yes, and the reason is worth knowing so we don't second-guess it. Mapped to a color wheel:

- Warm cluster: `--accent-warm` orange (~25°) · `--sunshine` yellow (~55°) · `--sprout` yellow-green (~85°)
- Cool cluster: `--mint` cyan-green (~170°) · `--lilac` soft violet (~287°)

The warm cluster balances against the cool cluster. Yellow and lilac are near-complementary, so they make each other feel brighter when they sit near each other. This is a distributed pastel palette, not a random assortment. We stop at these four pastels — a fifth would tip it into noise.

### Neutrals

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1a1a1e` | Primary text, primary buttons, icons |
| `--charcoal` | `#52525b` | Secondary text, subheads |
| `--ash` | `#a1a1aa` | Muted text, placeholders, disabled |
| `--linen` | `#fefcf9` | Near-white card surface |
| `--border-subtle` | `rgba(0,0,0,0.06)` | Card borders, hairlines |
| `--border-medium` | `rgba(0,0,0,0.12)` | Stronger borders |

### Surface tones

Warm, hue-tinted backgrounds. Each has a mood, but none carry semantic weight the way the pastels do — you can use them freely as section backgrounds without implying anything specific.

| Token | Hex | Mood | Typical use |
|---|---|---|---|
| `--cream` | `#f9f5f0` | Default, warm | Primary page background |
| `--sand` | `#f0ebe4` | Slightly grounded | Section dividers, subtle cards |
| `--lilac` | `#e2d1e6` | Contemplative, sophisticated | Mission / quote / founder-story sections; pull-quote backgrounds; thought-leadership content |

**Guidance on lilac.** Use it where you'd want cream to feel "a little more considered" — the founder story, the mission statement, a long-form quote. Don't use it for primary body-copy backgrounds; the hue is too present for long reading sessions. Ink on lilac passes AA contrast easily.

Tints/shades of lilac for when flat isn't enough:

| Token | Hex |
|---|---|
| `--lilac-tint` | `#f2e8f4` |
| `--lilac-shade` | `#a48ca9` |

### Personality pastels

| Token | Hex | Meaning | Typical use |
|---|---|---|---|
| `--sunshine` | `#f6eca7` | Warmth, encouragement | Highlights, positive states, illustration fills |
| `--mint` | `#b0f6f0` | Calm, clarity, trust | Info callouts, privacy/security moments, icon backgrounds |
| `--sprout` | `#bce784` | Growth, progress, success | Progress indicators, goal-completion, positive data |

Each pastel has a tint and a shade for when flat pastel isn't enough:

| Token | Hex |
|---|---|
| `--sunshine-tint` | `#fbf6d3` |
| `--sunshine-shade` | `#d9c469` |
| `--mint-tint` | `#dbfbf8` |
| `--mint-shade` | `#6dc9c0` |
| `--sprout-tint` | `#e1f3c4` |
| `--sprout-shade` | `#86b84a` |

### Accent

| Token | Hex | Use |
|---|---|---|
| `--accent-warm` | `#F97316` | Sparingly, for the "hero moment" — top-of-funnel headlines, key number callouts. Pair with sunshine. |

> **Note on legacy website palette:** the live site uses `#EC4899` (pink), `#3B82F6` (blue), `#F97316` (orange). The pink and blue are being retired in favor of the pastel personality layer. Orange stays as the single hero accent. When updating site CSS, leave old tokens in place until a full migration pass, but no new surfaces should use pink or blue.

### Semantic roles

| Role | Token | Hex |
|---|---|---|
| Success | `--sprout-shade` | `#86b84a` |
| Info | `--mint-shade` | `#6dc9c0` |
| Warning | `--sunshine-shade` | `#d9c469` |
| Error | `#c94f3c` (standalone, intentionally not pastel — errors must read) | |

### Accessibility

All text must hit WCAG AA (4.5:1) against its background:
- Ink on cream, sand, lilac, linen, white, and all pastel **tints** → passes.
- Ink on flat sunshine / mint / sprout / lilac → passes for body text.
- Charcoal on cream / sand / lilac / linen → passes.
- White text on pastels → **fails, don't do it**. Use ink instead.
- Ink on `--accent-warm` → passes; white on accent-warm also passes for ≥18px.

Never put pastel text on a pastel background. Pastels are surfaces, not ink.

### Gradients

Reserved for hero moments and the logo lockup.
- **Warmth gradient:** `linear-gradient(135deg, #f6eca7 0%, #F97316 100%)` — sunshine → accent-warm.
- **Growth gradient:** `linear-gradient(135deg, #b0f6f0 0%, #bce784 100%)` — mint → sprout.

Use at most one gradient per surface.

### Quick CSS drop-in

```css
:root {
  /* Neutrals */
  --ink: #1a1a1e;
  --charcoal: #52525b;
  --ash: #a1a1aa;
  --linen: #fefcf9;

  /* Surface tones */
  --cream: #f9f5f0;
  --sand: #f0ebe4;
  --lilac: #e2d1e6;
  --lilac-tint: #f2e8f4;
  --lilac-shade: #a48ca9;

  /* Personality pastels */
  --sunshine: #f6eca7;
  --mint: #b0f6f0;
  --sprout: #bce784;

  --sunshine-tint: #fbf6d3;  --sunshine-shade: #d9c469;
  --mint-tint: #dbfbf8;       --mint-shade: #6dc9c0;
  --sprout-tint: #e1f3c4;     --sprout-shade: #86b84a;

  /* Accent */
  --accent-warm: #F97316;
  --error: #c94f3c;
}
```

---

## 3. Typography

### Families

- **Display:** Playfair Display (400, 600, 700 + italic). Serif, literary, warm. Used for headlines, hero statements, mission quotes, and the occasional italicized pronoun ("You").
- **Body:** Inter (300, 400, 500, 600, 700). Clean, neutral sans-serif. Used for everything else — UI, body copy, captions.

Both are on Google Fonts. Always preconnect.

### Type scale

| Level | Family | Size | Weight | Letter-spacing | Line-height | Use |
|---|---|---|---|---|---|---|
| Display XL | Playfair | `clamp(2.5rem, 5vw, 4rem)` | 700 | -0.02em | 1.1 | Hero headlines |
| Display L | Playfair | `clamp(2rem, 4vw, 3rem)` | 600 | -0.02em | 1.15 | Section titles |
| Display M | Playfair | 1.8rem | 600 | -0.01em | 1.2 | Subsection titles |
| Display S | Playfair italic | 1.5rem | 400 | 0 | 1.4 | Pull quotes, mission statements |
| Body L | Inter | 1.125rem | 400 | 0 | 1.6 | Intro paragraphs |
| Body | Inter | 1rem | 400 | 0 | 1.6 | Default body |
| Body S | Inter | 0.95rem | 400 | 0 | 1.5 | Secondary body |
| Caption | Inter | 0.85rem | 500 | 0.02em | 1.4 | Labels, metadata |
| Eyebrow | Inter uppercase | 0.75rem | 600 | 0.1em | 1.2 | Section eyebrows above display headings |

### Typography patterns

- Pair a Playfair headline with Inter body. Never set a whole page in Playfair.
- Italicize the audience pronoun ("*You*, the educator") when you want the sentence to feel personal. This is a signature IEP Pal move — use it deliberately, not constantly.
- Never center long-form paragraphs. Center only display headlines and short statements.

---

## 4. Logo & icon system

### Logo

- **Primary mark:** a smiling "o" mark, black stroke. Minimalist, friendly. (Source SVG not currently in this repo — logo files need to be added, ideally under `assets/logos/` once that folder is created.)
- **Favicon:** `../ieppal-software/IEPPAL-RASA-FE/public/favicon.svg` is the working copy in the frontend app.

### Clear space

Reserve padding of at least `0.5x` the mark's height on all sides. Don't crowd the logo.

### Minimum sizes

- Digital: 24px height.
- Print: 0.5 inch height.

### Logo don'ts

- Don't fill the mark with a pastel — it's line art, not a shape.
- Don't rotate, skew, or add drop shadows.
- Don't place on a low-contrast pastel without adequate stroke weight (test at favicon scale).

### Illustration assets

The `assets/` folder (not yet committed to repo) contains the IEP Pal illustration system:
- **Smile 1.svg** — celebratory / welcome moments
- **Pat On Back.svg** — encouragement / success moments
- **Loading Icon 2.svg** — waiting states / processing

These are warm, hand-drawn-feeling SVGs. They set the emotional baseline: *we are rooting for the educator*. Use them like well-placed punctuation — one per screen, not a gallery.

---

## 5. Voice & tone (summary)

The full voice guide lives in `voice/SKILL.md`. In one paragraph:

IEP Pal speaks to educators the way a thoughtful colleague would — warm, specific, and respectful of their time. We say what a tool does before we say why it's great. We name the frustration (paperwork, fragmented systems, privacy worry) before we offer the fix. We never talk down, never hype, never say "revolutionize." We italicize *you* when the sentence needs to feel personal.

**Signature phrases that are on-brand:**
- "Support the educator so they can support the student."
- "Speed, privacy, and care."
- "All in one place."
- "*You*, the educator."

---

## 6. File structure (this repo)

```
ieppal-brand/
├── CLAUDE.md                    ← system entry point (workspace index + token management guide)
├── BRAND.md                     ← you are here (single source of truth)
├── voice/                       ← brand voice & tone
│   ├── SKILL.md                 ← voice & tone rules (SHIPPED) — load before any copy
│   └── references/              ← founder-voice.md, before-after-examples.md
├── assets/                      ← illustration SVGs (not yet committed to repo)
├── writing/                     ← long-form copy
│   ├── SKILL.md                 ← writing skill
│   ├── 01-drafts/               ← working drafts
│   └── 02-final/                ← finished pieces — handoff point for other media
├── linkedin posts/              ← short-form LinkedIn copy (own pipeline)
│   ├── linkedin.md
│   └── 01-drafts/
├── carousel/SKILL.md            ← LinkedIn carousel skill (uses Canva MCP)
├── slides/SKILL.md              ← slide deck generation skill (STUB)
└── video/                       ← Remotion + Hyperframes video workspace
    ├── CLAUDE.md                ← video workspace entry point + tool-chooser
    ├── skills-lock.json         ← locked skill versions
    └── remotion/                ← Remotion compositions (SKILL.md is a STUB)
        └── create-class-demo/  ← placeholder (project not yet scaffolded)

Note: IEPPAL-RASA-FE has moved to ../ieppal-software/IEPPAL-RASA-FE/ — do not reference IEPPAL-RASA-FE-mvp.
```

---

## ↓ When this file changes

Check and update the following files for stale content. Full details in `../../DEPENDENCIES.md`.

| File | What to check |
|---|---|
| `CLAUDE.md` (root) | Brand quick-reference → "Colors (intended direction)" and "Typography (intended)" blocks |
| `ieppal-brand/CLAUDE.md` | Token management table — carousel, visual alignment, and writing rows |
| `carousel/SKILL.md` | Pastel accent guidance; color accuracy checklist in Step 3 |
| `STATUS.md` | Brand row — in-flux / locked status |

Also: when the **Frontend Sync table** in this file is updated (because `tailwind.config.js` changed), update `CLAUDE.md` root → "Colors (currently in code)" line to match.

---

## 7. Changelog

- **2026-04-22** — Initial brand system locked. Palette: neutrals + three pastels (sunshine/mint/sprout) + ink CTAs + single orange hero accent. Pink and blue retired from new surfaces.
- **2026-04-22 (rev 2)** — Added `--lilac` #e2d1e6 as a surface tone (not a fourth personality pastel) for mission/quote/founder-story contexts. Added "does this palette actually work together" section with color-wheel reasoning. Palette now closed at 3 pastels + 3 surface tones + 1 accent.
