import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(fs.readFileSync(path.join(projectDirectory, 'locales.json'), 'utf8'));
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'n8n-localization-installer-'));
const nodeModules = path.join(temporaryRoot, 'node_modules');
const editorDist = path.join(nodeModules, 'n8n-editor-ui', 'dist');
const originalIndex = '<!doctype html><html><head><title>n8n</title></head><body></body></html>\n';

function write(relativePath, content) {
  const filePath = path.join(temporaryRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function run(locale, ...args) {
  return spawnSync(
    process.execPath,
    [
      path.join(projectDirectory, 'scripts', 'install-existing-n8n.mjs'),
      '--locale',
      locale,
      '--target',
      nodeModules,
      ...args,
    ],
    { cwd: temporaryRoot, encoding: 'utf8' },
  );
}

try {
  write(
    'node_modules/n8n/package.json',
    `${JSON.stringify({ name: 'n8n', version: registry.locales[registry.defaultLocale].n8nBaseline })}\n`,
  );
  write('node_modules/n8n-editor-ui/dist/index.html', originalIndex);
  fs.mkdirSync(path.join(editorDist, 'static'), { recursive: true });

  const locales = Object.keys(registry.locales);
  for (const locale of locales) {
    const config = registry.locales[locale];
    const dryRun = run(locale, '--dry-run');
    assert.equal(dryRun.status, 0, dryRun.stderr || dryRun.stdout);
    assert.equal(fs.readFileSync(path.join(editorDist, 'index.html'), 'utf8'), originalIndex);

    const install = run(locale);
    assert.equal(install.status, 0, install.stderr || install.stdout);
    const installedIndex = fs.readFileSync(path.join(editorDist, 'index.html'), 'utf8');
    assert.match(installedIndex, new RegExp(config.markerAttribute));
    assert.ok(fs.existsSync(path.join(editorDist, 'static', config.overlayFile)));
    assert.ok(fs.existsSync(path.join(editorDist, config.manifestName)));

    const reinstall = run(locale);
    assert.equal(reinstall.status, 0, reinstall.stderr || reinstall.stdout);
    assert.equal(fs.readFileSync(path.join(editorDist, 'index.html'), 'utf8'), installedIndex);

    const otherLocale = locales.find((candidate) => candidate !== locale);
    if (otherLocale) {
      const blockedSwitch = run(otherLocale, '--dry-run');
      assert.notEqual(blockedSwitch.status, 0);
      assert.match(blockedSwitch.stderr, /--uninstall before installing/);
    }

    const uninstall = run(locale, '--uninstall');
    assert.equal(uninstall.status, 0, uninstall.stderr || uninstall.stdout);
    assert.equal(fs.readFileSync(path.join(editorDist, 'index.html'), 'utf8'), originalIndex);
    assert.ok(!fs.existsSync(path.join(editorDist, 'static', config.overlayFile)));
  }

  write(
    'node_modules/n8n/package.json',
    `${JSON.stringify({ name: 'n8n', version: '99.0.0' })}\n`,
  );
  const newerVersion = run(registry.defaultLocale, '--dry-run');
  assert.equal(newerVersion.status, 0, newerVersion.stderr || newerVersion.stdout);
  assert.match(newerVersion.stderr, /Exact matches will be translated/);

  console.log(`Installer lifecycle passed for ${locales.join(', ')}.`);
} finally {
  if (temporaryRoot.startsWith(`${os.tmpdir()}${path.sep}n8n-localization-installer-`)) {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
