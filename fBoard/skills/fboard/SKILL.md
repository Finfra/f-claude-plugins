---
name: fboard
description: "Control fBoard whiteboard app via REST API"
argument-hint: "[command] [options]"
---

# fBoard Whiteboard Control

Control the fBoard whiteboard app (window, background, presets) via the fBoard REST API.

## Input

$ARGUMENTS

If no arguments are provided, ask the user what they want to do (e.g., change background color, apply preset, adjust window).

## Prerequisites

The fBoard REST API server (`http://localhost:3012`) must be running:

| Server           | How to Run                                       |
| ---------------- | ------------------------------------------------ |
| macOS Native App | Launch fBoard.app (enable REST API in Settings)  |

## Execution Steps

1. **Check Server**: Verify the fBoard server is running.
   ```bash
   curl -s --connect-timeout 3 -o /dev/null -w "%{http_code}" http://localhost:3012/
   ```
   If the server is not responding, inform the user with the launch command:
   > "fBoard REST API server is not running. Launch the app with:"
   > ```bash
   > open -a "fBoard"
   > ```
   > "Then enable REST API in Settings. Let me know when ready."

   Do NOT attempt to start the server automatically. Wait for user confirmation before proceeding.

2. **Execute Command**: Run the requested operation via the REST API.

3. **Report**: Inform the user of the result.

## API Reference

### Server

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/`           | Server info        |
| GET    | `/api/status` | Server status      |

### Window

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/window`             | Get window state         |
| POST   | `/api/window/level`       | Set window level         |
| POST   | `/api/window/frame`       | Set window frame         |
| POST   | `/api/window/center`      | Center window on screen  |
| POST   | `/api/window/reset`       | Reset to default size    |
| POST   | `/api/window/fullscreen`  | Toggle fullscreen        |
| POST   | `/api/window/move-screen` | Move to another screen   |

### Background

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/background`          | Get background state  |
| POST   | `/api/background/color`    | Set background color  |
| POST   | `/api/background/image`    | Set background image  |
| DELETE | `/api/background/image`    | Remove background image |
| POST   | `/api/background/fill-mode`| Set image fill mode   |

### Presets

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/presets`        | List all presets   |
| POST   | `/api/presets`        | Create new preset  |
| POST   | `/api/presets/apply`  | Apply a preset     |
| DELETE | `/api/presets/{id}`   | Delete a preset    |

### Screens

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/api/screens` | List available screens |

## Usage

### Background Color

```bash
# Set background color (hex)
curl -s -X POST http://localhost:3012/api/background/color \
  -H 'Content-Type: application/json' \
  -d '{"color":"#FF5733"}'
```

### Window Control

```bash
# Center window
curl -s -X POST http://localhost:3012/api/window/center

# Set window level (normal / floating / background)
curl -s -X POST http://localhost:3012/api/window/level \
  -H 'Content-Type: application/json' \
  -d '{"level":"floating"}'

# Set window frame
curl -s -X POST http://localhost:3012/api/window/frame \
  -H 'Content-Type: application/json' \
  -d '{"x":100,"y":100,"width":800,"height":600}'
```

### Presets

```bash
# List presets
curl -s http://localhost:3012/api/presets

# Apply preset by ID
curl -s -X POST http://localhost:3012/api/presets/apply \
  -H 'Content-Type: application/json' \
  -d '{"id":"00000000-0000-0000-0000-000000000001"}'
```

### Status

```bash
# Get current status
curl -s http://localhost:3012/api/status
```

## Examples

```
/fboard:fboard color #FF5733
/fboard:fboard preset fullscreen
/fboard:fboard status
/fboard:fboard window center
/fboard:fboard level floating
```
