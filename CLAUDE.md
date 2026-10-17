---
title: CLAUDE.md
description: Claude Code가 이 저장소에서 작업할 때 참고하는 가이드
date: 2026-04-04

# ── L1 아이덴티티 (Issue472) ──────────────────────────────────────────
# 스키마 정본: prj6 ~/_git/___oracle/_doc_arch/project-identity-scheme.md
# ⚠️ 빈 필드는 추측으로 채우지 말 것 — 틀린 값은 빈 값보다 나쁘다
prj: 20
identity: Finfra 가 공개 배포하는 Claude Code 플러그인 마켓플레이스 — fApp 제어 플러그인·세션 동작을 바꾸는 mod(spell-note 등)·fpm 번들(fpm-core)
identity_origin: macOS 네이티브 앱(fApp)을 REST API 로 Claude Code 에서 제어하는 플러그인 마켓플레이스
not: 앱이나 원본 SCAR 를 만드는 곳이 아니다 — 앱은 prj11~16, 개인 운영 SCAR·mod 는 prj3 이고 여기는 외부 배포용으로 다듬은 플러그인만 싣는다
goal_parent: 보조 도구
lifetime: perpetual
outcome: Finfra 플러그인이 마켓플레이스 등록 한 번으로 설치·동작하는가
status: active
---

글로벌 규칙(언어, 스타일, 네이밍 등)은 `~/.claude/CLAUDE.md` 참조.

# 프로젝트 개요

Finfra 가 공개 배포하는 Claude Code 플러그인 모음 저장소. 세 부류를 싣는다 — ① **fApp 제어 플러그인**(macOS 앱의 REST API 를 감쌈, fCapture 만 CLI 직접 실행) ② **mod**(function hook 으로 세션 동작·UI 를 바꾸는 플러그인, ex) spell-note) ③ **fpm 번들**(`fpm-core/`). 모두 Claude Code 마켓플레이스에서 설치 가능.

* 원본이 다른 repo 에 있는 플러그인(prj3 mod 등)은 **외부 배포용으로 일반화한 뒤** 옮긴다 — 개인 경로·토큰 하드코딩 금지

# 구조

```
f-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json      # 마켓플레이스 레지스트리
├── fBanner/                  # 이미지/PDF/SVG 격자 타일 분할 (Port: 3011)
├── fBoard/                   # 화이트보드 앱 제어 (Port: 3012)
├── fGoogleSheet/             # Google Sheets 데이터 관리 (Port: 3013)
├── fQRGen/                   # QR 코드 생성 (Port: 3014)
├── fSnippet/                 # 텍스트 스니펫 관리 (Port: 3015)
├── fWarrange/                # 윈도우 레이아웃 저장/복원 (Port: 3016)
├── fCapture/                 # 화면·윈도우·영역 캡처 (CLI 직접 실행 — 포트 없음)
├── spell-note/               # mod — 프롬프트 한국어 맞춤법 검사 band (function hook, 앱 불필요)
├── Issue.md                  # 이슈 트래커
└── nodeForHuman.md           # 휴먼 노드 문서
```

각 플러그인 폴더 구조:

* `plugin.json` - 플러그인 메타데이터
* `skills/<name>/SKILL.md` - Claude Code 스킬 정의
* `README.md` / `README_kr.md` - 영문/한국어 문서

# 플러그인 목록

| Plugin       | App              | Port | Description                       |
| :----------- | :--------------- | :--- | :-------------------------------- |
| fBanner      | fBanner.app      | 3011 | 이미지/PDF/SVG를 격자 타일로 분할 |
| fBoard       | fBoard.app       | 3012 | 화이트보드 앱 제어                |
| fGoogleSheet | fGoogleSheet.app | 3013 | Google Sheets 데이터 관리         |
| fQRGen       | fQRGen.app       | 3014 | QR 코드 생성                      |
| fSnippet     | fSnippet.app     | 3015 | 텍스트 스니펫 관리                |
| fWarrange    | fWarrange.app    | 3016 | 윈도우 레이아웃 저장/복원         |
| fCapture     | fCapture CLI     | —    | 화면·윈도우·영역 캡처             |
| spell-note   | — (mod)          | —    | 프롬프트 한국어 맞춤법 검사·기록  |

> **fCapture 만 예외**: 나머지 6종은 macOS 앱의 REST API(포트 3011~3016)를 `http.request` 로 호출한다. fCapture 는 앱이 아니라 CLI 이므로 서버 포트가 없고 `child_process.execFile` 로 바이너리를 직접 실행한다 — 포트 할당 불필요.

# Claude Code 커맨드 (`.claude/commands/`)

| 커맨드         | 설명                                                         |
| :------------- | :----------------------------------------------------------- |
| `git-auto`     | Git 자동 커밋 및 푸시 워크플로우                             |
| `issue-reg`    | 이슈 등록 (HWM 확인 -> ID 발급 -> Issue.md 업데이트)        |
| `issue-fix`    | 이슈 해결 워크플로우 (분석 -> 구현 -> 검증 -> 종결)         |
| `issue-closer` | 이슈 종결 처리 (커밋 -> 완료 이동 -> 해시 기록 -> Doc 커밋) |

# Claude Code 스킬 (`.claude/skills/`)

| 스킬    | 설명                                               |
| :------ | :------------------------------------------------- |
| `issue` | 이슈 관리 (issue-g 기반, 플러그인 프로젝트 특화)   |

# Claude Code 에이전트 (`.claude/agents/`)

| 에이전트 | 설명                                                                       |
| :------- | :------------------------------------------------------------------------- |
| `issue`  | Issue.md 상태 분석 후 우선순위에 따라 이슈 등록/진행/해결을 자동 결정/실행 |

# 개발 참고

* 플러그인 설치: `claude plugin install <name> --registry github:Finfra/f-claude-plugins`
* 전제 조건: macOS + 대응 앱 실행 중 + Claude Code CLI
* 각 플러그인의 SKILL.md가 실제 API 엔드포인트와 사용법을 정의

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
