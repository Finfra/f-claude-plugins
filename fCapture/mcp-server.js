#!/usr/bin/env node
// fCapture MCP 서버 — 기존 6종(fBanner·fQRGen 등)과 달리 REST 포트가 없다.
// fCapture 는 앱이 아니라 CLI 이므로 execFile 로 바이너리를 직접 실행한다.
const readline = require('readline');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// 바이너리 탐색 순서: FCAPTURE_BIN → brew 설치본 → ~/.bin 심링크. 하드코딩하지 않는다.
function resolveBin() {
  const candidates = [
    process.env.FCAPTURE_BIN,
    '/opt/homebrew/bin/fcapture',
    '/usr/local/bin/fcapture',
    path.join(os.homedir(), '.bin', 'fCapture')
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      fs.accessSync(c, fs.constants.X_OK);
      return c;
    } catch { /* 다음 후보 */ }
  }
  return null;
}

const PERMISSION_HINT =
  '화면 기록 권한이 없을 수 있습니다. 시스템 설정 → 개인정보 보호 및 보안 → 화면 기록 에서 ' +
  '이 MCP 서버를 실행한 앱(터미널·Claude Code 등)을 허용한 뒤 그 앱을 완전히 종료했다가 다시 실행하십시오.';

function looksLikePermissionError(text) {
  return /권한|permission|denied|not authorized|screen ?record|CGDisplay|TCC/i.test(text || '');
}

// fCapture 는 동시 실행을 견디지 못한다 — 병렬로 띄우면 전부 "스크린 녹화 권한이 필요합니다" 로
// 실패한다(2026-09-09 실측, 3-way 병렬 전건 실패 / 순차 실행은 전건 성공). 원인 메시지가
// 권한 문제로 오인되게 나오므로, MCP 클라이언트가 도구를 병렬 호출해도 CLI 는 한 번에 하나만 돈다.
let cliQueue = Promise.resolve();
function runCli(args, timeoutMs) {
  const run = cliQueue.then(() => runCliOnce(args, timeoutMs));
  cliQueue = run.catch(() => {});
  return run;
}

// CLI 1회 실행. 조용한 실패 금지 — exit code·stderr 를 그대로 사람이 읽는 메시지로 감싼다.
function runCliOnce(args, timeoutMs) {
  return new Promise((resolve) => {
    const bin = resolveBin();
    if (!bin) {
      resolve({
        error:
          'fCapture 바이너리를 찾지 못했습니다. `brew install finfra/f/fcapture` 로 설치하거나 ' +
          'FCAPTURE_BIN 환경변수에 실행 파일 절대경로를 지정하십시오. ' +
          '탐색한 경로: FCAPTURE_BIN, /opt/homebrew/bin/fcapture, /usr/local/bin/fcapture, ~/.bin/fCapture'
      });
      return;
    }
    execFile(bin, args, { timeout: timeoutMs || 60000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      const out = (stdout || '').trim();
      const errOut = (stderr || '').trim();
      if (err && err.killed) {
        resolve({ error: `fCapture 실행이 ${Math.round((timeoutMs || 60000) / 1000)}초 안에 끝나지 않아 중단했습니다. 명령: ${bin} ${args.join(' ')}` });
        return;
      }
      const code = err && typeof err.code === 'number' ? err.code : (err ? 1 : 0);
      if (code !== 0 || errOut) {
        let msg = `fCapture 실행 실패 (exit ${code}). 명령: ${bin} ${args.join(' ')}`;
        if (errOut) msg += `\nstderr: ${errOut}`;
        if (out) msg += `\nstdout: ${out}`;
        if (looksLikePermissionError(errOut + out)) msg += `\n${PERMISSION_HINT}`;
        resolve({ error: msg });
        return;
      }
      resolve({ bin, stdout: out });
    });
  });
}

// 캡처 도구 공통 — --result onlyPath 로 저장 경로 문자열만 돌려준다(이미지 바이너리를 stdout 으로 흘리지 않는다).
async function runCapture(args, timeoutMs) {
  const res = await runCli(args.concat(['-R', 'onlyPath']), timeoutMs);
  if (res.error) return res;
  const paths = res.stdout.split('\n').map(s => s.trim()).filter(Boolean);
  if (paths.length === 0) {
    return {
      error:
        `fCapture 가 exit 0 으로 끝났지만 저장 경로를 출력하지 않았습니다. 명령: ${res.bin} ${args.join(' ')}\n` +
        PERMISSION_HINT
    };
  }
  const missing = paths.filter(p => !fs.existsSync(p));
  if (missing.length > 0) {
    return { error: `fCapture 가 경로를 반환했지만 파일이 존재하지 않습니다: ${missing.join(', ')}` };
  }
  return { paths, path: paths[0] };
}

