# Scan Repository with TruffleHog

Scan the current repository for leaked secrets using TruffleHog.

## Prerequisites Check

1. Check if trufflehog is installed:
   ```bash
   trufflehog --version
   ```

2. If not installed, offer installation options:
   - **macOS (Homebrew)**: `brew install trufflehog`
   - **Docker**: `docker pull trufflesecurity/trufflehog:latest`
   - **Binary**: Download from https://github.com/trufflesecurity/trufflehog/releases
   - **Install script**:
     ```bash
     curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin
     ```

## Scanning Options

### Scan Local Git Repository
```bash
trufflehog git file://. --json
```

### Scan with Only Verified Secrets
```bash
trufflehog git file://. --only-verified
```

### Scan Remote Repository
```bash
trufflehog git https://github.com/owner/repo.git
```

### Scan Specific Branch
```bash
trufflehog git file://. --branch main
```

### Scan Since Specific Commit
```bash
trufflehog git file://. --since-commit abc1234
```

### Scan Directory (Non-Git)
```bash
trufflehog filesystem /path/to/directory
```

### Scan GitHub Organization
```bash
trufflehog github --org=organization-name --token=$GITHUB_TOKEN
```

### Scan S3 Bucket
```bash
trufflehog s3 --bucket=bucket-name
```

### Scan Docker Image
```bash
trufflehog docker --image=registry/image:tag
```

## Output Options

### JSON Output (Recommended for CI)
```bash
trufflehog git file://. --json > trufflehog-report.json
```

### Only Show Verified Secrets
```bash
trufflehog git file://. --only-verified
```

### Results Filter Options
```bash
# Only verified secrets
trufflehog git file://. --results=verified

# Verified + unknown (high confidence)
trufflehog git file://. --results=verified,unknown
```

### CI/CD Exit Code
```bash
# Exit with code 183 if secrets found
trufflehog git file://. --fail
```

## Advanced Options

### Exclude Paths
```bash
trufflehog git file://. --exclude-paths=exclude-patterns.txt
```

### Include Paths
```bash
trufflehog git file://. --include-paths=include-patterns.txt
```

### Concurrency
```bash
trufflehog git file://. --concurrency=10
```

### Scan GitHub Issues/PRs
```bash
trufflehog github --repo=owner/repo --issue-comments --pr-comments --token=$GITHUB_TOKEN
```

## Supported Secret Types

TruffleHog can detect 800+ secret types including:
- AWS credentials (Access Keys, Secret Keys)
- GCP service account keys
- Azure credentials
- GitHub tokens
- Slack tokens
- Stripe API keys
- Database connection strings
- Private keys (RSA, SSH, PGP)
- API keys for hundreds of services

## Verification Feature

TruffleHog can **verify** if discovered secrets are still active by:
1. Testing against the service's API
2. Checking if credentials authenticate successfully
3. Reporting verification status (verified/unverified)

This is a unique feature that distinguishes TruffleHog from pattern-only scanners.

## Key Flags Reference

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--only-verified` | Only show verified (active) secrets |
| `--results` | Filter results (verified, unknown, unverified) |
| `--fail` | Exit code 183 if secrets found |
| `--branch` | Scan specific branch |
| `--since-commit` | Scan since commit |
| `--exclude-paths` | File with paths to exclude |
| `--include-paths` | File with paths to include |
| `--concurrency` | Number of concurrent workers |
| `--no-verification` | Disable secret verification |

## Execution Steps

1. Verify trufflehog is installed
2. Determine the scan target (local repo, remote, filesystem)
3. Choose appropriate scan mode:
   - Quick scan: `--only-verified` for confirmed active secrets
   - Full scan: Default for all potential secrets
4. Run the scan with JSON output for detailed analysis
5. Parse and present findings, highlighting:
   - Verified secrets (highest priority - currently active!)
   - Unknown verification status
   - Unverified secrets (may be false positives or rotated)
6. For verified secrets:
   - URGENT: These are confirmed active credentials
   - Rotate immediately
   - Check for unauthorized access
   - Review access logs

## Docker Usage

```bash
# Scan current directory
docker run --rm -v "$(pwd):/repo" trufflesecurity/trufflehog:latest git file:///repo

# Scan with verification
docker run --rm -v "$(pwd):/repo" trufflesecurity/trufflehog:latest git file:///repo --only-verified
```
