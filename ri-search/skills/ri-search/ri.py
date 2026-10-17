#!/usr/bin/env python3
# ri.py — /ri 로컬 의미 검색 래퍼: rindex(텍스트·코드·문서) + DigUp(스크린샷·이미지·소리)
#
# 엔진(rindex·DigUp)은 이 플러그인에 들어 있지 않다 — 여기는 두 CLI 를 부르고 결과를 요약할 뿐이다.
# 개인 값(호스트·볼륨·경로)은 전부 환경 변수로 받는다. 설정이 없으면 PATH 의 `rindex`·`digup` 을 로컬에서 부른다.
#
# 사용: ri.py search <질문…> [-k N] [--kind K,K] [--ext a,b] [--root R] [--code] [--sort S] [--media] [--json]
#       ri.py status · ri.py update
# rc: 0 정상 · 1 백엔드 실패 · 2 사용법·환경 · 3 인덱서 실행 중이라 update 거부
#
# 환경 변수 (모두 선택)
#   RI_RINDEX       텍스트 인덱스 CLI (기본 `rindex`)
#   RI_DIGUP        미디어 인덱스 CLI (기본 PATH 의 `digup`, macOS 는 DigUp.app 번들 도우미)
#   RI_LOCAL_MARK   인덱스가 이 머신에 있다는 표지 디렉터리. 없으면 아래 RI_SSH_HOST 로 위임 (미설정이면 항상 로컬)
#   RI_SSH_HOST     인덱스를 가진 원격 호스트 — RI_LOCAL_MARK 가 이 머신에 없을 때 ssh 로 위임
#   RI_REMOTE_CMD   원격에서 이 스크립트를 부르는 명령 접두 (ex) `python3 /opt/ri/ri.py`) — RI_SSH_HOST 가 있으면 필수
#   RI_UPDATE_CMD   `update` 가 tmux 세션에서 돌릴 증분 갱신 명령 — `update` 에 필수
#   RI_INDEXER_PAT  실행 중인 인덱서를 찾는 pgrep -f 패턴 — 있으면 `update` 중복 기동을 거부
#   RI_SSH · RI_PGREP · RI_TMUX   각 실행 파일 경로 (기본 ssh · pgrep · tmux)
import argparse
import datetime
import json
import os
import re
import shlex
import shutil
import subprocess
import sys

HOME = os.path.expanduser("~")
RINDEX = os.environ.get("RI_RINDEX", "rindex")
DIGUP_APP = "/Applications/DigUp.app/Contents/Helpers/digup"
DIGUP = os.environ.get("RI_DIGUP") or shutil.which("digup") or DIGUP_APP
PGREP = os.environ.get("RI_PGREP", "pgrep")
TMUX = os.environ.get("RI_TMUX", "tmux")
SSH = os.environ.get("RI_SSH", "ssh")
SSH_HOST = os.environ.get("RI_SSH_HOST", "")
REMOTE_CMD = os.environ.get("RI_REMOTE_CMD", "")
LOCAL_MARK = os.environ.get("RI_LOCAL_MARK", "")
UPDATE_CMD = os.environ.get("RI_UPDATE_CMD", "")
INDEXER_PAT = os.environ.get("RI_INDEXER_PAT", "")
MEDIA_KINDS = "screenshot,image,audio,video"
SNIP = 160


def short(p):
    return "~" + p[len(HOME):] if p.startswith(HOME + "/") else p


def clip(s, n=SNIP):
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= n else s[:n] + "…"


def have(cmd):
    return os.access(cmd, os.X_OK) if os.sep in cmd else shutil.which(cmd) is not None


def run_json(cmd, name):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True)
    except FileNotFoundError:
        sys.exit(f"{name} 실행 파일 없음: {cmd[0]}")
    if r.returncode != 0:
        tail = "\n".join(r.stderr.strip().splitlines()[-3:])
        sys.exit(f"{name} 실패 (rc {r.returncode}): {tail}")
    try:
        return json.loads(r.stdout or "[]")
    except json.JSONDecodeError:
        sys.exit(f"{name} 출력이 JSON 이 아님: {clip(r.stdout, 200)}")


def fmt_ri(rows):
    out = []
    for i, x in enumerate(rows, 1):
        loc = f" [{x['loc']}]" if x.get("loc") else ""
        cp = f" (사본 {x['copies']})" if x.get("copies") else ""
        out.append(f"{i}. {x.get('score', 0):.3f}  {short(x['path'])}{loc} · {x.get('mtime', '')}{cp}")
        out.append(f"   {clip(x.get('snippet'))}")
    return out


def fmt_dg(rows):
    out = []
    for i, x in enumerate(rows, 1):
        d = datetime.date.fromtimestamp(x["modified"]).isoformat() if x.get("modified") else ""
        out.append(f"{i}. {x.get('cosine', 0):.3f}  [{x.get('kind', '?')}] {short(x['path'])} · {d}")
        out.append(f"   {clip(x.get('excerpt'))}")
    return out


