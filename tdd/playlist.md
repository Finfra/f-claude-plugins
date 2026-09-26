---
title: f-claude-plugins TDD 재생목록
description: prj20 f-claude-plugins 의 TDD 목표를 재생 순서로 나열한 목록 (prj6#Issue16)
date: 2026.09.26
---

# 무엇을 지키나

각 플러그인 MCP 서버가 앱의 실제 REST 경로와 CLI 규약대로 호출하고, 마켓플레이스 등록이 정합한지 지킨다

* 기존 러너: `python3 fpm-core/services/hub/test_*.py (fpm-core 번들 회귀 테스트 24종, ___pm 소유) / 앱 플러그인용 러너 없음(package.json에 test script 없음)`
* 목표 7개 중 기존 테스트로 덮인 것 1개 · 신규 6개

# 재생목록

위에서 아래로 돈다 — 빠르고 기초적인 것이 먼저, 통합·E2E 가 뒤다. 앞 항목이 깨지면 뒤 항목의 실패는 원인이 아니라 결과일 수 있다.

| # | id | 목표 | 근거 | 실행 | 상태 |
| :- | :- | :- | :- | :- | :- |
| 1 | `marketplace-manifest-consistency` | .claude-plugin/marketplace.json의 각 플러그인 path가 실제 폴더와 plugin.json을 가리키고, version이 plugin.json과 같다 | .claude-plugin/marketplace.json, */plugin.json (예: fBoard 1.1.0, fGoogleSheet 1.2.0) | — | ⬜ 신규 |
| 2 | `mcp-rest-paths-real` | 각 MCP 서버가 호출하는 REST 경로가 앱 실제 API와 일치한다(fSnippet·fWarrange는 /api/v2/*, fQRGen은 /api/generate) | commit a5af46e(5개 서버가 존재하지 않는 엔드포인트를 호출해 실동작 0이었음) | — | ⬜ 신규 |
| 3 | `mcp-missing-input-guard` | toolInput 없이 도구를 호출해도 TypeError로 죽지 않고 isError 응답을 돌려준다 | commit a5af46e '공통: toolInput 미전달 시 TypeError 방지 가드' | — | ⬜ 신규 |
| 4 | `fcapture-serialized-calls` | fCapture MCP는 동시에 들어온 캡처 호출을 직렬화해서, 병렬 요청도 전부 성공한다(권한 오류로 위장된 실패가 나지 않는다) | Issue10 실측 발견: 3-way 병렬은 전건 실패, 순차는 성공. promise 체인 뮤텍스 도입 | — | ⬜ 신규 |
| 5 | `stdin-close-inflight` | stdin이 닫혀도 진행 중인 비동기 도구 호출의 응답은 버려지지 않고 전달된다 | Issue10 실측 발견: rl.on('close', process.exit) 패턴이 in-flight 응답을 버림(fQRGen/mcp-server.js 유래) | — | ⬜ 신규 |
| 6 | `fcapture-error-paths` | 잘못된 mode, width 0, 프리셋 파일 부재, 바이너리 미발견, region_user 프리셋이 모두 isError=true와 사람이 읽을 수 있는 메시지로 반환된다 | Issue10 명세 준수·검증 결과(에러 경로 4종, region_user 거부) | — | ⬜ 신규 |
| 7 | `fpm-core-hub-regression` | fpm-core hub 서비스 회귀 테스트(i18n 패리티, 토큰 마스킹, allowlist 등)가 전부 exit 0으로 통과한다 | fpm-core/services/hub/test_*.py 24종 (예: test_i18n_parity.py 헤더 '실행: python3 services/hub/test_i18n_parity.py') | `for t in fpm-core/services/hub/test_*.py; do python3 $t; done` | ✅ 기존 |

# 규약

* **목표는 «검증 가능한 성질»** 이다 — *"잘 동작한다"* 는 목표가 아니다
* 새 버그를 고치면 **재현 테스트를 먼저** 여기 한 줄로 올리고(⬜), 테스트가 생기면 실행 열을 채워 ✅ 로 바꾼다
* 실패를 삼키는 패턴(`2>/dev/null || true` 등)을 테스트 안에 쓰지 않는다 — 실패는 실패로 드러나야 한다
* 판정 출처: prj6 `_doc_work/report/tdd-coverage_report.md` (이 프로젝트가 왜 TDD 대상인가)
