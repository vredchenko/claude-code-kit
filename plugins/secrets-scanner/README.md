# Secrets Scanner Plugin

Detect leaked secrets and credentials in your codebase using three industry-leading tools: **gitleaks**, **git-secrets**, and **TruffleHog**.

## Overview

This plugin provides comprehensive knowledge and capabilities for:
- Scanning repositories for leaked secrets locally
- Setting up CI/CD pipelines to guard against secret leaks
- Comparing and choosing the right tool for your needs
- Configuring custom detection rules and allowlists

## Supported Tools

| Tool | Maintainer | License | Key Feature |
|------|------------|---------|-------------|
| [gitleaks](https://github.com/gitleaks/gitleaks) | gitleaks | MIT | Highly customizable, SARIF output |
| [git-secrets](https://github.com/awslabs/git-secrets) | AWS Labs | Apache 2.0 | Native git hooks, AWS patterns |
| [TruffleHog](https://github.com/trufflesecurity/trufflehog) | TruffleSecurity | AGPL-3.0 | **Secret verification** (unique!) |

## Commands

| Command | Description |
|---------|-------------|
| `/secrets-scanner:scan-gitleaks` | Scan repository with gitleaks |
| `/secrets-scanner:scan-git-secrets` | Scan repository with git-secrets |
| `/secrets-scanner:scan-trufflehog` | Scan repository with TruffleHog |
| `/secrets-scanner:scan-all` | Scan with all three tools for maximum coverage |
| `/secrets-scanner:compare` | Compare tools to help choose the right one |
| `/secrets-scanner:ci-setup` | Set up GitHub Actions for secrets scanning |
| `/secrets-scanner:install` | Install the scanning tools |
| `/secrets-scanner:configure` | Configure custom rules and allowlists |

## Quick Start

### 1. Install a Tool

```bash
# macOS (any tool)
brew install gitleaks git-secrets trufflehog

# Or use the install command
/secrets-scanner:install
```

### 2. Scan Your Repository

```bash
# Quick scan with gitleaks
gitleaks git -v

# Scan with TruffleHog (only verified/active secrets)
trufflehog git file://. --only-verified

# Scan with git-secrets (requires setup first)
git secrets --install && git secrets --register-aws
git secrets --scan
```

### 3. Set Up CI/CD

Use `/secrets-scanner:ci-setup` to create a GitHub Actions workflow:

```yaml
# .github/workflows/secrets-scan.yml
name: Secrets Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Tool Comparison

### When to Use Each Tool

| Use Case | Recommended Tool |
|----------|------------------|
| General CI/CD scanning | **gitleaks** |
| AWS-focused projects | **git-secrets** |
| Need to verify if secrets are active | **TruffleHog** |
| Pre-commit blocking | **git-secrets** |
| Custom detection rules | **gitleaks** |
| Scan cloud storage (S3, GCS) | **TruffleHog** |
| GitHub Security integration (SARIF) | **gitleaks** |

### Feature Comparison

| Feature | gitleaks | git-secrets | TruffleHog |
|---------|----------|-------------|------------|
| Secret Verification | No | No | **Yes** |
| Built-in Patterns | 100+ | AWS-focused | 800+ |
| Custom Rules | TOML | Git config | Limited |
| SARIF Output | Yes | No | No |
| Pre-commit Hook | Yes | Native | Manual |
| Cloud Scanning | No | No | Yes |
| Docker Scanning | No | No | Yes |

## Documentation

Detailed reference documentation for each tool is available in the `docs/` directory:

- [gitleaks-reference.md](docs/gitleaks-reference.md) - Complete CLI reference
- [git-secrets-reference.md](docs/git-secrets-reference.md) - Complete CLI reference
- [trufflehog-reference.md](docs/trufflehog-reference.md) - Complete CLI reference

## Recommended Security Strategy

For maximum protection, use a layered approach:

1. **Pre-commit** (Developer machine)
   - Use **git-secrets** for blocking commits
   - Or gitleaks pre-commit hook

2. **CI/CD** (Pull requests)
   - Use **gitleaks** with SARIF for GitHub Security tab
   - Blocks merging PRs with detected secrets

3. **Periodic Audits** (Scheduled)
   - Use **TruffleHog** with `--only-verified`
   - Find active credentials that need rotation

## Configuration Examples

### gitleaks (.gitleaks.toml)

```toml
[extend]
useDefault = true

[allowlist]
paths = ['''\.env\.example$''', '''test/.*''']
```

### git-secrets

```bash
git secrets --add 'my_pattern'
git secrets --add --allowed 'false_positive'
```

### TruffleHog

```bash
# Exclude paths
echo "test/" > exclude.txt
trufflehog git file://. --exclude-paths=exclude.txt
```

## Resources

### Repositories
- https://github.com/gitleaks/gitleaks
- https://github.com/awslabs/git-secrets
- https://github.com/trufflesecurity/trufflehog

### Release Pages
- https://github.com/gitleaks/gitleaks/releases (v8.30.0)
- https://github.com/trufflesecurity/trufflehog/releases (v3.92.5)

### GitHub Actions
- https://github.com/gitleaks/gitleaks-action
- https://github.com/trufflesecurity/trufflehog (action in repo)

### Documentation
- https://gitleaks.io
- https://trufflesecurity.com/trufflehog

## Version Information

| Tool | Latest Version | Updated |
|------|----------------|---------|
| gitleaks | v8.30.0 | November 2025 |
| git-secrets | N/A | Ongoing |
| trufflehog | v3.92.5 | January 2025 |

## License

This plugin documentation is provided under MIT license. The individual tools have their own licenses:
- gitleaks: MIT
- git-secrets: Apache 2.0
- TruffleHog: AGPL-3.0
