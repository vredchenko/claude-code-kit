# Install Secrets Scanning Tools

Install gitleaks, git-secrets, and/or TruffleHog on the local development machine.

## Quick Install Commands

### All Three Tools (macOS with Homebrew)
```bash
brew install gitleaks git-secrets trufflehog
```

### All Three Tools (Linux)
```bash
# Gitleaks
curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.30.0/gitleaks_8.30.0_linux_x64.tar.gz | tar -xz -C /usr/local/bin gitleaks

# git-secrets
git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && sudo make install && cd .. && rm -rf git-secrets

# TruffleHog
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin
```

---

## Gitleaks Installation

### macOS (Homebrew)
```bash
brew install gitleaks
```

### Linux (Binary)
```bash
# Download latest release
GITLEAKS_VERSION="8.30.0"
curl -sSfL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" | tar -xz -C /usr/local/bin gitleaks
chmod +x /usr/local/bin/gitleaks
```

### Docker
```bash
docker pull zricethezav/gitleaks:latest
# Usage: docker run --rm -v "$(pwd):/repo" zricethezav/gitleaks:latest git -v -s /repo
```

### From Source (requires Go 1.22+)
```bash
git clone https://github.com/gitleaks/gitleaks.git
cd gitleaks
make build
sudo mv gitleaks /usr/local/bin/
```

### Verify Installation
```bash
gitleaks version
```

---

## git-secrets Installation

### macOS (Homebrew)
```bash
brew install git-secrets
```

### Linux/macOS (From Source)
```bash
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
cd ..
rm -rf git-secrets
```

### Windows (PowerShell)
```powershell
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
./install.ps1
```

### Post-Install Setup (Required)
```bash
# Initialize in current repository
git secrets --install

# Register AWS patterns
git secrets --register-aws

# Optional: Set up for all new repos
git secrets --install ~/.git-templates/git-secrets
git config --global init.templateDir ~/.git-templates/git-secrets
```

### Verify Installation
```bash
git secrets --list
```

---

## TruffleHog Installation

### macOS (Homebrew)
```bash
brew install trufflehog
```

### Linux/macOS (Install Script)
```bash
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin
```

### Linux (Binary)
```bash
TRUFFLEHOG_VERSION="3.92.5"
curl -sSfL "https://github.com/trufflesecurity/trufflehog/releases/download/v${TRUFFLEHOG_VERSION}/trufflehog_${TRUFFLEHOG_VERSION}_linux_amd64.tar.gz" | tar -xz -C /usr/local/bin trufflehog
chmod +x /usr/local/bin/trufflehog
```

### Docker
```bash
docker pull trufflesecurity/trufflehog:latest
# Usage: docker run --rm -v "$(pwd):/repo" trufflesecurity/trufflehog:latest git file:///repo
```

### From Source (requires Go)
```bash
git clone https://github.com/trufflesecurity/trufflehog.git
cd trufflehog
go install
```

### Verify Installation
```bash
trufflehog --version
```

---

## Execution Steps

1. Detect the operating system:
   ```bash
   uname -s  # Darwin for macOS, Linux for Linux
   ```

2. Check for existing installations:
   ```bash
   which gitleaks git-secrets trufflehog 2>/dev/null
   ```

3. Check for package managers:
   ```bash
   which brew apt yum dnf 2>/dev/null
   ```

4. Based on OS and available package managers, present options:
   - macOS: Prefer Homebrew
   - Linux: Prefer binary downloads or install scripts
   - Either: Offer Docker as alternative

5. Install requested tools and verify

6. For git-secrets, remind about per-repo setup:
   ```bash
   git secrets --install
   git secrets --register-aws
   ```

## Version Information

| Tool | Latest Version | Release Page |
|------|----------------|--------------|
| gitleaks | v8.30.0 | https://github.com/gitleaks/gitleaks/releases |
| git-secrets | N/A | https://github.com/awslabs/git-secrets |
| trufflehog | v3.92.5 | https://github.com/trufflesecurity/trufflehog/releases |

## Troubleshooting

**"Permission denied" during install:**
- Use `sudo` for `/usr/local/bin` installations
- Or install to user directory: `~/.local/bin`

**Homebrew not found:**
- Install: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

**Docker permission issues:**
- Add user to docker group: `sudo usermod -aG docker $USER`
- Or use: `sudo docker ...`

**PATH issues after install:**
- Add to ~/.bashrc or ~/.zshrc: `export PATH="/usr/local/bin:$PATH"`
- Reload: `source ~/.bashrc`
