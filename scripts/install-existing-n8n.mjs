#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localeRegistry = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, 'locales.json'), 'utf8'),
);
const supportedVersion =
  localeRegistry.locales[localeRegistry.defaultLocale].n8nBaseline;

function usage(exitCode = 0) {
  const message = [
    'n8n localization installer',
    '',
    'Usage:',
    '  n8n-localize [--locale zh-CN] [--target <node_modules>]',
    '  n8n-localize --uninstall [--locale zh-CN] [--target <node_modules>]',
    '  n8n-localize --dry-run [--locale zh-CN] [--target <node_modules>]',
    '  n8n-localize --list-locales',
    '',
    `--locale selects the interface locale; the default is ${localeRegistry.defaultLocale}.`,
    '--target may point to node_modules, the n8n package, or a project containing node_modules.',
    `The default dictionary baseline is n8n ${supportedVersion}; unmatched text stays in English.`,
  ].join('\n');
  fs.writeSync(exitCode ? process.stderr.fd : process.stdout.fd, `${message}\n`);
  process.exit(exitCode);
}

function parseArguments(argv) {
  const options = {
    target: null,
    locale: localeRegistry.defaultLocale,
    listLocales: false,
    uninstall: false,
    dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--target') {
      if (!argv[index + 1]) usage(2);
      options.target = path.resolve(argv[index + 1]);
      index += 1;
    } else if (argument === '--locale') {
      if (!argv[index + 1]) usage(2);
      options.locale = argv[index + 1];
      index += 1;
    } else if (argument === '--list-locales') options.listLocales = true;
    else if (argument === '--uninstall') options.uninstall = true;
    else if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--help' || argument === '-h') usage();
    else usage(2);
  }
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeTarget(candidate) {
  if (!candidate) return null;
  const absolute = path.resolve(candidate);
  const directPackage = path.join(absolute, 'package.json');
  if (fs.existsSync(directPackage)) {
    try {
      if (readJson(directPackage).name === 'n8n') return path.dirname(absolute);
    } catch {}
  }
  if (fs.existsSync(path.join(absolute, 'n8n', 'package.json'))) return absolute;
  if (fs.existsSync(path.join(absolute, 'node_modules', 'n8n', 'package.json'))) {
    return path.join(absolute, 'node_modules');
  }
  return null;
}

function discoverTarget(explicitTarget) {
  if (explicitTarget) {
    const target = normalizeTarget(explicitTarget);
    if (!target) throw new Error(`Could not find n8n at the specified target: ${explicitTarget}`);
    return target;
  }

  const candidates = [
    process.env.N8N_NODE_MODULES,
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    projectDirectory,
    path.join(projectDirectory, 'node_modules'),
  ];
  try {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    candidates.push(execFileSync(npmCommand, ['root', '-g'], { encoding: 'utf8' }).trim());
  } catch {}

  for (const candidate of candidates) {
    const target = normalizeTarget(candidate);
    if (target) return target;
  }
  throw new Error('Could not find n8n automatically. Use --target to specify its project or node_modules path.');
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content, 'utf8');
  fs.renameSync(temporary, filePath);
}

