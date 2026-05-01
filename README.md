# coding-agent-guidelines

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-CLAUDE.md-orange)](CLAUDE.md)
[![Cursor Rules](https://img.shields.io/badge/Cursor-.cursor%2Frules-111111)](.cursor/rules/coding-agent-guidelines.mdc)
[![AI Agents](https://img.shields.io/badge/AI%20Agents-AGENTS.md-0f766e)](AGENTS.md)

A drop-in behavioral spec for AI coding agents. It helps Claude Code, Cursor,
and other coding agents behave like careful senior engineers: read first, change
less, verify more, and avoid context bloat.

## Why This Exists

AI coding agents fail in predictable ways:

- they invent requirements from vague prompts
- they rewrite files instead of making scoped diffs
- they abstract before there is real duplication
- they touch unrelated code while fixing one bug
- they declare success without running checks
- they burn context reading irrelevant files
- they overuse subagents, MCP servers, and expensive models

This repo turns those lessons into persistent instructions you can install in
real projects.

## 3-Command Quick Start

```bash
git clone https://github.com/ashishkaloge/coding-agent-guidelines.git
cp coding-agent-guidelines/CLAUDE.md /path/to/your-project/CLAUDE.md
mkdir -p /path/to/your-project/.cursor/rules && cp coding-agent-guidelines/.cursor/rules/coding-agent-guidelines.mdc /path/to/your-project/.cursor/rules/
```

That gives Claude Code and Cursor the same core behavior rules inside your
project.

## What's Included

| Path | Purpose |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Project-level behavioral rules for Claude Code |
| [AGENTS.md](AGENTS.md) | Cross-tool agent instructions for agents that read AGENTS.md |
| [SKILL.md](SKILL.md) | Claude Code Skill form of the same guidance |
| [.claude/skills/coding-agent-guidelines/SKILL.md](.claude/skills/coding-agent-guidelines/SKILL.md) | Ready-to-copy project skill location |
| [.cursor/rules/coding-agent-guidelines.mdc](.cursor/rules/coding-agent-guidelines.mdc) | Cursor always-on project rule |
| [CURSOR.md](CURSOR.md) | Cursor explanation and rule source |
| [EXAMPLES.md](EXAMPLES.md) | Before/after failure modes in Python and TypeScript |
| [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) | Claude Code marketplace catalog |
| [plugins/coding-agent-guidelines](plugins/coding-agent-guidelines) | Installable Claude Code plugin package |
| [.github](.github) | Issue and pull-request templates for public contributions |
| [docs](docs) | Installation, architecture, adoption, roadmap, and launch notes |

## Install Options

### Claude Code: Project Memory

Copy [CLAUDE.md](CLAUDE.md) to the root of any repository:

```bash
cp CLAUDE.md /path/to/your-project/CLAUDE.md
```

Claude Code reads project-level `CLAUDE.md` automatically at session start and
after context compaction.

### Claude Code: Skill

Copy the skill into a project or user skills directory:

```bash
mkdir -p /path/to/your-project/.claude/skills/coding-agent-guidelines
cp SKILL.md /path/to/your-project/.claude/skills/coding-agent-guidelines/SKILL.md
```

### Claude Code: Plugin

After this repo is hosted on GitHub:

```text
/plugin marketplace add ashishkaloge/coding-agent-guidelines
/plugin install coding-agent-guidelines@coding-agent-guidelines
```

### Cursor

Copy the Cursor rule into your project:

```bash
mkdir -p /path/to/your-project/.cursor/rules
cp .cursor/rules/coding-agent-guidelines.mdc /path/to/your-project/.cursor/rules/
```

The rule uses `alwaysApply: true`, so Cursor includes it for every Agent Chat
request in that project.

### Other Agents

Use [AGENTS.md](AGENTS.md) or [CLAUDE.md](CLAUDE.md) as the source. Paste it into
whatever persistent instruction mechanism your tool supports.

## What The Rules Enforce

1. Reconnaissance before action
2. Smallest sufficient change
3. Edits as diffs, not rewrites
4. Explicit verification before claiming done
5. Context as a budget
6. Right tool at the right moment
7. Careful subagent use
8. Clear memory layers
9. Plan before risky patches
10. MCP discipline
11. Skills as loadable playbooks
12. Model choice matched to task complexity

## Repository Layout

```text
coding-agent-guidelines/
├── README.md
├── CLAUDE.md
├── AGENTS.md
├── CURSOR.md
├── SKILL.md
├── EXAMPLES.md
├── .cursor/rules/coding-agent-guidelines.mdc
├── .claude/skills/coding-agent-guidelines/SKILL.md
├── .claude-plugin/marketplace.json
├── .github/
├── plugins/coding-agent-guidelines/
│   ├── .claude-plugin/plugin.json
│   └── skills/coding-agent-guidelines/SKILL.md
└── docs/
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for why the files are duplicated
across root, Cursor, Skill, and plugin install paths.

## Who Should Use This

- developers using Claude Code or Cursor daily
- teams that want smaller diffs from AI coding agents
- maintainers tired of agents touching unrelated files
- founders using AI tools to move fast without destroying code quality
- anyone building reusable project rules, skills, or agent playbooks

## Compatibility

Designed for:

- Claude Code 2.1+
- Cursor 2.x project rules
- agents that read `AGENTS.md`
- any coding-agent tool with persistent Markdown instructions

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Good contributions are concrete:
new failure modes, sharper wording, better install paths, or compatibility notes
for another coding tool.

## Security

This repo contains instructions, not executable runtime code. Still, if you find
a supply-chain, plugin packaging, or malicious-instruction issue, see
[SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
