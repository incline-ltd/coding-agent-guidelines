# Architecture

This repository intentionally stores the same behavioral policy in several
install shapes.

## Canonical files

- `CLAUDE.md`: Claude Code project memory.
- `AGENTS.md`: cross-tool fallback for agents that read AGENTS files.
- `SKILL.md`: root copy of the skill body for easy review and copy/paste.
- `CURSOR.md`: human-readable explanation of the Cursor rule.
- `EXAMPLES.md`: worked examples showing failure modes and corrected behavior.

## Ready-to-install paths

- `SKILL.md`: source to copy into a Codex `.agents/skills/<name>` directory.
- Repository and user install paths are documented in `docs/INSTALLATION.md`.
- `.cursor/rules/coding-agent-guidelines.mdc`: Cursor project rule with
  `alwaysApply: true`.
- `.claude/skills/coding-agent-guidelines/SKILL.md`: project-skill path for
  Claude Code.
- `plugins/coding-agent-guidelines/skills/coding-agent-guidelines/SKILL.md`:
  plugin-packaged skill path.

## Plugin marketplace layout

```text
coding-agent-guidelines/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    └── coding-agent-guidelines/
        ├── .claude-plugin/
        │   └── plugin.json
        └── skills/
            └── coding-agent-guidelines/
                └── SKILL.md
```

The root marketplace catalog points Claude Code to the plugin directory. The
plugin manifest points Claude Code to the skill directory inside the plugin.

## Why duplicate files?

The duplication is deliberate because every tool expects a different path:

- Claude Code project memory expects `CLAUDE.md`.
- Cursor project rules expect `.cursor/rules/*.mdc`.
- Claude Code skills expect `.claude/skills/<name>/SKILL.md`.
- Codex skills expect `.agents/skills/<name>/SKILL.md`.
- Claude Code plugins expect a manifest under `.claude-plugin/plugin.json`.
- Generic coding agents often look for `AGENTS.md`.

The content should evolve together. When changing behavior, update the canonical
root file first, then sync the install-path copies.
Run `node scripts/validate.mjs` to validate metadata and confirm that the three
`SKILL.md` copies match.

## Release checklist

1. Run `node scripts/validate.mjs`.
2. Verify README install commands.
3. Confirm repository URLs point to the public GitHub repo.
4. Run Claude plugin validation where available.
5. Update manifest versions and the roadmap before tagging a release.
