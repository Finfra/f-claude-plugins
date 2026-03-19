# Issue Management

* Issue HWM: 3
* Save Point: 1f5fce8 (2026-03-19)

---

## 🤔 결정사항

---

## 🌱 이슈후보

---

## 🚧 진행중


---

## 📕 중요

---

## 📙 일반

## Issue2. fBanner 플러그인 패키지 추가 (등록: 2026-03-19)
* 목적: fBanner Claude Code 플러그인을 마켓플레이스 배포 가능한 형태로 구성
* 상세:
  - `fBanner/` 하위에 plugin.json, skills/fbanner/SKILL.md, README 구성
  - 리포 루트에 `.claude-plugin/marketplace.json` 생성 (`git-subdir` 방식)
  - README_kr.md / README.md에 마켓플레이스 설치 방법 기재
  - 설치 명령어: `/plugin marketplace add Finfra/f-claude-plugins` → `/plugin install fbanner@f-claude-plugins`

### Issue2_1. fBanner 플러그인 파일 구성
* 목표: plugin.json, SKILL.md, README 파일 배치
* 구현 명세:
  - `fBanner/plugin.json`: 플러그인 매니페스트
  - `fBanner/skills/fbanner/SKILL.md`: fbanner 스킬 정의
  - `fBanner/README.md`, `fBanner/README_kr.md`: 영문/한국어 문서

### Issue2_2. 마켓플레이스 설정 추가
* 목표: `.claude-plugin/marketplace.json`으로 하위 폴더 플러그인 배포
* 구현 명세:
  - `git-subdir` source로 `fBanner/` 경로 지정
  - 플러그인명: `fbanner`, 마켓플레이스명: `f-claude-plugins`

---

## 📗 선택

---

## ✅ 완료

### ~~Issue3. fGoogleSheet 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: 73d34bf)~~ ✅ 해결완료
* 목적: fGoogleSheet Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 해결사항:
  - `_public/agents/claude/`에서 `fGoogleSheet/` 하위로 plugin.json, skills, README 이동
  - marketplace.json에 fgooglesheet 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, 상대링크 등)

### Issue1. .gitignore 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: b152bf0) ✅
* 목표: macOS + Node.js 프로젝트에 맞는 .gitignore 설정
* 구현:
  - macOS 시스템 파일 제외 (.DS_Store, .AppleDouble 등)
  - Node.js 관련 제외 (node_modules, .npm, 로그 등)
  - 빌드 산출물 및 환경 파일 제외
* 검증: git status에서 불필요한 파일 미추적 확인

---

## ⏸️ 보류

---

## 🚫 취소

---

## 📜 참고

- `PDFKit`: macOS 내장 PDF 처리 프레임워크 (추가 설치 불필요)
- `UniformTypeIdentifiers`: 파일 형식 식별 (UTType)
- `Core Graphics`: bitmap 이미지 크롭 및 처리
