---
name: coding-agent-guidelines
description: |
  Apply disciplined coding-agent behavior in this project. Use this skill
  whenever the user asks Claude to write, modify, refactor, debug, or
  review code in a real codebase, especially for changes touching multiple
  files, schema/migration work, security-sensitive areas, or unfamiliar
  parts of the project. Enforces small scoped diffs, explicit assumptions,
  verifiable success criteria, context discipline, careful sub-agent and
  MCP usage, plan-mode for risky changes, and deliberate model selection.
---

# Coding Agent Guidelines (Skill Form)

These directives apply for the duration of any coding task in this project.

## Reconnaissance first

Before editing, identify the smallest set of files relevant to the task and
read them. State assumptions explicitly. If the request is ambiguous, ask
one focused question or state the interpretation you'll use and proceed.
If the user is wrong about a fact, say so directly.

## Smallest sufficient change

Write the minimum code that satisfies the requirement and the tests. No
speculative interfaces, no abstract base classes for one subclass, no
configuration without a real second caller. Inline until duplication
forces extraction. Comments explain why, not what.

## Edits as diffs, not rewrites

Modify only what was asked. No drive-by reformatting, no renames outside
scope, no deletion of code that "looks unused" without checking call
sites. Match the surrounding style.

## Define the finish line

State the verification command before writing code. Run it. Paste output.
"Should work" is not acceptable. If you cannot run the check, say so and
list what the user must run.

## Context as a budget

Use Grep and Glob to locate code. Read targeted ranges, not whole files.
Don't paste large files into reasoning unless you're editing them. Track
durable lessons; promote them to project memory when appropriate.

## Right tool, right moment

Search before reading. Batch independent reads in parallel. Prefer Edit
over Write for existing files. After two failures of the same command,
stop and read the error.

## Delegation hygiene

Spawn a sub-agent (Task tool) when the work is read-heavy and would
otherwise pollute the main context, when you need an independent review,
or when there are independent parallel tasks. Do not spawn a sub-agent
for a one-shot lookup. Sub-agents return only their final message;
instruct them to summarize what you actually need.

## Memory layers

Project `CLAUDE.md` for project conventions. User `CLAUDE.md` for personal
preferences across projects. Auto memory (`/memory`) for accumulated
notes — promote anything important into `CLAUDE.md`. Use `#`-prefixed
in-session rules to experiment, then promote.

## Plan mode for risky changes

Switch to plan mode (Shift+Tab Shift+Tab) when the change touches three
or more files, involves schema or auth, or is in unfamiliar territory.
Plan mode is read-only; review the produced plan as a code review before
exiting.

## MCP discipline

Each connected MCP server costs context on every turn. Connect narrowly,
disconnect what you haven't used in a week, prefer servers with
specific tool names and clear single purposes.

## Model selection

Use Haiku-class models for high-volume, simple, or read-heavy work
(including the built-in Explore subagent). Default to Sonnet-class for
day-to-day coding. Reach for Opus-class only with measured evidence the
task justifies the cost — typically planning, large refactors, or
unfamiliar architecture work. Inside Claude Code, the `/model` option
that runs Opus in plan mode and Sonnet in execution is a strong default
for hard work.

## Stop conditions

Conclude a task only when:

1. The verification command has been run and its output is included.
2. The diff contains only the requested change.
3. Any new assumptions, residual risks, or follow-ups are listed
   explicitly.

If any of those is missing, the task is not done.
