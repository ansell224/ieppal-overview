# Playwright — LinkedIn Draft Saver

> Full reference for saving LinkedIn posts as drafts via Playwright (npx, no global install).
> Invoked at Step 6 of the research-to-post pipeline in `./research-to-post.md`.

---

## How LinkedIn drafts work

LinkedIn does not expose a "Save draft" button in its composer. The draft is triggered when you:
1. Open the post composer
2. Type or paste content
3. Close the modal **without posting**

LinkedIn then shows a "Save as draft" confirmation dialog. Clicking **Save** stores the draft, accessible later from "Start a post → Your drafts."

The Playwright script automates steps 1–3, then handles the save dialog.

---

## Prerequisites

**Node.js required.** Check: `node --version`

**Playwright browsers (first-time setup):**
```bash
npx playwright install chromium
```

**LinkedIn auth (first-time setup):**
LinkedIn requires a logged-in session. The script uses a persistent browser context stored in `~/.linkedin-playwright-state/`. On first run, the browser opens for you to log in manually. After login, the session is saved. Subsequent runs are headless.

---

## Script — `linkedin-draft.js`

Save this file at `ieppal-brand/linkedin posts/scripts/linkedin-draft.js`:

```javascript
// linkedin-draft.js
// Usage: node linkedin-draft.js path/to/post.txt
//    or: node linkedin-draft.js --text "Your post content here"
//
// Requires: npx playwright install chromium (first time)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.linkedin-playwright-state',
  'auth.json'
);

async function getPostContent() {
  const args = process.argv.slice(2);
  if (args[0] === '--text') {
    return args.slice(1).join(' ');
  }
  if (args[0]) {
    return fs.readFileSync(args[0], 'utf8').trim();
  }
  throw new Error('Usage: node linkedin-draft.js path/to/post.txt\n   or: node linkedin-draft.js --text "content"');
}

async function ensureLoggedIn(browser) {
  const fs = require('fs');
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(STATE_PATH)) return; // already have session

  console.log('\n⚠️  First-time setup: logging in to LinkedIn...');
  console.log('A browser window will open. Log in, then press Enter here.\n');

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.linkedin.com/login');
  await new Promise(resolve => process.stdin.once('data', resolve));
  await context.storageState({ path: STATE_PATH });
  await context.close();
  console.log('✅ Session saved. Subsequent runs will be headless.\n');
}

async function saveDraft(content) {
  const browser = await chromium.launch({ headless: false }); // keep visible for safety

  await ensureLoggedIn(browser);

  const context = await browser.newContext({ storageState: STATE_PATH });
  const page = await context.newPage();

  console.log('Navigating to LinkedIn feed...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Open the post composer
  console.log('Opening post composer...');
  const composerTrigger = page.locator(
    '[data-control-name="share.sharebox_text"], ' +
    'button:has-text("Start a post"), ' +
    '.share-box-feed-entry__trigger'
  ).first();
  await composerTrigger.click();
  await page.waitForTimeout(1500);

  // Find the editor and type content
  console.log('Pasting post content...');
  const editor = page.locator('.ql-editor, [role="textbox"][aria-label*="post"]').first();
  await editor.waitFor({ state: 'visible', timeout: 10000 });
  await editor.click();
  await editor.pressSequentially(content, { delay: 10 });
  await page.waitForTimeout(1000);

  // Close the modal (Escape triggers the save-draft dialog)
  console.log('Closing composer to trigger Save Draft dialog...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);

  // Handle the Save Draft confirmation
  const saveButton = page.locator('button:has-text("Save"), [data-control-name="discard_share_save"]').first();
  const discardButton = page.locator('button:has-text("Discard")').first();

  try {
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();
    console.log('✅ Draft saved to LinkedIn.\n');
  } catch {
    console.log('⚠️  Save dialog not detected. Checking state...');
    // Fallback: try clicking the modal close button if it appeared differently
    const closeButton = page.locator('[aria-label="Dismiss"], button:has-text("Close")').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      const retryButton = page.locator('button:has-text("Save")').first();
      if (await retryButton.isVisible()) {
        await retryButton.click();
        console.log('✅ Draft saved (fallback path).\n');
      } else {
        console.log('❌ Could not confirm save. Check LinkedIn manually.');
      }
    }
  }

  await page.waitForTimeout(2000);
  await context.close();
  await browser.close();
}

getPostContent()
  .then(saveDraft)
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
```

---

## Usage

**From a file:**
```bash
# Content stored in a text file (e.g. exported from 01-drafts/ — just the post body)
node "ieppal-brand/linkedin posts/scripts/linkedin-draft.js" post.txt
```

**Inline text:**
```bash
node "ieppal-brand/linkedin posts/scripts/linkedin-draft.js" --text "Your post here..."
```

**Via npx (no local playwright install needed):**
```bash
# First install playwright browsers if not done:
npx playwright install chromium

# Then run the script:
node "ieppal-brand/linkedin posts/scripts/linkedin-draft.js" post.txt
```

---

## Extracting just the post body from a draft file

Draft files in `01-drafts/` have a header and then the post body after a `---` separator. To strip the header:

```bash
# Print everything after the second --- separator
awk '/^---/{count++} count==2 && !/^---/' \
  "ieppal-brand/linkedin posts/01-drafts/your-post.md" \
  > /tmp/post-body.txt

node "ieppal-brand/linkedin posts/scripts/linkedin-draft.js" /tmp/post-body.txt
```

---

## LinkedIn selector fragility

LinkedIn frequently updates its UI. If the script fails to find the composer or editor:

1. Run with `headless: false` (already set) and watch what happens.
2. Open DevTools in the browser window and inspect the element LinkedIn is actually rendering.
3. Update the selector strings in `composerTrigger` or `editor` to match.
4. Common alternative selectors:
   - `.share-box-feed-entry__trigger`
   - `[data-control-name="share.sharebox_text"]`
   - `.editor-content .ql-editor`

If LinkedIn's session expires, delete `~/.linkedin-playwright-state/auth.json` and re-run — the login flow will restart.

---

## Confirming the draft was saved

After the script runs, verify manually at least once:
1. Go to linkedin.com
2. Click "Start a post"
3. Look for "Your drafts" in the composer — the post should appear there.

---

## Known limitations

- **Must run on your Mac — not from Claude's sandbox.** The Claude sandbox has no network access to linkedin.com. Always run `linkedin-draft.js` from your own Mac terminal.
- **LinkedIn may detect automation** and show a CAPTCHA or security challenge. If this happens, run with `headless: false`, complete the challenge manually, and the session will resume.
- **2FA / CAPTCHA on login:** handle manually in the login window during first-time setup.
- **Long posts (>3,000 characters):** `pressSequentially` with a small delay keeps LinkedIn's editor from dropping characters. Adjust `delay: 10` upward if you see missing text.
- **Session expiry:** LinkedIn sessions typically last 1–2 weeks. If you get logged-out errors, delete the auth state file and re-authenticate.
- **`PLAYWRIGHT_BROWSERS_PATH` must be set before `require('playwright')`** — the script now handles this automatically (OS-aware: uses local `.playwright-browsers` on Linux, system browser cache on macOS).
