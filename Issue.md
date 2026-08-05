# Issue Management

* Issue HWM: 9
* Checkpoints:
    - 8cb111b (2026-07-26) MCP 브릿지 구현 + Desktop config 정정
    - 02d1026 (2026-03-19)

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

### Issue9. Claude Desktop MCP 서버 6종 연결 끊김 — node 경로 resolve 문제 (등록: 2026-08-03, 해결: 2026-08-03, commit: N/A — gitignore 대상이라 커밋 불가) ✅
* 목적: Claude Desktop 앱에서 fBanner·fBoard·fGoogleSheet·fQRGen·fSnippet·fWarrange 6개 MCP 서버가 모두 "Server disconnected" 상태였던 원인 규명 및 재발 위험 기록 (prj5 세션에서 발견·조사)
* 상세:
    - `~/Library/Application Support/Claude/claude_desktop_config.json` 의 6개 서버 항목이 `command: "/opt/homebrew/bin/node"` 를 참조했으나, 이 머신은 Homebrew node 미설치·nvm 전용 관리(`~/.nvm/versions/node/{v20.20.2,v24.18.0}`) 상태라 해당 경로가 존재하지 않아 spawn 실패
    - 대조군 `mcp-obsidian` 항목은 `/Users/nowage/.nvm/versions/node/v20.20.2/bin/npx` 절대경로를 정확히 참조하여 정상(`running`) 동작 — 근본 원인이 mcp-server.js 스크립트 자체가 아님을 확인
    - **소스(본 repo)는 정상**: 각 `plugin.json`(예: `fBanner/plugin.json`)은 `"command": "node"` bare 명령만 사용 — 절대경로 하드코딩 없음. 각 프로젝트(prj11~16) `_public/mcp/package.json` `engines.node` 도 `>=18.0.0` 범위라 문제 없음. `.nvmrc` 는 전 프로젝트(`__all/*`)에 존재하지 않음
    - 결론: 깨진 지점은 `claude_desktop_config.json` 하나뿐이며, 이는 **`claude plugin install` 설치 시점에 bare `"node"` 를 그 순간의 PATH 기준으로 절대경로 resolve해서 config 에 굽는 방식** 때문으로 추정 — 당시엔 Homebrew node 가 설치돼 있었으나 이후 nvm 전용으로 전환되며 stale 경로가 남음
* 구현 명세 (실제 반영):
    - `claude_desktop_config.json` 6개 항목의 `command` 를 `/Users/nowage/.nvm/versions/node/v24.18.0/bin/node` (nvm default) 로 직접 교정 + Claude Desktop 재시작 안내 (prj5 세션에서 수행, 본 repo 파일 변경 없음)
* 재발 위험 (미해결 — 관측만):
    - 이 머신의 `node` 는 PATH 상 실제 실행파일이 아니라 nvm 래핑 zsh 함수. 향후 `claude plugin install` 로 이 6개 플러그인을 재설치하면 설치 시점 PATH 상태에 따라 **동일 증상이 재발**하거나 resolve 자체가 실패할 수 있음
    - 근본 대응(설치 스크립트가 bare `"node"` 를 절대경로로 굽지 않게 하는 것)은 Claude Code 자체 동작이라 본 repo 에서 제어 불가 — 재발 시 본 이슈를 근거로 빠르게 진단할 것
* 종결 사유(hash 없음): `Issue.md` 가 이 repo 의 `.gitignore` 대상 + origin=public(Finfra) → 강제추적·gitignore 수정 금지 지침에 따라 commit 없이 종결 (Issue8 과 동일 사유)

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
