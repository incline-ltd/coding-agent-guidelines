---
description: >
  Behavioral guidelines for AI agents working in this repository. Covers
  reconnaissance, minimal changes, scoped edits, verification,
  context discipline, tool use, delegation, memory, planning, MCP, and
  model selection.
globs:
alwaysApply: true
---

# Cursor Project Rule: Coding Agent Guidelines

This file is the Cursor equivalent of `CLAUDE.md`. Place it at
`.cursor/rules/coding-agent-guidelines.mdc`. The frontmatter above sets
`alwaysApply: true`, which means the rule is included in the model
context for every Agent (Chat) request in this project.

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

| `CLAUDE.md` section            | Cursor equivalent                                            |
|-------------------------------|--------------------------------------------------------------|
| Reconnaissance Before Action  | Same; reinforce in Plan Mode for multi-file work             |
| Smallest Sufficient Change    | Same; rule body                                              |
| Edits as Diffs, Not Rewrites  | Same; reinforced by Manual mode for risky areas              |
| Define the Finish Line        | Same; auto-run + auto-fix-errors will run tests              |
| Context as a Budget           | Same; codebase indexing handles search, but `Grep` discipline still applies |
| Right Tool, Right Moment      | Same; Cursor's tool list is similar                          |
| Delegation Hygiene            | Cursor uses parallel subagents during exploration; same principle |
| Persisted vs. Ephemeral       | Project Rules / User Rules / Memories instead of `CLAUDE.md` tiers |
| Plan Before You Patch         | Cursor Plan Mode                                             |
| External Tools Are a Tax      | MCP integration in Cursor — same caveat about server bloat   |
| Skills as Loadable Playbooks  | No direct equivalent; closest is Auto Attached rules with `globs` |
| Match the Model to the Task   | Cursor's model dropdown + Auto routing                       |

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
choice rule from `CLAUDE.md` §12 still applies: don't pay for capacity
you don't need, but don't underspecify a hard refactor.

**Memories vs Rules.** Memories are *auto-derived* and short — you
generally don't write them, you let Cursor capture them and prune them.
Rules are *authored*. Use Rules for everything you want to persist
deliberately; let Memories handle small preference drift.

## The rule body

Below is the substantive content. Treat each section as a directive.

### Reconnaissance Before Action

Before editing, confirm what is being asked. If ambiguity remains
after reading the relevant files, state the interpretation you'll use
and proceed; do not silently choose. Surface assumptions explicitly.
If the user asserts something incorrect, push back rather than agree.

### Smallest Sufficient Change

Write the minimum that satisfies the requirement. No speculative
parameters, abstract base classes for one subclass, or configuration
without a second caller. Inline until duplication forces extraction
(rule of three). Comments explain why, not what.

### Edits as Diffs, Not Rewrites

Modify only what was asked. No drive-by reformatting, no renames
outside scope, no deletion of "looks unused" code without checking
call sites. Match the file's existing style.

### Define the Finish Line

State the verification command before writing code. Run it, paste
output. "Should work" is not a finish condition. If you cannot run
the check, say so and list the exact command the user should run.

### Context as a Budget

Search before reading. Read targeted ranges, not whole files. Don't
paste large files into the chat unless you're modifying them.
Consider whether durable lessons belong in this rule file.

### Right Tool, Right Moment

Search tools (codebase index, grep, glob) before content reads.
Batch independent reads. Prefer targeted edits to whole-file rewrites.
Don't loop on a failing command — read the error properly after the
second failure.

### Delegation and Parallel Subagents

Cursor agents will spawn parallel subagents for codebase exploration
automatically. For independent review, ask explicitly for a fresh
review pass. Don't expect subagents to coordinate with each other.

### Persisted vs. Ephemeral Knowledge

This rule file is the persistent layer. User Rules carry across
projects. Memories capture small preferences. In-chat instructions are
ephemeral; if a correction matters beyond this session, propose
adding it to a rule.

### Plan Before You Patch

For changes touching three or more files, schema/migration work, or
unfamiliar areas of the codebase, switch to Plan Mode. Review the
generated plan as you would a code review. Don't approve a plan you
wouldn't ship.

### External Tools Are a Tax

Each connected MCP server adds tool definitions to every request.
Connect narrowly, on demand. Disconnect anything you haven't used in
a week. Prefer MCP tools with specific names and clear single
purposes.

### Match the Model to the Task

Use the model dropdown deliberately. High-capability models on
trivial edits is waste; budget models on architecture work is
breakage. Run measured comparisons before standardizing on the most
expensive option.
