# Localization Roadmap

This roadmap describes planned work. It does not mean that any locale below is currently available. The authoritative list of installable locales remains [`locales.json`](locales.json).

## Translation source policy

- The installed n8n release's official English resources and visible node definitions are the only translation source.
- Every locale is translated directly from English. Simplified Chinese may help identify UI context, but its wording must never be used as an intermediate translation source.
- Existing locale files may share English keys, extraction tooling, validation rules, and installer behavior. They must not share translated values.
- Code, expressions, identifiers, JSON keys, API payloads, user data, secrets, product names, and established technical terms remain unchanged unless n8n itself presents them as translatable UI.
- Ambiguous or safety-sensitive actions may use bilingual labels when that improves precision without changing the underlying value.

## Shared foundation

Before a second locale is published, the current single-locale implementation must be generalized without changing the behavior of `zh-CN`:

1. Extract the English key set from a pinned n8n baseline and retain source provenance.
2. Give each locale its own dictionary and override paths, declared through the existing locale registry.
3. Make the overlay builder and native node-translation installer select the requested locale rather than relying on `zh-CN` constants.
4. Apply the existing exact-match, conflict, placeholder, protected-content, dry-run, manifest, and uninstall checks to every locale.
5. Validate each registered locale independently on macOS, Windows, and Linux.

Planned locales stay out of `locales.json` until they are installable and have passed their release gate. Missing keys on newer n8n versions must remain in English and must not make installation fail.

## Standard workflow for each locale

1. Freeze the official English baseline and generate the locale's key inventory.
2. Establish a terminology guide and a do-not-translate list.
3. Produce translations in small, reviewable batches directly from the English source. Automated drafting is allowed, but it is not acceptance evidence.
4. Validate key parity, placeholders, markup, conflicts, preserved terms, and protected content.
5. Review the editor shell, credentials, settings, triggers, core nodes, AI nodes, data views, errors, and empty states in a running n8n instance.
6. Test install, reinstall, version-tolerant partial matching, and uninstall on all supported operating systems.
7. Add the locale to `locales.json` only after its release gate passes.

For every locale, "complete" means:

- 100% of the eligible English keys in the pinned baseline are translated or explicitly recorded as intentionally preserved;
- no unresolved dictionary conflicts or placeholder/markup mismatches remain;
- no workflow data, credentials, expressions, code, field values, or serialized parameters are translated;
- native node translations and overlay translations both pass automated validation;
- representative workflows pass human UI review by a proficient speaker;
- installation and clean removal pass on macOS, Windows, and Linux.

## Delivery order

### 1. Traditional Chinese — `zh-TW`

**Entry conditions**

- The shared multi-locale foundation is complete and `zh-CN` regression tests pass unchanged.
- A Taiwan terminology guide exists for workflow automation, credentials, scheduling, data handling, and AI features.
- The English baseline and protected-term list are frozen.

**Regional terminology strategy**

- `zh-TW` follows terminology and writing conventions used in Taiwan.
- Taiwan and Hong Kong terms are tracked in a regional terminology matrix; Hong Kong-specific wording is not mixed into `zh-TW`.
- A future `zh-HK` locale must have its own reviewed values and release gate. Traditional characters or a conversion tool may seed candidate text, but every accepted value must be checked against the original English source.

**Human review focus**

- Taiwan usage for software, authentication, execution, scheduling, tables, fields, and error states.
- Character variants, punctuation, spacing, measure words, and concise control labels.
- Safety-sensitive actions and terms whose Simplified Chinese wording would be misleading in Taiwan.

**Definition of complete**

- The standard completion definition is met.
- The regional terminology matrix has no unresolved Taiwan/Hong Kong collisions in released strings.
- No entry is accepted solely because it is a character-converted `zh-CN` value.

**Release gate**

- Two review passes: terminology consistency and in-product UI review.
- Smoke tests cover installation, representative editor and node screens, workflow serialization, and uninstall on all three operating systems.

