# TruffleHog CLI Reference

> Source: https://github.com/trufflesecurity/trufflehog
> Latest Version: v3.92.5 (January 2025)
> License: AGPL-3.0

## Overview

TruffleHog finds, verifies, and analyzes leaked credentials. It supports 800+ secret types and can verify if discovered credentials are still active.

## Installation

```bash
# macOS
brew install trufflehog

# Install script
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

# Docker
docker pull trufflesecurity/trufflehog:latest

# Binary (Linux amd64)
curl -sSfL https://github.com/trufflesecurity/trufflehog/releases/download/v3.92.5/trufflehog_3.92.5_linux_amd64.tar.gz | tar -xz -C /usr/local/bin
```

## Commands

### git

Scan git repositories.

```bash
trufflehog git [options] <url>
```

**URL formats:**
- `file://.` - Local repository
- `https://github.com/owner/repo.git` - Remote via HTTPS
- `git@github.com:owner/repo.git` - Remote via SSH

### filesystem

Scan directories/files (non-git).

```bash
trufflehog filesystem [options] <path>
```

### github

Scan GitHub organizations/repositories.

```bash
trufflehog github [options]
```

**Options:**
- `--org=<org>` - Scan organization
- `--repo=<owner/repo>` - Scan specific repo
- `--token=<token>` - GitHub token (or GITHUB_TOKEN env)
- `--issue-comments` - Include issue comments
- `--pr-comments` - Include PR comments
- `--gists` - Include gists

### s3

Scan AWS S3 buckets.

```bash
trufflehog s3 [options]
```

**Options:**
- `--bucket=<name>` - Bucket name
- `--role-arn=<arn>` - IAM role for access

### gcs

Scan Google Cloud Storage.

```bash
trufflehog gcs [options]
```

### docker

Scan Docker images.

```bash
trufflehog docker --image=<image:tag>
```

**Options:**
- `--image=<name>` - Image name with tag

### postman

Scan Postman workspaces.

```bash
trufflehog postman --token=<token> --workspace=<id>
```

### jenkins

Scan Jenkins servers.

```bash
trufflehog jenkins --url=<url>
```

### elasticsearch

Scan Elasticsearch clusters.

```bash
trufflehog elasticsearch --nodes=<url>
```

## Global Options

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--only-verified` | Only show verified (active) secrets |
| `--results=<types>` | Filter: verified, unknown, unverified |
| `--fail` | Exit 183 if secrets found (for CI) |
| `--no-verification` | Disable verification (faster) |
| `--concurrency=<n>` | Number of concurrent workers |
| `--exclude-paths=<file>` | File with paths to exclude |
| `--include-paths=<file>` | File with paths to include |

## Git-Specific Options

| Option | Description |
|--------|-------------|
| `--branch=<name>` | Scan specific branch |
| `--since-commit=<sha>` | Start from commit |
| `--max-depth=<n>` | Maximum commit depth |
| `--bare` | Scan bare repository |

## Verification Feature

TruffleHog uniquely **verifies** if secrets are active by:
1. Testing credentials against the actual service
2. Reporting verification status

**Verification statuses:**
- `verified` - Confirmed active/working credential
- `unknown` - Could not verify (service unavailable, etc.)
- `unverified` - Tested and not working (rotated/invalid)

## Common Usage Examples

```bash
# Scan local git repo
trufflehog git file://.

# Scan with JSON output
trufflehog git file://. --json

# Only verified (active) secrets
trufflehog git file://. --only-verified

# Verified + unknown confidence
trufflehog git file://. --results=verified,unknown

# Scan remote repo
trufflehog git https://github.com/owner/repo.git

# Scan specific branch
trufflehog git file://. --branch=main

# Scan since commit
trufflehog git file://. --since-commit=abc123

# Scan directory (non-git)
trufflehog filesystem /path/to/files

# Scan GitHub org
export GITHUB_TOKEN="ghp_xxxx"
trufflehog github --org=my-org

# Scan S3 bucket
trufflehog s3 --bucket=my-bucket

# Scan Docker image
trufflehog docker --image=myregistry/myimage:latest

# CI mode (fail if secrets found)
trufflehog git file://. --fail --only-verified
```

## Docker Usage

```bash
# Scan current directory
docker run --rm -v "$(pwd):/repo" trufflesecurity/trufflehog:latest git file:///repo

# Scan with verification
docker run --rm -v "$(pwd):/repo" trufflesecurity/trufflehog:latest git file:///repo --only-verified

# Scan remote repo
docker run --rm trufflesecurity/trufflehog:latest git https://github.com/owner/repo.git
```

## Path Exclusions

Create `exclude.txt`:
```
test/
*.test.js
node_modules/
vendor/
.env.example
```

Use:
```bash
trufflehog git file://. --exclude-paths=exclude.txt
```

## Supported Secret Types (800+)

Categories include:
- **Cloud providers**: AWS, GCP, Azure
- **Version control**: GitHub, GitLab, Bitbucket
- **Communication**: Slack, Discord, Twilio
- **Payment**: Stripe, Square, PayPal
- **Database**: PostgreSQL, MySQL, MongoDB connection strings
- **SaaS**: Sendgrid, Mailchimp, Datadog
- **Crypto**: Private keys, SSH keys, PGP keys
- And many more...

## Exit Codes

- `0` - No secrets found
- `183` - Secrets found (when using `--fail`)
- `1` - Error occurred

## GitHub Action

```yaml
- uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: main
    head: HEAD
    extra_args: --only-verified
```

## Resources

- Repository: https://github.com/trufflesecurity/trufflehog
- Releases: https://github.com/trufflesecurity/trufflehog/releases
- Documentation: https://trufflesecurity.com/trufflehog
- Enterprise: https://trufflesecurity.com
- Community: Slack and Discord available
