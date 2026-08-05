---
title: f-claude-plugins 개발자용 참고 문서
description: Claude 플러그인 저장소 운영 시 인간이 알아야 할 절차
date: 2026-04-17
---

# 개요
* Claude 플러그인 저장소 (Projects.md id=20)

## 🔀 현재 작업중 브랜치 — `prj1-issue353-marketplace` (main 아님, 2026.08.05)

> prj1 의 hub 서버 다운 자동 강등(Issue355/340) 배포분 **수신 전용** 브랜치. **prj1·3·7·20 네 repo 가 한 덩어리.**
> ⚠️ `fpm-core/` 를 손으로 고치지 말 것 — `fpm-sync publish` 가 rsync vendor 하는 생성물이다.
> 📖 순서·검증·함정 SSOT: `~/_git/___pm/noteForHuman.md`. 상세는 이 문서 맨 끝 절.
> ⚠️ 머징 완료 시 이 절과 맨 끝 절을 함께 삭제.

# ToProcess

정리 전 초기 메모를 여기에 쌓고, 정리되면 아래 정식 섹션으로 옮긴다.

```

```

# Source Code
## Public Repository

* https://github.com/Finfra/fBanner_public
* https://github.com/Finfra/fBoard_public
* https://github.com/Finfra/fGoogleSheet_public
* https://github.com/Finfra/fQRGen_public
* https://github.com/Finfra/fSnippet_public
* https://github.com/Finfra/fWarrange_public

## Source Code

* ~/_git/__all/fBanner/_public/agent/claude
* ~/_git/__all/fBoard/_public/agent/claude
* ~/_git/__all/fGoogleSheet/_public/agent/claude
* ~/_git/__all/fQRGen/_public/agent/claude
* ~/_git/__all/fSnippet/_public/agent/claude
* ~/_git/__all/fWarrange/_public/agent/claude

# 📌 ToDo
* TODO: 플러그인 설치·업데이트 수동 검증 절차
* TODO: 플러그인 배포 전 로컬 테스트 체크리스트

# 🔀 브랜치 대기 중 — Issue353 계열 수신용 (2026.08.05)

> ⚠️ 머징 완료 후 이 절은 지운다.

* 현재 브랜치: **`prj1-issue353-marketplace`** (main 아님)
* **이 브랜치에서 손으로 `fpm-core/` 를 고치지 말 것.** prj1 `plugins/fpm-core` 를 `fpm-sync publish` 가 실폴더로 rsync vendor 한 **생성물**이다
* 브랜치를 판 이유: prj1 의 hub 서버 다운 자동 강등(Issue355/Issue340) 배포분을 **main 오염 없이 받기 위함**
* ⚠️ **분기 전 별건 1건을 main 에 먼저 고정함** — `f8fe7e1` (Issue9, Claude Desktop MCP node 경로). 이번 머징 범위 아니며 이미 main 에 있다
* 📖 **머징 순서·검증은 prj1 이 SSOT** — `~/_git/___pm/noteForHuman.md` "다중 repo 브랜치 머징 가이드". 요지: prj3 → prj1 머지 → `fpm-sync deploy <level> --with-marketplace` (마켓 게시 연쇄) → 이 브랜치 확인 후 머지 → 소비자 `claude plugin update fpm-core@f-claude-plugins`
