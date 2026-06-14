You want Claude to stop asking how you like things done every single session.



Here's how to set it up in ten minutes: 



1/ Create a folder on your computer

Name it after your workflow. Inside, create three folders and a .md file :

financial-modeling/

└── SKILL.md          ← your instructions (keep this name exactly as shown)

└── references/       ← models, formatting rules, examples

└── assets/           ← slide templates or excel sheets Claude can reference

└── scripts/           ← Python, Bash, etc for creating slides



Pro tip: You can get Claude to write the SKILL.md file (This is just a text file)

or

Find a SKILL.md file online from someone else



2/ Open SKILL.md and add a short description at the top

This is the part Claude reads to decide whether this skill is relevant. It looks like this:

---

name: financial-modeling

description: Build financial models, DCF analyses, and investor pitch decks. Use when the user asks to model revenue, build a forecast, project unit economics, or create a pitch deck with existing data.

---



Write it in plain English. The more specific you are about when to use the skill, the better Claude gets at picking it up without you asking.



3/ Write your instructions below that header

Think of this as the brief you'd give a new analyst before handing off a task. For example, how you like things structured and what format the output should be in



The more you put here once, the less you repeat yourself forever. Iterate on this over time. 



4/ Install it in Claude Cowork (Desktop App)

Settings → Capabilities → Skills → zip the folder → upload. That's it.



5/ Test it

Describe a task the way you normally would; you don't need to say "use the skill," just ask naturally. If Claude doesn't pick it up on its own, revisit the description from step 2 and add the exact phrases you tend to use. A few rounds of this and it'll click.



Bonus: inside Claude, there's a built-in skill-creator skill. Describe your workflow in plain English and it'll draft the SKILL.md for you. Good starting point if staring at a blank file feels daunting.



Your first version won't be perfect. That's normal. Refine as you go.



#AI #Productivity #ClaudeAI #Learning