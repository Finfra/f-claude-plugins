# f-claude-plugins

macOS 네이티브 앱을 Claude Code에서 제어할 수 있는 플러그인 모음입니다.
각 플러그인은 macOS 앱의 REST API를 통해 동작하며, Claude Code 마켓플레이스에서 설치할 수 있습니다.

## Plugins

| Plugin | Description | Port | App |
|--------|------------|------|-----|
| [fBanner](fBanner/) | 이미지/PDF/SVG를 격자 타일로 분할 | 3011 | fBanner.app |
| [fBoard](fBoard/) | 화이트보드 앱 제어 (윈도우, 배경색, 프리셋) | - | fBoard.app |
| [fSnippet](fSnippet/) | 텍스트 스니펫 검색, 확장, 관리 | 3015 | fSnippet.app |
| [fQRGen](fQRGen/) | URL/텍스트에서 QR 코드 생성 | 3014 | fQRGen.app |
| [fWarrange](fWarrange/) | macOS 윈도우 레이아웃 저장/복원 | 3016 | fWarrange.app |
| [fGoogleSheet](fGoogleSheet/) | Google Sheets 데이터 관리 | 3013 | fGoogleSheet.app |

## Installation

### Claude Code Marketplace

```bash
claude plugin install fbanner --registry github:Finfra/f-claude-plugins
```

개별 플러그인 이름: `fbanner`, `fboard`, `fsnippet`, `fqrgen`, `fwarrange`, `fgooglesheet`

### Manual

```bash
git clone https://github.com/Finfra/f-claude-plugins.git
cd f-claude-plugins/<plugin-folder>
claude plugin install .
```

## Prerequisites

- macOS
- 각 플러그인에 대응하는 macOS 앱이 실행 중이어야 합니다
- Claude Code CLI

## Repository Structure

```
f-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json      # 마켓플레이스 레지스트리
├── fBanner/
│   ├── plugin.json
│   ├── skills/fbanner/SKILL.md
│   ├── README.md
│   └── README_kr.md
├── fBoard/
├── fSnippet/
├── fQRGen/
├── fWarrange/
└── fGoogleSheet/
```

각 플러그인 폴더는 동일한 구조를 따릅니다:
- `plugin.json` — 플러그인 메타데이터
- `skills/<name>/SKILL.md` — Claude Code 스킬 정의
- `README.md` / `README_kr.md` — 영문/한국어 문서

## License

MIT
