// tdd 공통 헬퍼 — MCP 서버를 격리 환경(임시 HOME·목 서버 포트)으로 띄우고 JSON-RPC 한 줄씩 주고받는다.
// 실제 앱(3011~3016)·사용자 설치본·실데이터를 건드리지 않는 것이 전제다.
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// REST 6종 — 플러그인 폴더 · 포트 override 환경변수
const REST_SERVERS = {
  fBanner: 'FBANNER_PORT',
  fBoard: 'FBOARD_PORT',
  fGoogleSheet: 'FGOOGLESHEET_PORT',
  fQRGen: 'FQRGEN_PORT',
  fSnippet: 'FSNIPPET_PORT',
  fWarrange: 'FWARRANGE_PORT'
};

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `fcp-tdd-${prefix}-`));
}

// 요청을 기록하는 목 REST 서버. delayMs 만큼 늦게 200 을 돌려준다.
function startMockApp({ delayMs = 0 } = {}) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, body });
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      }, delayMs);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ port: server.address().port, requests, close: () => new Promise(r => server.close(r)) });
    });
  });
}

// 서버 프로세스를 띄운다. 응답은 id 별로 모은다.
function startServer(plugin, env = {}) {
  const home = tmpDir('home');
  const child = spawn(process.execPath, [path.join(ROOT, plugin, 'mcp-server.js')], {
    env: { PATH: process.env.PATH, HOME: home, ...env },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const responses = new Map();
  const waiters = new Map();
  let buf = '';
  let stderr = '';
  child.stderr.on('data', d => { stderr += d; });
  child.stdout.on('data', d => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (!line.trim()) continue;
      const msg = JSON.parse(line);
      responses.set(msg.id, msg);
      const w = waiters.get(msg.id);
      if (w) { waiters.delete(msg.id); w(msg); }
    }
  });
  const exited = new Promise(r => child.on('exit', code => r(code)));
  let nextId = 1;

  function send(method, params) {
    const id = nextId++;
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    return id;
  }
  function waitFor(id, timeoutMs = 5000) {
    if (responses.has(id)) return Promise.resolve(responses.get(id));
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        waiters.delete(id);
        reject(new Error(`${plugin}: id=${id} 응답 없음 (${timeoutMs}ms). stderr: ${stderr}`));
      }, timeoutMs);
      waiters.set(id, (m) => { clearTimeout(t); resolve(m); });
    });
  }
  async function call(name, args, timeoutMs) {
    const params = args === undefined ? { name } : { name, arguments: args };
    return waitFor(send('tools/call', params), timeoutMs);
  }
  async function listTools() {
    return (await waitFor(send('tools/list', {}))).result.tools;
  }
  function stop() {
    child.stdin.end();
    return exited;
  }
  return { child, home, send, waitFor, call, listTools, stop, exited, responses, stderr: () => stderr };
}

// tools/call 응답 → { isError, payload }
function parseResult(msg) {
  if (msg.error) throw new Error(`JSON-RPC error: ${JSON.stringify(msg.error)}`);
  return { isError: msg.result.isError, payload: JSON.parse(msg.result.content[0].text) };
}

// 가짜 fCapture 바이너리 — 동시 실행이면 실제 CLI 처럼 "권한" 메시지로 실패한다(2026-09-09 실측 재현).
function makeFakeFcapture(dir, { sleepSec = 0.3 } = {}) {
  const bin = path.join(dir, 'fcapture');
  const lock = path.join(dir, 'running.lock');
  const out = path.join(dir, 'out');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(bin, `#!/bin/sh
if [ "$1" = "--version" ]; then echo "fcapture 0.0.0-fake"; exit 0; fi
if ! mkdir "${lock}" 2>/dev/null; then
  echo "스크린 녹화 권한이 필요합니다" >&2
  exit 1
fi
sleep ${sleepSec}
f="${out}/cap_$$.png"
: > "$f"
rmdir "${lock}"
echo "$f"
`);
  fs.chmodSync(bin, 0o755);
  return bin;
}

module.exports = { ROOT, REST_SERVERS, tmpDir, startMockApp, startServer, parseResult, makeFakeFcapture };
