// #4 fcapture-serialized-calls — 동시에 들어온 캡처 호출을 직렬화해 병렬 요청도 전부 성공한다
// 실제 캡처 대신 가짜 바이너리(동시 실행 시 "권한" 메시지로 실패)를 FCAPTURE_BIN 으로 주입한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { tmpDir, startServer, parseResult, makeFakeFcapture } = require('./_mcp');

test('가짜 바이너리 자체가 동시 실행을 실패시킨다 (테스트 전제 확인)', async () => {
  const { execFile } = require('child_process');
  const bin = makeFakeFcapture(tmpDir('fake'));
  const run = () => new Promise(r => execFile(bin, ['-t', 'all'], (err) => r(err ? 'fail' : 'ok')));
  const results = await Promise.all([run(), run(), run()]);
  assert.ok(results.includes('fail'), `동시 실행이 전부 성공함: ${results}`);
});

test('capture_screen 3건 병렬 호출 → 3건 모두 isError=false, 파일 실재', async () => {
  const dir = tmpDir('fake');
  const srv = startServer('fCapture', { FCAPTURE_BIN: makeFakeFcapture(dir) });
  try {
    const ids = [1, 2, 3].map(() => srv.send('tools/call', { name: 'capture_screen', arguments: { path: dir } }));
    const msgs = await Promise.all(ids.map(id => srv.waitFor(id, 10000)));
    for (const m of msgs) {
      const { isError, payload } = parseResult(m);
      assert.equal(isError, false, JSON.stringify(payload));
      assert.ok(fs.existsSync(payload.path), `파일 없음: ${payload.path}`);
    }
    assert.equal(new Set(msgs.map(m => parseResult(m).payload.path)).size, 3, '저장 경로가 3개로 갈리지 않음');
  } finally {
    await srv.stop();
  }
});

test('앞 호출이 실패해도 큐가 막히지 않는다', async () => {
  const dir = tmpDir('fake');
  const srv = startServer('fCapture', { FCAPTURE_BIN: makeFakeFcapture(dir) });
  try {
    const bad = srv.send('tools/call', { name: 'capture_window', arguments: { mode: 'nope' } });
    const good = srv.send('tools/call', { name: 'get_version', arguments: {} });
    assert.equal(parseResult(await srv.waitFor(bad)).isError, true);
    const v = parseResult(await srv.waitFor(good));
    assert.equal(v.isError, false);
    assert.match(v.payload.version, /fake/);
  } finally {
    await srv.stop();
  }
});
