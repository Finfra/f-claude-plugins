---
name: fgooglesheet
description: "Manage Google Sheets data via fGoogleSheet REST API"
argument-hint: "[key] [value]"
---

# fGoogleSheet Data Management

Manage Google Sheets data (add key/value lines, find unanswered questions, check status) via the fGoogleSheet REST API.

## Input

$ARGUMENTS

If no arguments are provided, ask the user what they want to do:
- Add a key/value line to Google Sheets
- Find unanswered questions
- Check app status
- Find next empty row

## Prerequisites

The fGoogleSheet REST API server (`http://localhost:3013`) must be running:

| Server             | How to Run                                            |
| ------------------ | ----------------------------------------------------- |
| macOS Native App   | Launch fGoogleSheet.app (enable REST API in Settings) |

## Execution Steps

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

   - **Add Line** (default when key/value provided):
     ```bash
     curl -s -X POST http://localhost:3013/api/add-line \
       -H 'Content-Type: application/json' \
       -d '{"key":"<KEY>","value":"<VALUE>"}'
     ```

   - **Find Unanswered** (`--unanswered` or user asks for unanswered questions):
     ```bash
     curl -s http://localhost:3013/api/unanswered
     ```

   - **Check Status** (`--status` or user asks for status):
     ```bash
     curl -s http://localhost:3013/api/status
     ```

   - **Next Row** (`--next-row` or user asks for next empty row):
     ```bash
     curl -s http://localhost:3013/api/next-row
     ```

3. **Verify Result**: Check the HTTP response code and parse the JSON response.
   - Success: Report the result to the user.
   - Error: Display the error message and suggest corrective action.

4. **Report**: Inform the user of the operation result.

## API Reference

### Health Check

| Field    | Value                 |
| -------- | --------------------- |
| Endpoint | `GET /`               |
| Response | `200 OK` with status  |

### Add Line

| Field        | Value                                       |
| ------------ | ------------------------------------------- |
| Endpoint     | `POST /api/add-line`                        |
| Content-Type | `application/json`                          |
| `key`        | Key text to write in column A (required)    |
| `value`      | Value text to write in column B (optional)  |
| Response     | JSON with success status and row number     |

### Unanswered Questions

| Field    | Value                                              |
| -------- | -------------------------------------------------- |
| Endpoint | `GET /api/unanswered`                              |
| Response | JSON array of rows with A column but empty B column|

### App Status

| Field    | Value                                              |
| -------- | -------------------------------------------------- |
| Endpoint | `GET /api/status`                                  |
| Response | JSON with execution state, auth, sheet info        |

### Next Row

| Field    | Value                                |
| -------- | ------------------------------------ |
| Endpoint | `GET /api/next-row`                  |
| Response | JSON with next available row number  |

## Usage

### Direct curl Calls

**Add a line:**
```bash
curl -s -X POST http://localhost:3013/api/add-line \
  -H 'Content-Type: application/json' \
  -d '{"key":"What is Docker?","value":"Container virtualization platform"}'
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

## Options

- `--unanswered`: Find unanswered questions (A column filled, B column empty)
- `--status`: Check app status (execution state, authentication, sheet info)
- `--next-row`: Find next available empty row
- `--server=<url>`: Change server address (default: `http://localhost:3013`)

## Examples

```
/fgooglesheet:fgooglesheet What is Docker? Container virtualization platform
/fgooglesheet:fgooglesheet --unanswered
/fgooglesheet:fgooglesheet --status
/fgooglesheet:fgooglesheet --next-row
/fgooglesheet:fgooglesheet --server=http://192.168.1.100:3013 --status
```
