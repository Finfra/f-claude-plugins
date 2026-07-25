---
title: fWarrange Claude Code Plugin
description: fWarrange REST API를 통해 macOS 창 레이아웃을 저장하고 복구하는 Claude Code 플러그인
date: 2026-03-26
---

A Claude Code plugin that saves and restores macOS window layouts via the fWarrange REST API.
After installation, manage window layouts instantly using slash commands in Claude Code.

---

# Plugin Structure

```
.claude-plugin/
└── plugin.json              # Plugin manifest
skills/
└── fwarrange/
    └── SKILL.md             # Window layout management skill
```

---

# Skills

## `fwarrange` — Window Layout Management

Save and restore macOS window positions and sizes via the fWarrange REST API.

**Usage:**
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
/fwarrange:fwarrange cli status
/fwarrange:fwarrange settings general
/fwarrange:fwarrange excluded-apps
/fwarrange:fwarrange default-layout my-workspace
/fwarrange:fwarrange normalize-rules
/fwarrange:fwarrange restore-stats
/fwarrange:fwarrange locale
/fwarrange:fwarrange locale --set=en
```

**Features:**
* Guides user to launch the fWarrangeCli helper if the server is not running
* Capture current window layout with optional name and app filter
* Restore saved layouts with customizable retry settings and matching mode (strict/normal/loose)
* List, detail, rename, and delete layouts (delete-all with safety confirmation)
* Remove specific windows from a layout by ID
* View current windows and running apps; check accessibility permission status
* **Modes**: context switching — bundle a layout with required apps, activate to restore + launch
* **CLI helper management**: status, version, pause/resume, restart, quit
* **Settings**: read/update general, restore, api, advanced tabs; factory reset
* Manage restore-excluded apps and the default layout
* **Advanced tuning**: title-normalization ruleset and window-matching statistics
* Get and change app locale/language

**Options:**

| Option              | Description           | Default                 |
| ------------------- | --------------------- | ----------------------- |
| `--name=<name>`     | Layout name           | Auto-generated          |
| `--server=<url>`    | Change server address | `http://localhost:3016` |
| `--set=<code>`      | Set locale language   | -                       |

**API Summary (Service root: `http://localhost:3016/api/v2`):**

The plugin documents the user-facing and management endpoints below. The full v2 surface is 57 endpoints — machine-to-machine ones (`/paidapp/*`, `/ui/state`, `/operations`, `/changes`, `/shutdown`, `/settings/shortcuts`) are omitted here; see `api/openapi_v2.yaml` for the complete spec.

| Group         | Endpoints                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Health        | `GET /` · `GET /api/v2/health`                                                                     |
| Layouts       | `GET/DELETE /layouts` · `GET/PUT/DELETE /layouts/{name}` · `POST /layouts/{name}/windows/remove`   |
| Capture/Restore | `POST /capture` · `POST /layouts/{name}/restore` (+ matching mode strict/normal/loose)           |
| Windows       | `GET /windows/current` · `GET /windows/apps` · `GET /status/accessibility`                         |
| Modes         | `GET/POST /modes` · `GET/PATCH/DELETE /modes/{name}` · `POST /modes/{name}/activate`               |
| CLI helper    | `GET /cli/status` · `GET /cli/version` · `POST /cli/pause·resume·restart·quit`                     |
| Settings      | `GET/PATCH /settings/general·restore·api·advanced` · `GET /settings` · `POST /settings/factory-reset` |
| Excluded apps | `GET/POST/DELETE/PUT /settings/restore/excluded-apps` · `POST .../reset`                           |
| Default layout| `GET/PUT /settings/default-layout`                                                                 |
| Advanced      | `GET/PUT/DELETE /normalize-rules` · `GET/DELETE /restore-stats`                                    |

Destructive endpoints (delete-all, cli quit, factory-reset) require user confirmation; delete-all also needs the `X-Confirm-Delete-All: true` header.

---

# Installation

## Option 1: Plugin Install (Recommended)

Run in Claude Code:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fwarrange@f-claude-plugins
```

> The marketplace uses `git-subdir` to automatically resolve the `fWarrange/` subdirectory path.

## Option 2: Manual Copy

```bash
# After cloning f-claude-plugins repo
cp -r fWarrange/plugin.json .claude-plugin/plugin.json
cp -r fWarrange/skills .claude/skills
```

## Option 3: Symbolic Link

```bash
ln -sf fWarrange/skills/fwarrange .claude/skills/fwarrange
```

---

# Prerequisites

The fWarrange REST API server is provided by the **fWarrangeCli** helper — a non-sandboxed macOS agent distributed via Homebrew (not the App Store GUI app):

| Server         | How to Run                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `fWarrangeCli` | `brew install finfra/tap/fwarrange-cli` → `brew services start finfra/tap/fwarrange-cli` (REST enabled by default) |

> If the server is not running, the skill will prompt the user to start it via Homebrew. It will not start the server automatically.

**macOS Accessibility Permission** is required for window restore functionality:
* System Settings > Privacy & Security > Accessibility > Add fWarrangeCli

---

# Related Extensions

| Extension  | Location                | Description                                            |
| ---------- | ----------------------- | ------------------------------------------------------ |
| MCP Server | See fWarrange main repo | Window layout management via MCP protocol (Claude Desktop compatible) |

---

# License

MIT