def search(a):
    q = " ".join(a.query)
    ri, dg, notes = None, None, []
    if a.code and re.search(r"[가-힣]", q):
        notes.append("⚠️ --code 는 영어 질의가 정확함 (코드 검색 프롬프트가 영어 기준)")
    if not a.kind:
        cmd = [RINDEX, "search", q, "-k", str(a.k), "--json"]
        for opt in ("ext", "root", "sort"):
            v = getattr(a, opt)
            if v:
                cmd += [f"--{opt}", v]
        if a.code:
            cmd.append("--code")
        ri = run_json(cmd, "rindex")
    # 미디어 지정(--kind) · 병행(--media) · rindex 0건일 때만 DigUp — DigUp 정렬은 손댈 수 없어 캡처 이미지가 문서를 밀어내므로 기본 병행하지 않는다
    if a.kind or a.media or not ri:
        if have(DIGUP):
            kinds = a.kind or (MEDIA_KINDS if a.media else None)
            cmd = [DIGUP, "search", q, "-n", str(a.k), "--json"] + (["--kind", kinds] if kinds else [])
            dg = run_json(cmd, "DigUp")
        elif a.kind or a.media:
            sys.exit(f"DigUp 실행 파일 없음: {DIGUP} — RI_DIGUP 로 지정하거나 --kind·--media 를 빼라")
        else:
            notes.append(f"DigUp 없음({DIGUP}) — rindex 0건이라 미디어 인덱스 병행을 건너뜀")
    if a.json:
        print(json.dumps({"rindex": ri, "digup": dg}, ensure_ascii=False, indent=1))
        return 0
    out = notes[:]
    if ri is not None:
        out.append(f"## rindex (텍스트·코드·문서) — {len(ri)}건")
        out += fmt_ri(ri) or ["(결과 없음)"]
    if dg is not None:
        out.append(f"## DigUp (스크린샷·이미지·소리) — {len(dg)}건")
        out += fmt_dg(dg) or ["(결과 없음)"]
    print("\n".join(out))
    return 0


def status(_a):
    for name, cmd in (("rindex", [RINDEX, "stats"]), ("DigUp", [DIGUP, "status"])):
        print(f"## {name}")
        if not have(cmd[0]):
            print(f"(실행 파일 없음: {cmd[0]})")
            continue
        r = subprocess.run(cmd, capture_output=True, text=True)
        body = [l for l in (r.stdout + r.stderr).splitlines() if "Warning" not in l and "warn(" not in l]
        print("\n".join(body) if body else f"(출력 없음 · rc {r.returncode})")
    return 0


def update(_a):
    if not UPDATE_CMD:
        print("RI_UPDATE_CMD 가 비어 있음 — 증분 갱신 명령(ex) `rindex scan && rindex index`)을 환경 변수로 지정", file=sys.stderr)
        return 2
    if INDEXER_PAT and subprocess.run([PGREP, "-f", INDEXER_PAT], capture_output=True).returncode == 0:
        print("인덱서가 이미 실행 중 — 중복 기동 거부. 진행은 /ri status", file=sys.stderr)
        return 3
    if subprocess.run([TMUX, "has-session", "-t", "ri-index"], capture_output=True).returncode == 0:
        cmd = [TMUX, "send-keys", "-t", "ri-index", UPDATE_CMD, "Enter"]
    else:
        cmd = [TMUX, "new-session", "-d", "-s", "ri-index", UPDATE_CMD]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"tmux 기동 실패: {r.stderr.strip()}")
    print("증분 갱신을 tmux ri-index 에서 시작함 — 화면 tmux attach -t ri-index · 진행 /ri status")
    return 0


def main(argv):
    p = argparse.ArgumentParser(prog="ri", description="로컬 의미 검색 (rindex · DigUp)")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search")
    s.add_argument("query", nargs="+")
    s.add_argument("-k", type=int, default=8)
    s.add_argument("--kind", help="DigUp 만: screenshot,image,pdf,doc,audio,video")
    s.add_argument("--ext")
    s.add_argument("--root")
    s.add_argument("--sort", choices=["importance", "relevance", "recent"])
    s.add_argument("--code", action="store_true")
    s.add_argument("--media", action="store_true", help="DigUp 미디어 결과를 뒤에 별도 블록으로 병행")
    s.add_argument("--json", action="store_true")
    sub.add_parser("status")
    sub.add_parser("update")
    a = p.parse_args(argv)

    # 인덱스가 다른 머신에 있으면 ssh 로 위임한다 — 표지(RI_LOCAL_MARK)와 호스트(RI_SSH_HOST)를 둘 다 줬을 때만
    if LOCAL_MARK and SSH_HOST and not os.path.isdir(LOCAL_MARK) and not os.environ.get("RI_NO_SSH"):
        if not REMOTE_CMD:
            print("RI_SSH_HOST 가 있으면 RI_REMOTE_CMD(원격에서 ri.py 를 부르는 명령)도 필요함", file=sys.stderr)
            return 2
        remote = f"RI_NO_SSH=1 {REMOTE_CMD} " + shlex.join(argv)
        return subprocess.run([SSH, "-o", "BatchMode=yes", SSH_HOST, remote]).returncode
    return {"search": search, "status": status, "update": update}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
