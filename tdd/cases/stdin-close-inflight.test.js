// #5 stdin-close-inflight — stdin 이 닫혀도 진행 중인 비동기 도구 호출의 응답은 전달된다
const test = require('node:test');
const assert = require('node:assert/strict');
const { REST_SERVERS, tmpDir, startMockApp, startServer, parseResult, makeFakeFcapture } = require('./_mcp');

// 인자 없이 성공하는(required 없는) 조회 도구
const PROBE = {
  fBanner: 'get_status',
  fBoard: 'get_presets',
  fGoogleSheet: 'check_status',
  fQRGen: 'get_status',
  fSnippet: 'get_status',
  fWarrange: 'list_layouts'
};

for (const [plugin, portEnv] of Object.entries(REST_SERVERS)) {
  test(`${plugin}: 요청 직후 stdin 을 닫아도 응답이 온다`, async () => {
    const app = await startMockApp({ delayMs: 300 });
    const srv = startServer(plugin, { [portEnv]: String(app.port) });
    try {
      const id = srv.send('tools/call', { name: PROBE[plugin], arguments: {} });
      srv.child.stdin.end();
      const code = await srv.exited;
      assert.ok(srv.responses.has(id), `in-flight 응답이 버려짐 (exit ${code})`);
      assert.equal(parseResult(srv.responses.get(id)).isError, false);
      assert.equal(code, 0);
    } finally {
      await app.close();
    }
  });
}

test('fCapture: 캡처 진행 중 stdin 을 닫아도 응답이 온다', async () => {
  const dir = tmpDir('fake');
  const srv = startServer('fCapture', { FCAPTURE_BIN: makeFakeFcapture(dir, { sleepSec: 0.4 }) });
  const id = srv.send('tools/call', { name: 'capture_screen', arguments: { path: dir } });
  srv.child.stdin.end();
  const code = await srv.exited;
  assert.ok(srv.responses.has(id), `in-flight 응답이 버려짐 (exit ${code})`);
  assert.equal(parseResult(srv.responses.get(id)).isError, false);
});

test('fCapture: 병렬 3건 중 stdin 닫힘 → 3건 모두 응답', async () => {
  const dir = tmpDir('fake');
  const srv = startServer('fCapture', { FCAPTURE_BIN: makeFakeFcapture(dir, { sleepSec: 0.2 }) });
  const ids = [1, 2, 3].map(() => srv.send('tools/call', { name: 'capture_screen', arguments: { path: dir } }));
  srv.child.stdin.end();
  await srv.exited;
  for (const id of ids) assert.ok(srv.responses.has(id), `id=${id} 응답 누락`);
});
