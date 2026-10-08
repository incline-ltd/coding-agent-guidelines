---
description: >
  Behavioral guidelines for AI agents working in this repository. Covers
  understanding before editing, minimal changes, scoped edits, verification,
  efficient work, and approval before irreversible actions.
globs:
alwaysApply: true
---

# Cursor Project Rule: Coding Agent Guidelines

This file explains the Cursor equivalent of `CLAUDE.md`. Copy
`.cursor/rules/coding-agent-guidelines.mdc` into your project. The
frontmatter above sets `alwaysApply: true`, which means the rule is included
in the model context for every Agent (Chat) request in this project.

## Where this lives in Cursor's model

Cursor has three layers of persistent instructions:

1. **Project Rules** — `.cursor/rules/*.mdc` files, version-controlled
   with the repo. Each rule is a Markdown file with YAML frontmatter.
   This is the closest equivalent to project `CLAUDE.md`.
2. **User Rules** — global preferences set in Cursor Settings → Rules.
   Plain text, applied to Agent across all projects. Equivalent to
   `~/.claude/CLAUDE.md`.
3. **Memories** — auto-generated short rules derived from chat
   conversations, scoped to the project, observed by a sidecar model.
   Equivalent to Claude Code's auto memory but lighter-weight: think
   "remembered preferences," not "saved playbook."

Precedence (per Cursor docs): Team Rules → Project Rules → User Rules,
all merged, earlier sources winning on conflict.

`AGENTS.md` at the repo root is also recognized by Cursor as a project-
wide instruction file and is a reasonable alternative if you want a
single Markdown file shared across multiple AI tools.

## Rule frontmatter — what each field does

```yaml
---
description: <when this rule should be considered>
globs: <comma-separated glob patterns, or empty>
alwaysApply: <true | false>
---
```

The combination of these three fields defines the rule type:

| Type             | `alwaysApply` | `globs`        | `description` | When it loads                                    |
|------------------|---------------|----------------|---------------|--------------------------------------------------|
| Always           | `true`        | empty          | empty         | Every request in the project                     |
| Auto Attached    | `false`       | populated      | empty         | When edited/referenced files match the globs     |
| Agent Requested  | `false`       | empty          | populated     | Agent decides based on `description` relevance   |
| Manual           | `false`       | empty          | empty         | Only when invoked via `@rule-name`               |

The current behavior, per Cursor's docs and confirmed by the community:
even when `alwaysApply: true` puts a rule in context, the model can
still decide it's not relevant to the specific query and effectively
ignore it. Treat rules as strong defaults, not enforced configuration.

A rule body should be short — Cursor's guidance is "like a clear
internal doc, focused and actionable." Rules over a few hundred lines
become harder to follow.

## How this rule maps to Cursor's modes

Cursor offers several Agent modes:

- **Agent** (default): autonomous, all tools, edits files, runs
  commands, iterates on errors.
- **Ask**: read-only Q&A. Cannot edit. Useful for exploration.
- **Manual**: edits only the files you explicitly select; no autonomous
  exploration.
- **Plan**: research-first mode. The agent analyzes the
  codebase, asks clarifying questions, and produces a reviewable plan
  saved as a file before execution.
- **Debug**: instruments the app with runtime logs to
  reproduce and isolate bugs.
- **Custom Modes**: user-defined combinations of tools and
  instructions.

Mapping from `CLAUDE.md` sections to Cursor:

| `CLAUDE.md` section             | Cursor equivalent                                            |
|---------------------------------|--------------------------------------------------------------|
| Understand Before Editing       | Same; reinforce in Plan Mode for multi-file work             |
| Smallest Sufficient Change      | Same; rule body                                              |
| Edits as Diffs, Not Rewrites    | Same; reinforced by Manual mode for risky areas              |
| Define the Finish Line          | Same; auto-run + auto-fix-errors will run tests              |
| Work Efficiently                | Codebase indexing handles most search; Plan Mode; parallel subagents during exploration |
| Ask Before Irreversible Actions | Same; review Cursor's auto-run settings as well              |

Topics covered in [Claude Code notes](docs/CLAUDE_CODE_NOTES.md) rather
than the always-loaded rule:

| Notes topic                     | Cursor equivalent                                            |
|---------------------------------|--------------------------------------------------------------|
| Persisted vs. Ephemeral         | Project Rules / User Rules / Memories instead of `CLAUDE.md` tiers |
| External Tools Are a Tax        | MCP integration in Cursor — same caveat about server bloat   |
| Skills as Loadable Playbooks    | No direct equivalent; closest is Auto Attached rules with `globs` |
| Match the Model to the Task     | Cursor's model dropdown + Auto routing                       |

## Cursor-specific notes

**Codebase indexing.** Cursor maintains a custom embedding index of the
repo. Most "where is X?" queries are answered by the index, not by
file reads. You usually do not need to micromanage `Grep` vs `Read` —
but the principle still holds when the agent is editing.

**Background Agents.** Cursor supports cloud-based agents that run on a
dedicated VM and continue working while you do something else. They
require a paid plan and use Max-mode-compatible models. Treat them as
"long-running async tasks," not as "default mode" — the cost and
isolation tradeoffs are different.

**Default models.** Cursor exposes Auto routing plus an explicit model
dropdown. The dropdown contents track the major frontier models
(Anthropic Claude Sonnet/Opus/Haiku, OpenAI, Google Gemini, plus
Cursor's own Composer model trained for in-IDE agentic loops). The
model note in `docs/CLAUDE_CODE_NOTES.md` still applies: don't pay for capacity
you don't need, but don't underspecify a hard refactor.

**Memories vs Rules.** Memories are *auto-derived* and short — you
generally don't write them, you let Cursor capture them and prune them.
Rules are *authored*. Use Rules for everything you want to persist
deliberately; let Memories handle small preference drift.

## The rule body

The rule body in `.cursor/rules/coding-agent-guidelines.mdc` is the same
short core as `CLAUDE.md`. It stays short on purpose: with `alwaysApply: true`
it is added to every Agent request, so explanations like this file live
outside the rule.
