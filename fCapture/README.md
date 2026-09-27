---
title: fCapture Claude Code Plugin
description: fCapture CLI를 MCP로 노출하여 macOS 화면·윈도우·영역을 캡처하는 Claude Code 플러그인
date: 2026.09.09
---

A Claude Code plugin that captures macOS screens, windows, and regions through the
[fCapture](https://github.com/Finfra/fCapture) command-line tool.

Unlike the other plugins in this repository (fBanner, fBoard, fGoogleSheet, fQRGen, fSnippet,
fWarrange), fCapture is **not a REST app** — there is no server and no port to allocate.
The MCP server spawns the `fcapture` binary directly with `child_process.execFile`.

---

# Plugin Structure

```
fCapture/
├── plugin.json          # Plugin manifest (registers the `fcapture` MCP server)
├── mcp-server.js        # stdio JSON-RPC MCP server, wraps the fCapture CLI
└── skills/
    └── fcapture/
        └── SKILL.md     # Capture skill
```

---

# MCP Tools

| Tool                 | fCapture invocation                        | Required input               |
| :------------------- | :----------------------------------------- | :--------------------------- |
| `capture_screen`     | `-t all` or `-t screen:N`                   | —                            |
| `capture_window`     | `-t window_active` (or other window modes)  | —                            |
| `capture_region`     | `-t region_static --region x,y,w,h`         | `x`, `y`, `width`, `height`  |
| `capture_with_preset`| `fcapture <config.json>`                    | `config_path`                |
| `get_version`        | `--version`                                 | —                            |

## Common inputs

| Input    | Maps to           | Notes                                                          |
| :------- | :---------------- | :------------------------------------------------------------- |
| `path`   | `-p, --path`      | Save directory. Defaults to `~/Desktop`                         |
| `format` | `-F, --format`    | **Filename template**, not an image format. `%d` `%T` `%target` `%id` |
| `relay`  | `--relay N`       | `capture_window` only — delay N seconds before capturing        |
| `mode`   | `-t, --target`    | `capture_window` only — see below                               |

`capture_window` modes: `window_active` (default), `window_pointer`, `window_flash`, `scroll_capture`.

## Return value

Every capture tool appends `--result onlyPath`, so the tools return **saved file paths only**.
Image bytes are never written to stdout. `capture_screen` with no `display` captures every
display and returns one path per display in `paths`.

```json
{"paths": ["/tmp/shot_20260909_002518_screen1_1.png"], "path": "/tmp/shot_20260909_002518_screen1_1.png"}
```

## Preset file format

`capture_with_preset` takes a JSON file in fCapture's own settings format:

```json
{
    "capturePath": "~/Desktop",
    "target": "region_static",
    "fileFormat": "region_%d_%T",
    "staticRegion": { "x": 100, "y": 100, "width": 800, "height": 600 }
}
```

---

# Design Notes

* **`region_user` is not exposed.** That target waits for the user to drag a selection with the
  mouse, which would hang an MCP call forever. `capture_with_preset` also rejects preset files
  whose `target` is `region_user`.
* **CLI calls are serialized.** Running several `fcapture` processes at once makes *all* of them
  fail with `스크린 녹화 권한이 필요합니다` (screen recording permission required) even when the
  permission is granted — measured 2026-09-09, 3-way parallel failed on every run while the same
  commands run sequentially succeeded on every run. Because the message misattributes the cause,
  the MCP server queues invocations so only one `fcapture` process runs at a time.
* **Errors are never swallowed.** A non-zero exit code or any stderr output is returned as an
  error message containing the exact command, the exit code, and the CLI's own stderr. When the
  text looks permission-related, the message appends the System Settings path the user needs.
* **Binary lookup order:** `FCAPTURE_BIN` → `/opt/homebrew/bin/fcapture` →
  `/usr/local/bin/fcapture` → `~/.bin/fCapture`. Nothing is hardcoded.
  If `FCAPTURE_BIN` is set but not executable, the server returns an error instead of falling back to another install.

---

# Prerequisites

| Requirement          | How to satisfy                                                              |
| :------------------- | :-------------------------------------------------------------------------- |
| fCapture CLI         | `brew install finfra/f/fcapture` — verify with `fcapture --version`         |
| Screen recording     | System Settings → Privacy & Security → Screen Recording → allow the host app |
| Node.js              | Required to run `mcp-server.js`                                              |

> The screen recording permission belongs to the process that **hosts** the MCP server
> (your terminal, or Claude Code). After granting it, quit and relaunch that app.

---

# Installation

## Option 1: Plugin Install (Recommended)

```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fcapture@f-claude-plugins
```

## Option 2: Manual MCP registration

```bash
claude mcp add fcapture -- node /path/to/f-claude-plugins/fCapture/mcp-server.js
```

---

# Verification

```bash
# 1. The CLI itself
fcapture --version

# 2. The MCP server, driven directly over stdio
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_version","arguments":{}}}' \
  | node fCapture/mcp-server.js

# 3. Registered servers
claude mcp list
```

---

# License

MIT
