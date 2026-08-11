# Spanish Node Long-tail Translation Review

## Scope

- Source: `localization/parts/node_full_coverage.json` (source keys only; source values were not used)
- Target: neutral international Spanish (`es`)
- Translation engine: `Helsinki-NLP/opus-mt-en-es` (offline local inference, greedy decoding)
- Total source keys: 26,244
- Target keys: 26,244
- Coverage: 100.00%

## Results

- Translated/changed entries after the independent safety pass: 24,649
- Intentionally or defensively kept unchanged (English/code/brand): 1,595
- Heuristic natural-language English residual candidates: 0
- Translation failures: 0
- Missing source keys: 0
- Extra target keys: 0

## Structural preservation checks

| Protected class | Entries with mismatches |
| --- | ---: |
| HTML tags | 0 |
| URLs | 0 |
| placeholders | 0 |
| inline backtick code | 0 |
| HTML code spans | 0 |
| HTML pre spans | 0 |
| UUIDs | 0 |
| email addresses | 0 |
| all supported placeholders | 0 |

All source keys remain exact keys in the target JSON. The independent review restored unsafe JSON, CSV, query, expression, path, and mixed code/prose candidates to English when exact code preservation could not otherwise be guaranteed.

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
| URI | 0 |
| n8n | 0 |
| OpenAI | 0 |
| Anthropic | 0 |
| GitHub | 0 |
| GitLab | 0 |
| SharePoint | 0 |


## Terminology pass

AI, API, HTTP/HTTPS, JSON/JSONL, MCP, Webhook, OAuth, URL/URI, n8n, and common provider/product names are kept as technical terms. A deterministic post-pass also normalized recurring n8n terminology, Spanish equivalents for `e.g.`/`i.e.`, Webhook spelling, and spacing around protected product terms.

## Known limitation

This is high-coverage machine translation with deterministic terminology correction and structural validation, not a line-by-line native-speaker linguistic review. It remains a preview until representative UI screens and product-specific long descriptions receive fluent human review.
