# Issue Management

* Issue HWM: 16
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

### Issue16: [fSnippet] 플러그인 문서의 전제 조건 절이 옛 구조(fSnippet.app 내장 REST)를 설명 — fSnippetCli 기준으로 갱신 (등록: 2026-10-16, 출처: prj25 검토)
* 목적: 서버 기동 안내가 실제와 달라 처음 설치하는 사용자가 REST 서버를 못 띄운다 — fSnippetCli(brew) 기준으로 맞춘다
* 상세:
    - `fSnippet/README.md`·`README_kr.md` L39 «Launch fSnippet.app», L116-121 «Settings > Advanced > Enable REST API» — REST 서버(:3015)는 paidApp 이 아니라 cliApp **fSnippetCli** 가 띄운다
    - 루트 `CLAUDE.md` L55·`README.md` L15 의 필요 앱 = `fSnippet.app` — 같은 이유로 낡음
    - `fSnippet/skills/fsnippet/SKILL.md` L31·L44 `brew services start finfra/tap/fsnippet-cli` — 정본 표기는 `brew services start fsnippet-cli`(prj25 README)
    - `fSnippet/README*.md` L14-19 플러그인 구조 트리에 실제 파일 `mcp-server.js` 가 없다
    - MCP 확인 절차 부재 — 플러그인 설치 뒤 `/mcp` 에서 `fsnippet` 연결을 확인하는 안내가 없다. L129 외부 링크(`finfra/fSnippet_public/tree/main/mcp`)만 있음
    - 버전 표기 3곳 불일치: `fSnippet/plugin.json` 1.1.0 · `.claude-plugin/marketplace.json` 1.1.0 · `fSnippet/mcp-server.js` `serverInfo.version` 1.0.0 (플러그인 버전이 앱 1.2.0 과 같을 필요는 없으나 repo 안 세 값은 하나로)
* 구현 명세:
    - 전제 조건: `brew install finfra/tap/fsnippet-cli` → `brew services start fsnippet-cli` → `curl -s http://localhost:3015/api/v2/status` 확인 3단계로 교체 (README·README_kr 짝으로)
    - 루트 `CLAUDE.md`·`README.md` 필요 앱 행을 fSnippetCli 로
    - 구조 트리에 `mcp-server.js` 추가 · MCP 확인 절차 1단락
    - 버전 3곳을 하나로 맞춘다 — marketplace 기준 bump 규칙을 따른다
    - 검증: `grep -rn 'fSnippet.app' fSnippet/ CLAUDE.md README.md` · `grep -rn 'Enable REST API' fSnippet/` 0건 · README/README_kr 줄 대응 확인
    - ⚠️ `Issue.md` 작업트리에 a5af46e(2026-09-06) 스냅샷 기반 타 세션 미커밋 재포맷(+40/-95)이 있다 — 커밋은 내 블록만 싣는다(`git add -p` 또는 HEAD blob 에 블록만 적용). `issue-tx.py` 는 이 repo 의 `###` 헤더를 인식하지 못한다(Issue12 도구 한계)

### Issue13: fpm-core 사본 Apache-2.0 전파 확인 + README 라이선스 절 예외 줄 교체 (prj1#Issue556 이관) (등록: 2026-09-28)
* 목적: prj1#Issue550 이 fpm-core 원천 라이선스를 Apache-2.0 으로 고쳤다(prj1 4916a28). 이 repo 의 `fpm-core/` 는 fpm 번들 미러라 다음 fpm 출고(`deploy --with-marketplace`) 때 원천에서 전파된다. 전파 뒤 README 라이선스 절 예외 줄을 바꾸면 이 repo 전체가 OSI 오픈(MIT + Apache-2.0)이 된다(2026-09-28 사용자 지시로 prj1#Issue556 에서 이관)
* trigger: prj1 fpm 다음 출고 — R1 재통과 → main 병합 → `deploy <level> --with-marketplace` (출고 보류 중: 사용자 «테스트가 더 필요함», 2026-09-28)
* 상세:
    - 현황(2026-09-28): `fpm-core/.claude-plugin/plugin.json` `license` = `PolyForm-Noncommercial-1.0.0` — 원천(prj1)만 `Apache-2.0`
    - ⚠️ `fpm-core/` 는 여기서 직접 고치지 않는다 — `.fpm-integrity.json` 해시 대상이고 전파는 prj1 원천에서만 한다(Issue12 결과와 같은 이유)
    - ⚠️ README 줄은 **전파 뒤에만** 바꾼다 — 먼저 바꾸면 미러 실물(PolyForm NC)과 README 가 어긋난다
    - 바꿀 줄: README 라이선스 절 «`fpm-core/` 는 fpm 번들 미러이며 이 MIT 의 대상이 아니다» → «`fpm-core/` 는 Apache-2.0(fpm 번들 미러)»
    - 짝: prj8#Issue1(fpm 미러 사본 확인)
