# Issue Management

* Issue HWM: 8
* Checkpoints: 02d1026 (2026-03-19)

---

## 🤔 결정사항

---

## 🌱 이슈후보

1. `_doc_arch/`·`Issue.md` gitignore 정책 재검토 — public remote(Finfra) repo 라 내부 설계문서를 강제 추적할 수 없음. 설계문서를 어디에 영속 보관할지(별도 private repo / obsidian / _doc_base) 결정 필요. (prj1#Issue307 fan-out 중 발견)

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

### Issue8. _doc_arch 초기 설계문서 스켈레톤 작성 (등록: 2026-07-21, 해결: 2026-07-21, commit: N/A — gitignore 대상이라 커밋 불가) ✅
* 목적: 비어 있던 `_doc_arch/` 에 소스코드 기반 초기 설계문서 작성 (prj1#Issue307 fan-out, 방법론 원본 prj1#Issue306)
* 구현 명세:
    - `_doc_arch/architecture-overview.md` — 레포 구조·마켓플레이스(7 플러그인)·포트 할당(3011~3016)
    - `_doc_arch/plugin-skill-pattern.md` — 6개 f-app 공통 REST API 스킬 패턴 + 플러그인별 엔드포인트
    - `_doc_arch/fpm-core.md` — 번들 SCAR 스택(hub/dashboard/pm) 구조
    - 실제 확인 파일(marketplace.json·각 plugin.json·각 SKILL.md·fpm-core 트리·hooks.json)만 근거, 미확인분은 [TODO]/[FIXME] 마커
* 종결 사유(hash 없음): `_doc_arch/`·`Issue.md` 가 이 repo 의 `.gitignore` 대상 + origin=public(Finfra) → 강제추적·gitignore 수정 금지 지침에 따라 commit 없이 종결
* 후속: gitignore 정책 재검토는 이슈후보로만 등록(이번 작업 미처리)

### Issue7. fQRGen 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: fe011c0) ✅
* 목적: fQRGen Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fQRGen/` 하위로 plugin.json, skills/fqrgen/SKILL.md, README 이동
  - marketplace.json에 fqrgen 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, Related Extensions 링크를 본체 레포 참조로 변경)

### Issue6. fBoard 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: b267bd2, 02d1026) ✅
* 목적: fBoard Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fBoard/` 하위로 plugin.json, skills, README 이동
  - plugin.json에 repository를 f-claude-plugins로 변경, keywords/license 추가
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, 상대링크를 본체 레포 참조로 변경)

### Issue5. fSnippet 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: bbfea18) ✅
* 목적: fSnippet Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fSnippet/` 하위로 plugin.json, skills, README 이동
  - marketplace.json에 fsnippet 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, Related Extensions 링크를 GitHub 절대 URL로 변경)

### Issue2. fBanner 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: 8fbe0ac) ✅
* 목적: fBanner Claude Code 플러그인을 마켓플레이스 배포 가능한 형태로 구성
* 구현 명세:
  - `fBanner/` 하위에 plugin.json, skills/fbanner/SKILL.md, README 구성
  - marketplace.json에 fbanner 플러그인 등록 (`git-subdir` 방식)
  - README_kr.md / README.md에 마켓플레이스 설치 방법 기재

### Issue4. fWarrange 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: 98fcaa7) ✅
* 목적: fWarrange Claude Code 플러그인을 f-claude-plugins 레포로 통합
* 구현 명세:
  - `_public/agents/claude/`에서 `fWarrange/` 하위로 plugin.json, skills, README 이동
  - marketplace.json에 fwarrange 플러그인 등록 (`git-subdir` 방식)
  - README.md / README_kr.md를 통합 레포 구조에 맞게 수정 (설치 경로, 상대링크 등)

### Issue3. fGoogleSheet 플러그인 패키지 추가 (등록: 2026-03-19, 해결: 2026-03-19, commit: 73d34bf) ✅
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
