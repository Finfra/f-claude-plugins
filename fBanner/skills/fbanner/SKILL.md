---
name: fbanner
description: "Split images/PDFs/SVGs into grid tiles via fBanner REST API"
argument-hint: "[command] [path] [--options]"
---

# fBanner Image Grid Splitter

Split images, PDFs, and SVGs into grid tiles via the fBanner REST API.

## Input

$ARGUMENTS

If no arguments are provided, ask the user what file to split and the desired grid configuration.

## Prerequisites

The fBanner REST API server (`http://localhost:3011`) must be running:

| Server           | How to Run                                      |
| ---------------- | ----------------------------------------------- |
| macOS Native App | Launch fBanner.app (enable REST API in Settings) |

## Execution Steps

1. **Check Server**: Verify the fBanner server is running.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3011/
   ```
   If the server is not responding, inform the user with the launch command:
   > "fBanner REST API server is not running. Launch the app with:"
   > ```bash
   > open -a "fBanner"
   > ```
   > "Then enable REST API in Settings. Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Parse Command**: Determine the action from arguments.

   | Command   | Action                                    |
   | --------- | ----------------------------------------- |
   | `split`   | One-step split (load + configure + export) |
   | `load`    | Load a file into the app                  |
   | `config`  | Update split configuration                |
   | `export`  | Export split files                        |
   | `status`  | Show current app status                   |
   | (default) | If a file path is given, treat as `split` |

3. **Execute Action**:

   ### `split` (One-step split)
   ```bash
   curl -s -X POST http://localhost:3011/api/split \
     -H 'Content-Type: application/json' \
     -d '{
       "path": "<FILE_PATH>",
       "outputDir": "<OUTPUT_DIR>",
       "rows": <ROWS>,
       "cols": <COLS>,
       "exportFormat": "<FORMAT>"
     }'
   ```
   - If `--output` is not specified, use `resource/contents_result` as default output directory.
   - If `--rows` / `--cols` are not specified, default to 2x2.

   ### `load`
   ```bash
   curl -s -X POST http://localhost:3011/api/load \
     -H 'Content-Type: application/json' \
     -d '{"path": "<FILE_PATH>"}'
   ```

   ### `config`
   ```bash
   curl -s -X PUT http://localhost:3011/api/config \
     -H 'Content-Type: application/json' \
     -d '{"rows": <ROWS>, "cols": <COLS>, "exportFormat": "<FORMAT>"}'
   ```
   Only include fields that the user explicitly specified.

   ### `export`
   ```bash
   curl -s -X POST http://localhost:3011/api/export \
     -H 'Content-Type: application/json' \
     -d '{"outputDir": "<OUTPUT_DIR>"}'
   ```

   ### `status`
   ```bash
   curl -s http://localhost:3011/api/status | python3 -m json.tool
   ```

4. **Report**: Inform the user of the result including file count, output directory, and filenames.

## API Reference

| Method | Endpoint      | Description                              |
| ------ | ------------- | ---------------------------------------- |
| GET    | `/`           | Health check (status, app, version, port) |
| GET    | `/api/status` | App state, loaded file info, config      |
| GET    | `/api/config` | Current split configuration              |
| PUT    | `/api/config` | Update split configuration (partial)     |
| POST   | `/api/load`   | Load a file by path                      |
| POST   | `/api/export` | Export split files to directory           |
| POST   | `/api/split`  | One-step: load + configure + export      |

### Configuration Fields

| Field                | Type    | Range       | Default          | Description                  |
| -------------------- | ------- | ----------- | ---------------- | ---------------------------- |
| `rows`               | int     | 1-100       | 2                | Vertical splits              |
| `cols`               | int     | 1-100       | 2                | Horizontal splits            |
| `ratioW`             | float   | 0.1-10.0    | 1.0              | Horizontal ratio             |
| `ratioH`             | float   | 0.1-10.0    | 1.0              | Vertical ratio               |
| `exportFormat`       | string  | bitmap/jpg/svg/pdf | bitmap      | Output format                |
| `jpgQuality`         | float   | 0.1-1.0     | 0.8              | JPEG quality                 |
| `pdfExportMode`      | string  | firstPage/allPages/selectedPage | firstPage | PDF export mode |
| `selectedPdfPage`    | int     | 1+          | 1                | PDF page number              |
| `exportNameTemplate` | string  | -           | `{name}_{rr}-{cc}` | Output filename template   |

### Supported Input Formats

PNG, JPG, JPEG, TIFF, BMP, GIF, PDF, SVG

## Options

- `--rows=<N>`: Number of vertical splits (default: 2)
- `--cols=<N>`: Number of horizontal splits (default: 2)
- `--format=<fmt>`: Export format: `bitmap`, `jpg`, `svg`, `pdf` (default: bitmap)
- `--output=<dir>`: Output directory path (default: `resource/contents_result`)
- `--ratio-w=<N>`: Horizontal ratio (default: 1.0)
- `--ratio-h=<N>`: Vertical ratio (default: 1.0)
- `--server=<url>`: Change server address (default: `http://localhost:3011`)

## Examples

```
/fbanner:fbanner split resource/contents/example1.png --rows=3 --cols=4
/fbanner:fbanner split resource/contents/example3.pdf --rows=2 --cols=2 --format=svg --output=resource/contents_result/tiles
/fbanner:fbanner load resource/contents/example1.png
/fbanner:fbanner config --rows=2 --cols=3 --format=svg
/fbanner:fbanner export resource/contents_result
/fbanner:fbanner status
```
