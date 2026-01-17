# Webcam Capture Script

A Bun/TypeScript CLI tool for capturing photos of paper notes using a USB webcam.

## Features

- **Auto-detection**: Automatically finds external USB webcams (prefers non-integrated cameras)
- **Max resolution**: Queries camera capabilities and uses the highest supported resolution
- **PNG optimization**: Optional lossless compression via oxipng

## Prerequisites

```bash
# Required
sudo apt install fswebcam v4l-utils

# Optional (PNG optimization)
cargo install oxipng
```

## Usage

```bash
# Make executable
chmod +x webcam.ts

# List available cameras
./webcam.ts list

# Show camera capabilities and controls
./webcam.ts caps

# Take a photo
./webcam.ts snap my-notes

# With specific device and resolution
./webcam.ts snap -d /dev/video2 -r 3840x2160 my-notes
```

## Output

Photos are saved to `notes-captures/` directory:
- `{name}_original.png` - Raw capture
- `{name}_optimised.png` - Lossless optimized (if oxipng installed)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `WEBCAM_DEVICE` | Override default device (e.g., `/dev/video2`) |
| `WEBCAM_RES` | Override default resolution (e.g., `1920x1080`) |

## Tips for Paper Notes

1. **Good lighting** reduces noise and improves sharpness
2. **Disable auto-focus** to prevent hunting:
   ```bash
   v4l2-ctl -d /dev/video2 --set-ctrl=focus_automatic_continuous=0
   v4l2-ctl -d /dev/video2 --set-ctrl=focus_absolute=30
   ```
3. Run `./webcam.ts caps` to see all available camera controls
