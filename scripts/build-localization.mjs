import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptsDirectory, '..');
const localeRegistry = JSON.parse(
  fs.readFileSync(path.join(projectDirectory, 'locales.json'), 'utf8'),
);
const localeArgumentIndex = process.argv.indexOf('--locale');
if (localeArgumentIndex >= 0 && !process.argv[localeArgumentIndex + 1]) {
  throw new Error('--locale requires a registered locale code.');
}
const locale = localeArgumentIndex >= 0
  ? process.argv[localeArgumentIndex + 1]
  : localeRegistry.defaultLocale;
const localeConfig = localeRegistry.locales[locale];
if (!localeConfig) throw new Error(`Unsupported locale: ${locale}`);
const dictionaryDirectory = path.resolve(projectDirectory, localeConfig.dictionaryDirectory);
const partsDirectory = path.join(dictionaryDirectory, 'parts');
const overridesFile = path.join(dictionaryDirectory, 'overrides.json');
const targetArgumentIndex = process.argv.indexOf('--target');
if (targetArgumentIndex >= 0 && !process.argv[targetArgumentIndex + 1]) {
  throw new Error('--target requires the path to an existing node_modules directory.');
}
const targetNodeModules = targetArgumentIndex >= 0
  ? path.resolve(process.argv[targetArgumentIndex + 1])
  : path.join(projectDirectory, 'node_modules');
const outputFile = path.join(
  targetNodeModules,
  'n8n-editor-ui',
  'dist',
  'static',
  localeConfig.overlayFile,
);

if (!fs.existsSync(partsDirectory)) {
  throw new Error(`Localization parts directory is missing: ${partsDirectory}`);
}
const editorDistDirectory = path.resolve(path.dirname(outputFile), '..');
if (!fs.existsSync(editorDistDirectory)) {
  throw new Error('n8n editor UI is not installed. Run npm run deps first.');
}
fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const dictionary = {};
const conflicts = new Map();
const partFiles = fs
  .readdirSync(partsDirectory)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort();

for (const fileName of partFiles) {
  const filePath = path.join(partsDirectory, fileName);
  const part = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!part || Array.isArray(part) || typeof part !== 'object') {
    throw new Error(`${fileName} must contain a JSON object.`);
  }
  for (const [english, chinese] of Object.entries(part)) {
    if (!english.trim() || typeof chinese !== 'string' || !chinese.trim()) {
      throw new Error(`${fileName} contains an invalid entry for ${JSON.stringify(english)}.`);
    }
    if (dictionary[english] && dictionary[english] !== chinese) {
      const values = conflicts.get(english) ?? new Set([dictionary[english]]);
      values.add(chinese);
      conflicts.set(english, values);
    } else if (!dictionary[english]) {
      dictionary[english] = chinese;
    }
  }
}

const overrides = fs.existsSync(overridesFile)
  ? JSON.parse(fs.readFileSync(overridesFile, 'utf8'))
  : {};
for (const [english, chinese] of Object.entries(overrides)) {
  if (!english.trim() || typeof chinese !== 'string' || !chinese.trim()) {
    throw new Error(`overrides.json contains an invalid entry for ${JSON.stringify(english)}.`);
  }
  dictionary[english] = chinese;
  conflicts.delete(english);
}
if (conflicts.size > 0) {
  const details = [...conflicts.entries()]
    .map(([english, values]) => `${JSON.stringify(english)}: ${JSON.stringify([...values])}`)
    .join('\n');
  throw new Error(`Unresolved localization conflicts:\n${details}`);
}

for (const [english, chinese] of Object.entries({ ...dictionary })) {
  if (!english.includes(' | ') || !chinese.includes(' | ')) continue;
  const englishForms = english.split(' | ');
  const chineseForms = chinese.split(' | ');
  if (englishForms.length !== chineseForms.length) continue;
  for (let index = 0; index < englishForms.length; index += 1) {
    if (!dictionary[englishForms[index]]) dictionary[englishForms[index]] = chineseForms[index];
  }
}

