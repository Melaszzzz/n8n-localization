# Spanish candidate coverage

Audit date: 2026-08-12
English source baseline: n8n 2.34.4
Status: preview; machine candidate awaiting native UI review

## Coverage

- Source part files represented: **30 / 30**
- Unique English source keys represented: **33,240 / 33,240 (100%)**
- Entries across parts and overrides: **33,604**
- Candidate values identical to English: **1,904**
- Long-tail node entries: **26,244** (24,649 changed; 1,595 intentionally or defensively unchanged)

Identical values include code, queries, JSON/CSV examples, paths, identifiers, product names, international technical labels, and candidates restored to English because translating them could change behavior.

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

`npm test` validates all three current locales and the installer lifecycle:

```text
Validated 3 locales (zh-CN=33240, zh-TW=33240, es=33240),
90 dictionary files, 99720 unique entries, 240 overrides,
and 3 installer scripts.
Installer lifecycle passed for zh-CN, zh-TW, es.
```

Run the locale-specific audit with:

```bash
node localization/locales/es/audit.mjs
```

## Quality boundary

The 100% figure measures source-key coverage and structural safety, not native-language polish. The preview still requires contextual review in the rendered n8n UI by a fluent Spanish reviewer.
