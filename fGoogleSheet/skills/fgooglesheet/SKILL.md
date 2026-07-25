---
name: fgooglesheet
description: "Manage Google Sheets data via fGoogleSheet REST API"
argument-hint: "[key] [value]"
title: fGoogleSheet Data Management
date: 2026-06-20
---

Manage Google Sheets data (add key/value lines, set UI fields, clear a range, find unanswered questions, check status) via the fGoogleSheet REST API.

# Input

$ARGUMENTS

If no arguments are provided, ask the user what they want to do:
* Add a key/value line to Google Sheets (uploads + executes)
* Set the app's input fields without uploading (`--set-fields`)
* Clear a cell range (`--clear-range`)
* Find unanswered questions
* Check app status
* Find next empty row

# Prerequisites

The fGoogleSheet REST API server (`http://localhost:3013`) must be running:

| Server           | How to Run                                            |
| ---------------- | ----------------------------------------------------- |
| macOS Native App | Launch fGoogleSheet.app (enable REST API in Settings) |

# Execution Steps

1. **Check Server**: Verify the fGoogleSheet server is running.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3013/
   ```
   If the server is not responding, inform the user with the launch command:
   > "fGoogleSheet REST API server is not running. Launch the app with:"
   > ```bash
   > open -a "fGoogleSheet"
   > ```
   > "Then enable REST API in Settings. Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Determine Action**: Based on user input, choose the appropriate API call:

   * **Add Line** (default when key/value provided — writes to the sheet and executes the upload):
     ```bash
     curl -s -X POST http://localhost:3013/api/add-line \
       -H 'Content-Type: application/json' \
       -d '{"key":"<KEY>","value":"<VALUE>"}'
     ```

   * **Set Fields** (`--set-fields` — fills the app's input fields only, no upload):
     ```bash
     curl -s -X POST http://localhost:3013/api/set-fields \
       -H 'Content-Type: application/json' \
       -d '{"key":"<KEY>","value":"<VALUE>"}'
     ```

   * **Clear Range** (`--clear-range=<range>` — clears cells in the given A1 range):
     ```bash
     curl -s -X POST 'http://localhost:3013/api/clear-range?range=Sheet1!A12:B15'
     ```

   * **Find Unanswered** (`--unanswered` or user asks for unanswered questions):
     ```bash
     curl -s http://localhost:3013/api/unanswered?startRow=2
     ```

   * **Check Status** (`--status` or user asks for status):
     ```bash
     curl -s http://localhost:3013/api/status
     ```

   * **Next Row** (`--next-row` or user asks for next empty row):
     ```bash
     curl -s http://localhost:3013/api/next-row?startRow=2
     ```

3. **Verify Result**: Check the HTTP response code and parse the JSON response.
   * Success: Report the result to the user.
   * Error: Display the error message and suggest corrective action.

4. **Report**: Inform the user of the operation result.

# API Reference

## Health Check

| Field    | Value                |
| -------- | -------------------- |
| Endpoint | `GET /`              |
| Response | `200 OK` with status |

## Add Line

| Field        | Value                                      |
| ------------ | ------------------------------------------ |
| Endpoint     | `POST /api/add-line`                       |
| Content-Type | `application/json`                         |
| `key`        | Key text to write in column A (required)   |
| `value`      | Value text to write in column B (optional) |

**Success Response**:
```json
{"success": true, "targetRow": 5, "nextRow": 6, "newQuestionCnt": 2, "hasNewQuestions": true}
```

**Errors**: 400 (missing key), 401 (auth expired), 500 (API failure), 503 (not initialized)

## Set Fields

| Field        | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Endpoint     | `POST /api/set-fields`                                      |
| Content-Type | `application/json`                                          |
| `key`        | Key text to set in the app's input field (required)         |
| `value`      | Value text to set in the app's input field (optional)       |

Sets the app's UI input fields **without** triggering an upload or row increment
(unlike `add-line`, which uploads and executes).

**Success Response**:
```json
{"success": true, "key": "What is Swift?", "value": "A language by Apple."}
```

**Errors**: 400 (missing key)

## Clear Range

| Field    | Value                                                            |
| -------- | --------------------------------------------------------------- |
| Endpoint | `POST /api/clear-range?range=<A1Range>`                         |
| `range`  | A1 range to clear, e.g. `Sheet1!A12:B15` (required, query param) |

Clears all values in the given range. Supported in **API** and **Playwright**
access modes. In **AppsScript** mode the operation is skipped.

**Success Response**:
```json
{"success": true, "clearedRange": "Sheet1!A12:B15"}
```

**Skipped (AppsScript mode)**:
```json
{"success": false, "skipped": true, "reason": "clear-range not supported in AppsScript mode", "range": "Sheet1!A12:B15"}
```

**Errors**: 400 (missing range), 500 (API/Playwright failure), 503 (not initialized)

## Unanswered Questions

| Field      | Value                                               |
| ---------- | --------------------------------------------------- |
| Endpoint   | `GET /api/unanswered?startRow=2`                    |
| `startRow` | Row number to start scanning from (default: 2)      |
| Response   | JSON array of rows with A column but empty B column |

## App Status

| Field    | Value                                       |
| -------- | ------------------------------------------- |
| Endpoint | `GET /api/status`                           |
| Response | JSON with execution state, auth, sheet info |

## Next Row

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| Endpoint   | `GET /api/next-row?startRow=2`                 |
| `startRow` | Row number to start scanning from (default: 2) |
| Response   | JSON with next available row number            |

# Usage

## Direct curl Calls

**Add a line:**
```bash
curl -s -X POST http://localhost:3013/api/add-line \
  -H 'Content-Type: application/json' \
  -d '{"key":"What is Docker?","value":"Container virtualization platform"}'
```

**Set input fields only (no upload):**
```bash
curl -s -X POST http://localhost:3013/api/set-fields \
  -H 'Content-Type: application/json' \
  -d '{"key":"What is Docker?","value":"Container virtualization platform"}'
```

**Clear a range:**
```bash
curl -s -X POST 'http://localhost:3013/api/clear-range?range=Sheet1!A12:B15'
```

**Find unanswered questions:**
```bash
curl -s http://localhost:3013/api/unanswered
```

**Check status:**
```bash
curl -s http://localhost:3013/api/status
```

**Find next row:**
```bash
curl -s http://localhost:3013/api/next-row
```

# Options

* `--set-fields`: Fill the app's input fields without uploading (key/value required)
* `--clear-range=<range>`: Clear cells in an A1 range (e.g. `Sheet1!A12:B15`)
* `--unanswered`: Find unanswered questions (A column filled, B column empty)
* `--status`: Check app status (execution state, authentication, sheet info)
* `--next-row`: Find next available empty row
* `--server=<url>`: Change server address (default: `http://localhost:3013`)

# Examples

```
/fgooglesheet:fgooglesheet What is Docker? Container virtualization platform
/fgooglesheet:fgooglesheet --set-fields What is Docker? Container virtualization platform
/fgooglesheet:fgooglesheet --clear-range=Sheet1!A12:B15
/fgooglesheet:fgooglesheet --unanswered
/fgooglesheet:fgooglesheet --status
/fgooglesheet:fgooglesheet --next-row
/fgooglesheet:fgooglesheet --server=http://192.168.1.100:3013 --status
```
