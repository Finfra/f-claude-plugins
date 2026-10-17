---
name: ri
description: Local semantic search wrapper — /ri <query> · /ri status · /ri update. Routing and execution live in the ri-search skill
date: 2026.10.18
---

# 개요

[ri-search](../skills/ri-search/SKILL.md) 스킬의 얇은 슬래시 진입점. 로직은 실행체 `ri.py` 하나에 있고 여기는 인자만 넘긴다 — 옵션·라우팅 판정을 이 문서에 복제하지 않는다.

인자: `$ARGUMENTS`

# 절차

1. `$ARGUMENTS` 가 비었으면 `사용법: /ri <질문> [--kind K] [--media] [--code] [-k N] · /ri status · /ri update` 를 보이고 끝낸다
2. 첫 토큰으로 갈라 **한 번만** 실행한다:

| 첫 토큰  | 실행                                                                              |
| :------- | :-------------------------------------------------------------------------------- |
| `status` | `python3 "${CLAUDE_PLUGIN_ROOT}/skills/ri-search/ri.py" status`                   |
| `update` | `python3 "${CLAUDE_PLUGIN_ROOT}/skills/ri-search/ri.py" update` — 사용자가 친 경우에만 |
| 그 외    | `python3 "${CLAUDE_PLUGIN_ROOT}/skills/ri-search/ri.py" search "<질문>" [옵션]`   |

* `--` 로 시작하는 토큰(`--kind screenshot`·`--media`·`--code`·`-k 5` 등)은 옵션으로 뒤에 그대로 붙이고, 나머지를 **큰따옴표 한 덩어리**로 질문에 넣는다 — 인용하지 않으면 zsh 가 `?`·`*` 를 glob 으로 읽어 명령 전체가 중단된다
* `rindex`·`digup` 이 없다는 오류가 나오면 README «Engine» 를 안내한다 — 엔진을 대신 설치하지 않는다

3. 결과는 스킬 «결과 해석» 대로 — 상위 결과의 경로·스니펫으로 답하고, 원문이 필요한 1~2개만 Read 한다. 출력 전체를 다시 붙여 넣지 않는다
