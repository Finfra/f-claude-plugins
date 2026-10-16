// #8 fsnippet-request-body-spec — fSnippet MCP 의 expand·create 요청 본문이 REST v2 명세 필드와 일치한다 (근거: Issue15)
// 명세 SSOT: fSnippetCli(prj25) api/openapi_v2.yaml — 구 본문({key,context}·{key,value,tags})은 실서버가 400 INVALID_REQUEST 로 거부한다(2026-10-16 실측)
const test = require('node:test');
const assert = require('node:assert/strict');
const { startMockApp, startServer } = require('./_mcp');

async function withServer(fn) {
  const app = await startMockApp();
  const srv = startServer('fSnippet', { FSNIPPET_PORT: String(app.port) });
  try {
    await fn(app, srv);
  } finally {
    await srv.stop();
    await app.close();
  }
}

function lastBody(app) {
  return JSON.parse(app.requests[app.requests.length - 1].body);
}

test('expand_snippet 은 {abbreviation, placeholder_values} 를 POST 한다', () => withServer(async (app, srv) => {
  await srv.call('expand_snippet', { abbreviation: 'bb{right_command}', placeholder_values: { clipboard: 'x' } });
  assert.deepEqual(lastBody(app), { abbreviation: 'bb{right_command}', placeholder_values: { clipboard: 'x' } });
}));

test('create_snippet 은 {folder, keyword, name, content} 를 POST 한다', () => withServer(async (app, srv) => {
  const args = { folder: 'Docker', keyword: 'dps', name: 'docker ps', content: 'docker ps -a' };
  await srv.call('create_snippet', args);
  assert.deepEqual(lastBody(app), args);
}));

test('create_snippet 은 keyword 없이도 보낸다(===name.txt 형식)', () => withServer(async (app, srv) => {
  await srv.call('create_snippet', { folder: 'Docker', name: 'docker ps', content: 'docker ps -a' });
  assert.deepEqual(lastBody(app), { folder: 'Docker', name: 'docker ps', content: 'docker ps -a' });
}));

test('inputSchema 가 명세 필드를 선언하고 구 필드(key·value·context·tags)는 없다', () => withServer(async (app, srv) => {
  const tools = await srv.listTools();
  const byName = Object.fromEntries(tools.map(t => [t.name, t.inputSchema]));
  assert.deepEqual(Object.keys(byName.expand_snippet.properties).sort(), ['abbreviation', 'placeholder_values']);
  assert.deepEqual(byName.expand_snippet.required, ['abbreviation']);
  assert.deepEqual(Object.keys(byName.create_snippet.properties).sort(), ['content', 'folder', 'keyword', 'name']);
  assert.deepEqual(byName.create_snippet.required.sort(), ['content', 'folder', 'name']);
}));

test('필수 필드가 빠지면 앱에 요청 없이 isError 로 실패한다', () => withServer(async (app, srv) => {
  const e = await srv.call('expand_snippet', {});
  const c = await srv.call('create_snippet', { folder: 'Docker' });
  assert.equal(app.requests.length, 0);
  assert.equal(e.result.isError, true);
  assert.equal(c.result.isError, true);
}));

// fSnippetCli(Swift) 의 REST 서버는 chunked 본문을 파싱하지 못해 400 "Invalid JSON body" 로 거부한다(2026-10-16 실측).
// Node http.request 는 Content-Length 없이 req.write 하면 chunked 로 보내므로 길이를 명시해야 한다.
test('본문이 있는 요청은 Content-Length 로 보내고 chunked 를 쓰지 않는다', () => withServer(async (app, srv) => {
  await srv.call('create_snippet', { folder: 'Docker', name: '한글', content: 'x' });
  await srv.call('expand_snippet', { abbreviation: 'bb' });
  assert.equal(app.requests.length, 2);
  for (const req of app.requests) {
    assert.equal(req.headers['transfer-encoding'], undefined, `${req.url}: chunked 전송`);
    assert.equal(Number(req.headers['content-length']), Buffer.byteLength(req.body), `${req.url}: Content-Length 가 실제 바이트 수와 다름`);
  }
}));
