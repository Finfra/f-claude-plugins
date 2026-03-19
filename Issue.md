# Issue Management

* Issue HWM: 7
* Save Point: fe011c0 (2026-03-19)

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


---

## 📗 선택

---

## ✅ 완료

### ~~Issue7. fQRGen 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: fe011c0)~~ ✅ 해결완료
* 목적: fQRGen Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fQRGen/` 하위로 plugin.json, skills/fqrgen/SKILL.md, README 이동
  - marketplace.json에 fqrgen 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, Related Extensions 링크를 본체 레포 참조로 변경)

### ~~Issue6. fBoard 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: b267bd2)~~ ✅ 해결완료
* 목적: fBoard Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fBoard/` 하위로 plugin.json, skills, README 이동
  - plugin.json에 repository를 f-claude-plugins로 변경, keywords/license 추가
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, 상대링크를 본체 레포 참조로 변경)

### ~~Issue5. fSnippet 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: bbfea18)~~ ✅ 해결완료
* 목적: fSnippet Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fSnippet/` 하위로 plugin.json, skills, README 이동
  - marketplace.json에 fsnippet 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, Related Extensions 링크를 GitHub 절대 URL로 변경)

### ~~Issue2. fBanner 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: 8fbe0ac)~~ ✅ 해결완료
* 목적: fBanner Claude Code 플러그인을 마켓플레이스 배포 가능한 형태로 구성
* 구현 명세:
  - `fBanner/` 하위에 plugin.json, skills/fbanner/SKILL.md, README 구성
  - marketplace.json에 fbanner 플러그인 등록 (`git-subdir` 방식)
  - README_kr.md / README.md에 마켓플레이스 설치 방법 기재

### ~~Issue4. fWarrange 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: 98fcaa7)~~ ✅ 해결완료
* 목적: fWarrange Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fWarrange/` 하위로 plugin.json, skills, README 이동
  - marketplace.json에 fwarrange 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, 상대링크 등)

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
