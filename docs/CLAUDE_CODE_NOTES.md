# Claude Code Notes

Reference notes for people setting up Claude Code. They explain the reasoning
behind the short rules in `CLAUDE.md`, but they are not meant to be loaded into
an agent's context on every request. Tool names and controls change; check the
current Claude Code documentation before relying on a specific detail.

## Context as a Budget

The context window is a finite resource. Treat every file you read as a
withdrawal.

- Prefer `Grep` and `Glob` over `Read` when you need to locate something.
  Reading a 2,000-line file to find one symbol is wasteful.
- Read targeted ranges, not whole files, once you know where the relevant
  code is.
- Do not paste large file contents into your reasoning unless you are
  going to modify them. Summaries are usually enough.
- When you have learned something durable about the codebase (a build
  command, a non-obvious convention, a gotcha), consider whether it belongs
  in `CLAUDE.md` so the next session doesn't have to rediscover it. Auto
  memory will capture some of this; explicit `CLAUDE.md` entries are more
  reliable.
- After `/compact`, project-root `CLAUDE.md` is re-injected. Nested
  `CLAUDE.md` files in subdirectories are not — they reload only when you
  next read a file in that subdirectory. If a behavior disappears after
  compaction, that's usually why.

A lean context produces sharper completions. A bloated one produces
hallucinations.

## Right Tool, Right Moment

Tool selection is part of the work, not an afterthought.

- **Search before you read.** `Grep` for symbols and call sites. `Glob`
  for file discovery. Only `Read` when you have narrowed the target.
- **Batch independent reads.** If you need three files and the reads do
  not depend on each other, request them in parallel, not sequentially.
- **Don't run shell commands you could answer from a file.** `cat` of a
  file you can `Read` is two tool calls instead of one.
- **`Edit` over `Write`** for changes to existing files. `Write`
  overwrites the whole file and risks losing content; `Edit` produces
  reviewable diffs.
- **Don't loop on a failing command.** If a build or test fails three
  times the same way, stop and read the error properly. Re-running it
  with minor variations is not a strategy.

## Delegation Hygiene (Sub-Agents and the Task Tool)

Claude Code can spawn sub-agents via the Task tool. Built-ins include
`Explore` (read-only codebase search, often Haiku-backed), `Plan` (used
inside plan mode to gather context), and `general-purpose` (complex
multi-step work). Custom subagents live in `.claude/agents/*.md` with
frontmatter `name`, `description`, `tools`, and optional `model`.

Use a sub-agent when:

- The work is **read-heavy and would otherwise pollute the main context**
  — codebase exploration, doc lookup, locating examples.
- You need an **independent review** of code you just wrote, with no
  exposure to the reasoning that produced it.
- You have **independent parallel tasks** with no shared state — running
  three lint/format/security checks at once.

Do not use a sub-agent when:

- The task is one or two tool calls. Spawning an agent costs a turn and a
  fresh context; for trivial work it is pure overhead.
- The sub-agents would need to coordinate with each other. Sub-agents
  return a single final message to the parent and cannot talk among
  themselves.
- You are tempted to use one to "be safe." Reach for delegation when
  there is a concrete reason, not as a default.

The parent only sees the sub-agent's final message. If you need the
intermediate findings, instruct the sub-agent to return them in its
summary.

## Persisted vs. Ephemeral Knowledge

Claude Code has a layered memory system. Use it deliberately.

- **Project `CLAUDE.md`** (`./CLAUDE.md`, committed): conventions, build
  commands, architecture-at-a-glance, non-obvious gotchas. Keep it under
  ~200 lines; long files reduce adherence.
- **User `CLAUDE.md`** (`~/.claude/CLAUDE.md`): personal preferences that
  apply across all your projects (preferred languages, comment style,
  communication tone).
- **Managed/enterprise `CLAUDE.md`**: org-wide policy. Cannot be excluded
  by individual settings.
- **Auto memory** (where available): notes the agent writes to itself
  based on corrections and discoveries. Inspect with `/memory`. Toggle
  with the auto memory control in `/memory` or `autoMemoryEnabled` in
  settings. Treat auto memory as suggestions; promote anything important
  into `CLAUDE.md` so it survives across tools.
- **In-session `#` rules**: prefix a message with `#` to add a temporary
  rule for the current session only. Use this to experiment; promote to
  `CLAUDE.md` once it proves useful.

What does *not* belong in `CLAUDE.md`: running task lists, plans for the
current PR, or anything that changes weekly. Memory files should not
become fossils.

## Plan Before You Patch

