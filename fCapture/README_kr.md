---
title: fCapture Claude Code Plugin (한국어)
description: fCapture CLI를 MCP로 노출하여 macOS 화면·윈도우·영역을 캡처하는 Claude Code 플러그인
date: 2026.09.09
---

[fCapture](https://github.com/Finfra/fCapture) 커맨드라인 도구를 통해 macOS 화면·윈도우·영역을
캡처하는 Claude Code 플러그인입니다.

이 저장소의 다른 플러그인(fBanner·fBoard·fGoogleSheet·fQRGen·fSnippet·fWarrange)과 달리
fCapture 는 **REST 앱이 아닙니다** — 서버도 없고 할당할 포트도 없습니다. MCP 서버가
`child_process.execFile` 로 `fcapture` 바이너리를 직접 실행합니다.

---

# 플러그인 구조

```
fCapture/
├── plugin.json          # 플러그인 매니페스트 (`fcapture` MCP 서버 등록)
├── mcp-server.js        # stdio JSON-RPC MCP 서버, fCapture CLI 래퍼
└── skills/
    └── fcapture/
        └── SKILL.md     # 캡처 스킬
```

---

# MCP 도구

| 도구                  | fCapture 실행 형태                          | 필수 입력                    |
| :-------------------- | :------------------------------------------ | :--------------------------- |
| `capture_screen`      | `-t all` 또는 `-t screen:N`                  | —                            |
| `capture_window`      | `-t window_active` (그 외 윈도우 모드 가능)  | —                            |
| `capture_region`      | `-t region_static --region x,y,w,h`          | `x`, `y`, `width`, `height`  |
| `capture_with_preset` | `fcapture <config.json>`                     | `config_path`                |
| `get_version`         | `--version`                                  | —                            |

## 공통 입력

| 입력     | 대응 옵션         | 설명                                                              |
| :------- | :---------------- | :---------------------------------------------------------------- |
| `path`   | `-p, --path`      | 저장 폴더. 생략하면 `~/Desktop`                                    |
| `format` | `-F, --format`    | **파일명 템플릿**입니다(이미지 형식이 아님). `%d` `%T` `%target` `%id` |
| `relay`  | `--relay N`       | `capture_window` 전용 — N초 지연 후 캡처                           |
| `mode`   | `-t, --target`    | `capture_window` 전용 — 아래 참조                                  |

`capture_window` 모드: `window_active`(기본)·`window_pointer`·`window_flash`·`scroll_capture`.

## 반환값

모든 캡처 도구는 `--result onlyPath` 를 붙이므로 **저장 경로 문자열만** 돌려줍니다. 이미지
바이너리를 stdout 으로 흘리지 않습니다. `capture_screen` 을 `display` 없이 호출하면 전체
디스플레이를 캡처하고 `paths` 에 디스플레이별 경로를 모두 담아 돌려줍니다.

```json
{"paths": ["/tmp/shot_20260909_002518_screen1_1.png"], "path": "/tmp/shot_20260909_002518_screen1_1.png"}
```

## 프리셋 파일 형식

`capture_with_preset` 은 fCapture 자체 설정 형식의 JSON 파일을 받습니다.

```json
{
    "capturePath": "~/Desktop",
    "target": "region_static",
    "fileFormat": "region_%d_%T",
    "staticRegion": { "x": 100, "y": 100, "width": 800, "height": 600 }
}
```

---

# 설계 노트

* **`region_user` 는 노출하지 않습니다.** 사용자가 마우스로 영역을 드래그할 때까지 기다리는
  타겟이라 MCP 호출에서는 무한 대기가 됩니다. `capture_with_preset` 도 `target` 이
  `region_user` 인 프리셋 파일은 거부합니다.
* **CLI 호출은 직렬화합니다.** `fcapture` 를 동시에 여러 개 띄우면 권한이 정상 허용된
  상태에서도 *전부* `스크린 녹화 권한이 필요합니다` 로 실패합니다 — 2026-09-09 실측으로
  3-way 병렬은 전건 실패, 같은 명령을 순차로 돌리면 전건 성공이었습니다. 메시지가 원인을
  권한 문제로 오인하게 만들므로, MCP 서버가 호출을 큐에 넣어 한 번에 하나만 실행합니다.
* **실패를 삼키지 않습니다.** exit code 가 0 이 아니거나 stderr 에 내용이 있으면 실행한 명령
  전문·exit code·CLI 원본 stderr 를 담은 에러 메시지로 돌려줍니다. 문구가 권한 관련으로
  보이면 사용자가 눌러야 할 시스템 설정 경로를 덧붙입니다.
* **바이너리 탐색 순서:** `FCAPTURE_BIN` → `/opt/homebrew/bin/fcapture` →
  `/usr/local/bin/fcapture` → `~/.bin/fCapture`. 하드코딩하지 않습니다.

---

# 전제 조건

| 요구 사항        | 충족 방법                                                                  |
| :--------------- | :-------------------------------------------------------------------------- |
| fCapture CLI     | `brew install finfra/f/fcapture` — `fcapture --version` 으로 확인            |
| 화면 기록 권한   | 시스템 설정 → 개인정보 보호 및 보안 → 화면 기록 에서 호스트 앱 허용          |
| Node.js          | `mcp-server.js` 실행에 필요                                                  |

> 화면 기록 권한은 MCP 서버를 **띄운 프로세스**(터미널 또는 Claude Code)에 귀속됩니다.
> 허용한 뒤 그 앱을 완전히 종료했다가 다시 실행해야 반영됩니다.

---

# 설치

## 방법 1: 플러그인 설치 (권장)

```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fcapture@f-claude-plugins
```

## 방법 2: MCP 수동 등록

```bash
claude mcp add fcapture -- node /path/to/f-claude-plugins/fCapture/mcp-server.js
```

---

# 검증

```bash
# 1. CLI 자체
fcapture --version

# 2. MCP 서버를 stdio 로 직접 구동
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_version","arguments":{}}}' \
  | node fCapture/mcp-server.js

# 3. 등록된 서버 목록
claude mcp list
```

---

# 라이선스

MIT
