import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const localeDirectory = path.dirname(fileURLToPath(import.meta.url));
const localizationDirectory = path.resolve(localeDirectory, '..', '..');
const sourcePartsDirectory = path.join(localizationDirectory, 'parts');
const candidatePartsDirectory = path.join(localeDirectory, 'parts');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function matches(value, pattern) {
  return [...value.matchAll(pattern)].map((match) => match[0]);
}

function technicalTokens(value) {
  return matches(
    value,
    /\b(?:AI|APIs?|HTTPS?|JSON|MCP|Webhooks?|OAuth|URLs?|SQL|SSH|SSL|TLS|npm|n8n)\b/gi,
  ).map((token) => {
    const normalized = token.toLowerCase();
    if (['apis', 'urls', 'webhooks'].includes(normalized)) return normalized.slice(0, -1);
    return normalized;
  }).sort();
}

function protectedSignatures(value) {
  return {
    placeholders: matches(value, /\{\{[^{}]+\}\}|\$\{[^{}]+\}|\{[^{}]+\}|%s|\$refs/g),
    html: matches(value, /<\/?[A-Za-z][^>]*>/g),
    urls: matches(value, /https?:\/\/[^\s"'<>]+/g),
    fencedCode: matches(value, /```[\s\S]*?```/g),
    inlineCode: matches(value, /``[^`\n]+``|`[^`\n]+`/g),
    codeElements: matches(value, /<(code|pre)\b[^>]*>[\s\S]*?<\/\1>/gi),
    pipeForms: matches(value, /\|/g),
    technicalTokens: technicalTokens(value),
  };
}

const sourcePartFiles = fs.readdirSync(sourcePartsDirectory)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort();
const candidatePartFiles = fs.readdirSync(candidatePartsDirectory)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort();

const allSourceKeys = new Set();
for (const fileName of sourcePartFiles) {
  for (const key of Object.keys(readJson(path.join(sourcePartsDirectory, fileName)))) {
    allSourceKeys.add(key);
  }
}

const entries = [];
const keyMismatches = [];
for (const fileName of candidatePartFiles) {
  const source = readJson(path.join(sourcePartsDirectory, fileName));
  const candidate = readJson(path.join(candidatePartsDirectory, fileName));
  if (JSON.stringify(Object.keys(source)) !== JSON.stringify(Object.keys(candidate))) {
    keyMismatches.push(fileName);
  }
  for (const [english, spanish] of Object.entries(candidate)) {
    entries.push({ english, spanish, fileName });
  }
}

const sourceOverrides = readJson(path.join(localizationDirectory, 'overrides.json'));
const candidateOverrides = readJson(path.join(localeDirectory, 'overrides.json'));
const missingOverrideKeys = Object.keys(sourceOverrides)
  .filter((english) => !(english in candidateOverrides));
const unknownOverrideKeys = Object.keys(candidateOverrides)
  .filter((english) => !allSourceKeys.has(english));
if (missingOverrideKeys.length || unknownOverrideKeys.length) keyMismatches.push('overrides.json');
for (const [english, spanish] of Object.entries(candidateOverrides)) {
  entries.push({ english, spanish, fileName: 'overrides.json' });
}

const signatureMismatches = entries
  .map(({ english, spanish, fileName }) => {
    const source = protectedSignatures(english);
    const target = protectedSignatures(spanish);
    const categories = Object.keys(source)
      .filter((category) => JSON.stringify(source[category]) !== JSON.stringify(target[category]));
    return { english, spanish, fileName, categories };
  })
  .filter(({ categories }) => categories.length > 0);
const identicalValues = entries.filter(({ english, spanish }) => english === spanish);
const candidateUniqueKeys = new Set(entries.map(({ english }) => english));

const translationsByKey = new Map();
for (const { english, spanish, fileName } of entries.filter(({ fileName }) => fileName !== 'overrides.json')) {
  if (!translationsByKey.has(english)) translationsByKey.set(english, new Set());
  translationsByKey.get(english).add(spanish);
}
const conflicts = [...translationsByKey.entries()]
  .filter(([english, translations]) => translations.size > 1 && !(english in candidateOverrides))
  .map(([english, translations]) => ({ english, translations: [...translations] }));

const report = {
  status: 'candidate-needs-native-review',
  candidateFiles: candidatePartFiles.length + 1,
  entries: entries.length,
  uniqueKeys: candidateUniqueKeys.size,
  sourceUniqueKeys: allSourceKeys.size,
  coveragePercent: Number(((candidateUniqueKeys.size / allSourceKeys.size) * 100).toFixed(2)),
  identicalValues: identicalValues.length,
  keyMismatches,
  missingOverrideKeys,
  unknownOverrideKeys,
  placeholderMismatches: signatureMismatches.filter(({ categories }) => categories.includes('placeholders')),
  htmlMismatches: signatureMismatches.filter(({ categories }) => categories.includes('html')),
  urlMismatches: signatureMismatches.filter(({ categories }) => categories.includes('urls')),
  codeOrPreMismatches: signatureMismatches.filter(({ categories }) =>
    categories.some((category) => ['fencedCode', 'inlineCode', 'codeElements'].includes(category))),
  pipeFormMismatches: signatureMismatches.filter(({ categories }) => categories.includes('pipeForms')),
  technicalTokenMismatches: signatureMismatches.filter(({ categories }) =>
    categories.includes('technicalTokens')),
  protectedTokenMismatches: signatureMismatches,
  conflicts,
};

console.log(JSON.stringify(report, null, 2));
if (keyMismatches.length || signatureMismatches.length || conflicts.length) process.exitCode = 1;
