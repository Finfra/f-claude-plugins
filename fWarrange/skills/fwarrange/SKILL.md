---
name: fwarrange
description: "Save and restore macOS window layouts via fWarrange REST API"
argument-hint: "[capture|restore|list|detail|rename|delete|delete-all|remove-windows|windows|apps|status|locale|modes|mode-create|mode-activate|mode-delete|cli|settings|excluded-apps|default-layout|normalize-rules|restore-stats] [options]"
title: fWarrange Window Layout Management
date: 2026-06-20
---

Save and restore macOS window positions and sizes, manage context-switching modes, and configure the fWarrange helper via the fWarrange REST API (v2).

# Input

$ARGUMENTS

If no arguments are provided, ask the user what action they want to perform.

**Layout actions**
* **capture**: Save the current window layout
* **restore [name]**: Restore a saved layout
* **list**: List all saved layouts
* **detail [name]**: Get layout details
* **rename [name] [newName]**: Rename a layout
* **delete [name]**: Delete a layout
* **delete-all**: Delete all layouts
* **remove-windows [name] [ids...]**: Remove specific windows from a layout

**Window / system actions**
* **windows**: Show current windows
* **apps**: Show running applications
* **status**: Check accessibility permission status

**Mode actions** (context switching — restore layout + launch required apps)
* **modes**: List all modes
* **mode-create [name]**: Create a new mode
* **mode-activate [name]**: Activate a mode
* **mode-delete [name]**: Delete a mode

**Helper / settings actions**
* **cli [status|version|pause|resume|restart|quit]**: Manage the fWarrangeCli helper
* **settings [general|restore|api|advanced]**: Read or update app settings
* **excluded-apps**: View / edit apps excluded from restore
* **default-layout [name]**: Get or set the default layout
* **normalize-rules**: View / edit title-normalization ruleset (advanced)
* **restore-stats**: View / reset window-matching statistics (advanced)
* **locale [--set=code]**: Get or change app language (alias of settings general)

# Prerequisites

The fWarrange REST API server (`http://localhost:3016`) is provided by the **fWarrangeCli** helper — a non-sandboxed macOS agent distributed via Homebrew (not the GUI app):

| Server         | How to Run                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `fWarrangeCli` | `brew install finfra/tap/fwarrange-cli` → `brew services start finfra/tap/fwarrange-cli` (REST enabled by default) |

**Service root:** `http://localhost:3016/api/v2`

# Execution Steps

1. **Check Server**: Verify the fWarrange server is running.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3016/
   ```
   A `200` response means the server is up. (The root health endpoint is `GET /`; a versioned `GET /api/v2/health` is also available.)
   If the server is not responding, inform the user with the start command:
   > "fWarrange REST API server (fWarrangeCli) is not running. Start it via Homebrew:"
   > ```bash
   > brew services start finfra/tap/fwarrange-cli
   > ```
   > "Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Execute Action** based on $ARGUMENTS (see endpoint groups below).

3. **Report**: Inform the user of the result (layout name, window count, success/failure details).

---

# Layouts

## `capture` or `capture --name=<name>` — Save current window layout
```bash
# Default name (auto-generated timestamp)
curl -s -X POST http://localhost:3016/api/v2/capture \
  -H 'Content-Type: application/json' | python3 -m json.tool

# With custom name
curl -s -X POST http://localhost:3016/api/v2/capture \
  -H 'Content-Type: application/json' \
  -d '{"name":"<LAYOUT_NAME>"}' | python3 -m json.tool

# Filter specific apps only
curl -s -X POST http://localhost:3016/api/v2/capture \
  -H 'Content-Type: application/json' \
  -d '{"name":"<LAYOUT_NAME>","filterApps":["Safari","iTerm2"]}' | python3 -m json.tool
```

## `restore <name>` — Restore a saved layout
```bash
# Default settings
curl -s -X POST http://localhost:3016/api/v2/layouts/<NAME>/restore \
  -H 'Content-Type: application/json' | python3 -m json.tool

