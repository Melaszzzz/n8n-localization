# n8n 2.46.7 maintenance

Date: 2026-11-10

The baseline moves directly from n8n 2.38.6 to 2.46.7. Intermediate versions were not individually tested.

## Official sources

- `n8n@2.46.7`
- `n8n-editor-ui@2.46.5`
- `n8n-nodes-base@2.46.7`
- `@n8n/n8n-nodes-langchain@2.46.7`

The editor npm package no longer includes source maps. English editor text was read from `packages/frontend/@n8n/i18n/src/locales/en.json` at the official `n8n@2.46.7` GitHub tag. The editor package version at that tag matches the npm dependency, 2.46.5. Node labels and descriptions were read from the published node definitions.

The incremental audit identified 3,325 uncovered strings: 2,029 editor strings and 1,296 new or changed node strings. All three languages use the same input keys. Technical identifiers, examples, brands and model names may intentionally remain unchanged.

This is an incremental coverage audit. Existing node text outside the prior translation scope is not counted as newly covered. Dictionary key coverage does not guarantee that all dynamic UI content is translated.

## Verification

Validation covers matching key sets, protected placeholders, HTML, URLs and code, installer lifecycle tests, and install/reinstall/uninstall against the official packages above. After uninstalling each language, all 42,153 original package files were byte-for-byte identical.

Publication requires successful macOS, Windows and Linux tests. Traditional Chinese and Spanish remain previews pending native-speaker UI review. This package does not upgrade the user's n8n instance.
