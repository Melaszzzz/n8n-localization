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
    'n8n 界面语言包安装器',
    '',
    '用法：',
    '  n8n-localize [--locale zh-CN] [--target <node_modules>]',
    '  n8n-localize --uninstall [--locale zh-CN] [--target <node_modules>]',
    '  n8n-localize --dry-run [--locale zh-CN] [--target <node_modules>]',
    '  n8n-localize --list-locales',
    '',
    '--locale 指定界面语言；当前默认为 zh-CN。',
    '--target 可指向 node_modules、n8n 包目录，或包含 node_modules 的项目目录。',
    `词典基线为 n8n ${supportedVersion}；其他版本按已有文案尽量匹配。`,
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
    if (!target) throw new Error(`指定路径中未找到 n8n：${explicitTarget}`);
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
  throw new Error('未自动找到 n8n。请使用 --target 指定现有 n8n 的 node_modules 路径。');
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
        conflicts.push(`${entry.path}（路径不安全）`);
        remaining.push(entry);
        continue;
      }
      if (!fs.existsSync(outputPath)) continue;
      if (fs.readFileSync(outputPath, 'utf8') !== entry.content) {
        conflicts.push(`${entry.path}（安装后被修改）`);
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
      conflicts.push('n8n-editor-ui/dist/index.html（安装后被修改）');
    }
    if (fs.existsSync(overlayPath) && fs.readFileSync(overlayPath, 'utf8') === manifest.overlayContent) {
      if (!dryRun) fs.unlinkSync(overlayPath);
      removedOverlay = true;
    } else if (fs.existsSync(overlayPath)) {
      conflicts.push(
        `n8n-editor-ui/dist/static/${localeConfig.overlayFile}（安装后被修改）`,
      );
    }
    if (!dryRun && conflicts.length === 0) fs.unlinkSync(manifestPath);
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}已处理原生节点翻译：${native.removed} 个文件`);
  console.log(`${restoredIndex ? '将恢复/已恢复' : '未恢复'}编辑器入口，${removedOverlay ? '将移除/已移除' : '未移除'}语言覆盖层。`);
  for (const conflict of conflicts) console.warn(`保留冲突文件：${conflict}`);
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
    `不支持的语言：${options.locale}。请运行 --list-locales 查看可用语言。`,
  );
}
const marker = `<script src="/static/${localeConfig.overlayFile}" ${localeConfig.markerAttribute}></script>`;
const manifestName = localeConfig.manifestName;
const targetNodeModules = discoverTarget(options.target);
const n8nPackage = readJson(path.join(targetNodeModules, 'n8n', 'package.json'));
if (n8nPackage.version !== supportedVersion) {
  console.warn(
    `版本提示：词典基线为 n8n ${supportedVersion}，当前找到 ${n8nPackage.version}。` +
      '安装器会翻译能够精确匹配的内容；新增或已改变的文案将保持英文。',
  );
}

const editorDist = path.join(targetNodeModules, 'n8n-editor-ui', 'dist');
const indexPath = path.join(editorDist, 'index.html');
const manifestPath = path.join(editorDist, manifestName);
if (!fs.existsSync(indexPath)) throw new Error(`未找到 n8n 编辑器入口：${indexPath}`);

console.log(`目标 n8n：${path.join(targetNodeModules, 'n8n')} (${n8nPackage.version})`);
console.log(`界面语言：${localeConfig.nativeName} (${options.locale})`);

if (options.uninstall) {
  uninstall(targetNodeModules, editorDist, manifestPath, options.dryRun);
} else if (options.dryRun) {
  runScript('scripts/install-node-localization.mjs', [
    '--target',
    targetNodeModules,
    '--allow-partial',
    '--dry-run',
  ]);
  console.log(`[dry-run] 将生成 ${options.locale} 覆盖层并安全注入 n8n 编辑器入口。`);
} else {
  runScript('scripts/build-localization.mjs', ['--target', targetNodeModules]);
  runScript('scripts/install-node-localization.mjs', [
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
    throw new Error('无法在 n8n 编辑器入口中找到安全注入位置。');
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
  console.log('界面语言包安装完成。重启现有 n8n 服务并强制刷新浏览器即可生效。');
}