* 구현 명세:
    - 검증: `fpm-core/.claude-plugin/plugin.json` `license` = `Apache-2.0` · `bash ~/_git/___pm/sh/gen-integrity-manifest.sh --check --bundle fpm-core` OK · README 예외 줄 교체
    - 금지: `git push`(공개 라이선스 표기 변경은 사용자가 push)



---

## 📗 선택

---

## ✅ 완료

### Issue15: [fSnippet] `mcp-server.js` 의 `expand_snippet`·`create_snippet` 요청 본문이 REST v2 명세와 불일치 — 도구가 실제로 동작하지 않음 (등록: 2026-10-16, 완료: 2026-10-16, 출처: prj25 검토)
* Hash: fef5d6e
* 목적: MCP 도구 두 개가 API 가 받지 않는 필드를 보내 확장·생성이 실패한다(코드 대조 판정, 실호출 미재현) — 명세에 맞춰 고치고 실호출로 확인한다
* 상세:
    - `fSnippet/mcp-server.js` L34 `expand_snippet` → 본문 `{ key, context }`. 명세 `POST /api/v2/snippets/expand` 는 `{ abbreviation, placeholder_values }` (prj25 `api/openapi_v2.yaml` L1396-1406 예시)
    - `fSnippet/mcp-server.js` L36 `create_snippet` → 본문 `{ key, value, tags }`. 명세 `POST /api/v2/snippets` 는 `{ folder, keyword, name, content }`
    - 다른 도구(search·list·get 등)의 경로·쿼리도 같은 대조가 필요하다 — prj25 `api/openapi_v2.yaml` 이 SSOT (`/api/v1/*` 는 410 Gone)
    - prj25 에는 별도 npm 패키지 `fsnippet-mcp`(prj25 `mcp/`)가 있다 — 번들 서버를 유지할지, 그 패키지로 대체할지 판단 대상
* 구현 명세:
    - red 먼저: fSnippetCli(:3015) 기동 상태에서 MCP 서버를 stdio 로 띄워 `tools/call expand_snippet`·`create_snippet` 을 호출 → 현재 실패(400 또는 무효 결과) 확인
    - 두 도구의 `inputSchema`·요청 본문을 명세 필드로 교체. 나머지 도구도 경로·필드 대조
    - green: 같은 호출이 성공(expand 결과 문자열 · create 뒤 `GET /api/v2/snippets` 에 생성분) · 테스트용으로 만든 스니펫은 삭제
    - `tdd/playlist.md` 에 회귀 행 1개(이 두 도구의 명세 일치) 추가
    - 금지: 사용자 실데이터 폴더에 테스트 스니펫을 남기지 않는다 · `git push`
