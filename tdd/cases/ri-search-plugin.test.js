// #10 ri-search-plugin — ri-search 플러그인이 개인 값 없이 설정(env)만으로 동작한다 (근거: Issue20 — prj3 /ri 일반화)
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./_mcp');

const PLUGIN = path.join(ROOT, 'ri-search');
const RI = path.join(PLUGIN, 'skills', 'ri-search', 'ri.py');

function tmp(prefix) {
  return fs.mkdtempSync(path.join(require('os').tmpdir(), `fcp-tdd-${prefix}-`));
}

// 실행 가능한 가짜 CLI 를 만든다 — body 는 sh 스크립트 본문
function fake(dir, name, body) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, `#!/bin/sh\n${body}\n`, { mode: 0o755 });
  return p;
}

// 개인 환경 변수가 새어 들어가지 않도록 RI_* 를 비운 깨끗한 env
function ri(args, env) {
  const clean = { PATH: process.env.PATH, HOME: tmp('home') };
  return spawnSync('python3', ['-I', RI, ...args], { env: { ...clean, ...env }, encoding: 'utf8' });
}

const HIT = '[{"path":"/data/a.md","score":0.91,"mtime":"2026-10-01","snippet":"hello world"}]';

test('플러그인 골격: plugin.json·SKILL·커맨드·README 가 실재하고 name 이 ri-search', () => {
  const plugin = JSON.parse(fs.readFileSync(path.join(PLUGIN, 'plugin.json'), 'utf8'));
  assert.equal(plugin.name, 'ri-search');
  assert.equal(plugin.license, 'MIT');
  for (const f of ['skills/ri-search/SKILL.md', 'skills/ri-search/ri.py', 'commands/ri.md', 'README.md', 'README_kr.md']) {
    assert.ok(fs.existsSync(path.join(PLUGIN, f)), `없음: ${f}`);
  }
});

test('개인 값 grep 0건: 호스트·볼륨·계정·개인 repo 경로가 플러그인 어디에도 없다', () => {
  const bad = /jm4|jM4_2T|nowage|___common|\/Users\//i;
  const hits = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (bad.test(fs.readFileSync(p, 'utf8'))) hits.push(path.relative(ROOT, p));
    }
  })(PLUGIN);
  assert.deepEqual(hits, []);
});

test('search: RI_RINDEX 로 지정한 엔진을 부르고 결과를 2줄 형식으로 요약한다 (인덱스 마커·ssh 설정 없이 로컬 실행)', () => {
  const d = tmp('search');
  const rindex = fake(d, 'rindex', `echo '${HIT}'`);
  const r = ri(['search', '질문'], { RI_RINDEX: rindex });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /## rindex/);
  assert.match(r.stdout, /1\. 0\.910  \/data\/a\.md/);
  assert.match(r.stdout, /hello world/);
});

test('search: rindex 0건이어도 DigUp 이 없으면 크래시 없이 안내만 한다', () => {
  const d = tmp('nodigup');
  const rindex = fake(d, 'rindex', 'echo "[]"');
  const r = ri(['search', '질문'], { RI_RINDEX: rindex, RI_DIGUP: path.join(d, 'no-such-digup') });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /DigUp/);
  assert.match(r.stdout, /없음|not found/i);
});

test('search --kind: DigUp 만 부른다 (rindex 미호출)', () => {
  const d = tmp('kind');
  const rindex = fake(d, 'rindex', 'echo "RINDEX CALLED" >&2; exit 9');
  const digup = fake(d, 'digup', 'echo \'[{"path":"/x/s.png","cosine":0.5,"kind":"screenshot","modified":0,"excerpt":"shot"}]\'');
  const r = ri(['search', '화면', '--kind', 'screenshot'], { RI_RINDEX: rindex, RI_DIGUP: digup });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /## DigUp/);
  assert.doesNotMatch(r.stdout, /## rindex/);
});

test('원격: RI_SSH_HOST 와 RI_REMOTE_CMD 를 주면 인덱스 마커가 없는 머신에서 ssh 로 위임한다', () => {
  const d = tmp('ssh');
  const log = path.join(d, 'ssh.log');
  const ssh = fake(d, 'fakessh', `echo "$@" > '${log}'; echo remote-ok`);
  const r = ri(['search', '질문'], {
    RI_SSH: ssh, RI_SSH_HOST: 'indexbox', RI_REMOTE_CMD: 'python3 /opt/ri/ri.py',
    RI_LOCAL_MARK: path.join(d, 'absent')
  });
  assert.equal(r.status, 0, r.stderr);
  const args = fs.readFileSync(log, 'utf8');
  assert.match(args, /indexbox/);
  assert.match(args, /RI_NO_SSH=1 python3 \/opt\/ri\/ri\.py search/);
});

test('원격: RI_SSH_HOST 는 있는데 RI_REMOTE_CMD 가 없으면 추측하지 않고 rc 2', () => {
  const d = tmp('ssh-nocmd');
  const r = ri(['search', '질문'], { RI_SSH_HOST: 'indexbox', RI_LOCAL_MARK: path.join(d, 'absent') });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /RI_REMOTE_CMD/);
});

test('원격 설정이 없고 마커도 없으면 ssh 를 시도하지 않고 로컬 실행한다', () => {
  const d = tmp('nossh');
  const rindex = fake(d, 'rindex', `echo '${HIT}'`);
  const ssh = fake(d, 'fakessh', 'echo SSH CALLED >&2; exit 9');
  const r = ri(['search', '질문'], { RI_RINDEX: rindex, RI_SSH: ssh, RI_LOCAL_MARK: path.join(d, 'absent') });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /## rindex/);
});

test('update: RI_UPDATE_CMD 가 없으면 기동하지 않고 rc 2 로 설정을 요구한다', () => {
  const r = ri(['update'], {});
  assert.equal(r.status, 2);
  assert.match(r.stderr, /RI_UPDATE_CMD/);
});

test('update: RI_INDEXER_PAT 에 맞는 프로세스가 실행 중이면 rc 3 으로 거부한다', () => {
  const d = tmp('upd-busy');
  const pgrep = fake(d, 'pgrep', 'exit 0');
  const r = ri(['update'], { RI_UPDATE_CMD: 'true', RI_INDEXER_PAT: 'indexer', RI_PGREP: pgrep });
  assert.equal(r.status, 3);
});

test('update: 설정이 있으면 tmux 세션으로 RI_UPDATE_CMD 를 기동한다', () => {
  const d = tmp('upd-ok');
  const log = path.join(d, 'tmux.log');
  const tmux = fake(d, 'tmux', `echo "$@" >> '${log}'; case "$1" in has-session) exit 1;; esac; exit 0`);
  const r = ri(['update'], { RI_UPDATE_CMD: 'echo reindex', RI_TMUX: tmux });
  assert.equal(r.status, 0, r.stderr);
  assert.match(fs.readFileSync(log, 'utf8'), /new-session -d -s ri-index echo reindex/);
});
