# claude-code-kit

Collection of Claude Code plugins and customizations to be selectively used in other projects.

## Installation

Add this marketplace to your Claude Code installation:

```bash
/plugin marketplace add vredchenko/claude-code-kit
```

Then install individual plugins:

```bash
/plugin install <plugin-name>@claude-code-kit
```

## Available Plugins

### readme
Commands for generating and managing README files.
- `/readme:generate` - Generate a comprehensive README for your project

### bunjs
Bun.js development utilities and commands.
- `/bunjs:init` - Initialize a new Bun.js project
- `/bunjs:test` - Run tests with Bun's test runner

### localdev
Local development environment setup and management.
- `/localdev:setup` - Set up local development environment
- `/localdev:check` - Check environment for common issues

### playwright
Playwright testing utilities and test generation.
- `/playwright:init` - Initialize Playwright in your project
- `/playwright:generate` - Generate Playwright tests

### serenamcp
Serena MCP server integration for semantic code analysis.
- `/serenamcp:setup` - Set up Serena MCP server

### gitflow
Git workflow automation and branch management.
- `/gitflow:feature` - Create a new feature branch
- `/gitflow:release` - Prepare a release branch
- `/gitflow:pr` - Create a pull request

### docs
Documentation generation and management.
- `/docs:generate` - Generate documentation for the codebase
- `/docs:api` - Generate API documentation

### adr
Architecture Decision Records management.
- `/adr:new` - Create a new ADR
- `/adr:list` - List all ADRs in the project

### pdftools
PDF processing and manipulation utilities.
- `/pdftools:extract` - Extract content from PDF files
- `/pdftools:analyze` - Analyze PDF document content

### claude-tools
Claude Code configuration and utility commands.
- `/claude-tools:setup` - Set up Claude Code for a project
- `/claude-tools:context` - Generate CLAUDE.md context file

### python-dev
Python development utilities and project management.
- `/python-dev:init` - Initialize a Python project with modern tooling
- `/python-dev:test` - Run Python tests
- `/python-dev:lint` - Run linting and formatting checks

### react-dev
React development utilities and component generation.
- `/react-dev:component` - Generate a new React component
- `/react-dev:hook` - Generate a new React hook
- `/react-dev:test` - Run React component tests

### cli-dev
CLI application development utilities.
- `/cli-dev:init` - Initialize a new CLI application
- `/cli-dev:command` - Add a new command to the CLI

### dotenv
Environment variable management and .env file utilities.
- `/dotenv:sync` - Synchronize .env with .env.example
- `/dotenv:check` - Check environment variable configuration
- `/dotenv:generate` - Generate environment variable documentation

### dsl
Domain-Specific Language utilities.
- Commands coming soon

## Creating Your Own Plugins

Each plugin lives in the `plugins/` directory with the following structure:

```
plugins/my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Plugin manifest (required)
├── commands/
│   └── my-command.md    # Slash commands (optional)
├── hooks/
│   └── hooks.json       # Hooks configuration (optional)
└── .mcp.json            # MCP servers (optional)
```

### Plugin Manifest

The `plugin.json` file defines your plugin:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Description of your plugin",
  "author": "Your Name"
}
```

### Adding to Marketplace

Register your plugin in `.claude-plugin/marketplace.json`:

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin",
      "description": "Description shown when browsing"
    }
  ]
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.
