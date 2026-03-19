---
name: fsnippet
description: "Search, expand, and manage text snippets via fSnippet REST API"
argument-hint: "[search query or abbreviation]"
---

# fSnippet Snippet Manager

Search, expand, and manage text snippets via the fSnippet REST API.
Supports snippet search/expansion, clipboard history, folder browsing, and usage statistics.

## Input

$ARGUMENTS

If no arguments are provided, ask the user what they want to do:
- Search snippets
- Expand an abbreviation
- Browse clipboard history
- View folder list
- Check usage statistics

## Prerequisites

The fSnippet REST API server (`http://localhost:3015`) must be running:

| Requirement        | Details                                                |
| ------------------ | ------------------------------------------------------ |
| macOS Native App   | Launch fSnippet.app                                    |
| API Activation     | Settings > Advanced > Enable REST API                  |
| Default Port       | `3015` (configurable in Settings)                      |
| Security           | Localhost only by default (`127.0.0.1/32`)             |

## Execution Steps

1. **Check Server**: Verify the fSnippet server is running.
   ```bash
   curl -s --connect-timeout 3 http://localhost:3015/
   ```
   If the server is not responding, inform the user:
   > "fSnippet REST API server is not running. Launch the app and enable REST API:"
   > ```bash
   > open -a "fSnippet"
   > ```
   > "Then go to Settings > Advanced > Enable REST API. Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Parse Intent**: Determine what the user wants based on $ARGUMENTS:
   - If it looks like an abbreviation (e.g., `bb◊`, `awsec2◊`): use **Expand** flow
   - If it looks like a search query (e.g., `docker`, `aws ec2`): use **Search** flow
   - If it contains `clipboard` or `history`: use **Clipboard** flow
   - If it contains `folders` or `folder`: use **Folder** flow
   - If it contains `stats` or `statistics`: use **Stats** flow

3. **Execute the appropriate flow** (see API Reference below).

4. **Report**: Present results in a clean, readable format.

## API Reference

### Health Check
```bash
curl -s http://localhost:3015/
```
Returns server status, version, snippet count, and clipboard count.

### Search Snippets
```bash
curl -s "http://localhost:3015/api/snippets/search?q=<QUERY>&limit=20"
```
Search across abbreviations, folder names, tags, and descriptions.

**Parameters:**
| Param    | Required | Default | Description              |
| -------- | -------- | ------- | ------------------------ |
| `q`      | Yes      | -       | Search query             |
| `limit`  | No       | 20      | Max results (1-100)      |
| `offset` | No       | 0       | Pagination offset        |
| `folder` | No       | -       | Filter by folder name    |

### Get Snippet by Abbreviation
```bash
curl -s "http://localhost:3015/api/snippets/by-abbreviation/<ABBREV>"
```
Retrieve a snippet by exact abbreviation match. The abbreviation must be URL-encoded.

### Get Snippet by ID
```bash
curl -s "http://localhost:3015/api/snippets/<ID>"
```
Retrieve full snippet content by ID (format: `folder/filename`, URL-encoded).

### Expand Snippet
```bash
curl -s -X POST http://localhost:3015/api/snippets/expand \
  -H 'Content-Type: application/json' \
  -d '{"abbreviation":"<ABBREV>","placeholder_values":{}}'
```
Expand an abbreviation to its full text. Returns text data only (no keyboard simulation).

**Request Body:**
| Field                | Required | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `abbreviation`       | Yes      | Abbreviation to expand             |
| `placeholder_values` | No       | Key-value map for placeholder fill |

### Clipboard History
```bash
curl -s "http://localhost:3015/api/clipboard/history?limit=50"
```

**Parameters:**
| Param    | Required | Default | Description                            |
| -------- | -------- | ------- | -------------------------------------- |
| `limit`  | No       | 50      | Max results (1-200)                    |
| `offset` | No       | 0       | Pagination offset                      |
| `kind`   | No       | -       | Filter: plain_text, image, file_list   |
| `app`    | No       | -       | Filter by source app bundle ID         |
| `pinned` | No       | -       | Filter pinned items only               |

### Search Clipboard
```bash
curl -s "http://localhost:3015/api/clipboard/search?q=<QUERY>&limit=50"
```

### Get Clipboard Item Detail
```bash
curl -s "http://localhost:3015/api/clipboard/history/<ID>"
```

### List Folders
```bash
curl -s http://localhost:3015/api/folders
```
Returns all snippet folders with rule information (prefix, suffix, trigger_bias).

### Get Folder Detail
```bash
curl -s "http://localhost:3015/api/folders/<NAME>?limit=50"
```
Returns folder rule info and its snippet list.

### Usage Statistics (Top N)
```bash
curl -s "http://localhost:3015/api/stats/top?limit=10"
```

### Usage History
```bash
curl -s "http://localhost:3015/api/stats/history?limit=100"
```

**Parameters:**
| Param    | Required | Default | Description               |
| -------- | -------- | ------- | ------------------------- |
| `limit`  | No       | 100     | Max results               |
| `offset` | No       | 0       | Pagination offset         |
| `from`   | No       | -       | Start date (ISO 8601)     |
| `to`     | No       | -       | End date (ISO 8601)       |

### Trigger Keys
```bash
curl -s http://localhost:3015/api/triggers
```
Returns default and active trigger key information.

## Options

- `--server=<url>`: Change server address (default: `http://localhost:3015`)

## Examples

```
/fsnippet:fsnippet docker
/fsnippet:fsnippet bb◊
/fsnippet:fsnippet clipboard history
/fsnippet:fsnippet folders
/fsnippet:fsnippet stats top 5
/fsnippet:fsnippet search aws ec2 --server=http://localhost:3015
```