function runScript(script, args) {
  const result = spawnSync(process.execPath, [path.join(projectDirectory, script), ...args], {
    cwd: projectDirectory,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function removeNativeTranslations(targetNodeModules, dryRun) {
  const packageDirectories = [
    path.join(targetNodeModules, 'n8n-nodes-base'),
    path.join(targetNodeModules, '@n8n', 'n8n-nodes-langchain'),
  ];
  let removed = 0;
  const conflicts = [];
  for (const packageDirectory of packageDirectories) {
    const manifestPath = path.join(
      packageDirectory,
      'translations',
      options.locale,
      '.codex-node-localization-manifest.json',
    );
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    const remaining = [];
    for (const entry of manifest.entries ?? []) {
      const outputPath = path.resolve(packageDirectory, entry.path);
      if (!outputPath.startsWith(`${path.resolve(packageDirectory)}${path.sep}`)) {
        conflicts.push(`${entry.path} (unsafe path)`);
        remaining.push(entry);
        continue;
      }
      if (!fs.existsSync(outputPath)) continue;
      if (fs.readFileSync(outputPath, 'utf8') !== entry.content) {
        conflicts.push(`${entry.path} (modified after installation)`);
        remaining.push(entry);
        continue;
      }
      if (!dryRun) fs.unlinkSync(outputPath);
      removed += 1;
    }
    if (!dryRun) {
      if (remaining.length) atomicWrite(manifestPath, `${JSON.stringify({ ...manifest, entries: remaining }, null, 2)}\n`);
      else fs.rmSync(manifestPath, { force: true });
    }
  }
  return { removed, conflicts };
}

function uninstall(targetNodeModules, editorDist, manifestPath, dryRun) {
  const native = removeNativeTranslations(targetNodeModules, dryRun);
  let restoredIndex = false;
  let removedOverlay = false;
  const conflicts = [...native.conflicts];

  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    const indexPath = path.join(editorDist, 'index.html');
    const overlayPath = path.join(editorDist, 'static', localeConfig.overlayFile);
    if (fs.existsSync(indexPath) && fs.readFileSync(indexPath, 'utf8') === manifest.installedIndex) {
      if (!dryRun) atomicWrite(indexPath, manifest.originalIndex);
      restoredIndex = true;
    } else {
      conflicts.push('n8n-editor-ui/dist/index.html (modified after installation)');
    }
    if (fs.existsSync(overlayPath) && fs.readFileSync(overlayPath, 'utf8') === manifest.overlayContent) {
      if (!dryRun) fs.unlinkSync(overlayPath);
      removedOverlay = true;
    } else if (fs.existsSync(overlayPath)) {
      conflicts.push(
        `n8n-editor-ui/dist/static/${localeConfig.overlayFile} (modified after installation)`,
      );
    }
    if (!dryRun && conflicts.length === 0) fs.unlinkSync(manifestPath);
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Managed native node translation files: ${native.removed}`);
  console.log(`Editor entry: ${restoredIndex ? 'restored' : 'unchanged'}; overlay: ${removedOverlay ? 'removed' : 'unchanged'}.`);
  for (const conflict of conflicts) console.warn(`Preserved conflicting file: ${conflict}`);
  if (conflicts.length) process.exitCode = 1;
}

const options = parseArguments(process.argv.slice(2));
if (options.listLocales) {
  const localeList = Object.entries(localeRegistry.locales)
    .map(
      ([code, details]) =>
        `${code}\t${details.nativeName}\t${details.englishName}\t${details.status}`,
    )
    .join('\n');
  fs.writeSync(process.stdout.fd, `${localeList}\n`);
  process.exit(0);
}
const localeConfig = localeRegistry.locales[options.locale];
if (!localeConfig) {
  throw new Error(
    `Unsupported locale: ${options.locale}. Run --list-locales to see available locales.`,
  );
}
if (localeConfig.status === 'preview') {
  console.warn(
    `Locale notice: ${localeConfig.nativeName} (${options.locale}) is a preview. ` +
      'It passed automated validation but has not completed native-speaker review.',
  );
}
const marker = `<script src="/static/${localeConfig.overlayFile}" ${localeConfig.markerAttribute}></script>`;
const manifestName = localeConfig.manifestName;
const targetNodeModules = discoverTarget(options.target);
const n8nPackage = readJson(path.join(targetNodeModules, 'n8n', 'package.json'));
if (n8nPackage.version !== localeConfig.n8nBaseline) {
  console.warn(
    `Version notice: the ${options.locale} baseline is n8n ${localeConfig.n8nBaseline}; ` +
      `found ${n8nPackage.version}. Exact matches will be translated and changed text will stay in English.`,
  );
}

const editorDist = path.join(targetNodeModules, 'n8n-editor-ui', 'dist');
const indexPath = path.join(editorDist, 'index.html');
const manifestPath = path.join(editorDist, manifestName);
if (!fs.existsSync(indexPath)) throw new Error(`Could not find the n8n editor entry: ${indexPath}`);
const currentIndexBeforeInstall = fs.readFileSync(indexPath, 'utf8');
const otherInstalledLocale = Object.entries(localeRegistry.locales).find(
  ([code, details]) =>
    code !== options.locale && currentIndexBeforeInstall.includes(details.markerAttribute),
);
if (!options.uninstall && otherInstalledLocale) {
  throw new Error(
    `${otherInstalledLocale[0]} is already installed. Run --locale ${otherInstalledLocale[0]} --uninstall before installing ${options.locale}.`,
  );
}
if (
  !options.uninstall &&
  !currentIndexBeforeInstall.includes(localeConfig.markerAttribute) &&
  !currentIndexBeforeInstall.includes('</title>')
) {
  throw new Error('Could not find a safe injection point in the n8n editor entry.');
}

console.log(`Target n8n: ${path.join(targetNodeModules, 'n8n')} (${n8nPackage.version})`);
console.log(`Interface locale: ${localeConfig.nativeName} (${options.locale})`);

if (options.uninstall) {
  uninstall(targetNodeModules, editorDist, manifestPath, options.dryRun);
} else if (options.dryRun) {
  runScript('scripts/install-node-localization.mjs', [
    '--locale',
    options.locale,
    '--target',
    targetNodeModules,
    '--allow-partial',
    '--dry-run',
  ]);
  console.log(`[dry-run] Would build the ${options.locale} overlay and inject it into the n8n editor entry.`);
} else {
  fs.accessSync(indexPath, fs.constants.R_OK | fs.constants.W_OK);
  fs.accessSync(path.join(editorDist, 'static'), fs.constants.R_OK | fs.constants.W_OK);
  runScript('scripts/install-node-localization.mjs', [
    '--locale',
    options.locale,
    '--target',
    targetNodeModules,
    '--allow-partial',
    '--dry-run',
  ]);
  runScript('scripts/build-localization.mjs', [
    '--locale',
    options.locale,
    '--target',
    targetNodeModules,
  ]);
  runScript('scripts/install-node-localization.mjs', [
    '--locale',
    options.locale,
    '--target',
    targetNodeModules,
    '--allow-partial',
  ]);

  const overlayPath = path.join(editorDist, 'static', localeConfig.overlayFile);
  const overlayContent = fs.readFileSync(overlayPath, 'utf8');
  const currentIndex = fs.readFileSync(indexPath, 'utf8');
  const previousManifest = fs.existsSync(manifestPath) ? readJson(manifestPath) : null;
  const originalIndex = previousManifest?.originalIndex ?? currentIndex;
  const installedIndex = currentIndex.includes(localeConfig.markerAttribute)
    ? currentIndex
    : currentIndex.replace('</title>', `</title>\n    ${marker}`);
  if (installedIndex === currentIndex && !currentIndex.includes(localeConfig.markerAttribute)) {
    throw new Error('Could not find a safe injection point in the n8n editor entry.');
  }
  atomicWrite(indexPath, installedIndex);
  atomicWrite(
    manifestPath,
    `${JSON.stringify({
      format: 1,
      n8nVersion: n8nPackage.version,
      originalIndex,
      installedIndex,
      overlayContent,
    }, null, 2)}\n`,
  );
  console.log('Localization installed. Restart the existing n8n service and reload the editor without browser cache.');
}
