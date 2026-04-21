# Run Playwright Automation

Execute a Playwright automation script with proper browser management.

## Pre-Execution Checklist

Before running any Playwright script:

### 1. Kill Existing Browsers

```bash
pkill -f chromium || true
pkill -f firefox || true
```

### 2. Verify Foreground Mode

**CRITICAL**: Never run Playwright scripts in background mode.

- Do NOT use `run_in_background: true` in Bash tool
- Browser automation must run in the foreground to work reliably

### 3. Check Script Structure

Ensure the script follows best practices:
- Uses try/finally for browser cleanup
- Has reasonable timeouts (10-15s default)
- Includes delays between actions (100-300ms)

## Script Execution

### With npm/npx

```bash
# Kill browsers first
pkill -f chromium || true; pkill -f firefox || true

# Run the script
npx tsx scripts/your-script.ts
```

### With Bun

```bash
# Kill browsers first
pkill -f chromium || true; pkill -f firefox || true

# Run the script
bun run scripts/your-script.ts
```

## Post-Execution

### Check for Orphaned Processes

If a script fails or hangs, clean up:

```bash
pkill -f chromium || true
pkill -f firefox || true
```

### View Screenshots

If the script saved screenshots to `tmp/`, read the image file to view it.

## Troubleshooting

### Script Hangs

1. Kill the script (Ctrl+C)
2. Kill browser processes: `pkill -f chromium; pkill -f firefox`
3. Check for missing `await` statements
4. Reduce timeouts to catch hangs faster

### Browser Won't Launch

1. Ensure browsers are installed: `npx playwright install chromium firefox`
2. Check for existing processes: `pgrep -f chromium`
3. Kill all instances and retry

### Element Not Found

1. Add `waitForSelector` before interacting
2. Check if element is in iframe
3. Use `page.pause()` in headful mode to debug

## Common Patterns

### Wait for Network Idle

```typescript
await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');
```

### Wait for Specific Element

```typescript
await page.waitForSelector('.my-element', { timeout: 10000 });
```

### Retry on Failure

```typescript
for (let i = 0; i < 3; i++) {
  try {
    await page.click('button');
    break;
  } catch {
    await page.waitForTimeout(500);
  }
}
```
