# Security Policy

This repository contains behavioral instructions and plugin metadata. It does
not contain runtime code, secrets, or production infrastructure.

## Supported versions

The default branch and latest release are supported.

## Report a security issue

Please do not open a public issue for:

- malicious prompt-injection content inside a guideline
- plugin packaging that could install unexpected files
- marketplace metadata that points to the wrong source
- hidden executable behavior added to the repo

Email the maintainer or open a private advisory if GitHub enables advisories for
this repository.

## Safety expectations

- No secrets should be committed.
- Plugin metadata should point only to files inside this repository.
- The repo should stay documentation-first; avoid executable install scripts
  unless there is a clear reviewable need.
