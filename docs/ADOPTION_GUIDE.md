# Adoption Guide

Use this guide to roll the rules into an existing team or project without making
every workflow slower.

## Start with one repository

Pick a repo where AI coding agents already produce useful work but occasionally
make messy diffs. Add `CLAUDE.md` and the Cursor rule. Do not add every
optional file on day one.

## Tune by observed failures

When an agent makes a bad change, classify the failure:

- guessed requirement
- unscoped rewrite
- no verification
- context bloat
- wrong tool
- unnecessary subagent
- excessive abstraction

Patch the relevant guideline with one concrete sentence. Avoid turning the rules
into a long essay.

## Keep rules short enough to obey

A 1,000-line policy is easier to ignore than a 150-line policy. The main
`CLAUDE.md` can be longer than a prompt, but it should still be direct. Move
examples and extended discussion into docs.

## Use skills for long workflows

If a workflow is specific, repeated, and too long for `CLAUDE.md`, make it a
Skill. Good skill triggers name the domain and task clearly: migrations,
payments, release notes, incident reviews, or a project-specific build process.

## Review agent output differently

Review AI-generated changes for:

- files touched outside the request
- unsupported assumptions
- new configuration with only one caller
- missing tests or unverifiable claims
- dependency additions
- silent behavior changes

The guidelines are meant to reduce these issues, not replace review.
