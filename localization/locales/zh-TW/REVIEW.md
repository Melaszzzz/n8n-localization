# zh-TW candidate review status

Status: **candidate; not registered for installation and not native-reviewed**.

## Generation method

1. Copied only the English keys from the current zh-CN `parts` and
   `overrides` source files.
2. Used OpenCC's Simplified Chinese to Taiwan Traditional Chinese phrase mode
   (`cn` to `twp`) as a deterministic candidate seed.
3. Applied a Taiwan software terminology pass guided by the English key,
   including a contextual distinction between `project` (`專案`) and n8n data
   `item` (`項目`).
4. Preserved technical identifiers, interpolation placeholders, HTML tags,
   code fragments, URLs, and product names.

The zh-CN value is not treated as the semantic authority. The English key is
the source of meaning. Automated conversion cannot replace review by a native
Taiwan technical translator.

## Automated coverage audit

- Source files compared: 31 (30 parts plus overrides)
- Source entries: 33,433
- Candidate entries: 33,433
- Unique English keys: 33,240
- Entries adjusted by the Taiwan terminology/context pass beyond the raw
  OpenCC seed: 8,928
- Values intentionally kept exactly equal to their English key: 1,233
  (technical labels, identifiers, code, and examples)
- Values with no Han characters: 1,274
- Missing or extra keys: 0
- Placeholder or HTML-token mismatches: 0
- `item` keys incorrectly containing `專案`: 0
- All generated JSON files parse successfully

Repeated English keys across source parts explain the difference between entry
count and unique-key count.

## Second high-frequency Taiwan QA

The second automated QA made 561 counted corrections across 537 entry-edit
passes. Some entries were corrected by both passes, so this is an audit-event
count rather than a distinct-key count.

- Normalized `社羣` to `社群`, `軟體包`/node package to `套件`, `稽覈` to
  `審核`, `全域性` to `全域`, `遠端端` to `遠端`, and `資料錶` to `資料表`.
- Changed software `repository` from `倉庫` to `儲存庫` by checking the
  English key. Genuine warehouse terminology remains `倉庫`.
- Corrected Data Table and dataset UI rows/columns to `資料列`/`欄位` in the
  high-frequency table surfaces. Non-tabular uses were not globally replaced.
- Corrected related high-frequency artifacts including `覈取方塊`, `批准`,
  `瞭解`, `終端使用者`, `提供商`, and `測試用例`.
- Re-sampled navigation, credentials, community nodes, Data Tables, execution
  history, and AI panels after the corrections.

The locale remains preview-only and still requires native review.

## Required human review before release

- Review high-frequency navigation, credentials, workflow editor, execution,
  settings, AI, and community-node screens in a running n8n build.
- Review long descriptions for natural Taiwan phrasing rather than literal
  conversion.
- Confirm `項目` in n8n's item-processing context; a native reviewer may prefer
  `資料項目` or `資料筆` in specific screens.
- Confirm `憑證`, `外掛`, `回應`, `物件`, and `快取` against the intended Taiwan
  audience and keep the choice consistent.
- Inspect line wrapping and truncation for bilingual safety labels.
- Do not mark this locale stable until screenshots and native-language review
  are recorded.

## Known limitations

- This is an automated candidate based on the current English-key inventory;
  it has not been independently translated entry by entry from English.
- Product-specific node labels and technical examples may intentionally remain
  in English.
- Some polysemous English keys need screen context that is unavailable in the
  dictionary alone.
- New n8n keys require a fresh coverage audit and review.
