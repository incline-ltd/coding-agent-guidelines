# Installation Guide

This project supports direct project memory, Claude Code skills and plugins,
Codex skills, and Cursor project rules.

## Claude Code: project-level `CLAUDE.md`

Use this for most repositories.

```bash
cp CLAUDE.md /path/to/your-project/CLAUDE.md
```

Claude Code automatically reads this file at session start and after context
compaction.

## Claude Code: user-level memory

Use this when you want the rules across all your projects.

```bash
cat CLAUDE.md >> ~/.claude/CLAUDE.md
```

Review the merged file afterward so you do not duplicate or conflict with your
personal preferences.

## Claude Code: Skill

Use a Skill when you want the rules to load on demand rather than sit in every
turn's context.

Project scope:

```bash
mkdir -p /path/to/your-project/.claude/skills/coding-agent-guidelines
cp SKILL.md /path/to/your-project/.claude/skills/coding-agent-guidelines/SKILL.md
```

User scope:

```bash
mkdir -p ~/.claude/skills/coding-agent-guidelines
cp SKILL.md ~/.claude/skills/coding-agent-guidelines/SKILL.md
```

## Codex: Skill

Use a repository skill for one codebase or a user skill across codebases.

Repository scope:

```bash
mkdir -p /path/to/your-project/.agents/skills/coding-agent-guidelines
cp SKILL.md /path/to/your-project/.agents/skills/coding-agent-guidelines/SKILL.md
```

User scope:

```bash
mkdir -p ~/.agents/skills/coding-agent-guidelines
cp SKILL.md ~/.agents/skills/coding-agent-guidelines/SKILL.md
```

Codex scans both locations automatically. Invoke the skill directly or let its
description match the task.

## Claude Code: Plugin

Install from the public GitHub repository:

```text
/plugin marketplace add ashishkaloge/coding-agent-guidelines
/plugin install coding-agent-guidelines@coding-agent-guidelines
```

Validate before publishing:

```text
/plugin validate .
```

or from the CLI if available:

```bash
claude plugin validate .
```

## Cursor

Use the ready project rule:

```bash
mkdir -p /path/to/your-project/.cursor/rules
cp .cursor/rules/coding-agent-guidelines.mdc /path/to/your-project/.cursor/rules/
```

For global Cursor behavior, paste the rule body into Cursor Settings -> Rules ->
User Rules.

## Generic Agents

Use `AGENTS.md` or `CLAUDE.md` as the canonical Markdown source. Remove the
Anthropic-specific model-routing section if your provider does not expose
Opus/Sonnet/Haiku-style model choices.
