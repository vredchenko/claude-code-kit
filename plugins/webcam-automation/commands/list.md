# List Available Webcams

List all available video devices on the system.

## Usage

Run the webcam.ts script with the `list` command:

```bash
./webcam.ts list
```

## Prerequisites

Ensure the required dependencies are installed:

```bash
sudo apt install fswebcam v4l-utils
```

## Output

The command displays all video devices detected by `v4l2-ctl --list-devices`, showing device names and their associated `/dev/videoN` paths.

## Notes

- External USB webcams are preferred over integrated cameras when auto-detecting
- Use the device path shown here with the `-d` flag in other commands