Plan mode (`Shift+Tab` twice in Claude Code) puts the agent in read-only
mode and forces it to produce a written plan before any file changes.
Available tools in plan mode are read-only: `Read`, `Glob`, `Grep`,
`Task`, `WebFetch`, `WebSearch`, todo management, notebook reads. `Edit`,
`Write`, `Bash`, and state-mutating MCP tools are blocked.

Use plan mode when:

- The change touches three or more files.
- The work involves schema, migration, auth, or anything where a wrong
  step is expensive to roll back.
- You are working in an unfamiliar part of the codebase.
- You cannot describe the exact diff in a single sentence.

Skip plan mode when:

- The change is a one-file, one-function edit you fully understand.
- The task is read-only (a question about the code).

When exiting plan mode, the agent presents the plan via `exit_plan_mode`
and waits for approval. Edit the plan if it is wrong; do not approve a
plan you would not approve as a code review.

## External Tools Are a Tax (MCP)

Model Context Protocol servers extend the agent with tools, resources,
and prompts from external systems. They are useful, but they are not
free.

Every connected MCP server adds tool definitions to the system prompt
on every turn. A handful of well-chosen servers is fine. A dozen is
not — tool-list bloat measurably degrades tool selection and burns
input tokens on every request.

Connect an MCP server when:

- The agent genuinely needs live access to a system you cannot dump
  into context (a database, a ticketing system, a deploy target, your
  monitoring stack).
- The server's tools are *narrow and named for what they do*. A
  `search_jira_issues` tool earns its place; a `do_anything` tool does
  not.

Disconnect or scope an MCP server when:

- You only need it for one task per week. Enable it for that task.
- Its tool descriptions are vague, overlapping, or numerous (10+ tools
  with similar names).
- You can answer the same question with `Bash` and a CLI you already
  trust.

When invoking an MCP tool, address it with its server prefix when
multiple servers are connected; otherwise the agent can pick the wrong
implementation.

## Skills as Loadable Playbooks

Skills are filesystem-based, model-invoked packages: a directory
containing a `SKILL.md` (required) plus optional scripts, references,
and assets. Claude Code loads only the metadata (name + description)
at startup; the full body is loaded on demand when the description
matches the current task.

Project skills live at `.claude/skills/<name>/SKILL.md`. User skills
live at `~/.claude/skills/<name>/SKILL.md`. Plugin skills are bundled
under a plugin's `skills/` directory.

Required frontmatter: `name` (kebab-case, ≤64 chars), `description`
(non-empty, ≤1024 chars). Optional: `allowed-tools`,
`disable-model-invocation`, `user-invocable`, plus custom fields some
tools recognize.

Create a skill when:

- A workflow is repeated across sessions and is too long to keep in
  `CLAUDE.md` without bloating context.
- The workflow has well-defined activation conditions you can describe
  in the `description` field — that's what triggers it.
- You want to bundle scripts or reference docs alongside the
  instructions; skills are directories, `CLAUDE.md` is one file.

Do not create a skill for:

- Generic guidance that applies to every prompt — that's `CLAUDE.md`.
- A one-off task. Skills are infrastructure; if you'll use it once,
  just write the prompt.

The `description` field is the trigger. Be specific about when the
skill should fire ("Use when working with database migrations" beats
"Database stuff"). Skills under-trigger more often than they
over-trigger; err on the side of explicit.

Note: the `allowed-tools` field is enforced by the Claude Code CLI
runtime but does not apply when skills are used through the Agent SDK —
control tool access through `allowedTools` and `permissionMode` in
your SDK config.

## Match the Model to the Task

Anthropic's current lineup, in rough order of capability and cost:

- **Opus**: use for genuinely hard work such as cross-file refactors,
  architecture decisions, large unfamiliar codebases, and planning the
  hardest changes.
- **Sonnet**: use as the daily driver for routine coding work. Default to
  Sonnet unless measured evidence shows Opus does better on the task.
- **Haiku**: use for high-volume classification, routing, simple file
  reads, mechanical edits, and Explore-style codebase search.

Practical routing inside Claude Code:

- Use Opus in plan mode for hard plans, then let Sonnet execute. The
  `/model` command exposes a "Use Opus in plan mode, Sonnet otherwise"
  option for this.
- For one-line edits and quick lookups, drop to Haiku if available.
  Pulling Opus into a single-file rename is a waste.
- Run measured comparisons before standardizing on Opus. On most
  coding tasks the Sonnet/Opus gap is small enough that Sonnet wins
  on cost-per-correct-result.

The default failure mode is using too capable a model for too simple a
task and burning budget. The opposite mistake — using too weak a model
on a hard refactor — produces broken code. Match deliberately.
