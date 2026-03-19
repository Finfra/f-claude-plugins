---
name: fqrgen
description: "Generate QR codes from URL/text via fQRGen REST API"
argument-hint: "[url or text]"
---

# fQRGen QR Code Generation

Generate QR code images from URLs or text provided by the user via the fQRGen REST API.

## Input

$ARGUMENTS

If no arguments are provided, ask the user for a URL.

## Prerequisites

The fQRGen REST API server (`http://localhost:3014`) must be running:

| Server             | How to Run                                      |
| ------------------ | ----------------------------------------------- |
| macOS Native App   | Launch fQRGen.app (enable REST API in Settings) |
| Node.js Web App    | `cd lib/qrgen-node && npm start`                |

## Execution Steps

1. **Check Server**: Verify the fQRGen server is running.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3014/
   ```
   If the server is not responding, inform the user with the launch command:
   > "fQRGen REST API server is not running. Launch the app with:"
   > ```bash
   > open -a "fQRGen"
   > ```
   > "Then enable REST API in Settings. Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Generate QR Code**: Generate a QR code via the REST API and save to file.
   ```bash
   TIMESTAMP=$(date +%Y%m%d-%H%M%S)
   curl -s -X POST http://localhost:3014/api/generate \
     -H 'Content-Type: application/json' \
     -d '{"data":"<USER_INPUT>","format":"png"}' \
     --output "./qr-${TIMESTAMP}.png"
   ```

3. **Verify Result**: Validate file size and format, then open preview on macOS.
   ```bash
   file ./qr-*.png
   open ./qr-*.png
   ```

4. **Report**: Inform the user of the generated file path and size.

## API Reference

| Field        | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Endpoint     | `POST /api/generate`                                         |
| Content-Type | `application/json`                                           |
| `data`       | URL/text to encode in QR code (default: `https://example.com`) |
| `format`     | `png` or `svg` (default: `png`)                              |
| Response (PNG) | `image/png` binary                                         |
| Response (SVG) | `image/svg+xml` text                                       |

## Usage

### Direct curl Call

**PNG:**
```bash
curl -s -X POST http://localhost:3014/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"data":"<URL_OR_TEXT>","format":"png"}' \
  --output qr-output.png
```

**SVG:**
```bash
curl -s -X POST http://localhost:3014/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"data":"<URL_OR_TEXT>","format":"svg"}' \
  --output qr-output.svg
```

### Node.js Client

```javascript
const { FQRGenClient } = require('./lib/qrgen-node/client');
const client = new FQRGenClient('http://localhost:3014');
await client.generateAndSave('https://example.com', './qr.png');
```

## Options

- `--format=svg`: Generate as SVG (default: PNG)
- `--output=<path>`: Specify output path
- `--server=<url>`: Change server address (default: `http://localhost:3014`)

## Examples

```
/fqrgen:fqrgen https://finfra.kr
/fqrgen:fqrgen https://github.com --format=svg
/fqrgen:fqrgen "Hello World" --output=./hello.png
```