# Custom retry + matching settings
curl -s -X POST http://localhost:3016/api/v2/layouts/<NAME>/restore \
  -H 'Content-Type: application/json' \
  -d '{"maxRetries":5,"retryInterval":0.5,"minimumScore":30,"enableParallel":true}' | python3 -m json.tool
```
**Matching mode** (Issue72_5): add `"mode":"strict|normal|loose"` to the body to control fallback behavior.
* `strict`: score ≥70, no geometric fallback
* `normal`: user `minimumScore` (default 30) + distance/area weighting (default)
* `loose`: score ≥30, 1:N matching, Moom-style fallback on total miss

The restore response includes per-window success/failure detail (Issue74).

## `list` — List all saved layouts
```bash
curl -s http://localhost:3016/api/v2/layouts | python3 -m json.tool
```

## `detail <name>` — Get layout details
```bash
curl -s http://localhost:3016/api/v2/layouts/<NAME> | python3 -m json.tool
```

## `rename <name> <newName>` — Rename a layout
```bash
curl -s -X PUT http://localhost:3016/api/v2/layouts/<NAME> \
  -H 'Content-Type: application/json' \
  -d '{"newName":"<NEW_NAME>"}' | python3 -m json.tool
```

## `delete <name>` — Delete a specific layout
```bash
curl -s -X DELETE http://localhost:3016/api/v2/layouts/<NAME> | python3 -m json.tool
```

## `delete-all` — Delete all layouts (requires confirmation)
```bash
curl -s -X DELETE http://localhost:3016/api/v2/layouts \
  -H 'X-Confirm-Delete-All: true' | python3 -m json.tool
```
**WARNING**: Always confirm with the user before executing this command.

## `remove-windows <name> <id1> <id2> ...` — Remove specific windows from a layout
```bash
curl -s -X POST http://localhost:3016/api/v2/layouts/<NAME>/windows/remove \
  -H 'Content-Type: application/json' \
  -d '{"windowIds":[<ID1>,<ID2>]}' | python3 -m json.tool
```

---

# Windows / System

## `windows` — Show current windows
```bash
# All windows
curl -s http://localhost:3016/api/v2/windows/current | python3 -m json.tool

# Filter by specific apps
curl -s "http://localhost:3016/api/v2/windows/current?filterApps=Safari,iTerm2" | python3 -m json.tool
```

## `apps` — Show running applications
```bash
curl -s http://localhost:3016/api/v2/windows/apps | python3 -m json.tool
```

## `status` — Check accessibility permission
```bash
curl -s http://localhost:3016/api/v2/status/accessibility | python3 -m json.tool
```

---

# Modes (context switching)

A **mode** bundles a layout with a set of required apps. Activating a mode restores the layout and launches any apps that are not running.

## `modes` — List all modes
```bash
curl -s http://localhost:3016/api/v2/modes | python3 -m json.tool
```

## `mode-create <name>` — Create a new mode
```bash
curl -s -X POST http://localhost:3016/api/v2/modes \
  -H 'Content-Type: application/json' \
  -d '{"name":"coding","icon":"💻","shortcut":"⌃⌥1","layout":"coding-setup","requiredApps":["Xcode","iTerm2"]}' | python3 -m json.tool
```
Only `name` is required. `icon`, `shortcut`, `layout`, `requiredApps` are optional.

## `mode-detail <name>` — Get mode detail
```bash
curl -s http://localhost:3016/api/v2/modes/<NAME> | python3 -m json.tool
```

## `mode-update <name>` — Update a mode (partial)
```bash
curl -s -X PATCH http://localhost:3016/api/v2/modes/<NAME> \
  -H 'Content-Type: application/json' \
  -d '{"layout":"new-layout","requiredApps":["Safari"]}' | python3 -m json.tool
