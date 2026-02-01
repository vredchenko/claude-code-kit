# Take Screenshot

Quickly capture a screenshot of a web page using Playwright.

## Pre-Execution

Before running, kill any existing browser processes:

```bash
pkill -f chromium || true
pkill -f firefox || true
```

## Script Template

Create a temporary script or use inline execution:

```typescript
import { chromium } from 'playwright';

async function screenshot() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    // Navigate to target URL
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);  // Let page settle

    // Take screenshot
    await page.screenshot({
      path: 'tmp/screenshot.png',
      fullPage: true
    });

    console.log('Screenshot saved to tmp/screenshot.png');
  } finally {
    await browser.close();
  }
}

screenshot().catch(console.error);
```

## Options

Ask the user for:
- **URL**: The page to screenshot (default: `http://localhost:5173`)
- **Output path**: Where to save (default: `tmp/screenshot.png`)
- **Full page**: Capture entire scrollable page or just viewport

## Screenshot Variants

### Viewport Only
```typescript
await page.screenshot({ path: 'tmp/screenshot.png' });
```

### Full Page (Scrollable)
```typescript
await page.screenshot({ path: 'tmp/screenshot.png', fullPage: true });
```

### Specific Element
```typescript
const element = page.locator('.my-component');
await element.screenshot({ path: 'tmp/component.png' });
```

## Important

- **Run in foreground** - Do NOT use `run_in_background: true`
- **Save to `tmp/`** - This directory should be gitignored
- **Always close browser** - Use try/finally pattern
- After taking the screenshot, read the image file to view it
