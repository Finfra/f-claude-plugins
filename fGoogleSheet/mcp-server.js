#!/usr/bin/env node
const readline = require('readline');
const http = require('http');

const PORT = 3013;
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
      case 'add_row':
        return await makeRequest('/api/sheets/add-row', 'POST', { data: toolInput.data });
      case 'set_field':
        return await makeRequest('/api/sheets/set-field', 'POST', { row: toolInput.row, column: toolInput.column, value: toolInput.value });
      case 'clear_range':
        return await makeRequest('/api/sheets/clear-range', 'POST', { range: toolInput.range });
      case 'find_unanswered':
        return await makeRequest('/api/sheets/find-unanswered', 'POST', { column: toolInput.column });
      case 'check_status':
        return await makeRequest('/api/sheets/status');
      case 'find_next_row':
        return await makeRequest('/api/sheets/find-next-row', 'POST', { column: toolInput.column });
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
    { name: 'add_row', description: 'Add row to sheet', inputSchema: { type: 'object', properties: { data: { type: 'array' } }, required: ['data'] } },
    { name: 'set_field', description: 'Set field value', inputSchema: { type: 'object', properties: { row: { type: 'integer' }, column: { type: 'integer' }, value: { type: 'string' } }, required: ['row', 'column', 'value'] } },
    { name: 'clear_range', description: 'Clear range', inputSchema: { type: 'object', properties: { range: { type: 'string' } }, required: ['range'] } },
    { name: 'find_unanswered', description: 'Find unanswered questions', inputSchema: { type: 'object', properties: { column: { type: 'integer' } }, required: ['column'] } },
    { name: 'check_status', description: 'Check sheet status', inputSchema: { type: 'object', properties: {} } },
    { name: 'find_next_row', description: 'Find next available row', inputSchema: { type: 'object', properties: { column: { type: 'integer' } }, required: ['column'] } }
  ];

  rl.on('line', async (line) => {
    try {
      const msg = JSON.parse(line);
      if (msg.method === 'initialize') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fGoogleSheet', version: '1.2.0' } } }) + '\n');
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
