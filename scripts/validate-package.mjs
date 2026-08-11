import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'LICENSE',
  'NOTICE',
  'LICENSING.md',
  'README.md',
  'README.zh-CN.md',
  'AI_INSTALL.md',
  'llms.txt',
  'locales.json',
  'install.sh',
  'uninstall.sh',
  'install.ps1',
  'uninstall.ps1',
  'scripts/build-localization.mjs',
  'scripts/install-node-localization.mjs',
  'scripts/install-existing-n8n.mjs',
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(projectDirectory, relativePath))) {
    throw new Error(`Missing required package file: ${relativePath}`);
  }
}

const localeRegistry = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, 'locales.json'), 'utf8'),
);
if (localeRegistry.schemaVersion !== 2 || !localeRegistry.locales?.[localeRegistry.defaultLocale]) {
  throw new Error('locales.json must declare a valid default locale.');
}
const uniqueLocaleFields = ['dictionaryDirectory', 'overlayFile', 'markerAttribute', 'manifestName'];
for (const [locale, details] of Object.entries(localeRegistry.locales)) {
  if (
    !details.nativeName || !details.englishName || !details.status || !details.n8nBaseline ||
    uniqueLocaleFields.some((field) => !details[field])
  ) {
    throw new Error(`locales.json contains incomplete metadata for ${locale}.`);
  }
  if (!['complete', 'preview'].includes(details.status)) {
    throw new Error(`locales.json contains an unsupported status for ${locale}: ${details.status}.`);
  }
}
for (const field of uniqueLocaleFields) {
  const values = Object.values(localeRegistry.locales).map((details) => details[field]);
  if (new Set(values).size !== values.length) {
    throw new Error(`locales.json must use a unique ${field} for every locale.`);
  }
}

function sortedMatches(value, pattern, normalize = (match) => match) {
  return [...value.matchAll(pattern)].map((match) => normalize(match[0])).sort();
}

function validateTranslation(locale, source, translation, location) {
  const checks = [
    ['placeholder', /\{[A-Za-z_][A-Za-z0-9_.-]*\}|%s/g, undefined],
    ['HTML tag', /<\/?[A-Za-z][^>]*>/g, undefined],
    ['URL', /https?:\/\/[^\s<>"')]+/g, (value) => value.replace(/[）。】》、，。；：！？.,;:!?]+$/, '')],
  ];
  for (const [label, pattern, normalize] of checks) {
    const sourceMatches = sortedMatches(source, pattern, normalize);
    if (label === 'URL') {
      if (sourceMatches.some((url) => !translation.includes(url))) {
        throw new Error(`${locale}/${location} changes ${label}s in ${JSON.stringify(source)}.`);
      }
      continue;
    }
    const translatedMatches = sortedMatches(translation, pattern, normalize);
    if (JSON.stringify(sourceMatches) !== JSON.stringify(translatedMatches)) {
      throw new Error(`${locale}/${location} changes ${label}s in ${JSON.stringify(source)}.`);
    }
  }
  if (source.split('|').length !== translation.split('|').length) {
    throw new Error(`${locale}/${location} changes plural-form separators in ${JSON.stringify(source)}.`);
  }
}

const scriptFiles = requiredFiles.filter((file) => file.endsWith('.mjs'));
for (const relativePath of scriptFiles) {
  const result = spawnSync(process.execPath, ['--check', path.join(projectDirectory, relativePath)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`Syntax check failed for ${relativePath}:\n${result.stderr || result.stdout}`);
  }
}

let totalPartFiles = 0;
let totalEntries = 0;
let totalOverrides = 0;
const localeReports = [];
const localeKeySets = new Map();
for (const [locale, localeConfig] of Object.entries(localeRegistry.locales)) {
  const dictionaryDirectory = path.resolve(projectDirectory, localeConfig.dictionaryDirectory);
  if (!dictionaryDirectory.startsWith(`${projectDirectory}${path.sep}`)) {
    throw new Error(`Unsafe dictionary directory for ${locale}: ${localeConfig.dictionaryDirectory}`);
  }
  const partsDirectory = path.join(dictionaryDirectory, 'parts');
  const overridesFile = path.join(dictionaryDirectory, 'overrides.json');
  if (!fs.existsSync(partsDirectory)) throw new Error(`Missing parts directory for ${locale}.`);

  const translations = new Map();
  const conflicts = new Map();
  const partFiles = fs.readdirSync(partsDirectory).filter((name) => name.endsWith('.json')).sort();
  for (const fileName of partFiles) {
    const entries = JSON.parse(fs.readFileSync(path.join(partsDirectory, fileName), 'utf8'));
    if (!entries || Array.isArray(entries) || typeof entries !== 'object') {
      throw new Error(`${locale}/${fileName} must contain a JSON object.`);
    }
    for (const [english, translation] of Object.entries(entries)) {
      if (!english.trim() || typeof translation !== 'string' || !translation.trim()) {
        throw new Error(`${locale}/${fileName} contains an invalid entry for ${JSON.stringify(english)}.`);
      }
      validateTranslation(locale, english, translation, fileName);
      const previous = translations.get(english);
      if (previous && previous.translation !== translation) {
        const files = conflicts.get(english) ?? new Set([previous.fileName]);
        files.add(fileName);
        conflicts.set(english, files);
      }
      if (!previous) translations.set(english, { translation, fileName });
    }
  }

  const overrides = fs.existsSync(overridesFile)
    ? JSON.parse(fs.readFileSync(overridesFile, 'utf8'))
    : {};
  if (!overrides || Array.isArray(overrides) || typeof overrides !== 'object') {
    throw new Error(`${locale}/overrides.json must contain a JSON object.`);
  }
  for (const [english, translation] of Object.entries(overrides)) {
    if (!english.trim() || typeof translation !== 'string' || !translation.trim()) {
      throw new Error(`${locale}/overrides.json contains an invalid entry for ${JSON.stringify(english)}.`);
    }
    validateTranslation(locale, english, translation, 'overrides.json');
    conflicts.delete(english);
  }
  if (conflicts.size > 0) {
    const details = [...conflicts.entries()]
      .map(([english, files]) => `${JSON.stringify(english)} in ${[...files].join(', ')}`)
      .join('\n');
    throw new Error(`Unresolved ${locale} translation conflicts:\n${details}`);
  }
  totalPartFiles += partFiles.length;
  totalEntries += translations.size;
  totalOverrides += Object.keys(overrides).length;
  localeReports.push(`${locale}=${translations.size}`);
  localeKeySets.set(locale, new Set(translations.keys()));
}

const baselineKeys = localeKeySets.get(localeRegistry.defaultLocale);
for (const [locale, keys] of localeKeySets) {
  if (locale === localeRegistry.defaultLocale) continue;
  const missing = [...baselineKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !baselineKeys.has(key));
  if (missing.length || extra.length) {
    throw new Error(
      `${locale} key inventory differs from ${localeRegistry.defaultLocale}: ` +
      `${missing.length} missing, ${extra.length} extra.`,
    );
  }
}

console.log(
  `Validated ${Object.keys(localeRegistry.locales).length} locales (${localeReports.join(', ')}), ` +
  `${totalPartFiles} dictionary files, ${totalEntries} unique entries, ${totalOverrides} overrides, ` +
  `and ${scriptFiles.length} installer scripts.`,
);
