#!/usr/bin/env node
/**
 * fBanner MCP Server
 * Wraps fBanner.app REST API (localhost:3011) as MCP server
 */

const readline = require('readline');
const http = require('http');

const PORT = 3011;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
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
      case 'split_image':
        return await makeRequest('/api/split', 'POST', {
          filePath: toolInput.file_path,
          rows: toolInput.rows || 2,
          cols: toolInput.cols || 2,
          format: toolInput.format || 'png'
        });

      case 'load_image':
        return await makeRequest('/api/load', 'POST', {
          filePath: toolInput.file_path
        });

      case 'export_result':
        return await makeRequest('/api/export', 'POST', {
          outputPath: toolInput.output_path,
          format: toolInput.format || 'png'
        });

      case 'get_status':
        return await makeRequest('/api/status');

      case 'set_config':
        return await makeRequest('/api/config', 'POST', toolInput);

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
    {
      name: 'split_image',
      description: 'Split image/PDF/SVG into grid tiles',
      inputSchema: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: 'Source file path' },
          rows: { type: 'integer', description: 'Vertical splits' },
          cols: { type: 'integer', description: 'Horizontal splits' },
          format: { type: 'string', description: 'Output format (png/jpg/svg/pdf)' }
        },
        required: ['file_path']
      }
    },
    {
      name: 'load_image',
      description: 'Load image/PDF/SVG file',
      inputSchema: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: 'File path to load' }
        },
        required: ['file_path']
      }
    },
    {
      name: 'export_result',
      description: 'Export split result to file',
      inputSchema: {
        type: 'object',
        properties: {
          output_path: { type: 'string', description: 'Output directory' },
          format: { type: 'string', description: 'Export format' }
        },
        required: ['output_path']
      }
    },
    {
      name: 'get_status',
      description: 'Get current status',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'set_config',
      description: 'Set configuration',
      inputSchema: {
        type: 'object',
        properties: {
          rows: { type: 'integer' },
          cols: { type: 'integer' },
          format: { type: 'string' }
        }
      }
    }
  ];

  rl.on('line', async (line) => {
    try {
      const msg = JSON.parse(line);

      if (msg.method === 'initialize') {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: 'fBanner', version: '1.0.0' }
          }
        }) + '\n');
      } else if (msg.method === 'tools/list') {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: msg.id,
          result: { tools }
        }) + '\n');
      } else if (msg.method === 'tools/call') {
        const result = await handleToolCall(msg.params.name, msg.params.arguments);
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false
          }
        }) + '\n');
      }
    } catch (err) {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        error: { code: -32603, message: err.message }
      }) + '\n');
    }
  });

  rl.on('close', () => process.exit(0));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