```

## `mode-activate <name>` — Activate a mode (restore layout + run apps)
```bash
curl -s -X POST http://localhost:3016/api/v2/modes/<NAME>/activate | python3 -m json.tool
```

## `mode-delete <name>` — Delete a mode
```bash
curl -s -X DELETE http://localhost:3016/api/v2/modes/<NAME> | python3 -m json.tool
```

---

# CLI Helper management

## `cli status` — Helper runtime status
```bash
curl -s http://localhost:3016/api/v2/cli/status | python3 -m json.tool
```

## `cli version` — Helper version
```bash
curl -s http://localhost:3016/api/v2/cli/version | python3 -m json.tool
```

## `cli pause` / `cli resume` — Pause or resume the REST API (Issue229_4)
```bash
curl -s -X POST http://localhost:3016/api/v2/cli/pause  | python3 -m json.tool
curl -s -X POST http://localhost:3016/api/v2/cli/resume | python3 -m json.tool
```

## `cli restart` — Restart the helper (Issue229_4)
```bash
curl -s -X POST http://localhost:3016/api/v2/cli/restart | python3 -m json.tool
```

## `cli quit` — Quit the helper
```bash
curl -s -X POST http://localhost:3016/api/v2/cli/quit | python3 -m json.tool
```
**WARNING**: `quit` stops the helper; the REST API will no longer respond. Confirm with the user first.

---

# Settings

## `settings` — Read all settings
```bash
curl -s http://localhost:3016/api/v2/settings | python3 -m json.tool
```

## `settings general` — General tab (language, theme, data storage, launch-at-login)
```bash
# Read
curl -s http://localhost:3016/api/v2/settings/general | python3 -m json.tool

# Update (any subset of fields)
curl -s -X PATCH http://localhost:3016/api/v2/settings/general \
  -H 'Content-Type: application/json' \
  -d '{"appLanguage":"ko","theme":"system","launchAtLogin":true}' | python3 -m json.tool
```

## `settings restore` — Restore tab (retry / matching defaults)
```bash
# Read
curl -s http://localhost:3016/api/v2/settings/restore | python3 -m json.tool

# Update
curl -s -X PATCH http://localhost:3016/api/v2/settings/restore \
  -H 'Content-Type: application/json' \
  -d '{"maxRetries":5,"retryInterval":0.5,"minimumMatchScore":30,"enableParallelRestore":true}' | python3 -m json.tool
```

## `settings api` — REST API server settings
```bash
curl -s http://localhost:3016/api/v2/settings/api | python3 -m json.tool
curl -s -X PATCH http://localhost:3016/api/v2/settings/api \
  -H 'Content-Type: application/json' -d '{"<FIELD>":"<VALUE>"}' | python3 -m json.tool
```

## `settings advanced` — Advanced tab settings
```bash
curl -s http://localhost:3016/api/v2/settings/advanced | python3 -m json.tool
curl -s -X PATCH http://localhost:3016/api/v2/settings/advanced \
  -H 'Content-Type: application/json' -d '{"<FIELD>":"<VALUE>"}' | python3 -m json.tool
```

## `settings factory-reset` — Reset all settings to defaults
```bash
curl -s -X POST http://localhost:3016/api/v2/settings/factory-reset | python3 -m json.tool
```
**WARNING**: Wipes all settings. Confirm with the user first.

## `excluded-apps` — Apps excluded from restore
```bash
# List
curl -s http://localhost:3016/api/v2/settings/restore/excluded-apps | python3 -m json.tool

# Add apps
curl -s -X POST http://localhost:3016/api/v2/settings/restore/excluded-apps \
  -H 'Content-Type: application/json' -d '{"apps":["Xcode"]}' | python3 -m json.tool

# Remove apps
curl -s -X DELETE http://localhost:3016/api/v2/settings/restore/excluded-apps \
  -H 'Content-Type: application/json' -d '{"apps":["Xcode"]}' | python3 -m json.tool

# Replace whole list
curl -s -X PUT http://localhost:3016/api/v2/settings/restore/excluded-apps \
  -H 'Content-Type: application/json' -d '{"apps":["Activity Monitor","System Settings","Finder"]}' | python3 -m json.tool

