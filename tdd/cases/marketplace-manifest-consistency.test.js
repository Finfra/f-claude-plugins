// #1 marketplace-manifest-consistency — marketplace.json 의 각 항목이 실제 폴더·plugin.json 을 가리키고 version 이 같다
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./_mcp');

const market = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'));

// plugin.json 위치: 폴더 직하 또는 .claude-plugin/ 하위
function findPluginJson(dir) {
  for (const p of [path.join(dir, 'plugin.json'), path.join(dir, '.claude-plugin', 'plugin.json')]) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

test('marketplace 에 플러그인이 1개 이상 등록돼 있다', () => {
  assert.ok(Array.isArray(market.plugins) && market.plugins.length > 0);
});

for (const entry of market.plugins) {
  test(`${entry.name}: path 폴더·plugin.json 실재, name·version 일치`, () => {
    const dir = path.join(ROOT, entry.source.path);
    assert.ok(fs.statSync(dir).isDirectory(), `폴더 없음: ${entry.source.path}`);
    const pj = findPluginJson(dir);
    assert.ok(pj, `plugin.json 없음: ${entry.source.path}`);
    const plugin = JSON.parse(fs.readFileSync(pj, 'utf8'));
    assert.equal(plugin.name, entry.name, `name 불일치 (${path.relative(ROOT, pj)})`);
    assert.equal(plugin.version, entry.version, `version 불일치 (${path.relative(ROOT, pj)})`);
  });
}
