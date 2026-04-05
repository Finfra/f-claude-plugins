---
title: fGoogleSheet Claude Code Plugin (한국어)
description: fGoogleSheet REST API를 통해 Google Sheets 데이터를 관리하는 Claude Code 플러그인
date: 2026-03-26
---

fGoogleSheet REST API를 통해 Google Sheets 데이터를 관리하는 Claude Code 플러그인입니다.
설치 후 Claude Code에서 슬래시 커맨드로 데이터 추가, 미답변 질문 조회, 상태 확인 등을 즉시 수행할 수 있습니다.

---

# 플러그인 구조

```
plugin.json              # 플러그인 매니페스트
skills/
└── fgooglesheet/
    └── SKILL.md         # Google Sheets 관리 스킬
```

---

# 스킬

## `fgooglesheet` — Google Sheets 데이터 관리

fGoogleSheet REST API를 통해 Google Sheets 데이터를 관리합니다 (Key/Value 추가, 미답변 질문 조회, 상태 확인).

**사용 예시:**
```
/fgooglesheet:fgooglesheet Docker란? 컨테이너 가상화 플랫폼
/fgooglesheet:fgooglesheet --unanswered
/fgooglesheet:fgooglesheet --status
/fgooglesheet:fgooglesheet --next-row
```

**주요 기능:**
* Key/Value 데이터를 Google Sheets에 추가
* 미답변 질문 조회 (A열은 있고 B열이 비어있는 행)
* 앱 상태 조회 (실행 상태, 인증, 시트 정보)
* 다음 빈 행 찾기
* 서버 미실행 시 fGoogleSheet.app 실행 안내

**옵션:**

| 옵션              | 설명              | 기본값                  |
| ----------------- | ----------------- | ----------------------- |
| `--unanswered`    | 미답변 질문 조회  | -                       |
| `--status`        | 앱 상태 조회      | -                       |
| `--next-row`      | 다음 빈 행 찾기   | -                       |
| `--server=<주소>` | 서버 주소 변경    | `http://localhost:3013` |

**API 요약:**

| 엔드포인트            | 메서드 | 설명                                |
| --------------------- | ------ | ----------------------------------- |
| `GET /`               | GET    | 서버 상태 확인 (Health Check)       |
| `POST /api/add-line`  | POST   | Key/Value 데이터 Google Sheets 추가 |
| `GET /api/unanswered` | GET    | 미답변 질문 조회                    |
| `GET /api/status`     | GET    | 앱 상태 조회                        |
| `GET /api/next-row`   | GET    | 다음 빈 행 찾기                     |

---

# 설치 방법

## 방법 1: Plugin 설치 (권장)

Claude Code에서 실행:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fgooglesheet@f-claude-plugins
```

> marketplace는 `git-subdir`를 사용하여 `fGoogleSheet/` 하위 디렉토리 경로를 자동으로 처리합니다.

## 방법 2: 수동 복사

```bash
# f-claude-plugins 레포 클론 후
cp -r fGoogleSheet/plugin.json .claude-plugin/plugin.json
cp -r fGoogleSheet/skills .claude/skills
```

## 방법 3: 심볼릭 링크

```bash
ln -sf fGoogleSheet/skills/fgooglesheet .claude/skills/fgooglesheet
```

---

# 전제 조건

fGoogleSheet REST API 서버가 실행 중이어야 합니다:

| 서버              | 실행 방법                                          |
| ----------------- | -------------------------------------------------- |
| macOS 네이티브 앱 | fGoogleSheet.app 실행 (설정에서 REST API 활성화)   |

> 서버가 꺼져 있으면 스킬이 사용자에게 fGoogleSheet.app 실행을 안내합니다.

---

# 함께 사용하면 좋은 확장

| 확장       | 설명                                              |
| ---------- | ------------------------------------------------- |
| MCP Server | MCP 프로토콜로 Google Sheets 관리 (Claude Desktop 호환) |

---

# 라이선스

MIT
