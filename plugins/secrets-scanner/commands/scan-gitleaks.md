# Scan Repository with Gitleaks

Scan the current repository for leaked secrets using gitleaks.

## Prerequisites Check

1. Check if gitleaks is installed:
   ```bash
   gitleaks version
   ```

2. If not installed, offer installation options:
   - **macOS (Homebrew)**: `brew install gitleaks`
   - **Docker**: `docker pull zricethezav/gitleaks:latest`
   - **Binary**: Download from https://github.com/gitleaks/gitleaks/releases

## Scanning Options

### Basic Scan (Current Directory)
```bash
gitleaks git -v
```

### Scan Specific Directory
```bash
gitleaks dir -v /path/to/directory
```

### Scan Git History
```bash
gitleaks git -v --log-opts="--all"
```

### Generate JSON Report
```bash
gitleaks git -v --report-format json --report-path gitleaks-report.json
```

### Generate SARIF Report (for GitHub Security tab)
```bash
gitleaks git -v --report-format sarif --report-path gitleaks-report.sarif
```

### Scan with Baseline (only new findings)
```bash
# First create baseline
gitleaks git --report-path baseline.json

# Then compare against it
gitleaks git --baseline-path baseline.json --report-path new-findings.json
```

## Configuration

Gitleaks looks for configuration in this order:
1. `--config` CLI flag
2. `GITLEAKS_CONFIG` environment variable (path)
3. `GITLEAKS_CONFIG_TOML` environment variable (content)
4. `.gitleaks.toml` in target directory
5. Built-in default rules

### Example .gitleaks.toml
```toml
title = "Custom Gitleaks Config"

[extend]
useDefault = true

[[rules]]
id = "custom-api-key"
description = "Custom API Key"
regex = '''(?i)my_api_key\s*=\s*['"]?([a-zA-Z0-9]{32,})['"]?'''
keywords = ["my_api_key"]

[allowlist]
paths = [
  '''\.env\.example$''',
  '''test/.*''',
  '''.*_test\.go$'''
]
```

## Key Flags Reference

| Flag | Description |
|------|-------------|
| `-v, --verbose` | Show detailed output |
| `-c, --config` | Custom config file path |
| `-f, --report-format` | Output format (json, csv, junit, sarif) |
| `-r, --report-path` | Save report to file |
| `-b, --baseline-path` | Compare against baseline |
| `--redact` | Redact secrets in output (0-100) |
| `--exit-code` | Exit code when secrets found (default: 1) |
| `--no-git` | Treat as plain directory |
| `-l, --log-level` | Log level (trace, debug, info, warn, error) |

## Execution Steps

1. Verify gitleaks is installed and accessible
2. Check if `.gitleaks.toml` exists in the repository for custom configuration
3. Run the scan based on user requirements (basic, with history, with report)
4. Parse and present findings clearly
5. Suggest remediation for any secrets found
6. If secrets found, recommend:
   - Rotating compromised credentials immediately
   - Adding patterns to `.gitleaks.toml` allowlist if false positives
   - Setting up pre-commit hooks to prevent future leaks
