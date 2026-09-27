// #2 mcp-rest-paths-real — 각 MCP 서버가 앱 실제 API 경로로 호출한다 (근거: a5af46e 실측 대조표)
const test = require('node:test');
const assert = require('node:assert/strict');
const { REST_SERVERS, startMockApp, startServer } = require('./_mcp');

// [도구, 인자, 기대 method, 기대 url]
const EXPECTED = {
  fBanner: [
    ['split_image', { file_path: '/tmp/a.png' }, 'POST', '/api/split'],
    ['load_image', { file_path: '/tmp/a.png' }, 'POST', '/api/load'],
    ['export_result', { output_path: '/tmp/out' }, 'POST', '/api/export'],
    ['get_status', {}, 'GET', '/api/status'],
    ['set_config', { rows: 3 }, 'POST', '/api/config']
  ],
  fBoard: [
    ['set_window_size', { width: 800, height: 600 }, 'POST', '/api/window/frame'],
    ['set_background', { color: '#fff' }, 'POST', '/api/background/color'],
    ['set_background', { gradient: 'sunset' }, 'POST', '/api/background/gradient'],
    ['load_preset', { preset_name: 'p1' }, 'POST', '/api/presets/apply'],
    ['get_presets', {}, 'GET', '/api/presets']
  ],
  fGoogleSheet: [
    ['add_row', { data: ['a'] }, 'POST', '/api/add-line'],
    ['set_field', { row: 1, column: 2, value: 'v' }, 'POST', '/api/set-fields'],
    ['clear_range', { range: 'A1:B2' }, 'POST', '/api/clear-range?range=A1%3AB2'],
    ['find_unanswered', { column: 3 }, 'GET', '/api/unanswered'],
    ['check_status', {}, 'GET', '/api/status'],
    ['find_next_row', { column: 3 }, 'GET', '/api/next-row']
  ],
  fQRGen: [
    ['generate_qr', { data: 'hi' }, 'POST', '/api/generate'],
    ['generate_from_url', { url: 'https://x.y' }, 'POST', '/api/generate'],
    ['get_status', {}, 'GET', '/']
  ],
  fSnippet: [
    ['search_snippets', { query: 'ab' }, 'GET', '/api/v2/snippets/search?q=ab'],
    ['expand_snippet', { key: 'k' }, 'POST', '/api/v2/snippets/expand'],
    ['create_snippet', { key: 'k', value: 'v' }, 'POST', '/api/v2/snippets'],
    ['list_snippets', {}, 'GET', '/api/v2/snippets'],
    ['get_status', {}, 'GET', '/api/v2/status']
  ],
  fWarrange: [
    ['save_layout', { name: 'L1' }, 'POST', '/api/v2/capture'],
    ['restore_layout', { name: 'L 1' }, 'POST', '/api/v2/layouts/L%201/restore'],
    ['list_layouts', {}, 'GET', '/api/v2/layouts'],
    ['set_context_mode', { mode: 'work' }, 'POST', '/api/v2/modes/work/activate'],
    ['get_helper_status', {}, 'GET', '/api/v2/cli/status'],
    ['configure_helper', {}, 'GET', '/api/v2/settings'],
    ['configure_helper', { launchAtLogin: true }, 'PATCH', '/api/v2/settings/general']
  ]
};

for (const [plugin, portEnv] of Object.entries(REST_SERVERS)) {
  test(`${plugin}: 도구별 REST method·경로가 실제 API 와 일치`, async () => {
    const app = await startMockApp();
    const srv = startServer(plugin, { [portEnv]: String(app.port) });
    try {
      for (const [tool, args, method, url] of EXPECTED[plugin]) {
        const before = app.requests.length;
        await srv.call(tool, args);
        assert.equal(app.requests.length, before + 1, `${tool}: 요청이 1건 나가지 않음 (포트 override ${portEnv} 미지원?)`);
        const req = app.requests[before];
        assert.equal(`${req.method} ${req.url}`, `${method} ${url}`, `${tool} ${JSON.stringify(args)}`);
      }
    } finally {
      await srv.stop();
      await app.close();
    }
  });
}

test('fBoard clear_canvas 는 대응 API 가 없어 요청 없이 isError 로 실패한다', async () => {
  const app = await startMockApp();
  const srv = startServer('fBoard', { FBOARD_PORT: String(app.port) });
  try {
    const msg = await srv.call('clear_canvas', {});
    assert.equal(app.requests.length, 0);
    assert.equal(msg.result.isError, true);
  } finally {
    await srv.stop();
    await app.close();
  }
});
