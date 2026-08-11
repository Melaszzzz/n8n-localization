import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partsDirectory = path.join(projectDirectory, 'localization', 'parts');
const overridesFile = path.join(projectDirectory, 'localization', 'overrides.json');
const requiredFiles = [
  'LICENSE',
  'NOTICE',
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
if (localeRegistry.schemaVersion !== 1 || !localeRegistry.locales?.[localeRegistry.defaultLocale]) {
  throw new Error('locales.json must declare a valid default locale.');
}
for (const [locale, details] of Object.entries(localeRegistry.locales)) {
  if (!details.nativeName || !details.englishName || !details.status) {
    throw new Error(`locales.json contains incomplete metadata for ${locale}.`);
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

const translations = new Map();
const conflicts = new Map();
const partFiles = fs.readdirSync(partsDirectory).filter((name) => name.endsWith('.json')).sort();
for (const fileName of partFiles) {
  const entries = JSON.parse(fs.readFileSync(path.join(partsDirectory, fileName), 'utf8'));
  if (!entries || Array.isArray(entries) || typeof entries !== 'object') {
    throw new Error(`${fileName} must contain a JSON object.`);
  }
  for (const [english, chinese] of Object.entries(entries)) {
    if (!english.trim() || typeof chinese !== 'string' || !chinese.trim()) {
      throw new Error(`${fileName} contains an invalid entry for ${JSON.stringify(english)}.`);
    }
    const previous = translations.get(english);
    if (previous && previous.chinese !== chinese) {
      const files = conflicts.get(english) ?? new Set([previous.fileName]);
      files.add(fileName);
      conflicts.set(english, files);
    }
    if (!previous) translations.set(english, { chinese, fileName });
  }
}

const overrides = JSON.parse(fs.readFileSync(overridesFile, 'utf8'));
if (!overrides || Array.isArray(overrides) || typeof overrides !== 'object') {
  throw new Error('localization/overrides.json must contain a JSON object.');
}
for (const [english, chinese] of Object.entries(overrides)) {
  if (!english.trim() || typeof chinese !== 'string' || !chinese.trim()) {
    throw new Error(`overrides.json contains an invalid entry for ${JSON.stringify(english)}.`);
  }
  conflicts.delete(english);
}
if (conflicts.size > 0) {
  const details = [...conflicts.entries()]
    .map(([english, files]) => `${JSON.stringify(english)} in ${[...files].join(', ')}`)
    .join('\n');
  throw new Error(`Unresolved translation conflicts:\n${details}`);
}

console.log(
  `Validated ${partFiles.length} dictionary files, ${translations.size} unique entries, ` +
  `${Object.keys(overrides).length} overrides, and ${scriptFiles.length} installer scripts.`,
);
