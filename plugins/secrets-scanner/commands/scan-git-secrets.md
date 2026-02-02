# Scan Repository with git-secrets

Scan the current repository for leaked secrets using AWS git-secrets.

## Prerequisites Check

1. Check if git-secrets is installed:
   ```bash
   git secrets --version 2>/dev/null || git secrets 2>&1 | head -5
   ```

2. If not installed, offer installation options:
   - **macOS (Homebrew)**: `brew install git-secrets`
   - **Linux/macOS (from source)**:
     ```bash
     git clone https://github.com/awslabs/git-secrets.git
     cd git-secrets
     sudo make install
     ```
   - **Windows**: Download and run `install.ps1`

## Initial Setup (Required Once Per Repo)

git-secrets requires explicit installation in each repository:

```bash
# Install hooks in current repo
git secrets --install

# Register AWS patterns (highly recommended)
git secrets --register-aws
```

## Scanning Options

### Scan Staged Files
```bash
git secrets --scan
```

### Scan Specific Files
```bash
git secrets --scan path/to/file1 path/to/file2
```

### Scan Directory Recursively
```bash
git secrets --scan -r /path/to/directory
```

### Scan Entire Git History
```bash
git secrets --scan-history
```

### List Current Patterns
```bash
git secrets --list
```

## Configuration

### Add Custom Prohibited Patterns
```bash
# Add pattern locally (current repo)
git secrets --add 'PRIVATE[_-]?KEY'

# Add pattern globally (all repos)
git secrets --add --global 'my_company_api_[a-zA-Z0-9]{32}'
```

### Add Allowed Patterns (Whitelist)
```bash
# Allow specific false positive pattern
git secrets --add --allowed 'AKIAIOSFODNN7EXAMPLE'

# Allow example files
git secrets --add --allowed '\.example$'
```

### Add Literal Strings (Not Regex)
```bash
git secrets --add --literal 'MySpecificSecretValue'
```

### Custom Providers
```bash
# Add provider script that outputs patterns
git secrets --add-provider -- cat /path/to/secret-patterns.txt
```

## Pattern Storage

Patterns are stored in git config:
- **Local**: `.git/config`
- **Global**: `~/.gitconfig`

View with:
```bash
git config --get-all secrets.patterns
git config --get-all secrets.allowed
```

## AWS-Specific Patterns

After `--register-aws`, these patterns are active:
- AWS Access Key IDs: `(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}`
- AWS Secret Access Keys
- AWS account IDs
- Credential file patterns

## Template Setup (New Repos)

Set up git-secrets to auto-install in new repos:
```bash
git secrets --install ~/.git-templates/git-secrets
git config --global init.templateDir ~/.git-templates/git-secrets
```

## Key Commands Reference

| Command | Description |
|---------|-------------|
| `--install` | Install git hooks in current repo |
| `--scan` | Scan files for secrets |
| `--scan-history` | Scan entire git history |
| `--list` | Show all configured patterns |
| `--add <pattern>` | Add prohibited pattern |
| `--add --allowed <pattern>` | Add allowed pattern |
| `--add --literal <string>` | Add literal match |
| `--register-aws` | Enable AWS credential patterns |
| `--add-provider` | Add custom pattern provider |

## Execution Steps

1. Verify git-secrets is installed
2. Check if hooks are installed in the repository (`ls .git/hooks/pre-commit`)
3. If not installed, run `git secrets --install` and `git secrets --register-aws`
4. Run the appropriate scan command based on user needs
5. Present findings clearly with file locations and matched patterns
6. For any secrets found:
   - Identify the type of secret (AWS key, API token, etc.)
   - Recommend immediate credential rotation
   - Add to allowed patterns if false positive
   - Consider scanning history if current scan found issues

## Limitations

- Pattern-based detection may miss some secrets
- Requires manual setup per repository (or template config)
- Cannot detect encoded or obfuscated secrets
- Should be used alongside other security practices