# Reset to defaults
curl -s -X POST http://localhost:3016/api/v2/settings/restore/excluded-apps/reset | python3 -m json.tool
```

## `default-layout` — Get or set the default layout
```bash
# Get
curl -s http://localhost:3016/api/v2/settings/default-layout | python3 -m json.tool

# Set
curl -s -X PUT http://localhost:3016/api/v2/settings/default-layout \
  -H 'Content-Type: application/json' -d '{"name":"<LAYOUT_NAME>"}' | python3 -m json.tool
```

## `locale` — Get current app language (alias of settings general)
```bash
curl -s http://localhost:3016/api/v2/settings/general | python3 -m json.tool
# The `appLanguage` field shows the current locale.
```

## `locale --set=<code>` — Change app language
```bash
curl -s -X PATCH http://localhost:3016/api/v2/settings/general \
  -H 'Content-Type: application/json' \
  -d '{"appLanguage":"<LANG_CODE>"}' | python3 -m json.tool
```
Supported: `system`, `ko`, `en`, `ja`, `ar`, `zh-Hans`, `zh-Hant`, `fr`, `de`, `hi`, `es`

---

# Advanced (matching tuning)

## `normalize-rules` — Title-normalization ruleset (Issue72_3)
Absorbs dynamic window titles (browser/editor/terminal/chat) to recover `exactTitle` (90-point) matching.
```bash
# View ruleset
curl -s http://localhost:3016/api/v2/normalize-rules | python3 -m json.tool

# Replace ruleset
curl -s -X PUT http://localhost:3016/api/v2/normalize-rules \
  -H 'Content-Type: application/json' -d '{"rules":[...]}' | python3 -m json.tool

# Reset to built-in ruleset
curl -s -X DELETE http://localhost:3016/api/v2/normalize-rules | python3 -m json.tool
```

## `restore-stats` — Window-matching statistics (Issue72_1)
```bash
# View accumulated stats
curl -s http://localhost:3016/api/v2/restore-stats | python3 -m json.tool

