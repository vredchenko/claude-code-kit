# gitflow

Don't perform remote operations unless specifically instructed. Avoid mentioning Claude Code in commit messages. Be brief with commit messages, prefer one-liners. Commit locally after every change making it easy to revert last during local dev - then reset locally staged commits and restructure into new set of commits for publishing to remote.

More to follow on how to use git. Will need separate github plugin.

## Installation

```bash
/plugin marketplace add vredchenko/claude-code-kit
/plugin install gitflow@claude-code-kit
```

## Commands

### `/gitflow:feature`
Create a new feature branch following gitflow conventions.

### `/gitflow:release`
Prepare a release branch following gitflow conventions.

### `/gitflow:pr`
Create a pull request for the current branch.
