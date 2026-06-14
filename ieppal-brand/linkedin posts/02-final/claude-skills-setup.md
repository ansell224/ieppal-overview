You want Claude to stop asking how you like things done every single session.

Claude Skills let you save your workflows once — so it just knows.

Here's how to set one up. Takes about 20 minutes.

1/ Create a folder on your computer
Name it after your workflow. Inside, you need three things:

financial-modeling/
└── SKILL.md          ← your instructions (keep this name exactly as shown)
└── references/       ← templates, formatting rules, examples
└── assets/           ← slide templates, brand files, anything Claude should reference

2/ Open SKILL.md and add a short description at the top
This is the part Claude reads to decide whether this skill is relevant. It looks like this:

---
name: financial-modeling
description: Build financial models, DCF analyses, and investor pitch decks. Use when the user asks to model revenue, build a forecast, project unit economics, or create a pitch deck with existing data.
---

Write it in plain English. The more specific you are about *when* to use the skill, the better Claude gets at picking it up without you asking.

3/ Write your instructions below that header
Think of this as the brief you'd give a new analyst before handing off a task. Cover: how you like things structured, which assumptions to flag, what format the output should be in, what lives in the appendix.

The more you put here once, the less you repeat yourself forever.

4/ Install it
Settings → Capabilities → Skills → zip the folder → upload. That's it.

5/ Test it
Describe a task the way you normally would — don't say "use the skill," just ask naturally. If Claude doesn't pick it up on its own, revisit the description from step 2 and add the exact phrases you tend to use. A few rounds of this and it'll click.

Bonus: inside Claude, there's a built-in skill-creator skill. Describe your workflow in plain English and it'll draft the SKILL.md for you. Good starting point if staring at a blank file feels daunting.

Your first version won't be perfect. That's normal. Refine as you go.

Estimated time: 15–30 minutes.

#AI #Productivity #ClaudeAI #Learning