### 2. Spanish — `es`

**Entry conditions**

- `zh-TW` has completed the multi-locale release path without a `zh-CN` regression.
- A neutral international Spanish style guide defines treatment of regional vocabulary, formality, and technical anglicisms.

**Human review focus**

- Neutral wording understandable across major Spanish-speaking regions.
- Consistent imperative forms, grammatical gender, articles, pluralization, and UI length.
- Clear distinction among execution, run, trigger, workflow, credential, field, item, and record concepts.

**Definition of complete**

- The standard completion definition is met.
- Regionalisms are either replaced with neutral terms or documented as deliberate choices.
- Long labels and descriptions have been checked for clipping in narrow node panels and dialogs.

**Release gate**

- Review by at least one proficient Spanish speaker, followed by a separate terminology pass.
- Representative editor, node, credential, scheduling, and error flows pass UI and cross-platform installation tests.

### 3. Brazilian Portuguese — `pt-BR`

**Entry conditions**

- The Spanish release has confirmed that independent Latin-script dictionaries do not leak values between locales.
- A Brazilian Portuguese terminology guide and locale-specific orthography rules are approved.

**Human review focus**

- Brazilian rather than European Portuguese usage.
- Natural verb forms, contractions, gender, pluralization, and established Brazilian software terminology.
- Clear treatment of execution, credentials, nodes, webhooks, schedules, and AI concepts.

**Definition of complete**

- The standard completion definition is met.
- No European Portuguese wording remains unless it is also standard in Brazil.
- UI length and readability are reviewed in node panels, tables, dialogs, and notifications.

**Release gate**

- Review by at least one proficient Brazilian Portuguese speaker and a terminology consistency pass.
- Cross-platform install, reinstall, partial-version compatibility, and uninstall tests pass.

### 4. Japanese — `ja`

**Entry conditions**

- The shared tooling supports locale-specific typography and preserves mixed Latin/Japanese technical text correctly.
- A Japanese style guide defines politeness level, sentence endings, katakana policy, and retained English terms.

**Human review focus**

- Natural product-language phrasing rather than literal English word order.
- Consistent use of kanji, kana, katakana, full-width punctuation, spacing, and counters.
- Compact labels for constrained controls, plus unambiguous wording for destructive or security-sensitive actions.

**Definition of complete**

- The standard completion definition is met.
- A native or professionally proficient reviewer has checked all high-frequency editor and node flows.
- Mixed-script strings, placeholders, links, keyboard shortcuts, and inline code render correctly.

**Release gate**

- Native-level language review and a separate in-product UX pass are complete.
- Visual smoke tests cover dense node panels, tables, dialogs, notifications, AI nodes, and cross-platform installation/removal.

### 5. Indonesian — `id`

**Entry conditions**

- The preceding releases establish a stable process for terminology guides, independent dictionaries, and reviewer sign-off.
- An Indonesian guide defines standard formal product language and the treatment of common English technical terms.

**Human review focus**

- Natural, concise Indonesian rather than word-for-word English structure.
- Consistent affixes, active/passive forms, plural treatment, and technical loanwords.
- Clear differentiation of trigger, execution, workflow, item, field, credential, and connection concepts.

**Definition of complete**

- The standard completion definition is met.
- Informal or regionally narrow wording has been removed from general interface text.
- High-frequency automation, credential, scheduling, webhook, data, and AI flows have received human UI review.

**Release gate**

- Review by at least one proficient Indonesian speaker and a terminology consistency pass.
- Cross-platform installation, representative UI, workflow integrity, version-tolerant matching, and uninstall tests pass.

## Maintenance after release

- The n8n version watcher opens maintenance work; it does not publish translations automatically.
- For each new n8n baseline, extract the changed official English keys and translate only those changes directly from English.
- A locale keeps its complete status only after changed keys pass its automated and human review gates.
- Releases must never silently fall back to another translated locale. Unmatched source text stays in English.
