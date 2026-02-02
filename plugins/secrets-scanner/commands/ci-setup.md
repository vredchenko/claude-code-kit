# Setup CI/CD for Secrets Scanning

Configure GitHub Actions to automatically scan for leaked secrets on every push and PR.

## Choose Your Approach

1. **Gitleaks Action** (Recommended) - Official action, SARIF support
2. **TruffleHog Action** - Verification capability
3. **Multi-tool Setup** - Maximum coverage

## Option 1: Gitleaks GitHub Action

### Basic Setup

Create `.github/workflows/secrets-scan.yml`:

```yaml
name: Secrets Scan

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:
  schedule:
    - cron: '0 4 * * *'  # Daily at 4 AM UTC

jobs:
  gitleaks:
    name: Gitleaks Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for scanning

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### With SARIF Upload (GitHub Security Tab)

```yaml
name: Secrets Scan

on:
  push:
    branches: [main, master]
  pull_request:
  workflow_dispatch:

jobs:
  gitleaks:
    name: Gitleaks Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

### With Custom Configuration

```yaml
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_CONFIG: .gitleaks.toml
          GITLEAKS_ENABLE_COMMENTS: true
```

## Option 2: TruffleHog GitHub Action

```yaml
name: TruffleHog Secrets Scan

on:
  push:
    branches: [main, master]
  pull_request:
  workflow_dispatch:

jobs:
  trufflehog:
    name: TruffleHog Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

### With Full Options

```yaml
      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --results=verified,unknown
```

## Option 3: Multi-Tool Setup

Maximum coverage with all three tools:

```yaml
name: Comprehensive Secrets Scan

on:
  push:
    branches: [main, master]
  pull_request:
  workflow_dispatch:
  schedule:
    - cron: '0 4 * * *'

jobs:
  gitleaks:
    name: Gitleaks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  trufflehog:
    name: TruffleHog
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

  git-secrets:
    name: git-secrets
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install git-secrets
        run: |
          git clone https://github.com/awslabs/git-secrets.git
          cd git-secrets
          sudo make install

      - name: Configure git-secrets
        run: |
          git secrets --install
          git secrets --register-aws

      - name: Scan for secrets
        run: git secrets --scan
```

## Pre-commit Hook Setup

For local development, add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.30.0
    hooks:
      - id: gitleaks
```

Install with:
```bash
pip install pre-commit
pre-commit install
```

## Baseline Configuration

Create `.gitleaks.toml` for custom rules:

```toml
title = "Project Gitleaks Config"

[extend]
useDefault = true

[allowlist]
description = "Allowed patterns"
paths = [
  '''\.env\.example$''',
  '''test/fixtures/.*''',
  '''.*_test\.go$''',
  '''.*\.test\.js$'''
]

# Block commits with these patterns
[[rules]]
id = "custom-internal-key"
description = "Internal API Key"
regex = '''INTERNAL_API_KEY\s*=\s*['"]?([a-zA-Z0-9]{32,})['"]?'''
keywords = ["INTERNAL_API_KEY"]
```

## Execution Steps

1. Ask which approach the user prefers:
   - Quick setup (Gitleaks only)
   - Verified secrets (TruffleHog)
   - Maximum coverage (all three)

2. Create the workflow file:
   - Check if `.github/workflows/` exists
   - Create appropriate workflow YAML

3. Optionally create configuration:
   - `.gitleaks.toml` for custom rules
   - `.pre-commit-config.yaml` for local hooks

4. Provide testing instructions:
   ```bash
   # Test locally before committing
   act -j gitleaks  # if using 'act' for local GitHub Actions
   # Or push to trigger workflow
   ```

5. Explain next steps:
   - Monitor Actions tab for results
   - Check Security tab for SARIF findings (if enabled)
   - Adjust allowlist for false positives

## Branch Protection (Optional)

Recommend enabling branch protection:

1. Go to Settings > Branches > Add rule
2. Enable "Require status checks to pass"
3. Add the secrets scan job as required

This prevents merging PRs that contain detected secrets.

## Troubleshooting

**"No secrets found" but known secrets exist:**
- Ensure `fetch-depth: 0` for full history
- Check if secrets are in allowlist
- Verify branch being scanned

**Action fails on organization repos (Gitleaks):**
- Organizations need a free license from gitleaks.io
- Set `GITLEAKS_LICENSE` secret

**Too many false positives:**
- Add patterns to allowlist
- Use `--only-verified` with TruffleHog
- Customize rules in `.gitleaks.toml`
