#!/usr/bin/env node
const readline = require('readline');
const http = require('http');

const PORT = 3012;
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
      case 'set_window_size':
        return await makeRequest('/api/window/frame', 'POST', { width: inp.width, height: inp.height });
      case 'set_background':
        // 앱은 색과 그라디언트를 별도 엔드포인트로 받는다
        if (inp.gradient) return await makeRequest('/api/background/gradient', 'POST', { gradient: inp.gradient });
        return await makeRequest('/api/background/color', 'POST', { color: inp.color });
      case 'load_preset':
        return await makeRequest('/api/presets/apply', 'POST', { name: inp.preset_name });
      case 'get_presets':
        return await makeRequest('/api/presets');
      case 'clear_canvas':
        // fBoard 앱에 대응 엔드포인트가 없다 — 404 를 흘리지 않고 명시적으로 실패시킨다
        return { error: 'clear_canvas: fBoard 앱에 대응 API 가 없음 (구 /api/canvas/clear 는 미구현)' };
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const tools = [
    { name: 'set_window_size', description: 'Set whiteboard window size', inputSchema: { type: 'object', properties: { width: { type: 'integer' }, height: { type: 'integer' } } } },
    { name: 'set_background', description: 'Set background color or gradient', inputSchema: { type: 'object', properties: { color: { type: 'string' }, gradient: { type: 'string' } } } },
    { name: 'load_preset', description: 'Load preset configuration', inputSchema: { type: 'object', properties: { preset_name: { type: 'string' } }, required: ['preset_name'] } },
    { name: 'get_presets', description: 'List available presets', inputSchema: { type: 'object', properties: {} } },
    { name: 'clear_canvas', description: 'Clear whiteboard', inputSchema: { type: 'object', properties: {} } }
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
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fBoard', version: '1.1.0' } } }) + '\n');
      } else if (msg.method === 'tools/list') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { ttlMs: 60000, cacheScope: 'private', tools } }) + '\n');
      } else if (msg.method === 'tools/call') {
        const result = await handleToolCall(msg.params.name, msg.params.arguments);
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }], isError: false, resultType: 'complete' } }) + '\n');
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: 0, error: { code: -32603, message: err.message } }) + '\n');
    }
  });
  rl.on('close', () => process.exit(0));
}

main().catch(err => { console.error(err); process.exit(1); });
