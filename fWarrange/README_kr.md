---
title: fWarrange Claude Code Plugin (한국어)
description: fWarrange REST API를 통해 macOS 창 레이아웃을 저장하고 복구하는 Claude Code 플러그인
date: 2026-03-26
---

fWarrange REST API를 통해 macOS 창 레이아웃을 저장하고 복구하는 Claude Code 플러그인입니다.
설치 후 Claude Code에서 슬래시 커맨드로 창 레이아웃을 즉시 관리할 수 있습니다.

---

# 플러그인 구조

```
.claude-plugin/
└── plugin.json              # 플러그인 매니페스트
skills/
└── fwarrange/
    └── SKILL.md             # 창 레이아웃 관리 스킬
```

---

# 스킬

## `fwarrange` — 창 레이아웃 관리

fWarrange REST API를 통해 macOS 창의 위치와 크기를 저장하고 복구합니다.

**사용 예시:**
```
/fwarrange:fwarrange capture
/fwarrange:fwarrange capture --name=coding-setup
/fwarrange:fwarrange restore my-workspace
/fwarrange:fwarrange list
/fwarrange:fwarrange detail my-workspace
/fwarrange:fwarrange rename old-name new-name
/fwarrange:fwarrange delete my-workspace
/fwarrange:fwarrange delete-all
/fwarrange:fwarrange remove-windows my-workspace 14205 5032
/fwarrange:fwarrange windows
/fwarrange:fwarrange apps
/fwarrange:fwarrange status
/fwarrange:fwarrange modes
/fwarrange:fwarrange mode-create coding
/fwarrange:fwarrange mode-activate coding
/fwarrange:fwarrange cli status
/fwarrange:fwarrange settings general
/fwarrange:fwarrange excluded-apps
/fwarrange:fwarrange default-layout my-workspace
/fwarrange:fwarrange normalize-rules
/fwarrange:fwarrange restore-stats
/fwarrange:fwarrange locale
/fwarrange:fwarrange locale --set=en
```

**주요 기능:**
* 서버 미실행 시 fWarrangeCli 헬퍼(Homebrew) 실행 안내
* 현재 창 레이아웃 캡처 (이름 지정 및 앱 필터링 가능)
* 재시도·매칭 모드(strict/normal/loose) 설정으로 저장된 레이아웃 복구
* 레이아웃 목록·상세 조회, 이름 변경, 삭제 (전체 삭제는 안전 확인)
* 레이아웃에서 특정 창 ID로 제거
* 현재 창·실행 중인 앱 조회, 접근성 권한 상태 확인
* **모드(Modes)**: 컨텍스트 전환 — 레이아웃 + 필요 앱 묶음을 활성화 시 복구·실행
* **CLI 헬퍼 관리**: status, version, pause/resume, restart, quit
* **설정(Settings)**: general·restore·api·advanced 탭 조회/변경, 공장 초기화
* 복구 제외 앱 목록·기본 레이아웃 관리
* **고급 튜닝**: 타이틀 정규화 룰셋, 창 매칭 누적 통계
* 앱 언어(locale) 조회 및 변경

**옵션:**

| 옵션                | 설명            | 기본값                  |
| ------------------- | --------------- | ----------------------- |
| `--name=<이름>`     | 레이아웃 이름   | 자동 생성               |
| `--server=<주소>`   | 서버 주소 변경  | `http://localhost:3016` |
| `--set=<코드>`      | 언어 코드 설정  | -                       |

**API 요약 (서비스 루트: `http://localhost:3016/api/v2`):**

플러그인은 아래의 사용자·관리 엔드포인트를 문서화합니다. 전체 v2 표면은 57개이며, 머신간 통신용(`/paidapp/*`, `/ui/state`, `/operations`, `/changes`, `/shutdown`, `/settings/shortcuts`)은 제외했습니다. 전체 스펙은 `api/openapi_v2.yaml` 참조.

| 그룹          | 엔드포인트                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Health        | `GET /` · `GET /api/v2/health`                                                                     |
| Layouts       | `GET/DELETE /layouts` · `GET/PUT/DELETE /layouts/{name}` · `POST /layouts/{name}/windows/remove`   |
| 캡처/복구     | `POST /capture` · `POST /layouts/{name}/restore` (+ 매칭 모드 strict/normal/loose)                 |
| Windows       | `GET /windows/current` · `GET /windows/apps` · `GET /status/accessibility`                         |
| Modes         | `GET/POST /modes` · `GET/PATCH/DELETE /modes/{name}` · `POST /modes/{name}/activate`               |
| CLI 헬퍼      | `GET /cli/status` · `GET /cli/version` · `POST /cli/pause·resume·restart·quit`                     |
| Settings      | `GET/PATCH /settings/general·restore·api·advanced` · `GET /settings` · `POST /settings/factory-reset` |
| 제외 앱       | `GET/POST/DELETE/PUT /settings/restore/excluded-apps` · `POST .../reset`                           |
| 기본 레이아웃 | `GET/PUT /settings/default-layout`                                                                 |
| 고급          | `GET/PUT/DELETE /normalize-rules` · `GET/DELETE /restore-stats`                                    |

파괴적 엔드포인트(전체 삭제, cli quit, 공장 초기화)는 사용자 확인이 필요하며, 전체 삭제는 `X-Confirm-Delete-All: true` 헤더도 필요합니다.

---

# 설치 방법

## 방법 1: 플러그인 설치 (권장)

Claude Code 내에서 실행:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fwarrange@f-claude-plugins
```

> 마켓플레이스가 `git-subdir`로 `fWarrange/` 하위 경로를 자동 처리합니다.

## 방법 2: 수동 복사

```bash
# f-claude-plugins 레포 클론 후
cp -r fWarrange/plugin.json .claude-plugin/plugin.json
cp -r fWarrange/skills .claude/skills
```

## 방법 3: 심볼릭 링크

```bash
ln -sf fWarrange/skills/fwarrange .claude/skills/fwarrange
```

---

# 전제 조건

fWarrange REST API 서버는 **fWarrangeCli** 헬퍼(Homebrew로 배포되는 비샌드박스 macOS 에이전트, App Store GUI 앱 아님)가 제공합니다:

| 서버           | 실행 방법                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `fWarrangeCli` | `brew install finfra/tap/fwarrange-cli` → `brew services start finfra/tap/fwarrange-cli` (REST 기본 활성)          |

> 서버가 꺼져 있으면 스킬이 Homebrew 실행 명령을 안내합니다. 서버를 자동으로 시작하지는 않습니다.

**macOS 접근성 권한**이 창 복구 기능에 필요합니다:
* 시스템 설정 > 개인정보 보호 및 보안 > 손쉬운 사용 > fWarrangeCli 추가

---

# 함께 사용하면 좋은 확장

| 확장       | 위치                    | 설명                                              |
| ---------- | ----------------------- | ------------------------------------------------- |
| MCP Server | fWarrange 본체 레포 참조 | MCP 프로토콜로 창 레이아웃 관리 (Claude Desktop 호환) |

---

# 라이선스

MIT
