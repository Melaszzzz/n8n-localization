import assert from 'node:assert/strict';
import fs from 'node:fs';

// Exercise the actual github-script body without network access or GitHub writes.
const yaml = fs.readFileSync(new URL('../.github/workflows/n8n-version-watch.yml', import.meta.url), 'utf8');
const section = yaml.split('      - name: Close completed maintenance issue')[1];
assert.ok(section, 'Missing maintenance close step');
const script = section.split('          script: |\n')[1]
  .split('\n').map((line) => line.startsWith('            ') ? line.slice(12) : line).join('\n');
const execute = new (Object.getPrototypeOf(async function () {}).constructor)(
  'github', 'context', 'core', 'process', script,
);

async function scenario(release) {
  const updates = [], comments = [];
  const issues = [
    { number: 3, title: '维护：适配 n8n 2.35.7', body: '- [ ] Test' },
    { number: 5, title: '维护：适配 n8n 2.37.10', body: '- [ ] Test' },
    { number: 6, title: '维护：适配 n8n 2.38.6', body: '- [ ] Test' },
    { number: 7, title: '维护：适配 n8n 2.39.0', body: '- [ ] Test' },
    { number: 8, title: '维护：适配 n8n 2.38.6-rc.1', body: '- [ ] Test' },
    { number: 9, title: 'Other report 2.35.7', body: '- [ ] Test' },
    { number: 10, title: '维护：适配 n8n 2.35.7', pull_request: {} },
  ];
  const github = {
    rest: {
      repos: { getReleaseByTag: async () => {
        if (!release) throw Object.assign(new Error('Not found'), { status: 404 });
        return { data: release };
      } },
      issues: { listForRepo() {}, update: async (data) => updates.push(data),
        createComment: async (data) => comments.push(data) },
    },
    paginate: async () => issues,
  };
  await execute(github, { repo: { owner: 'test', repo: 'test' } }, { info() {} },
    { env: { MIN_BASELINE: '2.38.6', PACKAGE_TAG: 'v0.7.0' } });
  return { updates, comments };
}
for (const release of [null, { draft: true, published_at: 'today' }, { prerelease: true, published_at: 'today' }, { draft: false }]) {
  assert.deepEqual(await scenario(release), { updates: [], comments: [] });
}
const result = await scenario({ draft: false, published_at: 'today', html_url: 'https://example.com/release' });
assert.deepEqual(result.updates.filter((x) => x.state === 'closed').map((x) => x.issue_number), [3, 5, 6]);
assert.deepEqual(result.updates.filter((x) => x.body).map((x) => x.issue_number), [6]);
assert.ok(result.comments.find((x) => x.issue_number === 3).body.includes('未将该中间版本'));
assert.ok(result.comments.find((x) => x.issue_number === 6).body.includes('已完成'));
console.log('Version watch: release guard, skipped versions, current/future versions and PR exclusion passed.');
