# Russian Node Long-tail Translation Review

## Scope

- Source: `localization/parts/node_full_coverage.json` (source keys only; source values were not used)
- Target: standard Russian (`ru`), formal register (обращение на «вы»)
- Translation method: batch translation of the English source keys through the model driving this repository's tooling, in index-keyed batches with a structural check after every batch
- Total source keys: 26,244
- Target keys: 26,244
- Coverage: 100.00%

## Results

- Translated/changed entries after the final terminology pass: 24,542
- Intentionally or defensively kept unchanged (English/code/brand/identifier): 1,702
- Translation failures: 0
- Missing source keys: 0
- Extra target keys: 0

The unchanged group is dominated by timezone identifiers (`UTC +03:00 Europe Moscow` and the like), which account for 525 of the 1,702 entries; the rest are currency codes, model names, SQL and JSON fragments, sample values, and brand names.

## Structural preservation checks

| Protected class | Entries with mismatches |
| --- | ---: |
| HTML tags | 0 |
| URLs | 0 |
| placeholders | 0 |
| inline backtick code | 0 |
| HTML code spans | 0 |
| HTML pre spans | 0 |
| email addresses | 0 |
| pipe-form separators | 0 |

All source keys remain exact keys in the target JSON. Where a candidate would have required rewriting code, a query, an expression, or a JSON/CSV example, the English source was kept instead.

## Technical-token checks

| Token | Entries with occurrence-count mismatches |
| --- | ---: |
| AI | 0 |
| API | 0 |
| HTTP | 0 |
| HTTPS | 0 |
| JSON | 0 |
| MCP | 0 |
| Webhook | 0 |
| OAuth | 0 |
| URL | 0 |
| SQL | 0 |
| SSH | 0 |
| SSL | 0 |
| TLS | 0 |
| npm | 0 |
| n8n | 0 |
| OpenAI | 0 |
| GitHub | 0 |
| SharePoint | 0 |

Reproduce with:

```bash
node localization/locales/ru/audit.mjs
```

## Terminology pass

AI, API, HTTP/HTTPS, JSON, MCP, Webhook, OAuth, URL, SQL, npm, n8n, and common provider/product names are kept as technical terms in Latin script, as specified in `TERMINOLOGY.md`. A final pass corrected 107 candidates that had translated `URL` or `Webhook` into Russian, reordered placeholders, or reordered `<a>`/`<code>` spans relative to the English source.

## Known limitation

This is high-coverage machine translation with deterministic terminology correction and structural validation, not a line-by-line native-speaker linguistic review. Russian case agreement around non-declinable Latin-script terms and three-form plurals are the two areas most likely to need human correction. The locale remains a preview until representative UI screens and product-specific long descriptions receive fluent human review.
