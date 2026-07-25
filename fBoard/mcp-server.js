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
  try {
    switch (toolName) {
      case 'set_window_size':
        return await makeRequest('/api/window/size', 'POST', { width: toolInput.width, height: toolInput.height });
      case 'set_background':
        return await makeRequest('/api/background', 'POST', { color: toolInput.color, gradient: toolInput.gradient });
      case 'load_preset':
        return await makeRequest('/api/preset/load', 'POST', { name: toolInput.preset_name });
      case 'get_presets':
        return await makeRequest('/api/presets');
      case 'clear_canvas':
        return await makeRequest('/api/canvas/clear', 'POST', {});
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
      if (msg.method === 'initialize') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fBoard', version: '1.1.0' } } }) + '\n');
      } else if (msg.method === 'tools/list') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { tools } }) + '\n');
      } else if (msg.method === 'tools/call') {
        const result = await handleToolCall(msg.params.name, msg.params.arguments);
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }], isError: false } }) + '\n');
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: 0, error: { code: -32603, message: err.message } }) + '\n');
    }
  });
  rl.on('close', () => process.exit(0));
}

main().catch(err => { console.error(err); process.exit(1); });
