# Playwright Browser Automation Plugin

Browser automation using Playwright for testing, screenshots, and web interaction. Use when you need to view web pages, take screenshots, interact with web apps, fill forms, click buttons, or verify UI behavior.

## Installation

```bash
/plugin marketplace add vredchenko/claude-code-kit
/plugin install playwright@claude-code-kit
```

## Commands

| Command | Description |
|---------|-------------|
| `/playwright:init` | Initialize Playwright in the current project |
| `/playwright:screenshot` | Take a screenshot of a web page |
| `/playwright:run` | Run a Playwright automation script |
| `/playwright:test` | Generate Playwright tests |

---

# Skill: Browser Automation Best Practices

This plugin provides guidance for using Playwright effectively. Playwright is already an executable tool - the plugin's value is teaching best practices for browser management, timing, and cross-browser testing.

## Setup

Playwright should be installed as a dev dependency. Browser binaries are configured in `playwright.config.ts` and installed with:

```bash
# npm
npx playwright install chromium firefox

# bun
bunx playwright install chromium firefox
```

This installs both **Chromium** (default) and **Firefox** browsers.

## Browser Selection

Both Chromium and Firefox are available. Use this guidance:

| Scenario | Browser | Rationale |
|----------|---------|-----------|
| Default/most testing | Chromium | Faster, better DevTools, primary development |
| Random variety (~20%) | Firefox | Catch cross-browser issues early |
| Both browsers | Both | CSS differences, before releases, debugging browser-specific bugs |

### Selecting a Browser

```typescript
import { chromium, firefox } from 'playwright';

// Default: Use Chromium
const browser = await chromium.launch();

// Random variety: ~80% Chromium, ~20% Firefox
function selectBrowser() {
  return Math.random() < 0.8 ? chromium : firefox;
}
const browser = await selectBrowser().launch();

// Run same test in both browsers
for (const browserType of [chromium, firefox]) {
  const browser = await browserType.launch();
  // ... run test ...
  await browser.close();
}
```

## CRITICAL: Browser Management Rules

**Before launching any Playwright browser:**

1. **Kill existing browser processes** - Never have multiple automated browsers running simultaneously
2. **Always use try/finally** - Ensure browser closes even on errors
3. **Set reasonable timeouts** - Detect hanging tests (default 30s is often too long)
4. **Run in foreground** - Do NOT run Playwright scripts in background mode

```bash
# Kill any existing browser processes before starting
pkill -f chromium || true
pkill -f firefox || true
```

```typescript
// ALWAYS wrap in try/finally to ensure cleanup
const browser = await chromium.launch({ ... });
try {
  // ... test code ...
} finally {
  await browser.close();
}
```

## Action Timing Guidelines

**Add delays between browser actions** to let the browser catch up:

| Action Type | Recommended Delay |
|-------------|-------------------|
| After click | 150-300ms |
| After navigation | 500ms or `waitForLoadState` |
| After form fill | 100ms |
| After scroll/zoom | 200-300ms |
| Between rapid operations | 100-150ms |

```typescript
// Example: Pacing interactions
await button.click();
await page.waitForTimeout(200);  // Let browser process the click

await page.fill('input', 'value');
await page.waitForTimeout(100);
```

## Headful Mode: Full Screen Setup

When using headful mode (`headless: false`), maximize the browser window and match viewport to window size:

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']  // Start maximized (Chromium)
});

// Create context without fixed viewport - uses full window size
const context = await browser.newContext({
  viewport: null  // null = match browser window size
});

const page = await context.newPage();
```

**Note:** Firefox uses `-start-maximized` (single dash) but `viewport: null` works for both.

**Alternative: Explicit large viewport**
```typescript
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 }
});
```

## Timeout and Hang Detection

Set appropriate timeouts to detect hanging tests:

```typescript
// Set default timeout for all operations (e.g., 15 seconds)
page.setDefaultTimeout(15000);

// Or per-operation timeout
await page.click('button', { timeout: 5000 });
await page.waitForSelector('.result', { timeout: 10000 });

// For locator operations
const box = await element.boundingBox({ timeout: 3000 });
```

## Complete Script Template

Use this template for all Playwright automation:

```typescript
import { chromium, firefox, type Browser, type BrowserType } from 'playwright';

