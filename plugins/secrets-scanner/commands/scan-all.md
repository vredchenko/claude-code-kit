# Scan Repository with All Three Tools

Run a comprehensive secrets scan using gitleaks, git-secrets, and TruffleHog.

## Purpose

Running all three scanners provides:
- Maximum coverage - each tool has different detection patterns
- Cross-validation - secrets found by multiple tools are high confidence
- Comparison - see which tool performs best for your codebase

## Prerequisites

Check which tools are available:
```bash
echo "=== Checking installed tools ==="
echo -n "gitleaks: "; gitleaks version 2>/dev/null || echo "NOT INSTALLED"
echo -n "git-secrets: "; git secrets 2>&1 | grep -q "usage" && echo "installed" || echo "NOT INSTALLED"
echo -n "trufflehog: "; trufflehog --version 2>/dev/null || echo "NOT INSTALLED"
```

## Scan Execution

### 1. Gitleaks Scan
```bash
echo "=== Running Gitleaks ==="
gitleaks git -v --report-format json --report-path gitleaks-results.json 2>&1
echo "Results saved to: gitleaks-results.json"
```

### 2. git-secrets Scan
```bash
echo "=== Running git-secrets ==="
# Ensure hooks are installed
git secrets --install 2>/dev/null || true
git secrets --register-aws 2>/dev/null || true

# Run scan
git secrets --scan 2>&1 | tee git-secrets-results.txt
echo "Results saved to: git-secrets-results.txt"
```

### 3. TruffleHog Scan
```bash
echo "=== Running TruffleHog ==="
trufflehog git file://. --json > trufflehog-results.json 2>&1
echo "Results saved to: trufflehog-results.json"
```

## Combined Results Analysis

After running all three scans:

1. **Count findings per tool**:
   ```bash
   echo "=== Summary ==="
   echo "Gitleaks findings: $(cat gitleaks-results.json 2>/dev/null | grep -c '"RuleID"' || echo 0)"
   echo "TruffleHog findings: $(cat trufflehog-results.json 2>/dev/null | grep -c '"DetectorName"' || echo 0)"
   echo "git-secrets: $(wc -l < git-secrets-results.txt 2>/dev/null || echo 0) lines of output"
   ```

2. **Cross-reference findings**:
   - Compare file paths across all three reports
   - Secrets found by 2+ tools are high confidence
   - Unique findings may be tool-specific patterns or false positives

3. **Priority order**:
   1. TruffleHog verified secrets (confirmed active)
   2. Secrets found by multiple tools
   3. Single-tool findings (investigate individually)

## Execution Steps

1. Check which tools are installed
2. Offer to install missing tools (user choice)
3. Run available tools sequentially, saving reports
4. Parse and combine results
5. Present unified findings with:
   - Source tool(s) for each finding
   - File path and line number
   - Secret type/category
   - Verification status (if TruffleHog)
6. Recommend remediation based on finding severity

## Cleanup

After addressing findings:
```bash
rm -f gitleaks-results.json git-secrets-results.txt trufflehog-results.json
```

## Output Format Recommendation

Present combined results in a table:

| File | Line | Type | Tools | Verified | Priority |
|------|------|------|-------|----------|----------|
| config.js | 42 | AWS Key | gitleaks, trufflehog | Yes | CRITICAL |
| .env | 15 | API Token | gitleaks | N/A | HIGH |
| test.py | 100 | Password | git-secrets | N/A | MEDIUM |

## Notes

- Running all three tools may take longer on large repositories
- Each tool has different default patterns and detection methods
- Consider setting up CI to run at least one tool automatically
- Use `--only-verified` with TruffleHog for quick critical-only scan
