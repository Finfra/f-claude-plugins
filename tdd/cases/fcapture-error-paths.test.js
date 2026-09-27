// #6 fcapture-error-paths — 잘못된 입력·환경이 모두 isError=true + 사람이 읽을 메시지로 반환된다
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { tmpDir, startServer, parseResult, makeFakeFcapture } = require('./_mcp');

async function withServer(env, fn) {
  const srv = startServer('fCapture', env);
  try { await fn(srv); } finally { await srv.stop(); }
}

function fakeEnv() {
  return { FCAPTURE_BIN: makeFakeFcapture(tmpDir('fake')) };
}

async function expectError(srv, tool, args, pattern) {
  const { isError, payload } = parseResult(await srv.call(tool, args));
  assert.equal(isError, true, `${tool} ${JSON.stringify(args)} → ${JSON.stringify(payload)}`);
  assert.match(payload.error, pattern);
  return payload.error;
}

test('잘못된 mode → 사용 가능한 mode 목록을 알려준다', () => withServer(fakeEnv(), async (srv) => {
  await expectError(srv, 'capture_window', { mode: 'window_bogus' }, /mode.*window_active/s);
}));

test('width 0 / height 음수 → 1 이상 요구', () => withServer(fakeEnv(), async (srv) => {
  await expectError(srv, 'capture_region', { x: 0, y: 0, width: 0, height: 10 }, /1 이상/);
  await expectError(srv, 'capture_region', { x: 0, y: 0, width: 10, height: -1 }, /1 이상/);
}));

test('정수 아닌 좌표 → 정수 요구', () => withServer(fakeEnv(), async (srv) => {
  await expectError(srv, 'capture_region', { x: 'a', y: 0, width: 10, height: 10 }, /정수/);
}));

test('프리셋 파일 부재 → 경로를 담아 알린다', () => withServer(fakeEnv(), async (srv) => {
  const missing = path.join(tmpDir('p'), 'nope.json');
  const msg = await expectError(srv, 'capture_with_preset', { config_path: missing }, /존재하지 않습니다/);
  assert.ok(msg.includes(missing));
}));

test('프리셋 JSON 파손 → 읽지 못했다고 알린다', () => withServer(fakeEnv(), async (srv) => {
  const cfg = path.join(tmpDir('p'), 'bad.json');
  fs.writeFileSync(cfg, '{not json');
  await expectError(srv, 'capture_with_preset', { config_path: cfg }, /JSON/);
}));

test('region_user 프리셋 → 인터랙티브라 거부', () => withServer(fakeEnv(), async (srv) => {
  const cfg = path.join(tmpDir('p'), 'ru.json');
  fs.writeFileSync(cfg, JSON.stringify({ target: 'region_user' }));
  await expectError(srv, 'capture_with_preset', { config_path: cfg }, /region_user/);
}));

test('FCAPTURE_BIN 이 실행 불가 경로 → 조용히 다른 설치본으로 새지 않고 isError', () =>
  withServer({ FCAPTURE_BIN: '/nonexistent/fcapture' }, async (srv) => {
    const msg = await expectError(srv, 'get_version', {}, /FCAPTURE_BIN/);
    assert.ok(msg.includes('/nonexistent/fcapture'), msg);
  }));

test('바이너리 비정상 종료 → exit code·stderr 를 담는다', () => {
  const dir = tmpDir('bad');
  const bin = path.join(dir, 'fcapture');
  fs.writeFileSync(bin, '#!/bin/sh\necho "boom" >&2\nexit 3\n');
  fs.chmodSync(bin, 0o755);
  return withServer({ FCAPTURE_BIN: bin }, async (srv) => {
    await expectError(srv, 'capture_screen', {}, /exit 3.*boom/s);
  });
});
