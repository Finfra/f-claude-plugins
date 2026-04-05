---
title: fSnippet Claude Code Plugin
description: fSnippet REST API를 통해 텍스트 스니펫을 검색, 확장, 관리하는 Claude Code 플러그인
date: 2026-03-26
---

A Claude Code plugin that searches, expands, and manages text snippets via the fSnippet REST API.
After installation, interact with your snippet library instantly using slash commands in Claude Code.

---

# Plugin Structure

```
plugin.json              # Plugin manifest
skills/
└── fsnippet/
    └── SKILL.md         # Snippet management skill
```

---

# Skills

## `fsnippet` — Snippet Manager

Search, expand, and manage text snippets via the fSnippet REST API.

**Usage:**
```
/fsnippet:fsnippet docker
/fsnippet:fsnippet bb◊
/fsnippet:fsnippet clipboard history
/fsnippet:fsnippet folders
/fsnippet:fsnippet stats top 5
```

**Features:**
* Guides user to launch fSnippet.app if server is not running
* Search snippets by keyword across abbreviations, folders, tags
* Expand abbreviations to full text (with placeholder support)
* Browse clipboard history and search within it
* View snippet folders and their rules
* Check usage statistics

**Options:**

| Option            | Description           | Default                 |
| ----------------- | --------------------- | ----------------------- |
| `--server=<url>`  | Change server address | `http://localhost:3015` |

**API Summary (13 Endpoints):**

| Category  | Endpoint                                  | Method | Description                    |
| --------- | ----------------------------------------- | ------ | ------------------------------ |
| Status    | `/`                                       | GET    | Health check                   |
| Snippets  | `/api/snippets/search`                    | GET    | Search snippets by keyword     |
| Snippets  | `/api/snippets/by-abbreviation/{abbrev}`  | GET    | Get snippet by abbreviation    |
| Snippets  | `/api/snippets/{id}`                      | GET    | Get snippet detail by ID       |
| Snippets  | `/api/snippets/expand`                    | POST   | Expand abbreviation to text    |
| Clipboard | `/api/clipboard/history`                  | GET    | Get clipboard history          |
| Clipboard | `/api/clipboard/history/{id}`             | GET    | Get clipboard item detail      |
| Clipboard | `/api/clipboard/search`                   | GET    | Search clipboard history       |
| Folders   | `/api/folders`                            | GET    | List all snippet folders       |
| Folders   | `/api/folders/{name}`                     | GET    | Get folder detail with snippets|
| Stats     | `/api/stats/top`                          | GET    | Top N usage statistics         |
| Stats     | `/api/stats/history`                      | GET    | Usage history                  |
| Triggers  | `/api/triggers`                           | GET    | Get trigger key information    |

---

# Installation

## Option 1: Plugin Install (Recommended)

Run in Claude Code:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fsnippet@f-claude-plugins
```

> The marketplace uses `git-subdir` to automatically resolve the `fSnippet/` subdirectory path.

## Option 2: Manual Copy

```bash
# After cloning f-claude-plugins repo
cp -r fSnippet/plugin.json .claude-plugin/plugin.json
cp -r fSnippet/skills .claude/skills
```

## Option 3: Symbolic Link

```bash
ln -sf fSnippet/skills/fsnippet .claude/skills/fsnippet
```

---

# Prerequisites

The fSnippet REST API server must be running:

| Requirement      | Details                                                |
| ---------------- | ------------------------------------------------------ |
| macOS Native App | Launch fSnippet.app                                    |
| API Activation   | Settings > Advanced > Enable REST API                  |
| Default Port     | `3015` (configurable in Settings)                      |
| Security         | Localhost only by default (`127.0.0.1/32`)             |

> If the server is not running, the skill will prompt the user to launch fSnippet.app and enable the REST API.

---

# Related Extensions

| Extension                  | Location            | Description                                          |
| -------------------------- | ------------------- | ---------------------------------------------------- |
| [MCP Server](https://github.com/finfra/fSnippet_public/tree/main/mcp)  | fSnippet_public/mcp | Snippet access via MCP protocol (Claude Desktop compatible) |
| [OpenAPI Spec](https://github.com/finfra/fSnippet_public/tree/main/api) | fSnippet_public/api | Full OpenAPI 3.0 specification                       |

---

# License

MIT
