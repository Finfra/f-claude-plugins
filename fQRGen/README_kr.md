# fQRGen Claude Code Plugin

fQRGen REST API를 통해 QR 코드를 생성하는 Claude Code 플러그인입니다.
설치 후 Claude Code에서 슬래시 커맨드로 QR 코드를 즉시 생성할 수 있습니다.

---

## 플러그인 구조

```
.claude-plugin/
└── plugin.json          # 플러그인 매니페스트
skills/
└── fqrgen/
    └── SKILL.md         # QR 코드 생성 스킬
```

---

## 스킬

### `fqrgen` — QR 코드 생성

fQRGen REST API를 통해 URL 또는 텍스트를 QR 코드 이미지로 생성합니다.

**사용 예시:**
```
/fqrgen:fqrgen https://finfra.kr
/fqrgen:fqrgen https://github.com --format=svg
/fqrgen:fqrgen "Hello World" --output=./hello.png
```

**주요 기능:**
- 서버 미실행 시 fQRGen.app 실행 안내
- PNG / SVG 형식 지원
- 생성 후 macOS 미리보기 자동 실행
- 타임스탬프 기반 파일명 자동 생성

**옵션:**

| 옵션              | 설명              | 기본값                  |
| ----------------- | ----------------- | ----------------------- |
| `--format=svg`    | SVG 형식으로 생성 | `png`                   |
| `--output=<경로>` | 저장 경로 지정    | `./qr-{timestamp}.png`  |
| `--server=<주소>` | 서버 주소 변경    | `http://localhost:3014` |

**API 요약:**

| 항목         | 값                            |
| ------------ | ----------------------------- |
| Endpoint     | `POST /api/generate`          |
| Content-Type | `application/json`            |
| `data`       | QR 코드에 인코딩할 URL/텍스트 |
| `format`     | `png` 또는 `svg`              |

---

## 설치 방법

### 방법 1: 플러그인 설치 (권장)

Claude Code 내에서 실행:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fqrgen@f-claude-plugins
```

> 마켓플레이스가 `git-subdir`로 `fQRGen/` 하위 경로를 자동 처리합니다.

### 방법 2: 수동 복사

플러그인 디렉토리를 프로젝트에 복사합니다:

```bash
# f-claude-plugins 레포 클론 후
cp -r fQRGen/plugin.json .claude-plugin/plugin.json
cp -r fQRGen/skills .claude/skills
```

### 방법 3: 심볼릭 링크

```bash
ln -sf fQRGen/skills/fqrgen .claude/skills/fqrgen
```

---

## 전제 조건

fQRGen REST API 서버가 실행 중이어야 합니다:

| 서버              | 실행 방법                                  |
| ----------------- | ------------------------------------------ |
| macOS 네이티브 앱 | fQRGen.app 실행 (설정에서 REST API 활성화) |
| Node.js 웹 앱     | `cd lib/qrgen-node && npm start`           |

> 서버가 꺼져 있으면 스킬이 사용자에게 fQRGen.app 실행을 안내합니다.

---

## 함께 사용하면 좋은 확장

| 확장                        | 위치           | 설명                                         |
| --------------------------- | -------------- | -------------------------------------------- |
| MCP Server | fQRGen 본체 레포 참조 | MCP 프로토콜로 QR 생성 (Claude Desktop 호환) |

---

## 라이선스

MIT
