#!/usr/bin/env node
const readline = require('readline');
const http = require('http');

const PORT = 3014;
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
      case 'generate_qr':
        return await makeRequest('/api/generate', 'POST', { data: inp.data, format: inp.format || 'png', size: inp.size || 200 });
      case 'generate_from_url':
        // 앱에는 /api/generate 하나뿐이다 — URL 도 같은 엔드포인트로 보낸다
        return await makeRequest('/api/generate', 'POST', { data: inp.url, format: inp.format || 'png', size: inp.size || 200 });
      case 'get_status':
        // 상태는 루트가 제공한다 (/api/status 는 존재하지 않음)
        return await makeRequest('/');
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
    { name: 'generate_qr', description: 'Generate QR code from text/data', inputSchema: { type: 'object', properties: { data: { type: 'string' }, format: { type: 'string' }, size: { type: 'integer' } }, required: ['data'] } },
    { name: 'generate_from_url', description: 'Generate QR code from URL', inputSchema: { type: 'object', properties: { url: { type: 'string' }, format: { type: 'string' }, size: { type: 'integer' } }, required: ['url'] } },
    { name: 'get_status', description: 'Get QR generator status', inputSchema: { type: 'object', properties: {} } }
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
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fQRGen', version: '1.0.0' } } }) + '\n');
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
