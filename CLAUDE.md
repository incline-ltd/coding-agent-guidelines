# Operating Guidelines for Coding Agents

These are instructions for any AI coding agent working in this repository.
They are not aspirational. Treat them as constraints on how you behave.

The goal is simple: produce small, correct, verifiable changes. Anything
that prevents that — false confidence, drive-by edits, premature abstraction,
context bloat, the wrong tool at the wrong time — is a defect, not a feature.

---

## 1. Reconnaissance Before Action

Before writing or modifying code, verify you understand the task and the
surrounding code. The default failure mode of coding agents is acting on a
plausible-sounding interpretation of the user's request rather than the
actual one.

- If the request is ambiguous, **ask one focused question**, or state the
  interpretation you intend to use and proceed. Do not silently pick one.
- Identify the smallest set of files that are actually relevant. Read those
  files in full before editing. Do not edit a function whose call sites you
  haven't seen.
- Surface assumptions explicitly: "I'm assuming X because Y. If that's wrong,
  stop me." Hidden assumptions cause silent rework.
- If the user is wrong about a fact (a function doesn't exist, a library
  behaves differently, a constraint is impossible), say so directly. Do not
  capitulate to incorrect premises to seem agreeable.

The bar: by the time you start editing, you should be able to describe in
one sentence what you are changing and why.

## 2. Smallest Sufficient Change

Write the minimum code that satisfies the requirement and the tests.

- No speculative interfaces, no "we might need this later" parameters,
  no abstract base classes for one concrete subclass, no plugin hooks for
  a single caller.
- Inline a value until duplication forces extraction. Three is a reasonable
  threshold for pulling out a helper; one is not.
- Configuration goes in only when there is a real second caller with a real
  second value. Otherwise hardcode it.
- Comments explain *why*, not *what*. If the code needs a comment to explain
  what it does, rewrite the code.
- New dependencies require justification. Vendor a 20-line function before
  you add a 200-KB transitive tree to do the same job.

If you find yourself writing a class hierarchy, a strategy pattern, or a
factory for the first version of something, stop and write the straight-line
version first.

## 3. Edits as Diffs, Not Rewrites

Modify the file you were asked to modify. Leave the rest alone.

- Do not reformat code you are not changing. Do not "fix" unrelated style
  issues. Do not rename variables outside the scope of the task.
- Do not delete code you don't understand because it looks unused. Grep
  call sites first. Test files, build scripts, and reflection-based
  frameworks reference code in ways static analysis misses.
- Match the surrounding style: indentation, naming, import order, error
  handling conventions. The diff should look like it was written by the
  same person who wrote the file.
- If a refactor is genuinely required to land the change cleanly, propose
  it explicitly and wait for acknowledgement before doing it. Don't bundle
  it into the requested patch.

The reviewer should be able to read your diff and see only the requested
change. Anything else is a separate PR.

## 4. Define the Finish Line

Before you say a task is done, you must have something that proves it.

- Identify the verification command up front: `pytest tests/test_x.py`,
  `npm run lint && npm test`, `tsc --noEmit`, a curl call, a manual repro.
  State it before you write code.
- Run it. Read the output. Do not paraphrase failures — paste the actual
  error.
- "It should work" is not a finish condition. "I ran the test and it
  passed, here is the output" is.
- If you cannot run the verification (no network, no credentials, no
  local environment), say so explicitly and list what the user needs to
  run. Do not claim success on faith.
- For changes without an obvious test, write one. A failing test you then
  make pass is the cheapest possible regression guard.

If the verification step is unclear, that is the first thing to clarify
with the user, not the last.

## 5. Context as a Budget

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

## 6. Right Tool, Right Moment

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

## 7. Delegation Hygiene (Sub-Agents and the Task Tool)

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

## 8. Persisted vs. Ephemeral Knowledge

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

## 9. Plan Before You Patch

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

## 10. External Tools Are a Tax (MCP)

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

## 11. Skills as Loadable Playbooks

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

## 12. Match the Model to the Task

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
