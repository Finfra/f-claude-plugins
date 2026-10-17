---
name: ri-search
description: "Local semantic search — documents, notes, lecture material and code outside the current repo via a rindex-style text index; screenshots, photos and audio via a DigUp-style media index. Slash entry is /ri. Triggers: 'where is that file', 'find my notes about', 'find the screenshot'"
date: 2026.10.18
---

> 실동작 코드: [ri.py](ri.py) — 이 문서는 호출법·라우팅 판정만 담는다(로직은 실행체 하나). 엔진(`rindex`·`digup`)은 이 플러그인에 들어 있지 않다 — [README](../../README.md) «Engine» 참조

# 쓰는 법

```bash
python3 "${CLAUDE_SKILL_DIR}/ri.py" search "<질문>" [-k 8] [--kind K,K] [--media] [--ext a,b] [--root R] [--code] [--sort importance|relevance|recent] [--json]
python3 "${CLAUDE_SKILL_DIR}/ri.py" status     # 두 인덱스 진행(rindex stats · digup status)
python3 "${CLAUDE_SKILL_DIR}/ri.py" update     # RI_UPDATE_CMD 를 tmux ri-index 에서 기동 — 실행 중이면 rc 3 거부
```

* 슬래시 진입은 래퍼 [/ri](../../commands/ri.md) — `/ri <질문>` 은 `search`, `/ri status`·`/ri update` 는 그대로 넘긴다
* 엔진 경로·원격 호스트·갱신 명령은 환경 변수(`RI_RINDEX`·`RI_DIGUP`·`RI_SSH_HOST`·`RI_REMOTE_CMD`·`RI_LOCAL_MARK`·`RI_UPDATE_CMD`·`RI_INDEXER_PAT`)로 받는다. 아무것도 안 주면 PATH 의 `rindex`·`digup` 을 로컬에서 부른다
* rc: 0 정상 · 1 백엔드 실패(stderr 끝 3줄 표시) · 2 사용법·환경 · 3 인덱서 실행 중

# 라우팅 — 어느 인덱스로 보내나

| 찾는 것                        | 호출                                                                               |
| :----------------------------- | :--------------------------------------------------------------------------------- |
| 문서·강의자료·노트·코드 (기본) | `search "<질문>"` — rindex 만. 0건이면 DigUp 자동 병행                             |
| 화면·사진·소리                 | `search "<질문>" --kind screenshot` (image·audio·video·pdf·doc)                    |
| 둘 다 보고 싶을 때             | `search "<질문>" --media` — rindex 블록 먼저, DigUp 미디어 블록 뒤                 |
| 코드                           | `search "<영어 질의>" --code --ext py,ipynb` — 한글 질의면 영어 권장 고지가 붙는다 |
| 특정 위치                      | `--root <디렉터리>` · `--ext pdf,pptx`                                             |

* **DigUp 을 기본 병행하지 않는 이유** — DigUp 정렬은 손댈 수 없어 캡처 스크린샷이 의미 있는 문서 결과를 밀어낸다
* 현재 저장소 안의 구조·의존성은 이 도구가 아니라 저장소 자체 검색이 먼저다. `/ri` 는 **저장소 밖**(다른 repo·강의자료·공유 폴더·노트 전체)을 의미로 찾을 때 쓴다

# 결과 해석

* 출력은 결과마다 2줄 — `순위. 점수  경로[loc] · 수정일 (사본 N)` + 스니펫 160자. 점수는 rindex 중요도 점수, DigUp 은 cosine
* 상위 결과의 경로·스니펫으로 답하고, 원문이 필요한 1~2개만 Read 한다 — 결과 전체를 채팅에 dump 하지 않는다
* `[s52]`·`[p3]` 는 pptx 슬라이드·pdf 쪽 번호. 같은 내용이 다른 폴더에 겹쳐 나오면 사본이다(크기가 달라 묶이지 않은 것)

# 실행 제약

* 첫 검색은 임베딩 모델 로드로 수십 초 걸릴 수 있다 — 연달아 여러 번 부르지 말고 `-k` 로 한 번에 받는다
* `update` 는 사용자가 요청할 때만. 증분 주기·인덱스 운영은 엔진 쪽 몫이다