* 결과:
    - 원인 2중: ① 요청 본문 필드가 명세와 불일치 ② **`makeRequest` 가 `req.write` 만 해 chunked 로 전송 — fSnippetCli 는 chunked 본문을 `400 Invalid JSON body` 로 거부**(필드를 고쳐도 실패). ②는 이슈 등록 시 몰랐고 실서버 호출(red)에서 발견 — 목 서버는 chunked 도 받아들여 기존 테스트가 못 잡았다
    - `fSnippet/mcp-server.js`: `expand_snippet` → `{abbreviation, placeholder_values}`(필수 abbreviation) · `create_snippet` → `{folder, keyword, name, content}`(필수 folder·name·content, keyword 는 빈 값 허용=`===name.txt`) · `inputSchema` 교체 · `makeRequest` 가 본문 있을 때 `Content-Length`(바이트) 명시
    - 나머지 3도구(search·list·status) 경로·쿼리는 명세와 일치 확인(변경 없음). 번들 서버 유지 — `fsnippet-mcp` 대체 여부는 판단 대상으로 남기되 이번엔 유지(대체 시 plugin.json 배선·의존성 변경이 커 별도 이슈 사안)
    - TDD: red = `tdd/cases/fsnippet-request-body-spec.test.js` 6건 중 5건 실패(구 본문·chunked) + 실서버 구 본문 400 재현 → green = 54 pass(`npm test`). `mcp-rest-paths-real` 의 fSnippet 인자와 `_mcp.js` 목 서버(헤더 기록)도 함께 갱신. `tdd/playlist.md` 8번 행 추가
    - 실호출 green(jm4 fSnippetCli 1.2.0, stdio 로 번들 서버 기동): `create_snippet` 201 생성 → `search_snippets` 로 확인 → expand 본문 `{abbreviation}` `expanded_text=MCP15-OK` → REST `DELETE` 로 삭제, `snippet_count` 1861 복원·파일 잔존 0
    - 미결: `expand` 의 abbreviation 은 접두 포함 전체형(`@kw{right_command}`)이어야 매칭 — 도구 설명에는 예시만 적었다. 같은 chunked 패턴이 타 플러그인 `makeRequest` 에도 있을 수 있으나 해당 앱 서버 거동은 미실측(이번 범위 밖)

### Issue14: [fSnippet] 플러그인 문서의 `cli/pause` 의미 정정 + `plugin.json` `mcpServers` 절대경로 하드코딩 제거 (등록: 2026-10-15, 완료: 2026-10-16, 출처: prj25#Issue264)
* Hash: 0bb5531
* 목적: fSnippet 플러그인이 실제 동작과 다른 서술을 싣고, 다른 머신·사용자에서 MCP 서버를 못 띄운다 — 실측 기준으로 고친다
* 상세:
    - 출처: prj25(fSnippetCli) Issue264 «매뉴얼 밖 낡은 서술 정리» ①·⑤ 중 이 repo 몫 — prj25 쪽 문서(`api/openapi_v2.yaml`·`cli/README*`·`mcp/README*`)는 prj25 에서 정정 완료
    - ① `fSnippet/skills/fsnippet/SKILL.md`(L11·L233-234·L239·L240·L248·L249)·`fSnippet/README.md`(L76·L77)·`fSnippet/README_kr.md`(L76·L77) 가 `POST /api/v2/cli/pause` 를 «스니펫 확장 일시정지» 로 쓴다. 실측(2026-10-15 jm4, fSnippetCli 1.2.0): pause 는 **REST API 만** 멈춤 — `/api/v2/cli/*` 외 요청 `503`, 스니펫 확장은 계속 동작(`APIServer.swift` Pause guard)
    - ⑤ `fSnippet/plugin.json` `mcpServers.fsnippet.args` = `/Users/nowage/_git/__all/f-claude-plugins/fSnippet/mcp-server.js` 절대경로. 같은 패턴이 `fBanner`·`fBoard`·`fCapture`·`fGoogleSheet`·`fQRGen`·`fWarrange` `plugin.json` 에도 있음 — 7개 전부(2026-10-16 prj25 검토 실측)
    - 보강(2026-10-16, prj25 검토): 등록 당시 목록에서 resume 행(SKILL.md L240·L249, README* L77)과 SKILL.md L233-234 «temporarily suspending snippet expansion» 이 빠져 있었다 — 같은 오류라 함께 고친다
    - 근거: 같은 repo `fpm-core/hooks/hooks.json` 이 이미 `${CLAUDE_PLUGIN_ROOT}` 를 쓴다(hooks 에서의 확장 선례). `mcpServers` 에서도 확장되는지는 재설치로 실측한다
    - ⚠️ prj25 원본 `agents/claude/README*.md` 의 수동 설치 예시(`cp plugin.json`)도 절대경로를 퍼뜨린다 — 그 정정은 prj25 몫(여기서 고치지 않음)
* 구현 명세:
    - 문서 3곳: pause = «REST API 일시정지(확장은 계속 동작)», resume = «REST API 재개» 로 교체
    - `plugin.json`: `"args": ["${CLAUDE_PLUGIN_ROOT}/mcp-server.js"]` 로 교체(검증 필요 — 이 repo 플러그인 로더가 해당 변수를 확장하는지 확인 후). 다른 플러그인도 같은 방식으로 일괄
    - 검증: `grep -rn "/Users/nowage" */plugin.json` 0건 · 플러그인 재설치 후 MCP 서버 기동 확인
