# Issue Management

* Issue HWM: 20
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

### Issue18: [fSnippet] 플러그인 버전 1.1.0 → 1.1.1 — Issue15 동작 수정이 설치 사용자에게 업데이트로 전달되도록 (등록: 2026-10-16, 출처: prj25 검토)
* 목적: Issue15(`expand_snippet`·`create_snippet` 요청 본문 수정, `fef5d6e`)는 MCP 도구 동작이 바뀐 수정인데 버전이 1.1.0 그대로라, 이미 설치한 사용자가 마켓플레이스 업데이트로 받지 못할 수 있다
* 상세: 버전 표기 3곳 — `fSnippet/plugin.json` `version` · `.claude-plugin/marketplace.json` `fsnippet` 항목 `version` · `fSnippet/mcp-server.js` `serverInfo.version`
* 구현 명세:
    - 세 곳을 같은 값(1.1.1, patch — 기능 추가 없음)으로 올린다
    - 검증: `grep -rn '"version"\|serverInfo' fSnippet .claude-plugin/marketplace.json` 에서 fsnippet 세 값이 같음 · `node fSnippet/mcp-server.js` initialize 응답 version 확인
    - push 는 사용자 확인 뒤(현재 `release/0.1.0` 이 origin 보다 10커밋 앞섬)

### Issue19: [Repo] `Issue.md` 섹션 깊이가 양식과 달라 `fpm-do` 가 완료를 영영 못 봄 — 섹션 `##`→`#`, 이슈 `###`→`##` (등록: 2026-10-16, 출처: prj25 실측 — Issue14·15·16 위임 3회 모두 45분 시간 초과)
* 목적: 이 repo 로 `fpm-do` 위임을 했을 때 완료 커밋이 들어오면 바로 회수되게 한다
* 상세:
    - 실측(2026-10-16): prj25 가 Issue14·15·16 을 `fpm-do 20` 으로 맡겼고 세 번 모두 «시간 초과(45분)·완료 미기록·rc=1» 로 끝났다. 실제 완료 커밋(`03dad03`·`9a6fa67`·`33ac195`)은 그 안에 이미 있었다
    - 원인: 완료 판정(`~/.bin/fpm-do` `completed_block`, `~/.claude/hooks/lib/issue-completion.py` `is_done_section`)은 완료 섹션을 **최상위 `# …완료`** 로만 본다. 이 repo 는 `# Issue Management` 아래 `## ✅ 완료` 로 한 단계 깊어 섹션 자체를 못 찾는다(`###` 이슈 헤더는 판정기가 받는다 — 원인 아님)
    - 양식 SSOT `~/_git/___pm/data/template/Issue.md`·`~/.claude/rules/issue-g.md` «기본 섹션» 은 섹션 `# `, 이슈 `## ` 이다. 같은 이탈: prj11·prj42a (2026-10-16 전수 조사)
    - 판정기 쪽 fail-loud(섹션 부재 = 판정 불가로 즉시 보고)는 prj3 에 따로 등록
* 구현 명세:
    - `Issue.md` 의 섹션 헤더(🤔·🌱·🚧·📕·📙·📗·✅·⏸️·🚫·📜) `## ` → `# `, 이슈 헤더 `### Issue` → `## Issue`(서브 이슈 `#### Issue<N>_<M>` 은 `### `). `# Issue Management` 는 그대로
    - 다른 세션 미커밋분이 있으면 먼저 정리된 뒤 진행(일괄 치환이라 블록 단위 커밋과 충돌)
    - 검증: `bash -c 'source <(sed -n "/^completed_block()/,/^}/p" ~/.bin/fpm-do); completed_block . 16'` 가 Issue16 블록을 출력 · `python3 -c` 로 `issue-completion.py` `issue_completed_in(".", "Issue16")` 참

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

