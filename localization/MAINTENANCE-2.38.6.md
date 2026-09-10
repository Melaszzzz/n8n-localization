# n8n 2.38.6 maintenance

Date: 2026-09-10

This update moves the localization baseline directly from n8n 2.34.6 to 2.38.6. Intermediate n8n versions were not individually tested.

## Source and scope

Official npm packages used for the comparison and installer checks:

- `n8n@2.38.6`
- `n8n-editor-ui@2.38.2`
- `n8n-nodes-base@2.38.2`
- `@n8n/n8n-nodes-langchain@2.38.2`

The English editor locale was extracted from the official source map. Node labels, descriptions, hints and option labels were read from the published node definitions. Internal parameter names and option values were not translated.

The comparison identified 883 additional keys: uncovered editor strings and new node strings since the previous baseline. All three dictionaries include the same additional keys. Technical identifiers, model names and examples may intentionally retain their original spelling. Existing node strings outside the previous translation scope were not reclassified as new coverage.

Each locale has 34,924 unique dictionary keys. Key counts describe dictionary coverage, not a guarantee that every visible string in every integration is translated. Dynamic content and unknown text remain unchanged.

## Validation

- Dictionary key parity and protected placeholders, HTML, URLs and code.
- Installer fixtures, including install, repeat install, conflicts and removal.
- Install, repeat install and removal against the real packages listed above for all three languages. After removal, all 41,348 original package files were byte-for-byte identical.
- The release workflow requires macOS, Windows and Linux validation to succeed before publishing.
- Version-monitor tests cover missing/draft/prerelease releases, skipped versions, the current baseline, future versions and pull-request exclusion.

Traditional Chinese and Spanish remain preview languages pending native-speaker UI review. This maintenance does not upgrade users' n8n instances automatically.