* 결과:
    - `fSnippet/skills/fsnippet/SKILL.md`·`README.md`·`README_kr.md`: pause = «REST API 일시정지(확장은 계속 동작)» · resume = «REST API 재개» · 도입부·CLI Control 절 «suspending snippet expansion» 도 함께 정정
    - `plugin.json` 7종(fBanner·fBoard·fCapture·fGoogleSheet·fQRGen·fSnippet·fWarrange) `mcpServers.*.args` → `${CLAUDE_PLUGIN_ROOT}/mcp-server.js`. 확장 선례: 공식 플러그인 `.mcp.json`(discord 등)이 `mcpServers` 에서 같은 변수를 쓴다
    - 검증: [v] `grep -rn "/Users/nowage" */plugin.json` 0건 · [v] JSON 파싱 7종 ok · [v] `CLAUDE_PLUGIN_ROOT` 치환 경로로 7종 MCP 서버 initialize 응답 · [v] `npm test` 48 pass
    - 미실측: Claude Code 에서 플러그인 재설치 후 `/mcp` 연결 확인은 사용자 환경 몫(설치 캐시가 필요해 이 세션에서 하지 않음)

### Issue12: 라이선스 프로파일 C — README 의 MIT 주장에 맞는 LICENSE 파일 추가 (등록: 2026-09-27, 완료: 2026-09-27)
* Hash: ce897a4
* 목적: README 는 MIT 라 하지만 LICENSE 파일이 없어 법적으로는 미허가 상태다. 커넥터라 제한 없는 MIT 가 prj6 정본 배정이다
* 상세:
    - 루트 `LICENSE` = MIT 원문(Copyright (c) 2026 Finfra Co., Ltd.) · 각 플러그인 `plugin.json` 에 `license` 필드가 있으면 `MIT` 로 통일(없으면 추가하지 않는다)
    - README 라이선스 절에 LICENSE 링크
    - 정본 `/Users/nowage/_git/___oracle/_doc_arch/license-profiles.md` §4 row 20 · 템플릿 `/Users/nowage/_git/___oracle/data/template/license/README.md`(자리표 값 표 포함 — `{{N}}`=250 · `{{LICENSOR}}`=`Finfra Co., Ltd. (https://finfra.kr)` · `{{CONTACT}}`=finfra@gmail.com)
* 구현 명세:
    - 검증: `LICENSE` 존재 · README 라이선스 절 링크 · `grep -rn "All rights reserved" README*` 0건
    - 금지: `git push`(공개 라이선스 변경은 사용자가 push) · npm publish · 기존 릴리스 태그 변경
    - `Issue.md` 는 `python3 ~/.claude/sh/issue-tx.py --file Issue.md stage --issues <N>` / `check` 경유 스테이징 · 커밋 후 ✅ 이동 + hash 기록
* 결과:
    - 루트 `LICENSE` 신설 — MIT 원문, `Copyright (c) 2026 Finfra Co., Ltd. (https://finfra.kr)`. 하단 Notes 에 `fpm-core/` 제외 명시
    - `README.md` 라이선스 절 → `[LICENSE](LICENSE)` 링크 + `fpm-core/` 예외 1줄
    - `plugin.json` 7종(fBanner·fBoard·fGoogleSheet·fQRGen·fSnippet·fWarrange·fCapture)은 이미 `MIT` — 변경 없음
    - `fpm-core/.claude-plugin/plugin.json` 의 `PolyForm-Noncommercial-1.0.0` 은 **의도적으로 유지** — prj8 fpm 미러(`.fpm-integrity.json` 해시 대상)라 라이선스 소관이 prj8 이다(정본 §4 row 8: fpm 은 A → Apache-2.0 전환 예정). 여기서 MIT 로 바꾸면 소관 침범 + 무결성 해시 불일치
    - 검증: [v] `LICENSE` 존재 · [v] README 링크 · [v] `All rights reserved` README* 0건 · push 미수행(사용자 몫)
    - 도구 한계: `issue-tx.py move` 가 `# ` 레벨 섹션만 인식해 이 repo(`## ✅ 완료`)에서 섹션을 못 찾음 → 블록 이동은 수동 편집

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
