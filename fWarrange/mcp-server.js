#!/usr/bin/env node
const readline = require('readline');
const http = require('http');

// FWARRANGE_PORT 는 테스트·비표준 포트용 override — 기본은 앱 고정 포트
const PORT = Number(process.env.FWARRANGE_PORT) || 3016;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = { hostname: url.hostname, port: url.port || 80, path: url.pathname + url.search, method, headers: { 'Content-Type': 'application/json' } };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function handleToolCall(toolName, toolInput) {
  const inp = toolInput || {};
  try {
    switch (toolName) {
      case 'save_layout':
        // 저장은 capture 다 — 이름을 주지 않으면 앱이 기본 이름을 붙인다
        return await makeRequest('/api/v2/capture', 'POST', inp.name ? { name: inp.name } : {});
      case 'restore_layout':
        // 복원은 레이아웃 이름이 경로에 들어간다
        return await makeRequest(`/api/v2/layouts/${encodeURIComponent(inp.name || '')}/restore`, 'POST', {});
      case 'list_layouts':
        return await makeRequest('/api/v2/layouts');
      case 'set_context_mode':
        // 컨텍스트 전환 = 모드 활성화
        return await makeRequest(`/api/v2/modes/${encodeURIComponent(inp.mode || '')}/activate`, 'POST', {});
      case 'get_helper_status':
        return await makeRequest('/api/v2/cli/status');
      case 'configure_helper':
        // 인자가 있으면 general 설정을 PATCH, 없으면 현재 설정을 조회한다
        return Object.keys(inp).length
          ? await makeRequest('/api/v2/settings/general', 'PATCH', inp)
          : await makeRequest('/api/v2/settings');
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    // 연결 거부는 AggregateError 라 message 가 빈 문자열이다 — 빈 error 는 성공으로 오인되므로 code 로 채운다
    return { error: `앱(${BASE_URL}) 호출 실패: ${err.message || err.code || String(err)}` };
  }
}

// 도구 inputSchema.required 기준으로 누락 필드를 찾는다 — 앱에 undefined 를 흘려보내지 않는다.
function missingRequired(tools, toolName, inp) {
  const tool = tools.find(t => t.name === toolName);
  const required = (tool && tool.inputSchema && tool.inputSchema.required) || [];
  return required.filter(k => inp[k] === undefined || inp[k] === null || inp[k] === '');
}

// 도구 실패 판정 — 서버 내부 오류(error) 또는 앱의 HTTP 4xx/5xx
function isErrorResult(result) {
  return Boolean(result && (result.error || (typeof result.status === 'number' && result.status >= 400)));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  // stdin 이 닫혀도 진행 중인 도구 응답을 버리지 않는다 — 남은 호출이 끝난 뒤 종료한다.
  let inFlight = 0;
  let closed = false;
  const maybeExit = () => { if (closed && inFlight === 0) process.exit(0); };
  const tools = [
    { name: 'save_layout', description: 'Save current window layout', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
    { name: 'restore_layout', description: 'Restore saved window layout', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
    { name: 'list_layouts', description: 'List saved layouts', inputSchema: { type: 'object', properties: {} } },
    { name: 'set_context_mode', description: 'Set context mode', inputSchema: { type: 'object', properties: { mode: { type: 'string' } }, required: ['mode'] } },
    { name: 'get_helper_status', description: 'Get fWarrange helper status', inputSchema: { type: 'object', properties: {} } },
    { name: 'configure_helper', description: 'Configure helper settings', inputSchema: { type: 'object', properties: {} } }
  ];

  rl.on('line', async (line) => {
    try {
      const msg = JSON.parse(line);
      if (msg.method === 'server/discover') {
        // MCP 2026-07-28 무상태 코어 — 핸드셰이크 없이 지원 버전을 광고한다.
        // 구 클라이언트는 이 메서드를 보내지 않고 곧바로 initialize 로 오므로 아래 분기가 그대로 처리한다.
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            ttlMs: 60000,
            cacheScope: 'private',
            supportedVersions: ['2026-07-28'],
            capabilities: { tools: { listChanged: false } }
          }
        }) + '\n');
      } else if (msg.method === 'initialize') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fWarrange', version: '1.1.0' } } }) + '\n');
      } else if (msg.method === 'tools/list') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { ttlMs: 60000, cacheScope: 'private', tools } }) + '\n');
      } else if (msg.method === 'tools/call') {
        inFlight += 1;
        try {
          const inp = msg.params.arguments || {};
          const missing = missingRequired(tools, msg.params.name, inp);
          const result = missing.length
            ? { error: `필수 입력 누락: ${missing.join(', ')}` }
            : await handleToolCall(msg.params.name, inp);
          process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }], isError: isErrorResult(result), resultType: 'complete' } }) + '\n');
        } finally {
          inFlight -= 1;
          maybeExit();
        }
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: 0, error: { code: -32603, message: err.message } }) + '\n');
    }
  });
  rl.on('close', () => { closed = true; maybeExit(); });
}

main().catch(err => { console.error(err); process.exit(1); });
