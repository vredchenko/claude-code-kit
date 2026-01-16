# dotenv

Record env in dotenv example files tracked under version control, but gitignore and never commit real dotenv files. Keep dotenv examples and real files in sync. Claude Code to be aware of dotenv, check for existence, source updated env var values when changed, and use dotenv rather than setting env vars inline.

Understand what is and is not environment - avoid using for app config and feature flags. Use as a single source of truth about env everywhere in codebase, keep env DRY, separate env definition into separate parts where makes sense, manage multiple env definitions for different environments if makes sense (dev, prod, test, github, mcp, container, etc.).

## Installation

```bash
/plugin marketplace add vredchenko/claude-code-kit
/plugin install dotenv@claude-code-kit
```

## Commands

### `/dotenv:sync`
Synchronize environment variable files.

### `/dotenv:check`
Check environment variable configuration.

### `/dotenv:generate`
Generate environment variable documentation.
