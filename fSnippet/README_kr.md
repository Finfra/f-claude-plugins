---
title: fSnippet Claude Code Plugin (한국어)
description: fSnippet REST API를 통해 텍스트 스니펫을 검색, 확장, 관리하는 Claude Code 플러그인
date: 2026-03-26
---

fSnippet REST API를 통해 텍스트 스니펫을 검색, 확장, 관리하는 Claude Code 플러그인입니다.
설치 후 Claude Code에서 슬래시 커맨드로 스니펫 라이브러리에 즉시 접근할 수 있습니다.

---

# 플러그인 구조

```
plugin.json              # 플러그인 매니페스트
skills/
└── fsnippet/
    └── SKILL.md         # 스니펫 관리 스킬
```

---

# 스킬

## `fsnippet` — 스니펫 관리

fSnippet REST API를 통해 텍스트 스니펫을 검색, 확장, 관리합니다.

**사용 예시:**
```
/fsnippet:fsnippet docker
/fsnippet:fsnippet bb◊
/fsnippet:fsnippet clipboard history
/fsnippet:fsnippet folders
/fsnippet:fsnippet stats top 5
```

**주요 기능:**
* 서버 미실행 시 fSnippet.app 실행 안내
* 축약어, 폴더, 태그 기반 스니펫 검색
* 축약어를 전체 텍스트로 확장 (플레이스홀더 지원)
* 클립보드 히스토리 조회 및 검색
* 스니펫 폴더 및 규칙 정보 조회
* 사용 통계 확인

**옵션:**

| 옵션              | 설명              | 기본값                  |
| ----------------- | ----------------- | ----------------------- |
| `--server=<주소>` | 서버 주소 변경    | `http://localhost:3015` |

**API 요약 (13개 엔드포인트):**

| 카테고리  | 엔드포인트                                | 메서드 | 설명                       |
| --------- | ----------------------------------------- | ------ | -------------------------- |
| 상태      | `/`                                       | GET    | 헬스 체크                  |
| 스니펫    | `/api/snippets/search`                    | GET    | 키워드로 스니펫 검색       |
| 스니펫    | `/api/snippets/by-abbreviation/{abbrev}`  | GET    | 축약어로 스니펫 조회       |
| 스니펫    | `/api/snippets/{id}`                      | GET    | ID로 스니펫 상세 조회      |
| 스니펫    | `/api/snippets/expand`                    | POST   | 축약어를 텍스트로 확장     |
| 클립보드  | `/api/clipboard/history`                  | GET    | 클립보드 히스토리 조회     |
| 클립보드  | `/api/clipboard/history/{id}`             | GET    | 클립보드 항목 상세 조회    |
| 클립보드  | `/api/clipboard/search`                   | GET    | 클립보드 히스토리 검색     |
| 폴더      | `/api/folders`                            | GET    | 전체 스니펫 폴더 목록      |
| 폴더      | `/api/folders/{name}`                     | GET    | 폴더 상세 및 스니펫 목록   |
| 통계      | `/api/stats/top`                          | GET    | 상위 N 사용 통계           |
| 통계      | `/api/stats/history`                      | GET    | 사용 히스토리              |
| 트리거    | `/api/triggers`                           | GET    | 트리거 키 정보             |

---

# 설치 방법

## 방법 1: 플러그인 설치 (권장)

Claude Code에서 실행:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fsnippet@f-claude-plugins
```

> Marketplace는 `git-subdir`를 사용하여 `fSnippet/` 하위 디렉토리 경로를 자동으로 해석합니다.

## 방법 2: 수동 복사

```bash
# f-claude-plugins 레포 클론 후
cp -r fSnippet/plugin.json .claude-plugin/plugin.json
cp -r fSnippet/skills .claude/skills
```

## 방법 3: 심볼릭 링크

```bash
ln -sf fSnippet/skills/fsnippet .claude/skills/fsnippet
```

---

# 전제 조건

fSnippet REST API 서버가 실행 중이어야 합니다:

| 요구 사항         | 상세                                                   |
| ----------------- | ------------------------------------------------------ |
| macOS 네이티브 앱 | fSnippet.app 실행                                      |
| API 활성화        | 설정 > 고급 > REST API 활성화                          |
| 기본 포트         | `3015` (설정에서 변경 가능)                            |
| 보안              | 기본적으로 localhost만 허용 (`127.0.0.1/32`)           |

> 서버가 꺼져 있으면 스킬이 사용자에게 fSnippet.app 실행 및 REST API 활성화를 안내합니다.

---

# 함께 사용하면 좋은 확장

| 확장                        | 위치                | 설명                                                 |
| --------------------------- | ------------------- | ---------------------------------------------------- |
| [MCP Server](https://github.com/finfra/fSnippet_public/tree/main/mcp)   | fSnippet_public/mcp | MCP 프로토콜로 스니펫 접근 (Claude Desktop 호환)     |
| [OpenAPI Spec](https://github.com/finfra/fSnippet_public/tree/main/api) | fSnippet_public/api | OpenAPI 3.0 전체 스펙 문서                           |

---

# 라이선스

MIT
