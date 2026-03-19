# fGoogleSheet Claude Code Plugin

A Claude Code plugin that manages Google Sheets data via the fGoogleSheet REST API.
After installation, add lines, find unanswered questions, and check sheet status using slash commands in Claude Code.

---

## Plugin Structure

```
plugin.json              # Plugin manifest
skills/
└── fgooglesheet/
    └── SKILL.md         # Google Sheets management skill
```

---

## Skills

### `fgooglesheet` — Google Sheets Data Management

Manage Google Sheets data (add key/value lines, find unanswered questions, check status) via the fGoogleSheet REST API.

**Usage:**
```
/fgooglesheet:fgooglesheet What is Docker? Container virtualization platform
/fgooglesheet:fgooglesheet --unanswered
/fgooglesheet:fgooglesheet --status
/fgooglesheet:fgooglesheet --next-row
```

**Features:**
- Add key/value data lines to Google Sheets
- Find unanswered questions (A column filled, B column empty)
- Check app status (execution state, authentication, sheet info)
- Find next available row
- Guides user to launch fGoogleSheet.app if server is not running

**Options:**

| Option            | Description                | Default                 |
| ----------------- | -------------------------- | ----------------------- |
| `--unanswered`    | Find unanswered questions  | -                       |
| `--status`        | Check app status           | -                       |
| `--next-row`      | Find next empty row        | -                       |
| `--server=<url>`  | Change server address      | `http://localhost:3013` |

**API Summary:**

| Endpoint             | Method | Description                        |
| -------------------- | ------ | ---------------------------------- |
| `GET /`              | GET    | Health check                       |
| `POST /api/add-line` | POST   | Add key/value data to Google Sheet |
| `GET /api/unanswered`| GET    | Find unanswered questions          |
| `GET /api/status`    | GET    | Check app status                   |
| `GET /api/next-row`  | GET    | Find next empty row                |

---

## Installation

### Option 1: Plugin Install (Recommended)

Run in Claude Code:
```
/plugin marketplace add Finfra/f-claude-plugins
/plugin install fgooglesheet@f-claude-plugins
```

> The marketplace uses `git-subdir` to automatically resolve the `fGoogleSheet/` subdirectory path.

### Option 2: Manual Copy

```bash
# After cloning f-claude-plugins repo
cp -r fGoogleSheet/plugin.json .claude-plugin/plugin.json
cp -r fGoogleSheet/skills .claude/skills
```

### Option 3: Symbolic Link

```bash
ln -sf fGoogleSheet/skills/fgooglesheet .claude/skills/fgooglesheet
```

---

## Prerequisites

The fGoogleSheet REST API server must be running:

| Server             | How to Run                                           |
| ------------------ | ---------------------------------------------------- |
| macOS Native App   | Launch fGoogleSheet.app (enable REST API in Settings)|

> If the server is not running, the skill will prompt the user to launch fGoogleSheet.app.

---

## Related Extensions

| Extension                  | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| MCP Server                 | Google Sheets management via MCP protocol (Claude Desktop compatible) |

---

## License

MIT
