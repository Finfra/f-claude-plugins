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

// Issue16 — fSnippet 번들 MCP 서버의 serverInfo.version 도 plugin.json 과 같은 값이다 (repo 안 버전 3곳 일치)
test('fsnippet: mcp-server.js serverInfo.version 이 plugin.json version 과 같다', async () => {
  const { startServer } = require('./_mcp');
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, 'fSnippet', 'plugin.json'), 'utf8'));
  const srv = startServer('fSnippet', {});
  try {
    const res = await srv.waitFor(srv.send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'tdd', version: '0' } }));
    assert.equal(res.result.serverInfo.version, plugin.version);
  } finally {
    await srv.stop();
  }
});
