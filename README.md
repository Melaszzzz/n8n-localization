# n8n Localization

Documentation: English | [简体中文](README.zh-CN.md)

Community-maintained interface localization for existing self-hosted n8n installations. The project provides translation files and a reversible installer; it does not contain or redistribute n8n.

## Available localization packages

| Locale | Language | Status | Full baseline |
| --- | --- | --- | --- |
| `zh-CN` | Simplified Chinese | Complete | n8n 2.34.4 |
| `zh-TW` | Traditional Chinese (Taiwan) | Preview | n8n 2.34.4 |
| `es` | Spanish | Preview | n8n 2.34.4 |

Preview locales have full automated key coverage and pass installer validation, but still need proficient-speaker review in the live n8n interface. Planned locales and their release gates are tracked in the [localization roadmap](ROADMAP.md).

## Why this package

- Installs into an existing n8n installation without replacing the complete editor build.
- Uses manifest-managed changes and supports safe removal.
- Translates the main interface and node parameters through separate, compatible mechanisms.
- Uses exact source-text matching. Unknown or changed text remains in English.
- Preserves workflows, credentials, databases, API payloads, user input, code, and expressions.
- Tested on macOS, Windows, and Linux.

## Compatibility

- Self-hosted n8n installed locally or globally with npm.
- macOS, Windows, and Linux.
- Docker when the installer is run while building the image.
- n8n versions other than the full baseline are accepted; unmatched strings remain English.
- n8n Cloud is not supported because its editor files cannot be modified.

## Install

Requirements: an existing working n8n installation and Node.js 18 or newer.

List available languages:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --list-locales
```

Install Simplified Chinese:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN
```

Use `--locale zh-TW` for Traditional Chinese (Taiwan), or `--locale es` for Spanish. The installer prints a notice before installing a preview locale.

If n8n cannot be found automatically, specify its project, `node_modules`, or package directory:

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --target /path/to/n8n/project
```

Windows PowerShell:

```powershell
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --target "C:\path\to\n8n\project"
```

Restart the existing n8n service after installation and reload the editor without browser cache.

If this package is useful, star the repository to find it again and follow future locale updates.

## Uninstall

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --uninstall
```

The uninstaller restores only files managed by this project. Files modified after installation are reported and preserved. Uninstall the active locale before switching to another one.

## Translation policy

- Prefer n8n's native node translation mechanism; use a restricted frontend overlay for missing editor text.
- Keep established technical terms such as AI, API, HTTP, JSON, MCP, and Webhook in English.
- Show ambiguous or safety-sensitive terms bilingually where that improves precision.
- Never translate code, expressions, user data, field values, raw error details, workflow names, credential names, or secrets.
- Never use fuzzy or substring replacement.

## For AI assistants

Use the commands above only when the user already has a self-hosted n8n installation. Read [AI_INSTALL.md](AI_INSTALL.md) for target discovery, Docker guidance, safety constraints, and recovery steps. Machine-readable locale metadata is available in [locales.json](locales.json).

## Development

```bash
npm test
npm pack --dry-run
```

GitHub Actions validate dictionaries, installers, and package contents on macOS, Windows, and Linux. Translation provenance is documented in [localization/PROVENANCE.md](localization/PROVENANCE.md).

## License

Releases from `v0.4.0` onward are source-available under the [PolyForm Strict License 1.0.0](LICENSE). Unmodified noncommercial use is permitted; commercial use, modification, derivative works, and redistribution require separate written authorization. See [LICENSING.md](LICENSING.md).

n8n is not included and remains subject to the [n8n license](https://github.com/n8n-io/n8n/blob/master/LICENSE.md). See [NOTICE](NOTICE) for details.
