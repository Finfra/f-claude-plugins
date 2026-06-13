---
name: fwarrange
description: "Save and restore macOS window layouts via fWarrange REST API"
argument-hint: "[capture|restore|list|detail|rename|delete|delete-all|remove-windows|windows|apps|status|locale] [options]"
title: fWarrange Window Layout Management
date: 2026-06-13
---

Save and restore macOS window positions and sizes via the fWarrange REST API.

# Input

$ARGUMENTS

If no arguments are provided, ask the user what action they want to perform:
* **capture**: Save the current window layout
* **restore [name]**: Restore a saved layout
* **list**: List all saved layouts
* **detail [name]**: Get layout details
* **rename [name] [newName]**: Rename a layout
* **delete [name]**: Delete a layout
* **delete-all**: Delete all layouts
* **remove-windows [name] [ids...]**: Remove specific windows from a layout
* **windows**: Show current windows
* **apps**: Show running applications
* **status**: Check accessibility permission status
* **locale**: Get or change app language

# Prerequisites

The fWarrange REST API server (`http://localhost:3016`) is provided by the **fWarrangeCli** helper — a non-sandboxed macOS agent distributed via Homebrew (not the GUI app):

| Server         | How to Run                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `fWarrangeCli` | `brew install finfra/tap/fwarrange-cli` → `brew services start finfra/tap/fwarrange-cli` (REST enabled by default) |

# Execution Steps

1. **Check Server**: Verify the fWarrange server is running.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3016/health
   ```
   If the server is not responding, inform the user with the start command:
   > "fWarrange REST API server (fWarrangeCli) is not running. Start it via Homebrew:"
   > ```bash
   > brew services start finfra/tap/fwarrange-cli
   > ```
   > "Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Execute Action** based on $ARGUMENTS:

   **a. `capture` or `capture --name=<name>`** — Save current window layout
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

   **b. `restore <name>`** — Restore a saved layout
   ```bash
   # Default settings
   curl -s -X POST http://localhost:3016/api/v2/layouts/<NAME>/restore \
     -H 'Content-Type: application/json' | python3 -m json.tool

   # Custom retry settings
   curl -s -X POST http://localhost:3016/api/v2/layouts/<NAME>/restore \
     -H 'Content-Type: application/json' \
     -d '{"maxRetries":3,"retryInterval":1.0,"minimumScore":50,"enableParallel":true}' | python3 -m json.tool
   ```

   **c. `list`** — List all saved layouts
   ```bash
   curl -s http://localhost:3016/api/v2/layouts | python3 -m json.tool
   ```

   **d. `detail <name>`** — Get layout details
   ```bash
   curl -s http://localhost:3016/api/v2/layouts/<NAME> | python3 -m json.tool
   ```

   **e. `rename <name> <newName>`** — Rename a layout
   ```bash
   curl -s -X PUT http://localhost:3016/api/v2/layouts/<NAME> \
     -H 'Content-Type: application/json' \
     -d '{"newName":"<NEW_NAME>"}' | python3 -m json.tool
   ```

   **f. `delete <name>`** — Delete a specific layout
   ```bash
   curl -s -X DELETE http://localhost:3016/api/v2/layouts/<NAME> | python3 -m json.tool
   ```

   **g. `delete-all`** — Delete all layouts (requires confirmation)
   ```bash
   curl -s -X DELETE http://localhost:3016/api/v2/layouts \
     -H 'X-Confirm-Delete-All: true' | python3 -m json.tool
   ```
   **WARNING**: Always confirm with the user before executing this command.

   **h. `remove-windows <name> <id1> <id2> ...`** — Remove specific windows from a layout
   ```bash
   curl -s -X POST http://localhost:3016/api/v2/layouts/<NAME>/windows/remove \
     -H 'Content-Type: application/json' \
     -d '{"windowIds":[<ID1>,<ID2>]}' | python3 -m json.tool
   ```

   **i. `windows`** — Show current windows
   ```bash
   # All windows
   curl -s http://localhost:3016/api/v2/windows/current | python3 -m json.tool

   # Filter by specific apps
   curl -s "http://localhost:3016/api/v2/windows/current?filterApps=Safari,iTerm2" | python3 -m json.tool
   ```

   **j. `apps`** — Show running applications
   ```bash
   curl -s http://localhost:3016/api/v2/windows/apps | python3 -m json.tool
   ```

   **k. `status`** — Check accessibility permission
   ```bash
   curl -s http://localhost:3016/api/v2/status/accessibility | python3 -m json.tool
   ```

   **l. `locale`** — Get current app language (via /settings/general)
   ```bash
   curl -s http://localhost:3016/api/v2/settings/general | python3 -m json.tool
   # The `appLanguage` field shows the current locale.
   ```

   **m. `locale --set=<code>`** — Change app language (via /settings/general)
   ```bash
   curl -s -X PATCH http://localhost:3016/api/v2/settings/general \
     -H 'Content-Type: application/json' \
     -d '{"appLanguage":"<LANG_CODE>"}' | python3 -m json.tool
   ```
   Supported: `system`, `ko`, `en`, `ja`, `ar`, `zh-Hans`, `zh-Hant`, `fr`, `de`, `hi`, `es`

3. **Report**: Inform the user of the result (layout name, window count, success/failure details).

# API Reference (14 Endpoints)

| Method | Endpoint                                  | Description                        |
| ------ | ----------------------------------------- | ---------------------------------- |
| GET    | `/`                                       | Health check                       |
| GET    | `/api/v2/layouts`                         | List all layouts                   |
| DELETE | `/api/v2/layouts`                         | Delete all layouts (*)             |
| GET    | `/api/v2/layouts/{name}`                  | Get layout details                 |
| PUT    | `/api/v2/layouts/{name}`                  | Rename a layout                    |
| DELETE | `/api/v2/layouts/{name}`                  | Delete a layout                    |
| POST   | `/api/v2/capture`                         | Capture current layout             |
| POST   | `/api/v2/layouts/{name}/restore`          | Restore a layout                   |
| POST   | `/api/v2/layouts/{name}/windows/remove`   | Remove specific windows            |
| GET    | `/api/v2/windows/current`                 | List current windows               |
| GET    | `/api/v2/windows/apps`                    | List running apps                  |
| GET    | `/api/v2/status/accessibility`            | Check accessibility status         |
| GET    | `/api/v2/settings/general`                | Get app settings (incl. appLanguage)   |
| PATCH  | `/api/v2/settings/general`                | Update app settings (incl. appLanguage)|

(*) Requires `X-Confirm-Delete-All: true` header.

**Response format:**
* Success: `{"status": "ok", "data": {...}}`
* Error: `{"status": "error", "error": "..."}`

# Usage

## Capture current layout
```bash
curl -s -X POST http://localhost:3016/api/v2/capture \
  -H 'Content-Type: application/json' \
  -d '{"name":"my-workspace"}' | python3 -m json.tool
