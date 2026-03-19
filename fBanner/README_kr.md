# fBanner Claude Code Plugin

fBanner REST API를 통해 이미지, PDF, SVG를 그리드 타일로 분리하는 Claude Code 플러그인입니다.
설치 후 Claude Code에서 슬래시 커맨드로 파일을 즉시 분리할 수 있습니다.

---

## 플러그인 구조

```
.claude-plugin/
└── plugin.json          # 플러그인 매니페스트
skills/
└── fbanner/
    └── SKILL.md         # 이미지 그리드 분리 스킬
```

---

## 스킬

### `fbanner` — 이미지 그리드 분리

fBanner REST API를 통해 이미지, PDF, SVG를 그리드 타일로 분리합니다.

**사용 예시:**
```
/fbanner:fbanner split resource/contents/example1.png --rows=3 --cols=4
/fbanner:fbanner load resource/contents/example1.png
/fbanner:fbanner config --rows=2 --cols=3 --format=svg
/fbanner:fbanner export resource/contents_result
/fbanner:fbanner status
```

**주요 기능:**
- 서버 미실행 시 fBanner.app 실행 안내
- PNG, JPG, TIFF, BMP, GIF, PDF, SVG 입력 지원
- bitmap(PNG), JPG, SVG, PDF 형식으로 내보내기
- 원스텝 분리 커맨드 (로드 + 설정 + 내보내기)
- 부분 설정 업데이트

**옵션:**

| 옵션               | 설명              | 기본값                  |
| ------------------ | ----------------- | ----------------------- |
| `--rows=<N>`       | 세로 분할 수      | `2`                     |
| `--cols=<N>`       | 가로 분할 수      | `2`                     |
| `--format=<형식>`  | 내보내기 형식     | `bitmap`                |
| `--output=<경로>`  | 출력 디렉토리     | `resource/contents_result`   |
| `--ratio-w=<N>`    | 가로 비율         | `1.0`                   |
| `--ratio-h=<N>`    | 세로 비율         | `1.0`                   |
| `--server=<주소>`  | 서버 주소 변경    | `http://localhost:3011` |

**API 요약:**

| 메서드 | 엔드포인트    | 설명                               |
| ------ | ------------- | ---------------------------------- |
| GET    | `/`           | 헬스 체크                          |
| GET    | `/api/status` | 앱 상태 및 로드된 파일 정보        |
| GET    | `/api/config` | 현재 분리 설정                     |
| PUT    | `/api/config` | 분리 설정 업데이트                 |
| POST   | `/api/load`   | 파일 경로로 로드                   |
| POST   | `/api/export` | 분리된 파일을 디렉토리로 내보내기  |
| POST   | `/api/split`  | 원스텝: 로드 + 설정 + 내보내기    |

---

## 설치 방법

### 방법 1: 플러그인 설치 (권장)

Claude Code 내에서 실행:
```
/plugin marketplace add finfra/f-claude-plugin
/plugin install fbanner@f-claude-plugin
```

> 마켓플레이스가 `git-subdir`로 `fBanner/` 하위 경로를 자동 처리합니다.

### 방법 2: 수동 복사

플러그인 디렉토리를 프로젝트에 복사합니다:

```bash
# f-claude-plugins 레포 클론 후
cp -r fBanner/plugin.json .claude-plugin/plugin.json
cp -r fBanner/skills .claude/skills
```

### 방법 3: 심볼릭 링크

```bash
ln -sf fBanner/skills/fbanner .claude/skills/fbanner
```

---

## 전제 조건

fBanner REST API 서버가 실행 중이어야 합니다:

| 서버              | 실행 방법                                   |
| ----------------- | ------------------------------------------- |
| macOS 네이티브 앱 | fBanner.app 실행 (설정에서 REST API 활성화) |

> 서버가 꺼져 있으면 스킬이 사용자에게 fBanner.app 실행을 안내합니다.

---

## 함께 사용하면 좋은 확장

| 확장                        | 위치           | 설명                                              |
| --------------------------- | -------------- | ------------------------------------------------- |
| MCP Server | fBanner 본체 레포 참조 | MCP 프로토콜로 그리드 분리 (Claude Desktop 호환)  |

---

## 라이선스

MIT
