# Initialize Playwright

Set up Playwright browser automation in the current project.

## Steps

### 1. Detect Project Type

Check for package manager:
- If `bun.lockb` exists: use `bun`
- If `package-lock.json` exists: use `npm`
- Otherwise: ask the user which to use

### 2. Install Playwright

```bash
# npm
npm install -D playwright

# bun
bun add -d playwright
```

### 3. Install Browsers

Install Chromium and Firefox (the recommended browsers for testing):

```bash
# npm
npx playwright install chromium firefox

# bun
bunx playwright install chromium firefox
```

### 4. Create playwright.config.ts

Create a configuration file with best practices:

```typescript
import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
});
```

### 5. Set Up Directory Structure

Create necessary directories:

```bash
mkdir -p tests
mkdir -p tmp  # For screenshots (should be gitignored)
```

Add `tmp/` to `.gitignore` if not already present.

### 6. Create Example Script

Create `scripts/screenshot.ts` as a starting point:

```typescript
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tmp/screenshot.png', fullPage: true });
    console.log('Screenshot saved to tmp/screenshot.png');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
```

### 7. Add Package Scripts (Optional)

Suggest adding to `package.json`:

```json
{
  "scripts": {
    "playwright:install": "playwright install chromium firefox",
    "test:e2e": "playwright test"
  }
}
```

## User Preferences to Ask

Before starting, ask the user:
1. Base URL for testing (default: `http://localhost:5173`)
2. Whether to create example test files
3. Whether to install both Chromium and Firefox (recommended) or just Chromium
