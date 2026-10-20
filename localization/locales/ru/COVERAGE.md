# Russian candidate coverage

Audit date: 2026-09-10
English source baseline: n8n 2.34.6
Status: preview; machine candidate awaiting native UI review

## Original 2.34.6 candidate coverage

- Source part files represented: **31 / 31**
- Unique English source keys represented: **34,041 / 34,041 (100%)**
- Entries across parts and overrides: **34,234**
- Candidate values identical to English: **1,863**
- Long-tail node entries: **26,244** (24,542 changed; 1,702 intentionally or defensively unchanged)

Identical values include code, queries, JSON/CSV examples, paths, identifiers, product names, timezone identifiers, currency codes, international technical labels, and candidates kept in English because translating them could change behavior.

## Final automated audit

| Check | Mismatches |
| --- | ---: |
| Source keys and override keys | 0 |
| Placeholders | 0 |
| HTML tags | 0 |
| URLs | 0 |
| Fenced/inline code and `<code>/<pre>` | 0 |
| Pipe-form separators | 0 |
| Technical tokens | 0 |
| Unresolved cross-part conflicts | 0 |

`npm test` validates all four current locales and the installer lifecycle:

```text
Validated 4 locales (zh-CN=34041, zh-TW=34041, es=34041, ru=34041),
124 dictionary files, 136164 unique entries, 263 overrides,
and 3 installer scripts.
Installer lifecycle passed for zh-CN, zh-TW, es, ru.
```

Run the locale-specific audit with:

```bash
node localization/locales/ru/audit.mjs
```

## Quality boundary

The 100% figure measures source-key coverage and structural safety, not native-language polish. The preview still requires contextual review in the rendered n8n UI by a fluent Russian reviewer, with particular attention to plural forms and to case agreement around non-declinable Latin-script technical terms.

## Current-main integration (2026-10-21)

The 883 keys added upstream for n8n 2.38.6 are explicitly retained in English pending Russian translation. The Russian translation baseline remains 2.34.6. Current key-inventory coverage is 34,924 / 34,924 across 32 source parts, with 35,117 entries including overrides and 2,746 values identical to English. Inventory coverage includes these English fallbacks and does not measure translation completeness.

The locale audit reports zero mismatches and zero conflicts. `npm test` validates 4 locales with 34,924 unique keys each, 128 dictionary files, 139,696 unique entries, and 263 overrides, and checks installer lifecycle and version-monitor behavior.