function requireInt(inp, key) {
  const v = inp[key];
  if (v === undefined || v === null || v === '') throw new Error(`필수 입력 누락: ${key}`);
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${key} 는 정수여야 합니다 (받은 값: ${JSON.stringify(v)})`);
  return n;
}

const WINDOW_MODES = ['window_active', 'window_pointer', 'window_flash', 'scroll_capture'];

async function handleToolCall(toolName, toolInput) {
  const inp = toolInput || {};
  try {
    switch (toolName) {
      case 'capture_screen': {
        const target = inp.display === undefined || inp.display === null
          ? 'all'
          : `screen:${requireInt(inp, 'display')}`;
        const args = ['-t', target];
        if (inp.path) args.push('-p', String(inp.path));
        if (inp.format) args.push('-F', String(inp.format));
        return await runCapture(args, 60000);
      }
      case 'capture_window': {
        const mode = inp.mode ? String(inp.mode) : 'window_active';
        if (!WINDOW_MODES.includes(mode)) {
          return { error: `mode 값이 올바르지 않습니다: ${mode}. 사용 가능: ${WINDOW_MODES.join(', ')}` };
        }
        const args = ['-t', mode];
        if (inp.path) args.push('-p', String(inp.path));
        if (inp.format) args.push('-F', String(inp.format));
        let timeout = mode === 'scroll_capture' ? 180000 : 60000;
        if (inp.relay !== undefined && inp.relay !== null) {
          const relay = requireInt(inp, 'relay');
          if (relay < 0) return { error: 'relay 는 0 이상이어야 합니다' };
          args.push('--relay', String(relay));
          timeout += relay * 1000;
        }
        return await runCapture(args, timeout);
      }
      case 'capture_region': {
        const x = requireInt(inp, 'x');
        const y = requireInt(inp, 'y');
        const w = requireInt(inp, 'width');
        const h = requireInt(inp, 'height');
        if (w <= 0 || h <= 0) return { error: 'width·height 는 1 이상이어야 합니다' };
        const args = ['-t', 'region_static', '--region', `${x},${y},${w},${h}`];
        if (inp.path) args.push('-p', String(inp.path));
        if (inp.format) args.push('-F', String(inp.format));
        return await runCapture(args, 60000);
      }
      case 'capture_with_preset': {
        if (!inp.config_path) return { error: '필수 입력 누락: config_path' };
        const cfg = String(inp.config_path).replace(/^~(?=\/|$)/, os.homedir());
        if (!fs.existsSync(cfg)) return { error: `설정 파일이 존재하지 않습니다: ${cfg}` };
        // 설정 파일이 target=region_user 를 지정하면 인터랙티브 대기에 걸린다 — 미리 거른다.
        try {
          const parsed = JSON.parse(fs.readFileSync(cfg, 'utf8'));
          if (parsed && parsed.target === 'region_user') {
            return { error: '설정 파일의 target 이 region_user 입니다. 사용자 마우스 조작을 요구해 MCP 호출에서는 사용할 수 없습니다.' };
          }
        } catch (e) {
          return { error: `설정 파일을 JSON 으로 읽지 못했습니다: ${cfg} — ${e.message}` };
        }
        return await runCapture([cfg], 180000);
      }
      case 'get_version': {
        const res = await runCli(['--version'], 10000);
        if (res.error) return res;
        return { version: res.stdout, bin: res.bin };
      }
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  // stdin 이 닫혀도 진행 중인 캡처 응답을 버리지 않는다 — 남은 호출이 끝난 뒤 종료한다.
  let inFlight = 0;
  let closed = false;
  const maybeExit = () => { if (closed && inFlight === 0) process.exit(0); };
  const tools = [
    {
      name: 'capture_screen',
      description: 'Capture full display(s). Omit display to capture all displays. Returns saved file path(s).',
      inputSchema: {
        type: 'object',
        properties: {
          display: { type: 'integer', description: 'Display number (1-based). Omit for all displays.' },
          path: { type: 'string', description: 'Save directory (default: ~/Desktop)' },
          format: { type: 'string', description: 'Filename template, ex) screenshot_%d_%T_%target' }
        }
      }
    },
    {
      name: 'capture_window',
      description: 'Capture a window. mode: window_active (default) / window_pointer / window_flash / scroll_capture. Returns saved file path.',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: WINDOW_MODES, description: 'Capture target mode (default: window_active)' },
          path: { type: 'string', description: 'Save directory (default: ~/Desktop)' },
          format: { type: 'string', description: 'Filename template, ex) window_%d_%T' },
          relay: { type: 'integer', description: 'Delay N seconds before capturing' }
        }
      }
    },
    {
      name: 'capture_region',
      description: 'Capture a fixed screen region by coordinates. Returns saved file path.',
      inputSchema: {
        type: 'object',
        properties: {
          x: { type: 'integer' },
          y: { type: 'integer' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          path: { type: 'string', description: 'Save directory (default: ~/Desktop)' },
          format: { type: 'string', description: 'Filename template' }
        },
        required: ['x', 'y', 'width', 'height']
      }
    },
    {
      name: 'capture_with_preset',
      description: 'Run fCapture with a JSON preset file (capturePath / target / fileFormat / staticRegion / result). Returns saved file path.',
      inputSchema: {
        type: 'object',
        properties: { config_path: { type: 'string', description: 'Absolute path to the preset JSON file' } },
        required: ['config_path']
      }
    },
    {
      name: 'get_version',
      description: 'Get the installed fCapture CLI version',
      inputSchema: { type: 'object', properties: {} }
    }
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
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'fCapture', version: '1.0.0' } } }) + '\n');
      } else if (msg.method === 'tools/list') {
        process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { ttlMs: 60000, cacheScope: 'private', tools } }) + '\n');
      } else if (msg.method === 'tools/call') {
        inFlight += 1;
        try {
          const result = await handleToolCall(msg.params.name, msg.params.arguments);
          process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }], isError: Boolean(result && result.error), resultType: 'complete' } }) + '\n');
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
