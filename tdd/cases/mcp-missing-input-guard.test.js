// #3 mcp-missing-input-guard — arguments 없이 호출해도 TypeError 로 죽지 않고 isError 응답을 돌려준다
const test = require('node:test');
const assert = require('node:assert/strict');
const { REST_SERVERS, startMockApp, startServer, parseResult } = require('./_mcp');

const PLUGINS = { ...REST_SERVERS, fCapture: null };

for (const [plugin, portEnv] of Object.entries(PLUGINS)) {
  test(`${plugin}: required 필드가 있는 도구를 arguments 없이 부르면 요청 없이 isError`, async () => {
    const app = await startMockApp();
    const env = portEnv ? { [portEnv]: String(app.port) } : { FCAPTURE_BIN: '/nonexistent/fcapture' };
    const srv = startServer(plugin, env);
    try {
      const tools = await srv.listTools();
      const withRequired = tools.filter(t => (t.inputSchema.required || []).length > 0);
      assert.ok(withRequired.length > 0, 'required 필드가 있는 도구가 없음');
      for (const t of withRequired) {
        const before = app.requests.length;
        const { isError, payload } = parseResult(await srv.call(t.name));
        assert.equal(isError, true, `${t.name}: isError 가 true 가 아님 → ${JSON.stringify(payload)}`);
        assert.doesNotMatch(String(payload.error), /TypeError|Cannot read prop|undefined/, `${t.name}: 내부 예외가 그대로 샘`);
        for (const key of t.inputSchema.required) {
          assert.match(String(payload.error), new RegExp(key), `${t.name}: 누락 필드 ${key} 를 알려주지 않음`);
        }
        assert.equal(app.requests.length, before, `${t.name}: 누락 입력으로 앱에 요청이 나감`);
      }
      // 모든 도구 무인자 호출 후에도 프로세스가 살아 있어야 한다
      assert.equal(srv.child.exitCode, null, '서버가 죽음');
    } finally {
      await srv.stop();
      await app.close();
    }
  });
}

for (const [plugin, portEnv] of Object.entries(REST_SERVERS)) {
  test(`${plugin}: 앱이 꺼져 있으면(연결 거부) isError=true`, async () => {
    const app = await startMockApp();
    const port = app.port;
    await app.close();
    const srv = startServer(plugin, { [portEnv]: String(port) });
    try {
      const tools = await srv.listTools();
      const noReq = tools.find(t => !(t.inputSchema.required || []).length && t.name !== 'clear_canvas');
      const { isError, payload } = parseResult(await srv.call(noReq.name, {}));
      assert.equal(isError, true, `${noReq.name}: ${JSON.stringify(payload)}`);
    } finally {
      await srv.stop();
    }
  });
}
