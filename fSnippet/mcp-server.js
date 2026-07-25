#!/usr/bin/env node
const readline = require('readline');
const http = require('http');

const PORT = 3015;
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
      case 'search_snippets':
        return await makeRequest(`/api/search?q=${encodeURIComponent(toolInput.query)}`);
      case 'expand_snippet':
        return await makeRequest('/api/expand', 'POST', { key: toolInput.key, context: toolInput.context });
      case 'create_snippet':
        return await makeRequest('/api/create', 'POST', { key: toolInput.key, value: toolInput.value, tags: toolInput.tags });
      case 'list_snippets':
        return await makeRequest('/api/list');
      case 'get_status':
        return await makeRequest('/api/status');
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
    { name: 'search_snippets', description: 'Search snippets by keyword', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    { name: 'expand_snippet', description: 'Expand snippet with context', inputSchema: { type: 'object', properties: { key: { type: 'string' }, context: { type: 'string' } }, required: ['key'] } },
    { name: 'create_snippet', description: 'Create new snippet', inputSchema: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' }, tags: { type: 'array' } }, required: ['key', 'value'] } },
    { name: 'list_snippets', description: 'List all snippets', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_status', description: 'Get snippet manager status', inputSchema: { type: 'object', properties: {} } }
  ];

  rl.on('line', async (line) => {
    try {
      const msg = JSON.parse(line);
      if (msg.method === 'initialize') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fSnippet', version: '1.0.0' } } }) + '\n');
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
