# git-secrets CLI Reference

> Source: https://github.com/awslabs/git-secrets
> Maintainer: AWS Labs
> License: Apache 2.0

## Overview

git-secrets prevents committing secrets and credentials into git repositories. It installs git hooks that scan commits, commit messages, and merges for prohibited patterns.

## Installation

```bash
# macOS
brew install git-secrets

# Linux/macOS from source
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install

# Windows (PowerShell)
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
./install.ps1
```

## Initial Setup (Required)

```bash
# Install hooks in current repository
git secrets --install

# Register AWS patterns
git secrets --register-aws
```

## Commands

### --install

Install git hooks into a repository.

```bash
git secrets --install [<target-directory>]
```

**Options:**
- `-f, --force` - Overwrite existing hooks

### --scan

Scan files for secrets.

```bash
git secrets --scan [options] [<files>...]
```

**Options:**
- `-r, --recursive` - Scan directories recursively
- `--cached` - Scan staged changes
- `--no-index` - Scan untracked files
- `--untracked` - Scan untracked files

### --scan-history

Scan entire git history for secrets.

```bash
git secrets --scan-history
```

### --list

List all registered patterns.

```bash
git secrets --list
```

### --add

Add a prohibited pattern.

```bash
git secrets --add [options] <pattern>
```

**Options:**
- `--global` - Add to global config
- `--literal` - Treat pattern as literal string (not regex)
- `--allowed` - Add as allowed pattern (whitelist)

### --add-provider

Add a secret provider (script that outputs patterns).

```bash
git secrets --add-provider -- <command>
```

### --register-aws

Register AWS credential patterns.

```bash
git secrets --register-aws [--global]
```

### --aws-provider

Output AWS credential patterns (used as a provider).

```bash
git secrets --aws-provider
```

## Pattern Management

### Add Prohibited Pattern
```bash
# Local (current repo)
git secrets --add 'password\s*=\s*['\''"]'

# Global (all repos)
git secrets --add --global 'PRIVATE[_-]?KEY'
```

### Add Allowed Pattern (Whitelist)
```bash
# Allow example credentials
git secrets --add --allowed 'AKIAIOSFODNN7EXAMPLE'

# Allow test files
git secrets --add --allowed '\.test\.[jt]s$'
```

### Add Literal String
```bash
git secrets --add --literal 'sk_test_abc123'
```

### Remove Patterns
```bash
# Edit git config directly
git config --unset secrets.patterns '<pattern>'
```

## AWS Patterns

After `--register-aws`, these patterns are active:

```
# Access Key ID
(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}

# Secret patterns from aws-provider
```

## Configuration Storage

Patterns are stored in git config:

```bash
# View patterns
git config --get-all secrets.patterns

# View allowed
git config --get-all secrets.allowed

# View providers
git config --get-all secrets.providers
```

## Template Setup (Auto-Install in New Repos)

```bash
# Create template directory
git secrets --install ~/.git-templates/git-secrets

# Set as default template
git config --global init.templateDir ~/.git-templates/git-secrets

# Now all new repos will have git-secrets hooks
```

## Common Usage Examples

```bash
# Initial setup
git secrets --install
git secrets --register-aws

# Scan current directory
git secrets --scan

# Scan specific files
git secrets --scan config.js .env

# Scan recursively
git secrets --scan -r src/

# Scan entire history
git secrets --scan-history

# Add custom pattern
git secrets --add 'my_company_key_[a-z0-9]{32}'

# Allow false positive
git secrets --add --allowed 'example_api_key_12345'

# List all patterns
git secrets --list
```

## Git Hooks Installed

- `pre-commit` - Scans staged changes before commit
- `commit-msg` - Scans commit message
- `prepare-commit-msg` - Validates merge commits

## Bypassing (Emergency Only)

```bash
# Skip hooks for single commit (NOT RECOMMENDED)
git commit --no-verify -m "message"
```

## Integration with CI

```yaml
# GitHub Actions example
jobs:
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install git-secrets
        run: |
          git clone https://github.com/awslabs/git-secrets.git
          cd git-secrets && sudo make install

      - name: Scan for secrets
        run: |
          git secrets --install
          git secrets --register-aws
          git secrets --scan
```

## Limitations

- Pattern-based detection (regex), may miss obfuscated secrets
- Requires manual setup per repository (unless using templates)
- AWS-focused, limited built-in patterns for other services
- Cannot verify if found secrets are active

## Resources

- Repository: https://github.com/awslabs/git-secrets
- AWS Blog: https://aws.amazon.com/blogs/security (search "git-secrets")
