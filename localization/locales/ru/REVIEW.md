# Russian locale review status

Status: **preview — complete machine candidate, native UI review still required**.

## Source and generation

- English source baseline: all keys in `localization/parts/*.json` for n8n 2.34.6.
- The Chinese and Spanish translations were not used as translation input; every value was produced from the English source key.
- The whole key set was translated in 103 index-keyed batches so that no candidate could drift out of alignment with its source key.
- One translation per unique English key was produced globally, which removes cross-part conflicts by construction.

## Independent review performed

- Full key-set comparison against all 31 English source parts.
- Placeholder, HTML tag, URL, fenced/inline code, `<code>/<pre>`, pipe-form, and technical-token parity checks after every batch.
- 107 candidates corrected in a final terminology pass, restoring the protected tokens `URL` and `Webhook`, the English placeholder order in five strings, and the original tag order in four `<a>`/`<code>` strings.
- Terminology normalization against `TERMINOLOGY.md`: `рабочий процесс`, `узел`, `триггер`, `выполнение`, `учётные данные`, `таблица данных`, `холст`, `элемент`, `расписание`, `инструмент`.
- Russian plural handling reviewed separately: pipe-separated UI forms keep the two-form arity of the English source, while the overlay renders full three-form Russian plurals for relative time.
- Focused review of core UI, credentials, settings, Schedule Trigger, Webhook, AI Agent, HTTP Request, and Data Table surfaces.
- Installer/package validation through `npm test`.

## Publication boundary

All source keys now have a structurally safe Russian candidate, but coverage is not the same as native linguistic quality. Long-tail node descriptions still contain machine-generated Russian and intentionally preserved English technical examples. A native reviewer should check tone, case agreement, the consistency of the informal/formal register (`вы`), product context, and representative rendered screens on macOS, Windows, and Linux.

Two areas deserve particular attention from the first native reviewer:

- **Plural forms.** Russian needs three forms where the English source has two. Pipe-separated values intentionally keep the source arity, so counts such as `{count} узлов` read correctly for most numbers but not for all.
- **Grammatical case around protected tokens.** `URL`, `Webhook`, `API` and similar terms stay in Latin script and do not decline, so surrounding wording was chosen to stay grammatical without them.

The locale may be distributed only as a clearly labeled preview until that UI review is complete.

## Integration with current main

The Russian translation baseline remains n8n 2.34.6. The 883 keys added upstream for n8n 2.38.6 are included in `parts/n8n_2_38_6.json` with English values, pending Russian translation. This preserves the shared key inventory without presenting untranslated strings as reviewed Russian. The original review and generation statements above describe the 2.34.6 candidate.
