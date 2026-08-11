# AI installation guide

This repository installs interface translations into an existing self-hosted n8n installation. It does not install or redistribute n8n.

## Applicability

- Supported: self-hosted n8n installed with npm on macOS, Windows, or Linux.
- Supported with an explicit target: an extracted n8n package or a project containing `node_modules/n8n`.
- Docker: run the installer during image construction. Do not modify a running ephemeral container.
- Not supported: n8n Cloud.

## Available locales

Run:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --list-locales
```

The current complete locale is `zh-CN` (Simplified Chinese).

## Install

If n8n is discoverable from the current project or global npm installation:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN
```

If discovery fails, locate the directory containing `node_modules/n8n` and pass it explicitly:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --target /path/to/project
```

After installation, restart the existing n8n service and reload the editor without browser cache.

## Safety rules for assistants

- Do not install a second copy of n8n.
- Do not delete or recreate the n8n data directory.
- Do not modify workflows, credentials, databases, environment secrets, or user content.
- Do not expose a local n8n instance to the public internet.
- Use `--dry-run` first when the installation target is uncertain.
- If n8n is newer than the translation baseline, proceed only with exact matches; unmatched text remains English.

## Uninstall

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --uninstall
```

The uninstaller restores only files managed by this project and preserves files changed after installation.
