---
name: fsnippet
description: "Search, expand, create, delete, and manage text snippets via fSnippet REST API"
argument-hint: "[search query or abbreviation]"
title: fSnippet Snippet Manager
date: 2026-06-20
---

Search, expand, create, delete, and manage text snippets via the fSnippet REST API.
Supports snippet search/expansion, snippet & folder CRUD, clipboard history, folder browsing,
usage statistics, and CLI helper control (pause/resume/reload).

# Input

$ARGUMENTS

If no arguments are provided, ask the user what they want to do:
* Search snippets
* Expand an abbreviation
* Browse clipboard history
* View folder list
* Check usage statistics

# Prerequisites

The fSnippet REST API server (`http://localhost:3015`) is provided by the **fSnippetCli** helper — a non-sandboxed macOS agent distributed via Homebrew (not the GUI app):

| Requirement   | Details                                                 |
| ------------- | ------------------------------------------------------- |
| Engine        | `fSnippetCli` (`brew install finfra/tap/fsnippet-cli`)  |
| Start service | `brew services start finfra/tap/fsnippet-cli`           |
| Default Port  | `3015` (REST API enabled by default)                    |
| Security      | Localhost only by default (`127.0.0.1/32`)              |

# Execution Steps

1. **Check Server**: Verify the fSnippet server is running.
   ```bash
   curl -s --connect-timeout 3 http://localhost:3015/
   ```
   If the server is not responding, inform the user:
   > "fSnippet REST API server (fSnippetCli) is not running. Start it via Homebrew:"
   > ```bash
   > brew services start finfra/tap/fsnippet-cli
   > ```
   > "Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Parse Intent**: Determine what the user wants based on $ARGUMENTS:
   * If it looks like an abbreviation (e.g., `bb{right_command}`, `awsec2{right_command}`): use **Expand** flow
   * If it looks like a search query (e.g., `docker`, `aws ec2`): use **Search** flow
   * If it contains `create`, `add`, or `new`: use **Create Snippet / Create Folder** flow
   * If it contains `delete` or `remove`: use **Delete Snippet / Delete Folder** flow
   * If it contains `clipboard` or `history`: use **Clipboard** flow
   * If it contains `folders` or `folder`: use **Folder** flow
   * If it contains `stats` or `statistics`: use **Stats** flow
   * If it contains `pause`, `resume`, `reload`, or `version`: use **CLI Control** flow

3. **Execute the appropriate flow** (see API Reference below).

4. **Report**: Present results in a clean, readable format.

# API Reference

## Health Check
```bash
curl -s http://localhost:3015/             # root (legacy-compatible)
curl -s http://localhost:3015/api/v2/status # v2 status (recommended)
```
Returns server status, version, snippet count, and clipboard count.

## Search Snippets
```bash
curl -s "http://localhost:3015/api/v2/snippets/search?q=<QUERY>&limit=20"
```
Search across abbreviations, folder names, tags, and descriptions.

**Parameters:**

| Param    | Required | Default | Description              |
| -------- | -------- | ------- | ------------------------ |
| `q`      | Yes      | -       | Search query             |
| `limit`  | No       | 20      | Max results (1-100)      |
| `offset` | No       | 0       | Pagination offset        |
| `folder` | No       | -       | Filter by folder name    |

## Get Snippet by Abbreviation
```bash
curl -s "http://localhost:3015/api/v2/snippets/by-abbreviation/<ABBREV>"
```
Retrieve a snippet by exact abbreviation match. The abbreviation must be URL-encoded.

## Get Snippet by ID
```bash
curl -s "http://localhost:3015/api/v2/snippets/<ID>"
```
Retrieve full snippet content by ID (format: `folder/filename`, URL-encoded).

## Expand Snippet
```bash
curl -s -X POST http://localhost:3015/api/v2/snippets/expand \
  -H 'Content-Type: application/json' \
  -d '{"abbreviation":"<ABBREV>","placeholder_values":{}}'
```
Expand an abbreviation to its full text. Returns text data only (no keyboard simulation).

**Request Body:**

| Field                | Required | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `abbreviation`       | Yes      | Abbreviation to expand             |
| `placeholder_values` | No       | Key-value map for placeholder fill |

## List Snippets
```bash
curl -s "http://localhost:3015/api/v2/snippets?limit=50&folder=<FOLDER>"
```
List all snippets with optional folder filtering and pagination.

**Parameters:**

| Param    | Required | Default | Description              |
| -------- | -------- | ------- | ------------------------ |
| `limit`  | No       | 50      | Max results (1-200)      |
| `offset` | No       | 0       | Pagination offset        |
| `folder` | No       | -       | Filter by folder name    |

## Create Snippet
```bash
curl -s -X POST http://localhost:3015/api/v2/snippets \
  -H 'Content-Type: application/json' \
  -d '{"folder":"Docker","keyword":"dps","name":"docker ps","content":"docker ps -a"}'
```
Create a new snippet file as `keyword===name.txt` in the given folder. If `keyword` is empty,
the file is created as `===name.txt`. Returns `201` on success.

