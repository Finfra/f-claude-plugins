---
title: CLAUDE.md
description: Claude Code가 이 저장소에서 작업할 때 참고하는 가이드
date: 2026-04-04
---

글로벌 규칙(언어, 스타일, 네이밍 등)은 `~/.claude/CLAUDE.md` 참조.

# 프로젝트 개요

macOS 네이티브 앱을 Claude Code에서 제어할 수 있는 플러그인 모음 저장소. 각 플러그인은 macOS 앱의 REST API를 통해 동작하며, Claude Code 마켓플레이스에서 설치 가능.

# 구조

```
f-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json      # 마켓플레이스 레지스트리
├── fBanner/                  # 이미지/PDF/SVG 격자 타일 분할 (Port: 3011)
├── fBoard/                   # 화이트보드 앱 제어 (Port: -)
├── fGoogleSheet/             # Google Sheets 데이터 관리 (Port: 3013)
├── fQRGen/                   # QR 코드 생성 (Port: 3014)
├── fSnippet/                 # 텍스트 스니펫 관리 (Port: 3015)
├── fWarrange/                # 윈도우 레이아웃 저장/복원 (Port: 3016)
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
| fBoard       | fBoard.app       | -    | 화이트보드 앱 제어                |
| fGoogleSheet | fGoogleSheet.app | 3013 | Google Sheets 데이터 관리         |
| fQRGen       | fQRGen.app       | 3014 | QR 코드 생성                      |
| fSnippet     | fSnippet.app     | 3015 | 텍스트 스니펫 관리                |
| fWarrange    | fWarrange.app    | 3016 | 윈도우 레이아웃 저장/복원         |

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
