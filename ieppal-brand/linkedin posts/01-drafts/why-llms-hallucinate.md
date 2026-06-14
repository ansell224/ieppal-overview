---
post-type: opinion / reflection
hook-type: controversial statement
sources: Stanford CS229 - Building Large Language Models (LLMs) / Hallucination.md
personal-story-thread: building iep-pal.com — stakes of AI getting things wrong in education
pairs-with: none
status: ready for review
---

AI doesn't lie to you. It doesn't even know it's wrong.

That's what makes hallucination so strange. When ChatGPT invents a fake citation or gets a date completely wrong, it isn't malfunctioning -- it's doing exactly what it was trained to do.

Here's what's actually happening under the hood.

LLMs don't retrieve facts the way a search engine does. They generate text one word at a time, each step asking: "what word is most likely to come next?" Plausible-sounding and true are two very different things -- but the model can't tell them apart.

It gets more interesting. Researchers at Stanford found that part of the problem may come from the fine-tuning process itself. When models are trained on human-written examples, those examples include confident references, specific statistics, and citations -- some of which the model never actually encountered during its initial training. The model learns the *format* of being knowledgeable without having the substance to back it up.

So it produces confident nonsense, because that's what confident, helpful responses look like.

The most honest fix isn't better AI. It's teaching models to say "I don't know" -- which turns out to be surprisingly hard.

This is something I think about a lot building iep-pal.com, where generating false information about a student's legal accommodations isn't just inconvenient. It's harmful. The more we rely on these tools, the more important it is to understand their failure modes -- not to avoid AI, but to use it well.

What's your approach to catching hallucinations in your own work?

#Education #AI #LLMs #Learning
