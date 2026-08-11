#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localeRegistry = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, 'locales.json'), 'utf8'),
);
const manifestName = '.codex-node-localization-manifest.json';
const manifestFormat = 1;

function usage(exitCode = 0) {
  const output = [
    'Usage: node scripts/install-node-localization.mjs [--locale <code>] [--target <node_modules>] [--allow-partial] [--dry-run] [--json]',
    '',
    'Generates n8n node translation files for a locale registered in locales.json.',
    '  --locale  Locale code; defaults to the registry default',
    '  --dry-run  Inspect and report without writing files',
    '  --json     Print a machine-readable report',
    '  --allow-partial  Skip node types that are absent in the installed n8n version',
    '  --help     Show this help',
  ].join('\n');
  (exitCode ? console.error : console.log)(output);
  process.exit(exitCode);
}

function parseArguments(argv) {
  const result = {
    dryRun: false,
    json: false,
    allowPartial: false,
    locale: localeRegistry.defaultLocale,
    target: path.join(projectDirectory, 'node_modules'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') result.dryRun = true;
    else if (argument === '--json') result.json = true;
    else if (argument === '--allow-partial') result.allowPartial = true;
    else if (argument === '--locale') {
      const locale = argv[index + 1];
      if (!locale) usage(2);
      result.locale = locale;
      index += 1;
    }
    else if (argument === '--target') {
      const target = argv[index + 1];
      if (!target) usage(2);
      result.target = path.resolve(target);
      index += 1;
    }
    else if (argument === '--help' || argument === '-h') usage();
    else {
      console.error(`Unknown option: ${argument}`);
      usage(2);
    }
  }
  return result;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read JSON ${filePath}: ${error.message}`);
  }
}

function loadDictionary(localeConfig) {
  const dictionary = new Map();
  const dictionaryDirectory = path.resolve(projectDirectory, localeConfig.dictionaryDirectory);
  const partsDirectory = path.join(dictionaryDirectory, 'parts');
  if (!fs.existsSync(partsDirectory)) {
    throw new Error(`Localization parts directory is missing: ${partsDirectory}`);
  }
  const partFiles = fs
    .readdirSync(partsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();

  for (const fileName of partFiles) {
    const part = readJson(path.join(partsDirectory, fileName));
    for (const [english, chinese] of Object.entries(part)) {
      if (typeof english === 'string' && typeof chinese === 'string' && chinese && chinese !== english) {
        dictionary.set(english, chinese);
      }
    }
  }

  const overridesPath = path.join(dictionaryDirectory, 'overrides.json');
  if (fs.existsSync(overridesPath)) {
    for (const [english, chinese] of Object.entries(readJson(overridesPath))) {
      if (typeof english === 'string' && typeof chinese === 'string' && chinese && chinese !== english) {
        dictionary.set(english, chinese);
      }
    }
  }
  return { dictionary, partFiles: partFiles.length };
}

function translated(dictionary, value) {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  return dictionary.get(value);
}

function safeKey(value) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const key = String(value);
    return key && !['__proto__', 'prototype', 'constructor'].includes(key) ? key : undefined;
  }
  return undefined;
}

function makeObject() {
  return Object.create(null);
}

function setTranslation(root, segments, value, state) {
  if (!value || segments.some((segment) => safeKey(segment) === undefined)) return false;
  let current = root;
  for (const rawSegment of segments.slice(0, -1)) {
    const segment = safeKey(rawSegment);
    if (!Object.hasOwn(current, segment)) current[segment] = makeObject();
    if (!current[segment] || typeof current[segment] !== 'object') {
      state.collisions += 1;
      state.structuralCollisions += 1;
      return false;
    }
    current = current[segment];
  }
  const leaf = safeKey(segments.at(-1));
  if (Object.hasOwn(current, leaf)) {
    if (current[leaf] !== value) {
      state.collisions += 1;
      state.valueCollisions += 1;
    }
    return false;
  }
  current[leaf] = value;
  state.strings += 1;
  return true;
}

function translateFields(source, output, basePath, dictionary, state) {
  const fields = ['displayName', 'description', 'placeholder', 'hint'];
  for (const field of fields) {
    const value = translated(dictionary, source?.[field]);
    if (value) setTranslation(output, [...basePath, field], value, state);
  }
}

function translateOption(option, output, optionPath, dictionary, state) {
  const displayName = translated(dictionary, option?.name ?? option?.displayName);
  if (displayName) setTranslation(output, [...optionPath, 'displayName'], displayName, state);
  for (const field of ['description', 'hint']) {
    const value = translated(dictionary, option?.[field]);
    if (value) setTranslation(output, [...optionPath, field], value, state);
  }
}

function translateProperty(property, output, basePath, dictionary, state) {
  const propertyName = safeKey(property?.name);
  if (!propertyName) return;
  const propertyPath = [...basePath, propertyName];
  translateFields(property, output, propertyPath, dictionary, state);

  for (const field of ['multipleValueButtonText', 'addOptionalFieldButtonText']) {
    const value = translated(dictionary, property?.typeOptions?.[field]);
    if (value) setTranslation(output, [...propertyPath, field], value, state);
  }

  if (!Array.isArray(property.options)) return;
  const isSimpleOptions = property.type === 'options' || property.type === 'multiOptions';
  if (isSimpleOptions) {
    for (const option of property.options) {
      const optionKey = safeKey(option?.value);
      if (!optionKey) continue;
      translateOption(option, output, [...propertyPath, 'options', optionKey], dictionary, state);
    }
    return;
  }

  for (const option of property.options) {
    if (Array.isArray(option?.values)) {
      const optionKey = safeKey(option.name);
      if (!optionKey) continue;
      const optionPath = [...propertyPath, 'options', optionKey];
      translateOption(option, output, optionPath, dictionary, state);
      for (const child of option.values) {
        translateProperty(child, output, [...optionPath, 'values'], dictionary, state);
      }
    } else {
      // A collection's options are properties themselves. The official i18n path
      // inserts "options" before each child property name.
      translateProperty(option, output, [...propertyPath, 'options'], dictionary, state);
    }
  }
}

function highestVersion(description) {
  const versions = Array.isArray(description.version) ? description.version : [description.version];
  return Math.max(0, ...versions.filter((value) => Number.isFinite(Number(value))).map(Number));
}

function buildTranslation(descriptions, dictionary) {
  const output = makeObject();
  const state = { collisions: 0, structuralCollisions: 0, valueCollisions: 0, strings: 0 };
  const ordered = [...descriptions].sort((a, b) => highestVersion(b) - highestVersion(a));
  const current = ordered[0];

  translateFields(current, output, ['header'], dictionary, state);
  const eventTriggerDescription = translated(dictionary, current?.eventTriggerDescription);
  if (eventTriggerDescription) {
    setTranslation(output, ['nodeView', 'eventTriggerDescription'], eventTriggerDescription, state);
  }
  for (const description of ordered) {
    for (const property of description.properties ?? []) {
      translateProperty(property, output, ['nodeView'], dictionary, state);
    }
  }
  return { output, ...state };
}

function translationDirectory(nodeSourcePath, locale) {
  const nodeDirectory = path.dirname(nodeSourcePath);
  let maxVersion = null;
  for (const entry of fs.readdirSync(nodeDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^v\d{1,2}$/i.test(entry.name)) continue;
    const version = Number(entry.name.slice(1));
    if (maxVersion === null || version > maxVersion) maxVersion = version;
  }
  // Match n8n's NodeTypes.getNodeTranslationPath() exactly: it constructs a
  // lower-case vN segment even when the installed package uses Vn on macOS.
  return maxVersion === null
    ? path.join(nodeDirectory, 'translations', locale)
    : path.join(nodeDirectory, `v${maxVersion}`, 'translations', locale);
}

function isManagedRelativePath(packageDirectory, relativePath, locale) {
  if (typeof relativePath !== 'string' || path.isAbsolute(relativePath)) return false;
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith(`..${path.sep}`) || normalized === '..') return false;
  if (!normalized.endsWith('.json')) return false;
  const segments = normalized.split(path.sep);
  if (!segments.includes('translations') || !segments.includes(locale)) return false;
  const absolute = path.resolve(packageDirectory, normalized);
  return absolute.startsWith(`${path.resolve(packageDirectory)}${path.sep}`);
}

function readManifest(manifestPath, packageDirectory, locale) {
  if (!fs.existsSync(manifestPath)) return { entries: [] };
  const manifest = readJson(manifestPath);
  if (manifest.format !== manifestFormat || !Array.isArray(manifest.entries)) {
    throw new Error(`Refusing to replace an unrecognized manifest: ${manifestPath}`);
  }
  for (const entry of manifest.entries) {
    if (!isManagedRelativePath(packageDirectory, entry?.path, locale) || typeof entry?.content !== 'string') {
      throw new Error(`Unsafe entry in localization manifest: ${manifestPath}`);
    }
  }
  return manifest;
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryPath, content, 'utf8');
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

function buildPackagePlan(packageInfo, dictionary, locale) {
  const packageJson = readJson(path.join(packageInfo.directory, 'package.json'));
  const declaredSources = new Set(packageJson?.n8n?.nodes ?? []);
  const knownNodes = readJson(path.join(packageInfo.directory, 'dist', 'known', 'nodes.json'));
  const descriptions = readJson(path.join(packageInfo.directory, 'dist', 'types', 'nodes.json'));
  const descriptionsByName = new Map();
  for (const description of descriptions) {
    if (!descriptionsByName.has(description.name)) descriptionsByName.set(description.name, []);
    descriptionsByName.get(description.name).push(description);
  }

  const desired = new Map();
  const nodes = [];
  let collisions = 0;
  let structuralCollisions = 0;
  let valueCollisions = 0;
  for (const [nodeName, metadata] of Object.entries(knownNodes)) {
    if (!declaredSources.has(metadata.sourcePath)) continue;
    const variants = descriptionsByName.get(nodeName);
    if (!variants?.length || !/^[A-Za-z0-9_.-]+$/.test(nodeName)) continue;
    const built = buildTranslation(variants, dictionary);
    collisions += built.collisions;
    structuralCollisions += built.structuralCollisions;
    valueCollisions += built.valueCollisions;
    if (built.strings === 0) continue;
    const outputDirectory = translationDirectory(path.join(packageInfo.directory, metadata.sourcePath), locale);
    const outputPath = path.join(outputDirectory, `${nodeName}.json`);
    const content = `${JSON.stringify(built.output, null, 2)}\n`;
    desired.set(path.relative(packageInfo.directory, outputPath), content);
    nodes.push({ name: nodeName, strings: built.strings, path: outputPath });
  }
  return {
    desired,
    nodes,
    collisions,
    structuralCollisions,
    valueCollisions,
    declaredNodes: declaredSources.size,
    knownNodes: Object.keys(knownNodes).length,
  };
}

function applyPackagePlan(packageInfo, plan, dryRun, locale) {
  const manifestPath = path.join(packageInfo.directory, 'translations', locale, manifestName);
  const previous = readManifest(manifestPath, packageInfo.directory, locale);
  const previousByPath = new Map(previous.entries.map((entry) => [entry.path, entry.content]));
  const nextEntries = [];
  const report = { written: 0, unchanged: 0, removed: 0, conflicts: [], wouldWrite: 0, wouldRemove: 0 };

  for (const [relativePath, content] of [...plan.desired].sort(([a], [b]) => a.localeCompare(b))) {
    const outputPath = path.join(packageInfo.directory, relativePath);
    const exists = fs.existsSync(outputPath);
    const current = exists ? fs.readFileSync(outputPath, 'utf8') : null;
    const previousContent = previousByPath.get(relativePath);
    if (exists && previousContent === undefined) {
      report.conflicts.push(`${relativePath} (existing file is not managed by this script)`);
      continue;
    }
    if (exists && previousContent !== undefined && current !== previousContent) {
      report.conflicts.push(`${relativePath} (managed file was modified)`);
      nextEntries.push({ path: relativePath, content: previousContent });
      continue;
    }
    if (current === content) {
      report.unchanged += 1;
    } else if (dryRun) {
      report.wouldWrite += 1;
    } else {
      atomicWrite(outputPath, content);
      report.written += 1;
    }
    nextEntries.push({ path: relativePath, content });
  }

  for (const entry of previous.entries) {
    if (plan.desired.has(entry.path)) continue;
    const outputPath = path.join(packageInfo.directory, entry.path);
    if (!fs.existsSync(outputPath)) continue;
    const current = fs.readFileSync(outputPath, 'utf8');
    if (current !== entry.content) {
      report.conflicts.push(`${entry.path} (stale managed file was modified)`);
      nextEntries.push(entry);
      continue;
    }
    if (dryRun) report.wouldRemove += 1;
    else {
      fs.unlinkSync(outputPath);
      report.removed += 1;
    }
  }

  if (!dryRun) {
    const manifestContent = `${JSON.stringify(
      { format: manifestFormat, generatedBy: 'scripts/install-node-localization.mjs', locale, entries: nextEntries },
      null,
      2,
    )}\n`;
    const currentManifest = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf8') : null;
    if (currentManifest !== manifestContent) atomicWrite(manifestPath, manifestContent);
  }
  return report;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const localeConfig = localeRegistry.locales[options.locale];
  if (!localeConfig) throw new Error(`Unsupported locale: ${options.locale}`);
  const locale = options.locale;
  const { dictionary, partFiles } = loadDictionary(localeConfig);
  const packages = [
    { name: 'n8n-nodes-base', directory: path.join(options.target, 'n8n-nodes-base') },
    {
      name: '@n8n/n8n-nodes-langchain',
      directory: path.join(options.target, '@n8n', 'n8n-nodes-langchain'),
    },
  ];
  const packageReports = [];
  const priorityNames = new Set(['scheduleTrigger', 'httpRequest', 'code', 'set', 'if', 'switch', 'merge']);
  const priority = [];

  for (const packageInfo of packages) {
    if (!fs.existsSync(packageInfo.directory)) continue;
    const plan = buildPackagePlan(packageInfo, dictionary, locale);
    const applied = applyPackagePlan(packageInfo, plan, options.dryRun, locale);
    for (const node of plan.nodes) {
      if (packageInfo.name === 'n8n-nodes-base' && priorityNames.has(node.name)) {
        priority.push({ name: node.name, strings: node.strings, generated: true, path: node.path });
      }
    }
    packageReports.push({
      package: packageInfo.name,
      declaredNodes: plan.declaredNodes,
      knownNodes: plan.knownNodes,
      generatedFiles: plan.desired.size,
      translatedStrings: plan.nodes.reduce((sum, node) => sum + node.strings, 0),
      collisions: plan.collisions,
      structuralCollisions: plan.structuralCollisions,
      valueCollisions: plan.valueCollisions,
      ...applied,
    });
  }

  for (const name of priorityNames) {
    if (!priority.some((item) => item.name === name)) priority.push({ name, strings: 0, generated: false });
  }
  priority.sort((a, b) => a.name.localeCompare(b.name));
  const report = {
    dryRun: options.dryRun,
    locale,
    dictionaryEntries: dictionary.size,
    partFiles,
    packages: packageReports,
    priority,
  };

  if (options.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${options.dryRun ? '[dry-run] ' : ''}Node localization: ${dictionary.size} dictionary entries`);
    for (const item of packageReports) {
      console.log(
        `${item.package}: ${item.generatedFiles} files, ${item.translatedStrings} strings; ` +
          `${item.written} written, ${item.unchanged} unchanged, ${item.removed} removed` +
          (options.dryRun ? `, ${item.wouldWrite} would write, ${item.wouldRemove} would remove` : ''),
      );
      for (const conflict of item.conflicts) console.warn(`  conflict: ${conflict}`);
    }
    console.log(
      `Priority nodes: ${priority.map((item) => `${item.name}=${item.generated ? item.strings : 'missing'}`).join(', ')}`,
    );
  }
  if (
    (!options.allowPartial && priority.some((item) => !item.generated)) ||
    packageReports.some((item) => item.conflicts.length)
  ) {
    process.exitCode = 1;
  }
}

main();