const serializedDictionary = JSON.stringify(dictionary, null, 2);
const runtime = String.raw`(() => {
  'use strict';

  const activeLocale = ${JSON.stringify(locale)};
  const overlayGuard = '__N8N_LOCALIZATION_' + activeLocale.replace(/[^A-Za-z0-9]/g, '_') + '__';
  if (globalThis[overlayGuard]) return;
  globalThis[overlayGuard] = true;

  const dictionary = ${serializedDictionary};
  const templateToken = /\{[^{}]+\}|%s/g;
  const escapeRegExp = (value) => value.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
  const templateTranslations = Object.entries(dictionary)
    .filter(([source]) => {
      templateToken.lastIndex = 0;
      if (!templateToken.test(source)) return false;
      templateToken.lastIndex = 0;
      const fixedLetters = source.replace(templateToken, '').replace(/[^A-Za-z]/g, '');
      return fixedLetters.length >= 4;
    })
    .map(([source, target]) => {
      templateToken.lastIndex = 0;
      const tokens = [];
      let cursor = 0;
      let pattern = '^';
      for (const match of source.matchAll(templateToken)) {
        pattern += escapeRegExp(source.slice(cursor, match.index)) + '(.+?)';
        tokens.push(match[0]);
        cursor = match.index + match[0].length;
      }
      pattern += escapeRegExp(source.slice(cursor)) + '$';
      return { regex: new RegExp(pattern), target, tokens };
    });
  const translatedAttributes = ['aria-label', 'placeholder', 'title'];
  const skippedTags = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);
  const userDataSelectors = [
    '[contenteditable="true"]',
    '.cm-editor',
    '.monaco-editor',
    '[data-test-id="workflow-card-name"]',
    '[data-test-id*="workflow-name"]',
    '[data-test-id*="credential-name"]',
    '[data-test-id*="project-name"]',
    '[data-test-id*="node-name"]',
    '[data-test-id*="tag-name"]',
    '[data-test-id="tag"]',
    '[data-test-id="tags-table"]',
    '[data-test-id="data-table-card-name"]',
    '[data-test-id="data-table-header-name-input"]',
    '[data-test-id="data-table-grid"]',
    '[data-test-id="ndv-data-container"]',
    '[data-test-id="expression-output"]',
    '[data-test-id="inline-expression-editor-output"]',
    '[data-test-id="log-details-input"]',
    '[data-test-id="log-details-output"]',
    '[data-test-id="instance-ai-llm-step-output"]',
    '[data-test-id="mcp-access-token-json"]',
    '[data-test-id="chat-message-content"]',
    '[data-test-id="instance-ai-user-message"]',
    '[data-test-id="instance-ai-assistant-message"]',
    '[data-test-id="canvas-node-group-description-text"]',
    '[data-test-id="workflow-description-edit-content"]',
    '[data-test-id="mcp-workflow-description-cell"]',
    '[data-test-id="agent-workflow-tool-description"]',
    '[data-test-id="node-error-message"]',
    '[data-test-id="node-error-description"]',
    '[data-test-id="sanitized-error-message"]',
  ].join(',');
  const safeStaticUserDataUiText = new Set([
    'Variables and context',
    "The URL for resuming a 'Wait' node",
    '[filled at execution time]',
    'Execute previous nodes',
    'to view input data',
    'No input connected',
    'No input data',
    'Execute step',
    'Preview',
    'No trigger output',
    'No output data',
    'No output data returned',
    'No output data in this branch',
    'Execute this node to view data',
    'Test this trigger',
    'set mock data',
    'Schema',
    'Table',
    'JSON',
    'or',
  ]);
  const safeScheduleOptionText = new Set([
    'Seconds',
    'Minutes',
    'Hours',
    'Days',
    'Weeks',
    'Months',
    'Custom (Cron)',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Midnight',
    'Noon',
  ]);
  const scheduleTriggerLabels = new Set([
    'Schedule Trigger',
    dictionary['Schedule Trigger'],
  ].filter(Boolean));
  const pendingRoots = new Set();
  let framePending = false;

  function isUserData(element) {
    return element instanceof Element && Boolean(element.closest(userDataSelectors));
  }

  function isBuiltInOverview(element, value) {
    return location.pathname.startsWith('/home/') &&
      element instanceof Element &&
      Boolean(element.closest('[data-test-id="project-name"]')) &&
      value?.trim() === 'Overview';
  }

  function isSafeStaticUserDataUi(element, value) {
    if (!(element instanceof Element) || !safeStaticUserDataUiText.has(value?.trim())) return false;
    if (element.closest('table, [role="grid"], .cm-editor, .monaco-editor')) return false;
    return Boolean(element.closest('dialog, [role="dialog"]'));
  }

  function isSafeScheduleNodeUi(element, value) {
    if (!(element instanceof Element) || !safeScheduleOptionText.has(value?.trim())) return false;
    const dialog = element.closest('dialog, [role="dialog"]');
    if (!dialog || ![...scheduleTriggerLabels].some((label) =>
      (dialog.textContent ?? '').includes(label))) return false;
    if (element.closest('table, [role="grid"], .cm-editor, .monaco-editor')) return false;
    return Boolean(element.closest('button, [role="button"], [role="combobox"], [role="option"]'));
  }

  function translateSafeControlValue(element) {
    if (!(element instanceof HTMLInputElement)) return;
    const dialog = element.closest('dialog, [role="dialog"]');
    if (!dialog || element.closest('table, [role="grid"], .cm-editor, .monaco-editor')) return;
    const isScheduleOption = safeScheduleOptionText.has(element.value) &&
      [...scheduleTriggerLabels].some((label) => (dialog.textContent ?? '').includes(label));
    const isRenderedSelectLabel = element.readOnly || element.matches('[role="combobox"]') ||
      Boolean(element.closest('[role="combobox"], .el-select, .el-select-v2'));
    if (!isScheduleOption && !isRenderedSelectLabel) return;
    const translated = dictionary[element.value];
    // This changes only the rendered label. No input/change event is emitted, so
    // Vue's parameter model and the serialized workflow value remain untouched.
    if (translated && translated !== element.value) element.value = translated;
  }

  function isSafeBilingualNodeName(element, value) {
    if (!(element instanceof Element)) return false;
    const translated = dictionary[value?.trim()];
    if (!translated || !/[（(][^）)]*[A-Za-z][^）)]*[）)]/.test(translated)) return false;
    return Boolean(element.closest(
      '[data-test-id="canvas-node"], [data-test-id="node-title-container"]',
    ));
  }

  function translateExact(value) {
    if (!value) return null;
    const match = value.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match) return null;
    const translated = dictionary[match[2]];
    return translated ? match[1] + translated + match[3] : null;
  }

  function translateTemplate(value) {
    if (!value) return null;
    const spaced = value.match(/^(\s*)(.*?)(\s*)$/s);
    if (!spaced) return null;
    for (const template of templateTranslations) {
      const match = spaced[2].match(template.regex);
      if (!match) continue;
      const named = new Map();
      const positional = [];
      let capturesAreValid = true;
      template.tokens.forEach((token, index) => {
        const captured = match[index + 1];
        // Pluralization templates such as "{count} Tool" must never treat the
        // beginning of a real node name ("Call n8n Workflow Tool") as a count.
        if (/^\{(?:count|index|total|completed|current|limit|size|number)\}$/i.test(token) &&
            !/^[-+]?\d[\d,.]*(?:\s*[A-Za-z%]+)?$/.test(captured.trim())) {
          capturesAreValid = false;
        }
        if (token === '%s') positional.push(captured);
        else if (!named.has(token)) named.set(token, captured);
      });
      if (!capturesAreValid) continue;
      let positionalIndex = 0;
      const translated = template.target.replace(templateToken, (token) =>
        token === '%s' ? positional[positionalIndex++] : named.get(token) ?? token,
      );
      return spaced[1] + translated + spaced[3];
    }
    return null;
  }

  const relativeTimeUnits = Object.freeze(activeLocale === 'zh-TW' ? {
    second: '秒', minute: '分鐘', hour: '小時', day: '天', week: '週', month: '個月', year: '年',
  } : activeLocale === 'zh-CN' ? {
    second: '秒', minute: '分钟', hour: '小时', day: '天', week: '周', month: '个月', year: '年',
  } : {});
  const monthNumbers = Object.freeze({
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  });

  function translateUiPattern(value, element) {
    if (!value || !(element instanceof Element)) return null;
    const match = value.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match) return null;
    const text = match[2];
    const inResourceCard = Boolean(element.closest('[data-test-id^="resources-list-item-"]'));
    const inPagination = Boolean(element.closest(
      '[data-test-id="resources-list-pagination"], .el-pagination, .el-select-dropdown',
    ));
    let translated = null;

    if (inResourceCard) {
      const relative = text.match(/^(\d+) (second|minute|hour|day|week|month|year)s? ago$/);
      if (relative) {
        if (activeLocale === 'es') {
          const count = Number(relative[1]);
          const units = {
            second: ['segundo', 'segundos'], minute: ['minuto', 'minutos'],
            hour: ['hora', 'horas'], day: ['día', 'días'], week: ['semana', 'semanas'],
            month: ['mes', 'meses'], year: ['año', 'años'],
          };
          translated = 'hace ' + relative[1] + ' ' + units[relative[2]][count === 1 ? 0 : 1];
        } else if (activeLocale === 'zh-CN' || activeLocale === 'zh-TW') {
          translated = relative[1] + relativeTimeUnits[relative[2]] + '前';
        }
      }

      const created = text.match(/^Created (\d{1,2}) ([A-Z][a-z]+)(?: (\d{4}))?$/);
      if (created && monthNumbers[created[2]]) {
        if (activeLocale === 'es') {
          const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          translated = 'Creado el ' + created[1] + ' de ' + months[monthNumbers[created[2]] - 1] +
            (created[3] ? ' de ' + created[3] : '');
        } else if (activeLocale === 'zh-CN' || activeLocale === 'zh-TW') {
          translated = (activeLocale === 'zh-TW' ? '建立於 ' : '创建于 ') +
            (created[3] ? created[3] + '年' : '') + monthNumbers[created[2]] + '月' + created[1] + '日';
        }
      }
    }

    if (inPagination) {
      const total = text.match(/^Total (\d+)$/);
      if (total) {
        if (activeLocale === 'es') translated = 'Total: ' + total[1];
        else if (activeLocale === 'zh-CN' || activeLocale === 'zh-TW') {
          translated = '共 ' + total[1] + (activeLocale === 'zh-TW' ? ' 筆' : ' 条');
        }
      }
      const pageSize = text.match(/^(\d+)\/page$/);
      if (pageSize) {
        if (activeLocale === 'es') translated = pageSize[1] + '/página';
        else if (activeLocale === 'zh-CN' || activeLocale === 'zh-TW') {
          translated = pageSize[1] + (activeLocale === 'zh-TW' ? ' 筆/頁' : ' 条/页');
        }
      }
    }

    return translated ? match[1] + translated + match[3] : null;
  }

  function translateTextNode(node) {
    const parent = node.parentElement;
    if (!parent || skippedTags.has(parent.tagName)) return;
    if (
      isUserData(parent) &&
      !isBuiltInOverview(parent, node.nodeValue) &&
      !isSafeStaticUserDataUi(parent, node.nodeValue) &&
      !isSafeScheduleNodeUi(parent, node.nodeValue) &&
      !isSafeBilingualNodeName(parent, node.nodeValue)
    ) return;
    const translated = translateExact(node.nodeValue) ??
      translateUiPattern(node.nodeValue, parent) ??
      translateTemplate(node.nodeValue);
    if (translated && translated !== node.nodeValue) node.nodeValue = translated;
  }

  function translateElement(element) {
    translateSafeControlValue(element);
    // Textarea values are user data and remain untouched, but their static
    // placeholder/title attributes are UI copy and may be translated safely.
    if ((skippedTags.has(element.tagName) && element.tagName !== 'TEXTAREA') || isUserData(element)) return;
    for (const attribute of translatedAttributes) {
      const original = element.getAttribute(attribute);
      const translated = translateExact(original) ?? translateTemplate(original);
      if (translated && translated !== original) element.setAttribute(attribute, translated);
    }
  }

  function translateTree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (!(root instanceof Element || root instanceof Document || root instanceof DocumentFragment)) return;
    if (root instanceof Element) translateElement(root);
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateElement(node);
    }
  }

  function flush() {
    framePending = false;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    for (const root of roots) translateTree(root);
  }

  function schedule(root) {
    pendingRoots.add(root);
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(flush);
    }
  }

  document.documentElement.lang = activeLocale;
  const start = () => {
    schedule(document.body);
    // Some Element Plus controls assign their visible input value as a DOM
    // property after insertion, which does not fire MutationObserver. Limited
    // rescans catch that late label without dispatching any form events.
    for (const delay of [250, 1000, 2500]) setTimeout(() => schedule(document.body), delay);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') schedule(mutation.target);
        else if (mutation.type === 'characterData') schedule(mutation.target);
        else for (const node of mutation.addedNodes) schedule(node);
      }
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: translatedAttributes,
    });
    console.info('[n8n-localization] ' + activeLocale + ' overlay enabled with ' +
      Object.keys(dictionary).length + ' entries.');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
`;

fs.writeFileSync(outputFile, runtime, 'utf8');
console.log(
  `Built ${locale} overlay with ${Object.keys(dictionary).length} entries ` +
    `from ${partFiles.length} files and ${Object.keys(overrides).length} overrides.`,
);
console.log(`Output: ${outputFile}`);
