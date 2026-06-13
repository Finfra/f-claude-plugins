---
name: fsnippet
description: "Search, expand, and manage text snippets via fSnippet REST API"
argument-hint: "[search query or abbreviation]"
title: fSnippet Snippet Manager
date: 2026-06-13
---

Search, expand, and manage text snippets via the fSnippet REST API.
Supports snippet search/expansion, clipboard history, folder browsing, and usage statistics.

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
   * If it contains `clipboard` or `history`: use **Clipboard** flow
   * If it contains `folders` or `folder`: use **Folder** flow
   * If it contains `stats` or `statistics`: use **Stats** flow

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

# Options

* `--server=<url>`: Change server address (default: `http://localhost:3015`)

# Examples

```
/fsnippet:fsnippet docker
/fsnippet:fsnippet bb{right_command}
/fsnippet:fsnippet clipboard history
/fsnippet:fsnippet folders
/fsnippet:fsnippet stats top 5
/fsnippet:fsnippet search aws ec2 --server=http://localhost:3015
```
