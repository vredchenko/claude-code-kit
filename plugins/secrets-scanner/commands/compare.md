# Compare Secrets Scanning Tools

Provide a detailed comparison of gitleaks, git-secrets, and TruffleHog to help choose the right tool.

## Quick Comparison Table

| Feature | Gitleaks | git-secrets | TruffleHog |
|---------|----------|-------------|------------|
| **License** | MIT | Apache 2.0 | AGPL-3.0 |
| **Language** | Go | Bash | Go |
| **Secret Verification** | No | No | Yes (unique!) |
| **Built-in Patterns** | 100+ | AWS-focused | 800+ |
| **Custom Rules** | TOML config | Git config | Limited |
| **Pre-commit Hook** | Yes | Yes (native) | Manual |
| **GitHub Action** | Official | Community | Official |
| **SARIF Output** | Yes | No | No |
| **Git History Scan** | Yes | Yes | Yes |
| **Non-Git Scan** | Yes | Limited | Yes |
| **Cloud Source Scan** | No | No | Yes (S3, GCS) |
| **Docker Image Scan** | No | No | Yes |
| **Installation** | Single binary | make install | Single binary |
| **Active Development** | Very active | Moderate | Very active |
| **Latest Version** | v8.30.0 | N/A | v3.92.5 |

## Detailed Comparison

### Gitleaks

**Best for:** General-purpose secret scanning with high customizability

**Pros:**
- Extensive built-in rules for common secret types
- Highly customizable via TOML configuration
- Excellent CI/CD integration (GitHub Action, SARIF support)
- Composite rules for multi-part secrets (v8.28+)
- Baseline support for tracking new vs. known issues
- Active community and regular updates
- MIT license - most permissive

**Cons:**
- No secret verification (can't confirm if secrets are active)
- Regex-based detection may miss encoded secrets
- Configuration can become complex for large rule sets

**Ideal Use Cases:**
- CI/CD pipelines with GitHub Actions
- Organizations needing custom detection rules
- Projects requiring SARIF integration with GitHub Security

### git-secrets

**Best for:** AWS-focused projects, simple pattern blocking

**Pros:**
- Native git hook integration (blocks commits)
- Pre-configured AWS credential patterns
- Lightweight, shell-based (minimal dependencies)
- Template support for organization-wide deployment
- Works offline without external dependencies

**Cons:**
- AWS-focused, limited built-in patterns for other services
- Requires manual setup per repository
- No verification of found secrets
- Pattern management can be cumbersome at scale
- Less active development than alternatives

**Ideal Use Cases:**
- AWS-heavy environments
- Teams wanting commit-time blocking
- Environments with limited tooling (shell-based)

### TruffleHog

**Best for:** Comprehensive scanning with verification, cloud sources

**Pros:**
- **Secret verification** - confirms if credentials are active (unique!)
- 800+ detector types for various services
- Scans cloud sources (S3, GCS, GitHub orgs)
- Docker image scanning capability
- High accuracy due to verification
- Enterprise version available

**Cons:**
- AGPL license may be restrictive for some organizations
- Verification requires network access
- Less customizable than gitleaks
- Verification can slow down scans

**Ideal Use Cases:**
- Incident response (need to know which secrets are active)
- Organizations with cloud storage to scan
- Teams needing highest accuracy (verified results)

## Recommendation Matrix

| Scenario | Recommended Tool |
|----------|------------------|
| Quick CI/CD setup | Gitleaks |
| AWS-centric project | git-secrets |
| Need to verify active secrets | TruffleHog |
| Custom detection rules needed | Gitleaks |
| Pre-commit blocking | git-secrets |
| Scan S3/GCS buckets | TruffleHog |
| GitHub Security integration | Gitleaks (SARIF) |
| Minimal dependencies | git-secrets |
| Docker image scanning | TruffleHog |
| Enterprise with support | TruffleHog Enterprise |

## Combined Strategy Recommendation

For maximum security, consider a layered approach:

1. **Pre-commit**: git-secrets (blocks commits with secrets)
2. **CI/CD**: Gitleaks (comprehensive scan with SARIF)
3. **Periodic Audit**: TruffleHog (verification of active secrets)

## Execution Steps

When user asks for comparison:

1. Present the quick comparison table
2. Ask about their specific needs:
   - Primary cloud provider (AWS, GCP, Azure)?
   - Need for secret verification?
   - CI/CD platform in use?
   - License restrictions?
3. Provide tailored recommendation based on needs
4. Offer to help install and configure the recommended tool(s)

## Resource Links

### Gitleaks
- Repository: https://github.com/gitleaks/gitleaks
- Releases: https://github.com/gitleaks/gitleaks/releases
- Documentation: https://gitleaks.io
- GitHub Action: https://github.com/gitleaks/gitleaks-action

### git-secrets
- Repository: https://github.com/awslabs/git-secrets
- AWS Security Blog: Search "git-secrets" on aws.amazon.com/blogs/security

### TruffleHog
- Repository: https://github.com/trufflesecurity/trufflehog
- Releases: https://github.com/trufflesecurity/trufflehog/releases
- Documentation: https://trufflesecurity.com/trufflehog
- Enterprise: https://trufflesecurity.com