**Request Body:**

| Field     | Required | Description                                  |
| --------- | -------- | -------------------------------------------- |
| `folder`  | Yes      | Target folder name (must exist)              |
| `keyword` | No       | Abbreviation keyword (empty → `===name.txt`) |
| `name`    | Yes      | Snippet display name (file name part)        |
| `content` | Yes      | Snippet body text                            |

## Delete Snippet
```bash
curl -s -X DELETE "http://localhost:3015/api/v2/snippets/<ID>"
```
Delete a snippet file by ID. ID format is `folder/keyword===name.txt` (URL-encoded).
Always confirm with the user before deleting.

## Clipboard History
```bash
curl -s "http://localhost:3015/api/v2/clipboard/history?limit=50"
```

**Parameters:**

| Param    | Required | Default | Description                            |
| -------- | -------- | ------- | -------------------------------------- |
| `limit`  | No       | 50      | Max results (1-200)                    |
| `offset` | No       | 0       | Pagination offset                      |
| `kind`   | No       | -       | Filter: plain_text, image, file_list   |
| `app`    | No       | -       | Filter by source app bundle ID         |
| `pinned` | No       | -       | Filter pinned items only               |

## Search Clipboard
```bash
curl -s "http://localhost:3015/api/v2/clipboard/search?q=<QUERY>&limit=50"
```

## Get Clipboard Item Detail
```bash
curl -s "http://localhost:3015/api/v2/clipboard/history/<ID>"
```

## List Folders
```bash
curl -s http://localhost:3015/api/v2/folders
```
Returns all snippet folders with rule information (prefix, suffix, trigger_bias).

## Get Folder Detail
```bash
curl -s "http://localhost:3015/api/v2/folders/<NAME>?limit=50"
```
Returns folder rule info and its snippet list.

## Create Folder
```bash
curl -s -X POST http://localhost:3015/api/v2/folders \
  -H 'Content-Type: application/json' \
  -d '{"name":"MyNewFolder"}'
```
Create a new snippet folder. Name must not contain `/` or `..`. Returns `201` on success,
`409` if the folder already exists.

## Delete Folder
```bash
curl -s -X DELETE "http://localhost:3015/api/v2/folders/<NAME>"
```
Delete a snippet folder. **Only empty folders can be deleted** (hidden files and rule files
starting with `_` are ignored when checking emptiness). Always confirm with the user first.

## Usage Statistics (Top N)
```bash
curl -s "http://localhost:3015/api/v2/stats/top?limit=10"
```

## Usage History
```bash
curl -s "http://localhost:3015/api/v2/stats/history?limit=100"
```

**Parameters:**

| Param    | Required | Default | Description               |
| -------- | -------- | ------- | ------------------------- |
| `limit`  | No       | 100     | Max results               |
| `offset` | No       | 0       | Pagination offset         |
| `from`   | No       | -       | Start date (ISO 8601)     |
| `to`     | No       | -       | End date (ISO 8601)       |

## Trigger Keys
```bash
curl -s http://localhost:3015/api/v2/triggers
```
Returns default and active trigger key information.

## CLI Control
Control the fSnippetCli helper engine. Useful for temporarily suspending snippet expansion
or reloading resources after editing snippet files.

```bash
curl -s http://localhost:3015/api/v2/cli/status        # GET  — engine running state
curl -s http://localhost:3015/api/v2/cli/version       # GET  — CLI helper version
curl -s -X POST http://localhost:3015/api/v2/cli/pause   # POST — suspend snippet expansion
curl -s -X POST http://localhost:3015/api/v2/cli/resume  # POST — restore snippet expansion
curl -s -X POST http://localhost:3015/api/v2/reload      # POST — reload all snippet resources
```

| Endpoint        | Method | Description                                      |
| --------------- | ------ | ------------------------------------------------ |
| `/cli/status`   | GET    | Engine running/paused state                      |
| `/cli/version`  | GET    | CLI helper version string                        |
| `/cli/pause`    | POST   | Suspend snippet expansion (typing still logged)  |
| `/cli/resume`   | POST   | Restore snippet expansion                         |
| `/reload`       | POST   | Reload all snippet/rule resources from disk      |

# Options

* `--server=<url>`: Change server address (default: `http://localhost:3015`)

# Examples

```
/fsnippet:fsnippet docker
/fsnippet:fsnippet bb{right_command}
/fsnippet:fsnippet clipboard history
/fsnippet:fsnippet folders
/fsnippet:fsnippet stats top 5
/fsnippet:fsnippet create snippet in Docker
/fsnippet:fsnippet delete snippet Docker/dps===docker ps.txt
/fsnippet:fsnippet create folder MyNewFolder
/fsnippet:fsnippet pause
/fsnippet:fsnippet reload
/fsnippet:fsnippet search aws ec2 --server=http://localhost:3015
```
