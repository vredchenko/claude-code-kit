# Show Camera Capabilities

Display supported formats, resolutions, and camera controls for a webcam.

## Usage

```bash
# Auto-detect webcam
./webcam.ts caps

# Specific device
./webcam.ts caps -d /dev/video2
```

## Output

The command shows:
- **Supported Formats & Resolutions** - All video formats and discrete resolutions
- **Camera Controls** - Available settings like brightness, contrast, focus, etc.
- **Tips** - Suggestions for optimal paper note capture

## Disabling Auto-Focus

For paper notes, disable auto-focus to prevent hunting:

```bash
v4l2-ctl -d /dev/video2 --set-ctrl=focus_automatic_continuous=0
v4l2-ctl -d /dev/video2 --set-ctrl=focus_absolute=30
```

## Prerequisites

```bash
sudo apt install fswebcam v4l-utils
```
