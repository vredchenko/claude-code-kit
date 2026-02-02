# Gitleaks CLI Reference

> Source: https://github.com/gitleaks/gitleaks
> Latest Version: v8.30.0 (November 2025)
> License: MIT

## Overview

Gitleaks is a SAST tool for detecting hardcoded secrets like passwords, API keys, and tokens in git repositories, files, and stdin.

## Installation

```bash
# macOS
brew install gitleaks

# Docker
docker pull zricethezav/gitleaks:latest

# Binary (Linux x64)
curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.30.0/gitleaks_8.30.0_linux_x64.tar.gz | tar -xz -C /usr/local/bin gitleaks
```

## Commands

### gitleaks git

Scan git repositories using git log history.

```
gitleaks git [flags]
```

**Flags:**
- `--log-opts <string>` - Git log options (e.g., `--all`, `--since=2023-01-01`)
- `--pre-commit` - Scan staged changes only (for pre-commit hooks)
- `--staged` - Alias for --pre-commit

### gitleaks dir (aliases: files, directory)

Scan directories and files.

```
gitleaks dir [path] [flags]
```

**Flags:**
- `--no-git` - Treat directory as plain files (not a git repo)
- `--follow-symlinks` - Follow symbolic links

### gitleaks stdin

Scan content from standard input.

```
echo "secret=AKIAIOSFODNN7EXAMPLE" | gitleaks stdin
```

## Global Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--config` | `-c` | Path to config file |
| `--exit-code` | | Exit code when leaks found (default: 1) |
| `--report-format` | `-f` | Output format: json, csv, junit, sarif |
| `--report-path` | `-r` | Path to save report |
| `--baseline-path` | `-b` | Path to baseline file for comparison |
| `--verbose` | `-v` | Show verbose output |
| `--redact` | | Redact secrets (0-100, percentage) |
| `--no-banner` | | Suppress banner |
| `--log-level` | `-l` | Log level: trace, debug, info, warn, error, fatal |
| `--max-target-megabytes` | | Skip files larger than this |

## Configuration File (.gitleaks.toml)

```toml
title = "Gitleaks Config"

# Extend default rules
[extend]
useDefault = true

# Custom rule
[[rules]]
id = "custom-secret"
description = "Custom Secret Pattern"
regex = '''(?i)my_secret_key\s*=\s*['"]?([a-zA-Z0-9]{32})['"]?'''
keywords = ["my_secret_key"]
entropy = 3.5
secretGroup = 1

# Rule-specific allowlist
[[rules]]
id = "generic-password"
regex = '''password\s*=\s*['"]([^'"]+)['"]'''
  [rules.allowlist]
  paths = ['''test/.*''']
  regexes = ['''password123''', '''testpassword''']

# Global allowlist
[allowlist]
description = "Global Allowlist"
paths = [
  '''\.env\.example$''',
  '''test/.*''',
  '''docs/.*'''
]
commits = ["abc123"]  # Ignore specific commits
regexes = ['''EXAMPLE_.*''']  # Ignore matching content
```

## Common Usage Examples

```bash
# Basic scan of current repo
gitleaks git -v

# Scan with JSON report
gitleaks git -v --report-format json --report-path report.json

# Scan directory (not git)
gitleaks dir /path/to/files --no-git

# Scan with custom config
gitleaks git -v --config .gitleaks.toml

# Scan only new issues (baseline comparison)
gitleaks git --baseline-path baseline.json --report-path new.json

# Scan staged changes (pre-commit)
gitleaks git --pre-commit -v

# Generate SARIF for GitHub Security
gitleaks git --report-format sarif --report-path results.sarif

# Scan all branches
gitleaks git -v --log-opts="--all"

# Redact secrets in output
gitleaks git -v --redact=100
```

## Exit Codes

- `0` - No leaks found
- `1` - Leaks found (or error, configurable via --exit-code)

## Environment Variables

- `GITLEAKS_CONFIG` - Path to config file
- `GITLEAKS_CONFIG_TOML` - Config content as string

## Pre-commit Integration

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.30.0
    hooks:
      - id: gitleaks
```

## GitHub Action

```yaml
- uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Resources

- Repository: https://github.com/gitleaks/gitleaks
- Releases: https://github.com/gitleaks/gitleaks/releases
- GitHub Action: https://github.com/gitleaks/gitleaks-action
- Documentation: https://gitleaks.io
- Playground: https://gitleaks.io/playground