async function main() {
  // Kill any existing browser processes
  const { execSync } = await import('child_process');
  try { execSync('pkill -f chromium', { stdio: 'ignore' }); } catch {}
  try { execSync('pkill -f firefox', { stdio: 'ignore' }); } catch {}

  // Select browser (80% Chromium, 20% Firefox for variety)
  const browserType: BrowserType = Math.random() < 0.8 ? chromium : firefox;
  console.log(`Using ${browserType.name()}`);

  let browser: Browser | null = null;

  try {
    // Launch browser (headful with full screen)
    browser = await browserType.launch({
      headless: false,
      args: ['--start-maximized']
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    // Set reasonable default timeout
    page.setDefaultTimeout(15000);

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);  // Extra settling time

    // ... your test code here ...
    // Remember to add delays between actions!

    // Take screenshot
    await page.screenshot({ path: 'tmp/screenshot.png', fullPage: true });

  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    // ALWAYS close browser
    if (browser) {
      await browser.close();
    }
  }
}

main().catch(console.error);
```

## Quick Patterns

### Take a Screenshot

```typescript
import { chromium } from 'playwright';

let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tmp/screenshot.png', fullPage: true });
} finally {
  if (browser) await browser.close();
}
```

### Interactive Testing with Pacing

```typescript
import { chromium } from 'playwright';

let browser;
try {
  browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Click with pacing
  await page.click('button:has-text("Submit")');
  await page.waitForTimeout(200);

  // Fill with pacing
  await page.fill('input[name="email"]', 'test@example.com');
  await page.waitForTimeout(100);

  // Wait for result
  await page.waitForSelector('.result');
  const text = await page.textContent('.result');

} finally {
  if (browser) await browser.close();
}
```

### Dual-Browser Testing

Run the same test in both browsers for cross-browser validation:

```typescript
import { chromium, firefox, type BrowserType } from 'playwright';

async function runTest(browserType: BrowserType) {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    // ... test code ...
    console.log(`${browserType.name()}: PASS`);
  } finally {
    await browser.close();
  }
}

// Run in both browsers
for (const browserType of [chromium, firefox]) {
  await runTest(browserType);
}
```

### Check Element Visibility

```typescript
const isVisible = await page.isVisible('.my-element');
const count = await page.locator('.list-item').count();
```

## Headless vs Headful Mode

### When to Use Headful Mode (`headless: false`)

Use headful mode for interactions that require full GPU/WebGL support:

- **WebGL/Three.js/Canvas interactions** - Scroll-based zoom, raycasting, click detection on 3D meshes
- **Drag operations** - Complex drag-and-drop, canvas drawing
- **Scroll interactions** - Scroll-to-zoom, infinite scroll testing
- **Visual debugging** - When you need to see what's happening

### When Headless Mode is Fine (`headless: true`)

Headless works reliably for standard DOM interactions:

- **Screenshots** - Static page captures
- **Form filling** - Input fields, dropdowns, checkboxes
- **Button clicks** - Standard DOM button elements
- **Text extraction** - Reading page content
- **Navigation** - Page loads, redirects
- **Basic assertions** - Element visibility, counts

### User Override

If the user explicitly requests headless or headful mode, follow their preference.

## Common Commands

```bash
# Kill existing browsers first
pkill -f chromium || true
pkill -f firefox || true

# Install browsers
npx playwright install chromium firefox
# or with bun
bunx playwright install chromium firefox

# Run a test script (FOREGROUND only, not background)
npx tsx scripts/screenshot.ts
# or with bun
bun run scripts/screenshot.ts
```

## Important Rules Summary

1. **Never run multiple browsers** - Kill existing processes before launching new one
2. **Always use try/finally** - Browser must close even on error
3. **Run in foreground** - Do not use `run_in_background: true` for Playwright scripts
4. **Add delays between actions** - 100-300ms depending on operation type
5. **Set reasonable timeouts** - 10-15s default, shorter for simple operations
6. **Save screenshots to `tmp/`** - This directory should be gitignored
7. **Use `viewport: null` for headful** - Matches browser window size
8. **Use `--start-maximized`** - Full screen in headful mode
9. **Default to Chromium** - Use Firefox for variety (~20%) or cross-browser testing
