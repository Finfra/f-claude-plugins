---
title: fcapture
description: "Capture macOS screens, windows, and regions via the fCapture CLI"
argument-hint: "[screen|window|region|version] [options]"
date: 2026.09.09
---

# Input

$ARGUMENTS

* If no arguments are provided, capture the active window (`window_active`) and report the path.

# Prerequisites

fCapture is a **CLI, not a REST app** — there is no server to start and no port to check.

1. **Verify the binary is installed** (once per session is enough):
   ```bash
   fcapture --version
   ```
   If the command is not found, tell the user how to install it and stop:
   > "fCapture CLI is not installed. Install it with:"
   > ```bash
   > brew install finfra/f/fcapture
   > ```
   Do NOT install it automatically. Wait for the user to confirm.

2. **Screen recording permission** belongs to the process hosting this session (terminal or
   Claude Code), not to fCapture itself. If a capture fails with
   `스크린 녹화 권한이 필요합니다`, direct the user to
   System Settings → Privacy & Security → Screen Recording, then have them quit and relaunch
   the host app.

# Execution Steps

1. **Pick the target** from the user's request:

   | Request                          | Command                                                        |
   | :------------------------------- | :------------------------------------------------------------- |
   | Active window (default)          | `fcapture -t window_active -R onlyPath`                        |
   | Window under the mouse pointer   | `fcapture -t window_pointer -R onlyPath`                       |
   | A long/scrolling window          | `fcapture -t scroll_capture -R onlyPath`                       |
   | All displays                     | `fcapture -t all -R onlyPath`                                  |
   | One display                      | `fcapture -t screen:1 -R onlyPath`                             |
   | Fixed region                     | `fcapture -t region_static --region 100,100,800,600 -R onlyPath` |
   | Saved preset                     | `fcapture <config.json>`                                       |

2. **Add options** as requested:
   ```bash
   fcapture -t window_active -p ~/Downloads -F shot_%d_%T --relay 3 -R onlyPath
   ```
   * `-p` save directory (default `~/Desktop`)
   * `-F` filename template — `%d` date, `%T` time, `%target` target name, `%id` index
   * `--relay N` wait N seconds before capturing (use this when the user needs to switch windows first)

3. **Verify the result**: `-R onlyPath` prints the saved path(s), one per line. Confirm the file
   exists before reporting success.
   ```bash
   ls -lh "<returned path>"
   ```

4. **Report**: give the user the file path and size. Do not embed the image bytes in the response.

# Rules

* **Never run `-t region_user`.** It waits for an interactive mouse drag and will hang the session.
  If the user wants to pick an area by hand, tell them to run `fcapture -t region_user` themselves
  in a terminal.
* **Run one capture at a time.** Parallel `fcapture` processes all fail with a misleading
  `스크린 녹화 권한이 필요합니다` error (measured 2026-09-09). Chain captures sequentially.
* **Do not claim a capture succeeded without checking.** Exit code 0 plus an existing file is the
  evidence; report the CLI's stderr verbatim on failure.

# CLI Reference

| Option              | Meaning                                                                     |
| :------------------ | :--------------------------------------------------------------------------- |
| `-t, --target`      | `window_pointer` / `window_active` / `window_flash` / `scroll_capture` / `screen:N` / `all` / `region_static` / `region_user` |
| `-p, --path`        | Save directory (default `~/Desktop`)                                         |
| `-F, --format`      | Filename template (`%d`, `%T`, `%target`, `%id`)                             |
| `--region x,y,w,h`  | Coordinates, required by `region_static`                                     |
| `--relay N`         | Delay N seconds                                                              |
| `-R, --result`      | `text` (default) / `json` / `onlyPath`                                       |
| `--shadow` / `--no-shadow` | Include or exclude the window shadow (default: excluded)              |
| `-v, --version`     | Print version                                                                |

> The same capabilities are exposed as MCP tools (`capture_screen`, `capture_window`,
> `capture_region`, `capture_with_preset`, `get_version`) by `fCapture/mcp-server.js`.
