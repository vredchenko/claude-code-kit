# Capture Photo

Take a photo using the webcam and save as PNG.

## Usage

```bash
# Basic capture (auto-detect webcam, max resolution)
./webcam.ts snap my-notes

# Specify device
./webcam.ts snap -d /dev/video2 my-notes

# Specify resolution
./webcam.ts snap -r 1920x1080 my-notes

# Quiet mode (minimal output)
./webcam.ts snap -q my-notes
```

## Options

| Flag | Description |
|------|-------------|
| `-d, --device <path>` | Video device (default: auto-detect external) |
| `-r, --resolution <WxH>` | Capture resolution (default: max supported) |
| `-q, --quiet` | Minimal output |

## Output Files

Photos are saved to `notes-captures/` directory:
- `{name}_original.png` - Raw capture
- `{name}_optimised.png` - Lossless optimized (if oxipng installed)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `WEBCAM_DEVICE` | Override default device |
| `WEBCAM_RES` | Override default resolution |

## Prerequisites

```bash
# Required
sudo apt install fswebcam v4l-utils

# Optional (PNG optimization)
cargo install oxipng
```

## Notes

- Resolution auto-detection queries the camera and uses the highest supported
- The script skips 30 frames and averages 3 frames for better quality
- Good lighting reduces noise and improves sharpness
