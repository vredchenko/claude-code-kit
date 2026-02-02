# Configure Secrets Scanning Tools

Set up custom configuration for gitleaks, git-secrets, and TruffleHog.

## Gitleaks Configuration

Gitleaks uses TOML configuration files.

### Configuration Precedence
1. `--config` CLI flag
2. `GITLEAKS_CONFIG` environment variable (file path)
3. `GITLEAKS_CONFIG_TOML` environment variable (content)
4. `.gitleaks.toml` in repository root
5. Built-in default rules

### Create .gitleaks.toml

```toml
# .gitleaks.toml
title = "Custom Gitleaks Configuration"

# Extend default rules (recommended)
[extend]
useDefault = true

# Global allowlist - applies to all rules
[allowlist]
description = "Global allowlist"
paths = [
  # Test files
  '''test/.*''',
  '''.*_test\.go$''',
  '''.*\.test\.[jt]sx?$''',
  '''.*\.spec\.[jt]sx?$''',

  # Example/template files
  '''\.env\.example$''',
  '''\.env\.sample$''',
  '''\.env\.template$''',

  # Documentation
  '''docs/.*''',
  '''.*\.md$''',

  # Lock files
  '''package-lock\.json$''',
  '''yarn\.lock$''',
  '''pnpm-lock\.yaml$''',
  '''Gemfile\.lock$''',
  '''poetry\.lock$'''
]

# Specific commits to ignore
commits = [
  "abc1234567890",  # Known false positive commit
]

# Regex patterns to ignore
regexes = [
  '''EXAMPLE_.*''',
  '''PLACEHOLDER_.*''',
]

# Custom rules
[[rules]]
id = "internal-api-key"
description = "Internal API Key"
regex = '''(?i)INTERNAL[_-]?API[_-]?KEY\s*[:=]\s*['"]?([A-Za-z0-9_-]{32,})['"]?'''
keywords = ["internal", "api", "key"]
entropy = 3.5

[[rules]]
id = "custom-database-url"
description = "Database Connection String"
regex = '''(?i)(postgres|mysql|mongodb)://[^:]+:[^@]+@[^\s'"]+'''
keywords = ["postgres", "mysql", "mongodb"]

# Rule-specific allowlist
[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)api[_-]?key\s*[:=]\s*['"]?([A-Za-z0-9_-]{20,})['"]?'''
keywords = ["api_key", "apikey"]

  [rules.allowlist]
  paths = ['''config/.*\.example\..*''']
  regexes = ['''test_api_key''', '''dummy_api_key''']
```

### Advanced: Composite Rules (v8.28+)

```toml
# Primary rule
[[rules]]
id = "aws-credentials-composite"
description = "AWS Access Key with Secret Key in proximity"
regex = '''AKIA[0-9A-Z]{16}'''
keywords = ["AKIA"]

# Auxiliary rule linked to primary
[[rules]]
id = "aws-secret-key"
description = "AWS Secret Key (auxiliary)"
regex = '''(?i)aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?'''
keywords = ["aws", "secret"]
  [rules.composite]
  primaryRule = "aws-credentials-composite"
  withinLines = 5  # Must appear within 5 lines of primary
```

---

## git-secrets Configuration

git-secrets uses git config for pattern storage.

### Add Prohibited Patterns

```bash
# Add to current repository
git secrets --add 'password\s*=\s*['\''"][^'\''"]+['\''"]'
git secrets --add 'PRIVATE[_-]?KEY'
git secrets --add 'BEGIN RSA PRIVATE KEY'

# Add globally (all repositories)
git secrets --add --global 'my_company_[a-zA-Z0-9]{32}'
```

### Add Allowed Patterns (Whitelist)

```bash
# Whitelist example values
git secrets --add --allowed 'AKIAIOSFODNN7EXAMPLE'
git secrets --add --allowed 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'

# Whitelist test files
git secrets --add --allowed '.*\.test\.[jt]s$'
git secrets --add --allowed 'test/.*'
```

### Add Literal Strings (Not Regex)

```bash
git secrets --add --literal 'sk_test_1234567890abcdef'
```

### View Current Configuration

```bash
# List all patterns
git secrets --list

# View in git config
git config --get-all secrets.patterns
git config --get-all secrets.allowed
git config --get-all secrets.providers
```

### Provider Scripts

```bash
# Add a script that outputs patterns
git secrets --add-provider -- cat /path/to/patterns.txt

# Add inline command
git secrets --add-provider -- 'echo "my_secret_pattern"'
```

### Remove Patterns

```bash
# Edit git config directly
git config --unset secrets.patterns 'pattern_to_remove'
git config --unset-all secrets.patterns  # Remove all
```

---

## TruffleHog Configuration

TruffleHog has limited configuration but supports path exclusions.

### Exclude Paths File

Create `trufflehog-exclude.txt`:
```
# Patterns to exclude (one per line)
test/
*.test.js
*.spec.ts
.env.example
node_modules/
vendor/
docs/
```

Use with:
```bash
trufflehog git file://. --exclude-paths=trufflehog-exclude.txt
```

### Include Paths File

Create `trufflehog-include.txt`:
```
# Only scan these paths
src/
config/
.env
```

Use with:
```bash
trufflehog git file://. --include-paths=trufflehog-include.txt
```

### Environment Variables

```bash
# For GitHub scanning
export GITHUB_TOKEN="your_token"
trufflehog github --org=your-org

# For S3 scanning (uses AWS credentials)
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
trufflehog s3 --bucket=your-bucket
```

---

## Execution Steps

1. Ask which tool(s) to configure
2. Determine configuration needs:
   - Custom patterns to detect
   - Paths/patterns to exclude
   - Existing false positives to whitelist
3. Create appropriate configuration files:
   - `.gitleaks.toml` for gitleaks
   - git config entries for git-secrets
   - Exclude/include files for TruffleHog
4. Test configuration:
   ```bash
   # Gitleaks
   gitleaks git -v --config .gitleaks.toml

   # git-secrets
   git secrets --scan

   # TruffleHog
   trufflehog git file://. --exclude-paths=trufflehog-exclude.txt
   ```
5. Commit configuration files to repository

## Common Configuration Scenarios

### Ignore Test Files
```toml
# .gitleaks.toml
[allowlist]
paths = ['''test/.*''', '''.*_test\.go$''', '''.*\.test\.js$''']
```

### AWS-Heavy Project
```bash
# git-secrets
git secrets --register-aws
git secrets --add --allowed 'AKIAIOSFODNN7EXAMPLE'
```

### Monorepo with Multiple Projects
```toml
# .gitleaks.toml
[[rules]]
id = "project-a-key"
description = "Project A API Key"
regex = '''PROJECT_A_KEY=([a-zA-Z0-9]{32})'''
paths = ["project-a/.*"]  # Only scan project-a directory
```

### High-Sensitivity Scan
```bash
# Combine tools for maximum coverage
gitleaks git -v --config .gitleaks.toml
trufflehog git file://. --only-verified
git secrets --scan-history
```
