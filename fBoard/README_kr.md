---
title: fBoard Claude Code Plugin (한국어)
description: fBoard REST API를 통해 화이트보드 앱을 제어하는 Claude Code 플러그인
date: 2026-03-26
---

fBoard REST API를 통해 화이트보드 앱을 제어하는 Claude Code 플러그인입니다.
설치 후 Claude Code에서 슬래시 커맨드로 윈도우, 배경, 프리셋을 즉시 제어할 수 있습니다.

---

# 플러그인 구조

```
plugin.json              # 플러그인 매니페스트
skills/
└── fboard/
    └── SKILL.md         # 화이트보드 제어 스킬
```

---

# 스킬

## `fboard` — 화이트보드 제어

fBoard REST API를 통해 화이트보드 앱(윈도우 위치/크기, 배경색/이미지, 프리셋)을 제어합니다.

**사용 예시:**
```
/fboard:fboard color #FF5733
/fboard:fboard preset fullscreen
/fboard:fboard status
/fboard:fboard window center
/fboard:fboard level floating
```

**주요 기능:**
* 서버 미실행 시 fBoard.app 실행 안내
* 배경색 및 배경 이미지 관리
* 윈도우 위치, 크기, 레벨 제어
* 프리셋 저장/적용/삭제
* 다중 모니터 지원

**API 요약 (18개 엔드포인트):**

| 카테고리 | 엔드포인트                                                       |
| -------- | ---------------------------------------------------------------- |
| 서버     | `GET /`, `GET /api/status`                                       |
| 윈도우   | `GET/POST /api/window/*` (level, frame, center, reset, fullscreen, move-screen) |
| 배경     | `GET/POST/DELETE /api/background/*` (color, image, fill-mode)    |
| 프리셋   | `GET/POST/DELETE /api/presets/*` (list, create, apply, delete)   |
| 스크린   | `GET /api/screens`                                               |

---

# 설치 방법

## 방법 1: 플러그인 설치 (권장)

Claude Code 내에서 실행:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fboard@f-claude-plugins
```

> 마켓플레이스가 `git-subdir`로 `fBoard/` 하위 경로를 자동 처리합니다.

## 방법 2: 수동 복사

```bash
# f-claude-plugins 레포 클론 후
cp -r fBoard/plugin.json .claude-plugin/plugin.json
cp -r fBoard/skills .claude/skills
```

## 방법 3: 심볼릭 링크

```bash
ln -sf fBoard/skills/fboard .claude/skills/fboard
```

---

# 전제 조건

fBoard REST API 서버가 실행 중이어야 합니다:

| 서버              | 실행 방법                                    |
| ----------------- | -------------------------------------------- |
| macOS 네이티브 앱 | fBoard.app 실행 (설정에서 REST API 활성화)   |

> 서버가 꺼져 있으면 스킬이 사용자에게 fBoard.app 실행을 안내합니다.

---

# 함께 사용하면 좋은 확장

| 확장       | 위치                  | 설명                                              |
| ---------- | --------------------- | ------------------------------------------------- |
| MCP Server | fBoard 본체 레포 참조 | MCP 프로토콜로 화이트보드 제어 (Claude Desktop 호환) |

---

# 라이선스

MIT
