# Video scripts — CLI & automation reference

All bash and CLI commands for the IEP Pal video pipeline live here.
For pipeline context and folder conventions, see `../SKILL.md`.

---

## Scaffold a new Hyperframes project

Run from `ieppal-brand/video/`:

```bash
npx hyperframes init 01-drafts/<project-name>
```

---

## Dev loop (inside the project folder)

```bash
cd 01-drafts/<project-name>

npx hyperframes lint             # catch errors before previewing
npx hyperframes inspect          # visual layout check (text overflow, clipping)
npx hyperframes preview          # hot-reload studio on localhost:3002
```

---

## Render and archive

```bash
cd 01-drafts/<project-name>

npx hyperframes render                          # renders MP4 in the project folder
npx hyperframes render --output <name>.mp4      # named output

# Once approved, move the MP4 to 02-final/
mv <output>.mp4 ../../02-final/<project-name>.mp4
```

The Hyperframes project stays in `01-drafts/` — only the MP4 moves to `02-final/`.

---

## Full check before render

```bash
npm run check     # lint + inspect in one pass (if package.json defines this script)
```

---

## Useful flags

```bash
npx hyperframes lint --verbose    # include info-level findings
npx hyperframes lint --json       # machine-readable output
npx hyperframes inspect --json    # agent-readable layout findings
npx hyperframes inspect --at 1.5,4,7.25   # check specific timestamps
npx hyperframes preview --port 4567       # custom port
```

---

## Remotion (stub — not yet built)

```bash
# Scaffold (run from ieppal-brand/video/)
npm init video@latest   # follow prompts, place project under 01-drafts/<project-name>

# Dev
cd 01-drafts/<project-name>
npm start

# Render
npx remotion render

# Move MP4 to 02-final/ after approval (same convention as Hyperframes)
mv out/<output>.mp4 ../../02-final/<project-name>.mp4
```
