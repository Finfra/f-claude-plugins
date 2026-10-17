# ri-search — Claude Code 로컬 의미 검색

`/ri` 를 추가하는 Claude Code 플러그인. 평문으로 물으면 지금 작업 중인 repo **밖**의 내 컴퓨터 자료 — **문서·노트·코드·스크린샷·소리** — 중 가장 가까운 것을 찾아 준다.

얇은 앞단이다. 임베딩 인덱스는 사용자가 준비한 CLI 두 개([Engine](#engine))가 만들고 서빙하며, 이 플러그인은 그 둘을 부르고 결과를 합쳐 결과당 2줄로 요약해 보여 줄 뿐이다.

---

## 설치

```bash
/plugin marketplace add Finfra/f-claude-plugins
/plugin install ri-search@f-claude-plugins
```

* Claude Code 를 돌리는 머신에 `python3`(3.9+) 필요
* 플러그인에는 **인덱스도 임베딩 모델도 들어 있지 않다** — Engine 참조

---

## 사용

```text
/ri 어텐션 헤드 강의자료 어디 있지
/ri 계약서 초안 --ext pdf,docx
/ri login flow --code --ext py,ts          # 코드 검색은 영어 질의가 정확함
/ri 오류 대화상자 --kind screenshot         # 미디어 인덱스만
/ri 예산 --media                           # 텍스트 결과 먼저, 뒤에 미디어 결과
/ri status                                 # 두 인덱스 진행 상황
/ri update                                 # 증분 재색인 (RI_UPDATE_CMD 필요)
```

| 옵션 | 의미 |
| :-- | :-- |
| `-k N` | 인덱스별 결과 수 (기본 8) |
| `--ext a,b` · `--root DIR` · `--sort importance\|relevance\|recent` | 텍스트 인덱스 필터 |
| `--code` | 코드 검색 (영어 질의 권장) |
| `--kind K,K` | 미디어 인덱스만 — `screenshot,image,pdf,doc,audio,video` |
| `--media` | 텍스트 결과 뒤에 미디어 블록도 덧붙임 |
| `--json` | 두 엔진의 원본 JSON |

기본은 텍스트 인덱스만 조회하고, 결과가 0건일 때만 미디어 인덱스가 자동으로 붙는다. 미디어 쪽 정렬은 손댈 수 없어 기본으로 섞으면 스크린샷이 실제 문서를 밀어낸다.

---

## Engine

| 역할 | CLI | 계약 |
| :-- | :-- | :-- |
| 텍스트·코드·문서 | `rindex` | `rindex search <질문> -k N --json [--ext E] [--root R] [--sort S] [--code]` → `{path, score, mtime, snippet, loc?, copies?}` JSON 배열 · `rindex stats` |
| 스크린샷·이미지·소리 | `digup` | `digup search <질문> -n N --json [--kind K,K]` → `{path, cosine, kind, modified, excerpt}` JSON 배열 · `digup status` |

둘 중 하나가 없어도 된다. `digup` 이 없으면 미디어 블록만 빠지고, `rindex` 가 없으면 텍스트 검색이 분명한 메시지와 함께 실패한다. 위 계약만 지키면 어떤 CLI 든 쓸 수 있다.

---

## 설정

설정은 전부 환경 변수다 — 셸 프로필이나 Claude Code `settings.json` 의 `env` 에 둔다. `rindex`·`digup` 이 `PATH` 에 있고 인덱스가 같은 머신에 있으면 아무것도 안 줘도 된다.

| 변수 | 기본값 | 설명 |
| :-- | :-- | :-- |
| `RI_RINDEX` | `rindex` | 텍스트 인덱스 CLI |
| `RI_DIGUP` | `PATH` 의 `digup`, 없으면 DigUp.app 도우미 | 미디어 인덱스 CLI |
| `RI_SSH_HOST` | *(빈 값)* | 인덱스를 가진 호스트 — `RI_LOCAL_MARK` 와 함께 쓴다 |
| `RI_LOCAL_MARK` | *(빈 값)* | 인덱스가 있는 머신에만 존재하는 디렉터리. 로컬에 없고 `RI_SSH_HOST` 가 있으면 `ssh` 로 위임 |
| `RI_REMOTE_CMD` | *(빈 값)* | 원격에서 이 스크립트를 부르는 명령 (ex) `python3 /path/to/ri.py`) — `RI_SSH_HOST` 와 함께 필수 |
| `RI_UPDATE_CMD` | *(빈 값)* | `/ri update` 가 tmux 세션 `ri-index` 에서 돌릴 증분 재색인 명령 — `update` 에 필수 |
| `RI_INDEXER_PAT` | *(빈 값)* | 실행 중인 인덱서의 `pgrep -f` 패턴 — 일치하면 `update` 가 중복 기동을 거부(rc 3) |
| `RI_SSH` · `RI_PGREP` · `RI_TMUX` | `ssh` · `pgrep` · `tmux` | 실행 파일 |

종료 코드: `0` 정상 · `1` 백엔드 실패 · `2` 사용법·설정 누락 · `3` 인덱서 실행 중.

---

## 테스트

```bash
npm test        # tdd/cases/ri-search-plugin.test.js 포함 — 가짜 rindex/digup 으로 실제 인덱스를 건드리지 않음
```

---

## 라이선스

[MIT](../LICENSE)