### Issue20: `ri-search`(로컬 의미 검색) 플러그인 이관 — prj3 글로벌 SCAR `/ri` 를 외부 배포용으로 일반화 (등록: 2026-10-18, 완료: 2026-10-18, 출처: 사용자 지시 · prj6 세션)
* Hash: af5c1f2
* 목적: prj3 `~/.claude/skills/ri-search/`(SKILL.md·ri.py) + `commands/ri.md` 를 이 마켓플레이스의 플러그인으로 싣는다. 이후 prj3 원본이 바뀌면 여기에도 반영한다(동기 의무는 prj3#Issue1129 가 원본 SCAR 에 명시)
* 상세:
    - 원본: `~/.claude/skills/ri-search/` · `~/.claude/commands/ri.md` (prj3 Issue1121·1128) · 엔진(`rindex`·DigUp)은 prj5 `~/_git/___common/hosts/jm4/resource_index/` — 엔진 운영 정본 prj5 `_doc_arch/resource-index.md`
    - 일반화(이 repo CLAUDE.md «개인 경로·토큰 하드코딩 금지»): `ssh jm4`·`/Volumes/jM4_2T`·`~/_git/___common` 같은 개인 호스트·경로를 설정(env·config)으로 뺀다. 엔진 동봉 여부(플러그인만 vs 엔진 포함)는 이 repo 가 판정하고 결과를 Issue 에 적는다
    - 플러그인 디렉터리 이름 `ri-search/` · `marketplace.json` 등재
* 구현 명세:
    1. 플러그인 골격 + SKILL·커맨드 이관(개인 값 제거) · README(설치·엔진 준비·설정)
    2. 검증: 개인 값 grep 0건(`jm4`·`jM4_2T`·`nowage`·`___common`) · 로컬 설치 후 `/ri status` 1회
    3. ⚠️ 원격 push(공개 repo)는 사용자 승인 뒤 — 로컬 커밋까지만
* 결과 (2026-10-18):
    - **엔진 동봉 판정: 동봉하지 않음(플러그인만)** — 엔진은 prj5 가 운영하는 개인 인덱서(외장 볼륨 DB·임베딩 모델·tmux 증분 갱신)라 공개 배포물로 일반화할 수 없고, 계약(`rindex search … --json` → `{path,score,mtime,snippet,loc?,copies?}` · `digup search … --json` → `{path,cosine,kind,modified,excerpt}`)만 README «Engine» 에 명시. 계약을 지키는 CLI 면 무엇이든 쓴다
    - 신설 `ri-search/`: `plugin.json`(0.1.0, MIT, author Finfra) · `skills/ri-search/{SKILL.md,ri.py}` · `commands/ri.md` · `README.md`/`README_kr.md`
    - 개인 값 제거: `/Volumes/jM4_2T/data/resourceIndex`(RES)·`ssh jm4`·`~/.bin/rindex`·`run_index.sh`·`~/.claude/skills/...` 하드코딩 → 환경 변수 `RI_RINDEX`·`RI_DIGUP`·`RI_LOCAL_MARK`·`RI_SSH_HOST`·`RI_REMOTE_CMD`·`RI_UPDATE_CMD`·`RI_INDEXER_PAT`(+`RI_SSH`·`RI_PGREP`·`RI_TMUX`). 설정이 없으면 PATH 의 `rindex`·`digup` 을 로컬 실행. 원격 위임은 `RI_LOCAL_MARK`·`RI_SSH_HOST` 둘 다 있을 때만, `RI_REMOTE_CMD` 없으면 추측하지 않고 rc 2. `update` 는 `RI_UPDATE_CMD` 필수(없으면 rc 2)
    - 동작 변화(원본 대비): ① DigUp 부재 시 rindex 0건 병행은 크래시 대신 안내 1줄, `--kind`·`--media` 지정 때만 오류 ② 글로벌 SCAR 가드 박스·`/gq`·`/wq`·graphify 라우팅 참조 제거 ③ 커맨드 경로 `${CLAUDE_PLUGIN_ROOT}`, 스킬 경로 `${CLAUDE_SKILL_DIR}`
    - TDD: red = `tdd/cases/ri-search-plugin.test.js` 11케이스 0 pass / 11 fail(플러그인 없음) → green = 11 pass, `npm test` 68 pass / 0 fail. `tdd/playlist.md` 10번 행 추가(가짜 rindex/digup/ssh/tmux)
    - 검증: [v] `grep -rniE 'jm4|jM4_2T|nowage|___common|/Users/' ri-search` 0건 · [v] `claude plugin validate ri-search` 통과 · [v] `claude plugin validate .` 통과(경고 1건 — marketplace description 부재, 기존 상태) · [v] `claude --plugin-dir ri-search -p "/ri-search:ri status"` 가 `${CLAUDE_PLUGIN_ROOT}` 치환 후 실행되어 rindex·DigUp 상태 출력(설정 env 없이 PATH 의 rindex + DigUp.app 도우미 폴백)
    - `marketplace.json` 등재(`spell-note` 뒤, 0.1.0) · 루트 `README.md`·`CLAUDE.md` 플러그인 표 갱신
    - 미실측: `/plugin install ri-search@f-claude-plugins` 마켓플레이스 경유 설치(공개 push 전이라 불가) · `RI_SSH_HOST` 실제 ssh 위임(가짜 ssh 로만 검증)
    - 미수행: `git push` — 사용자 승인 대기(현재 `release/0.1.0` 이 origin 보다 앞섬)
    - 후속: prj3 원본 변경 시 여기 반영(prj3#Issue1129 동기 의무). 원본 `ri.py` 와의 차이는 위 «동작 변화» 3건

### Issue17: 📙 Python 3.14 기준 전환 — 인터프리터·venv·하드코딩 버전 정리 (등록: 2026-10-16, 완료: 2026-10-17, 출처: prj55#Issue23 · 총괄: prj5#Issue131)
* commit: 88430a7 (코드 변경 없는 근거 종결 — 이슈 이동 커밋만)
* 목적: 3-OS(macOS·Windows·Linux) 기준 Python 이 **3.14** 로 확정됨(2026-10-16 사용자 결정 — Ubuntu 26.04 OS `python3` = 3.14, prj1 배포 하한 3.14+). 이 repo 의 Python 실행 경로·venv·버전 표기를 3.14 에 맞춘다
* depends: prj1#Issue641
* 담당: prj5 팀장 총괄(prj5#Issue131) — 핀봇 배분 없음, 이 repo 세션이 직접 처리
* 상세:
    - 검출(2026-10-16 자동 스캔, 참고용 — 문서 속 언급 포함): .py 89개 · shebang `python3`×81 · 하드코딩 minor(3.14 외) 없음 · requires-python 없음 · venv 없음
    - 기준 설치원: macOS brew `python@3.14`(bare `brew install python` = 3.15 · `/usr/bin/python3` = CLT 3.9 쓰지 않음) · Windows python.org 3.14(`py -3.14`) · Ubuntu 22.04 deadsnakes `python3.14` / 26.04 OS `python3`
    - 근거: prj2 `3.Resource/_Coding/_python/Python3.14_전환사전조사.md` · prj55 `_doc_work/report/python-version-survey_report.md`
* 구현 명세:
    1. 3.14 외 minor 를 고정한 shebang·스크립트·`requires-python`·문서 설치 안내를 3.14 기준으로 정리 (의도적 고정이면 사유를 남기고 유지)
    2. venv 가 있으면 `python3.14 -m venv` 로 재생성 → 의존 설치 확인 (구 venv 는 검증 뒤 제거)
    3. `python3.14 -m compileall -q <소스>` 통과 + 기존 테스트 통과
    4. Python 실사용이 없으면 근거 1줄을 결과에 적고 종결
* 결과 (2026-10-17):
    - 판정: Python 실사용은 `fpm-core/`(prj1 번들 미러) 안에만 있고 이 repo 고유 Python 코드·venv·pyproject·requirements 는 없음 — `fpm-core/` 는 `.fpm-integrity.json` 해시 대상이라 여기서 고치지 않음(Issue13 과 같은 이유). 코드 변경 0건
    - 검출: tracked `.py` 89개 전부 `fpm-core/`(hooks 10 · hooks/lib 9 · services/hub 65 · skills 5). `grep -rnE 'python3\.(9|10|11|12|13|15)|python@3\.|py -3\.|requires-python'` 0건, `venv`·`.venv`·`.python-version`·`pyproject.toml`·`requirements*.txt` 없음. 비-미러 문서의 python 언급은 `python3 -m json.tool`(fBanner·fWarrange SKILL.md) 뿐이라 minor 고정 아님 — 정리 대상 없음
    - `/usr/bin/python3` 폴백: `fpm-core/hooks/fbot-tick.sh`·`fbot-worker-plist.sh`·`fbot-worker-unit.sh` 의 후보 순회 목록(`command -v python3` 우선, 마지막 후보)에 CLT 3.9 경로가 들어 있음 — 원천(prj1) 소관이라 prj1#Issue641 몫으로 넘김(이 repo 는 전파만 받음)
    - 검증(CPython 3.14.6, uv): `python3.14 -m compileall -q fpm-core` 통과(0 오류) · `fpm-issue-map/tests/test-*.py` 3종 unittest 38건 OK(13+15+10) · `services/hub/test_*.py` 56개 중 54 PASS / 2 FAIL
    - FAIL 2건은 전환 무관(brew 3.14.6 에서 동일 실패, 3.9 는 `X | None` 문법 TypeError 라 참고 제외): `test_fbot_org_cache_issue551.py` = 임시 디렉토리에 `lib/fbot-prj.py` 가 없어 FileNotFoundError(미러에 해당 파일 미포함) · `test_issue_map.py` = 70 PASS / 1 FAIL(`[배포본] 생성기 존재` — 미러 위치(~/.claude 아님)에서 생성기 경로를 못 찾음)
    - 부수: `compileall` 이 tracked `__pycache__/*.cpython-314.pyc` 를 갱신·신규 생성했으나 전부 HEAD 내용으로 복원/삭제해 작업트리 변화 없음. 이후 검증은 `PYTHONDONTWRITEBYTECODE=1`
    - 남김: 타 세션의 `Issue.md` 미커밋 재포맷(a5af46e 스냅샷 기반, +69/-117)은 건드리지 않음 — 이 이슈 이동은 HEAD blob 기준으로 별도 커밋. 그 작업트리 사본에는 Issue17 이 진행 위치에 남아 있으므로 해당 세션이 정리 시 이 완료본과 합칠 것

### Issue16: [fSnippet] 플러그인 문서의 전제 조건 절이 옛 구조(fSnippet.app 내장 REST)를 설명 — fSnippetCli 기준으로 갱신 (등록: 2026-10-16, 완료: 2026-10-16, 출처: prj25 검토)
* Hash: 138d630
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
* 결과:
    - `fSnippet/README.md`·`README_kr.md`: 전제 조건을 `brew install finfra/tap/fsnippet-cli` → `brew services start fsnippet-cli` → `curl -s http://localhost:3015/api/v2/status` 3단계로 교체 · `/mcp` 에서 `fsnippet` connected 확인 절 신설 · 구조 트리에 `mcp-server.js` 추가 · Features 의 fSnippet.app 안내 문구 정정 (en/kr 줄 수 146/146 대응)
    - `SKILL.md`: `brew services start finfra/tap/fsnippet-cli` → `brew services start fsnippet-cli`(정본 표기)
    - 루트 `README.md`·`CLAUDE.md` 필요 앱 행 `fSnippet.app` → `fSnippetCli`
    - 버전 3곳 1.1.0 일치 — `mcp-server.js` `serverInfo.version` 1.0.0 → 1.1.0 (문서 변경이라 plugin.json·marketplace 는 bump 하지 않음)
    - TDD: red = `tdd/cases/marketplace-manifest-consistency.test.js` 신규 케이스 `1.0.0 !== 1.1.0` 실패 → green = `npm test` 55 pass / 0 fail. `tdd/playlist.md` 1번 행 근거 보강
    - 검증: [v] `grep -rn 'fSnippet.app' fSnippet/ CLAUDE.md README.md` 0건 · [v] `grep -rn 'Enable REST API' fSnippet/` 0건 · [v] README/README_kr 헤딩 수·줄 수 대응
    - 미실측: 신규 설치 후 `/mcp` 연결 화면은 사용자 환경 몫


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
