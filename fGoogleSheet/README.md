---
title: fGoogleSheet Claude Code Plugin
description: fGoogleSheet REST API를 통해 Google Sheets 데이터를 관리하는 Claude Code 플러그인
date: 2026-06-20
---

A Claude Code plugin that manages Google Sheets data via the fGoogleSheet REST API.
After installation, add lines, find unanswered questions, and check sheet status using slash commands in Claude Code.

---

# Plugin Structure

```
plugin.json              # Plugin manifest
skills/
└── fgooglesheet/
    └── SKILL.md         # Google Sheets management skill
```

---

# Skills

## `fgooglesheet` — Google Sheets Data Management

Manage Google Sheets data (add key/value lines, find unanswered questions, check status) via the fGoogleSheet REST API.

**Usage:**
```
/fgooglesheet:fgooglesheet What is Docker? Container virtualization platform
/fgooglesheet:fgooglesheet --set-fields What is Docker? Container virtualization platform
/fgooglesheet:fgooglesheet --clear-range=Sheet1!A12:B15
/fgooglesheet:fgooglesheet --unanswered
/fgooglesheet:fgooglesheet --status
/fgooglesheet:fgooglesheet --next-row
```

**Features:**
* Add key/value data lines to Google Sheets (uploads + executes)
* Set the app's input fields without uploading
* Clear a cell range (API / Playwright modes)
* Find unanswered questions (A column filled, B column empty)
* Check app status (execution state, authentication, sheet info)
* Find next available row
* Guides user to launch fGoogleSheet.app if server is not running

**Options:**

| Option                 | Description                          | Default                 |
| ---------------------- | ------------------------------------ | ----------------------- |
| `--set-fields`         | Fill input fields without uploading  | -                       |
| `--clear-range=<range>`| Clear cells in an A1 range           | -                       |
| `--unanswered`         | Find unanswered questions            | -                       |
| `--status`             | Check app status                     | -                       |
| `--next-row`           | Find next empty row                  | -                       |
| `--server=<url>`       | Change server address                | `http://localhost:3013` |

**API Summary:**

| Endpoint                 | Method | Description                          |
| ------------------------ | ------ | ------------------------------------ |
| `GET /`                  | GET    | Health check                         |
| `POST /api/add-line`     | POST   | Add key/value data to Google Sheet   |
| `POST /api/set-fields`   | POST   | Set input fields only (no upload)    |
| `POST /api/clear-range`  | POST   | Clear a cell range (`?range=A1:B2`)  |
| `GET /api/unanswered`    | GET    | Find unanswered questions            |
| `GET /api/status`        | GET    | Check app status                     |
| `GET /api/next-row`      | GET    | Find next empty row                  |

---

# Installation

## Option 1: Plugin Install (Recommended)

Run in Claude Code:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fgooglesheet@f-claude-plugins
```

> The marketplace uses `git-subdir` to automatically resolve the `fGoogleSheet/` subdirectory path.

## Option 2: Manual Copy

```bash
# After cloning f-claude-plugins repo
cp -r fGoogleSheet/plugin.json .claude-plugin/plugin.json
cp -r fGoogleSheet/skills .claude/skills
```

## Option 3: Symbolic Link

```bash
ln -sf fGoogleSheet/skills/fgooglesheet .claude/skills/fgooglesheet
```

---

# Prerequisites

The fGoogleSheet REST API server must be running:

| Server           | How to Run                                           |
| ---------------- | ---------------------------------------------------- |
| macOS Native App | Launch fGoogleSheet.app (enable REST API in Settings)|

> If the server is not running, the skill will prompt the user to launch fGoogleSheet.app.

---

# Related Extensions

| Extension  | Description                                              |
| ---------- | -------------------------------------------------------- |
| MCP Server | Google Sheets management via MCP protocol (Claude Desktop compatible) |

---

# License

MIT