```

## Restore a layout
```bash
curl -s -X POST http://localhost:3016/api/v2/layouts/my-workspace/restore \
  -H 'Content-Type: application/json' | python3 -m json.tool
```

## List saved layouts
```bash
curl -s http://localhost:3016/api/v2/layouts | python3 -m json.tool
```

## Get layout details
```bash
curl -s http://localhost:3016/api/v2/layouts/my-workspace | python3 -m json.tool
```

## Rename a layout
```bash
curl -s -X PUT http://localhost:3016/api/v2/layouts/my-workspace \
  -H 'Content-Type: application/json' \
  -d '{"newName":"new-workspace"}' | python3 -m json.tool
```

## Delete a layout
```bash
curl -s -X DELETE http://localhost:3016/api/v2/layouts/my-workspace | python3 -m json.tool
```

## Delete all layouts
```bash
curl -s -X DELETE http://localhost:3016/api/v2/layouts \
  -H 'X-Confirm-Delete-All: true' | python3 -m json.tool
```

## Remove specific windows from layout
```bash
curl -s -X POST http://localhost:3016/api/v2/layouts/my-workspace/windows/remove \
  -H 'Content-Type: application/json' \
  -d '{"windowIds":[14205,5032]}' | python3 -m json.tool
```

## Get current locale (via /settings/general)
```bash
curl -s http://localhost:3016/api/v2/settings/general | python3 -m json.tool
# The `appLanguage` field shows the current locale.
```

## Change language (via /settings/general)
```bash
curl -s -X PATCH http://localhost:3016/api/v2/settings/general \
  -H 'Content-Type: application/json' \
  -d '{"appLanguage":"en"}' | python3 -m json.tool
```

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
/fwarrange:fwarrange locale
/fwarrange:fwarrange locale --set=en
```