# Reset (new baseline)
curl -s -X DELETE http://localhost:3016/api/v2/restore-stats | python3 -m json.tool
```

---

# API Reference (documented endpoints)

| Method | Endpoint                                          | Description                          |
| ------ | ------------------------------------------------- | ------------------------------------ |
| GET    | `/`                                               | Health check (root)                  |
| GET    | `/api/v2/health`                                  | Health check (versioned)             |
| GET    | `/api/v2/layouts`                                 | List all layouts                     |
| DELETE | `/api/v2/layouts`                                 | Delete all layouts (*)               |
| GET    | `/api/v2/layouts/{name}`                          | Get layout details                   |
| PUT    | `/api/v2/layouts/{name}`                          | Rename a layout                      |
| DELETE | `/api/v2/layouts/{name}`                          | Delete a layout                      |
| POST   | `/api/v2/capture`                                 | Capture current layout               |
| POST   | `/api/v2/layouts/{name}/restore`                  | Restore a layout (+ matching mode)   |
| POST   | `/api/v2/layouts/{name}/windows/remove`           | Remove specific windows              |
| GET    | `/api/v2/windows/current`                         | List current windows                 |
| GET    | `/api/v2/windows/apps`                            | List running apps                    |
| GET    | `/api/v2/status/accessibility`                    | Check accessibility status           |
| GET    | `/api/v2/modes`                                   | List modes                           |
| POST   | `/api/v2/modes`                                   | Create a mode                        |
| GET    | `/api/v2/modes/{name}`                            | Get mode detail                      |
| PATCH  | `/api/v2/modes/{name}`                            | Update a mode                        |
| DELETE | `/api/v2/modes/{name}`                            | Delete a mode                        |
| POST   | `/api/v2/modes/{name}/activate`                   | Activate a mode                      |
| GET    | `/api/v2/cli/status`                              | Helper status                        |
| GET    | `/api/v2/cli/version`                             | Helper version                       |
| POST   | `/api/v2/cli/pause`                               | Pause REST API                       |
| POST   | `/api/v2/cli/resume`                              | Resume REST API                      |
| POST   | `/api/v2/cli/restart`                             | Restart helper                       |
| POST   | `/api/v2/cli/quit`                                | Quit helper (*)                      |
| GET    | `/api/v2/settings`                                | Read all settings                    |
| GET    | `/api/v2/settings/general`                        | General settings (incl. appLanguage) |
| PATCH  | `/api/v2/settings/general`                        | Update general settings              |
| GET    | `/api/v2/settings/restore`                        | Restore tab settings                 |
| PATCH  | `/api/v2/settings/restore`                        | Update restore settings              |
| GET    | `/api/v2/settings/api`                            | REST API settings                    |
| PATCH  | `/api/v2/settings/api`                            | Update REST API settings             |
| GET    | `/api/v2/settings/advanced`                       | Advanced settings                    |
| PATCH  | `/api/v2/settings/advanced`                       | Update advanced settings             |
| POST   | `/api/v2/settings/factory-reset`                  | Factory reset (*)                    |
| GET    | `/api/v2/settings/restore/excluded-apps`          | List excluded apps                   |
| POST   | `/api/v2/settings/restore/excluded-apps`          | Add excluded apps                    |
| DELETE | `/api/v2/settings/restore/excluded-apps`          | Remove excluded apps                 |
| PUT    | `/api/v2/settings/restore/excluded-apps`          | Replace excluded apps                |
| POST   | `/api/v2/settings/restore/excluded-apps/reset`    | Reset excluded apps                  |
| GET    | `/api/v2/settings/default-layout`                 | Get default layout                   |
| PUT    | `/api/v2/settings/default-layout`                 | Set default layout                   |
| GET    | `/api/v2/normalize-rules`                         | Get title-normalize ruleset          |
| PUT    | `/api/v2/normalize-rules`                         | Replace ruleset                      |
| DELETE | `/api/v2/normalize-rules`                         | Reset to built-in ruleset            |
| GET    | `/api/v2/restore-stats`                           | Get matching statistics              |
| DELETE | `/api/v2/restore-stats`                           | Reset statistics                     |

(*) Destructive — confirm with the user (delete-all also requires `X-Confirm-Delete-All: true` header).

> The full v2 surface (57 endpoints) additionally includes machine-to-machine endpoints — `/paidapp/*` (paidApp lifecycle), `/ui/state`, `/operations`, `/changes`, `/shutdown`, `/settings/shortcuts` — used by the GUI app and automation, not typically driven by hand. See `api/openapi_v2.yaml` for the complete spec.

**Response format:**
* Success: `{"status": "ok", "data": {...}}`
* Error: `{"status": "error", "error": "..."}`

# Options

* `--name=<layout-name>`: Specify layout name for capture/restore
* `--server=<url>`: Change server address (default: `http://localhost:3016`)
* `--set=<code>`: Set locale language code

# Examples

```
/fwarrange:fwarrange capture
/fwarrange:fwarrange capture --name=coding-setup
/fwarrange:fwarrange restore my-workspace
/fwarrange:fwarrange list
/fwarrange:fwarrange detail my-workspace
/fwarrange:fwarrange rename old-name new-name
/fwarrange:fwarrange delete my-workspace
/fwarrange:fwarrange delete-all
/fwarrange:fwarrange remove-windows my-workspace 14205 5032
/fwarrange:fwarrange windows
/fwarrange:fwarrange apps
/fwarrange:fwarrange status
/fwarrange:fwarrange modes
/fwarrange:fwarrange mode-create coding
/fwarrange:fwarrange mode-activate coding
/fwarrange:fwarrange mode-delete coding
/fwarrange:fwarrange cli status
/fwarrange:fwarrange cli version
/fwarrange:fwarrange settings general
/fwarrange:fwarrange excluded-apps
/fwarrange:fwarrange default-layout my-workspace
/fwarrange:fwarrange normalize-rules
/fwarrange:fwarrange restore-stats
/fwarrange:fwarrange locale
/fwarrange:fwarrange locale --set=en
```
