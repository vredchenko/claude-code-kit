#!/usr/bin/env bun
/**
 * Webcam capture script for taking photos of paper notes.
 * Auto-detects external USB webcams and uses max supported resolution.
 *
 * Usage:
 *   webcam.ts list                     # List available cameras
 *   webcam.ts caps                     # Show camera capabilities & controls
 *   webcam.ts snap [name]              # Take a photo (PNG) at max resolution
 *   webcam.ts snap -d /dev/video2 foo  # Use specific device
 *   webcam.ts snap -r 1920x1080 foo    # Override resolution
 *
 * Prerequisites:
 *   sudo apt install fswebcam v4l-utils
 *
 * Optional (for PNG optimization):
 *   cargo install oxipng
 */

import { $ } from "bun";
import { parseArgs } from "util";

const NOTES_DIR = "notes-captures";
const FALLBACK_RES = "1920x1080";

// ANSI colors (disabled if not TTY)
const isTTY = process.stdout.isTTY;
const c = {
  reset: isTTY ? "\x1b[0m" : "",
  bold: isTTY ? "\x1b[1m" : "",
  dim: isTTY ? "\x1b[2m" : "",
  green: isTTY ? "\x1b[32m" : "",
  yellow: isTTY ? "\x1b[33m" : "",
  red: isTTY ? "\x1b[31m" : "",
  cyan: isTTY ? "\x1b[36m" : "",
};

function log(msg: string) {
  console.log(msg);
}

function success(msg: string) {
  console.log(`${c.green}✓${c.reset} ${msg}`);
}

function warn(msg: string) {
  console.log(`${c.yellow}!${c.reset} ${msg}`);
}

function error(msg: string) {
  console.error(`${c.red}✗${c.reset} ${msg}`);
}

function dim(msg: string): string {
  return `${c.dim}${msg}${c.reset}`;
}

async function checkDependencies(): Promise<{ ok: boolean; hasOxipng: boolean }> {
  const missing: string[] = [];
  let hasOxipng = false;

  try {
    await $`which fswebcam`.quiet();
  } catch {
    missing.push("fswebcam");
  }

  try {
    await $`which v4l2-ctl`.quiet();
  } catch {
    missing.push("v4l-utils");
  }

  try {
    await $`which oxipng`.quiet();
    hasOxipng = true;
  } catch {
    // Optional
  }

  if (missing.length > 0) {
    error("Missing required dependencies:");
    console.error(`  sudo apt install ${missing.join(" ")}`);
    return { ok: false, hasOxipng: false };
  }
  return { ok: true, hasOxipng };
}

async function listDevices() {
  log(`${c.bold}Available video devices:${c.reset}\n`);
  try {
    await $`v4l2-ctl --list-devices`;
  } catch {
    error("No video devices found");
  }
}

async function showCapabilities(device?: string) {
  const dev = device || (await findWebcam());
  if (!dev) {
    error("No webcam found. Use -d to specify device.");
    process.exit(1);
  }

  log(`${c.bold}Device:${c.reset} ${dev}\n`);

  log(`${c.bold}=== Supported Formats & Resolutions ===${c.reset}\n`);
  await $`v4l2-ctl -d ${dev} --list-formats-ext`;

  log(`\n${c.bold}=== Camera Controls ===${c.reset}\n`);
  await $`v4l2-ctl -d ${dev} --list-ctrls`;

  log(`\n${c.bold}=== Tips for paper notes ===${c.reset}`);
  log("• Max resolution is auto-detected and used by default");
  log("• Good lighting reduces noise and improves sharpness");
  log("• Disable auto-focus to prevent hunting:\n");
  log(dim(`  v4l2-ctl -d ${dev} --set-ctrl=focus_automatic_continuous=0`));
  log(dim(`  v4l2-ctl -d ${dev} --set-ctrl=focus_absolute=30`));
  log("");
}

async function getMaxResolution(device: string): Promise<string | null> {
  try {
    const result = await $`v4l2-ctl -d ${device} --list-formats-ext`.text();
    const resolutions: { width: number; height: number; pixels: number }[] = [];

    // Parse "Size: Discrete WxH" lines
    const regex = /Size:\s*Discrete\s+(\d+)x(\d+)/g;
    let match;
    while ((match = regex.exec(result)) !== null) {
      const width = parseInt(match[1], 10);
      const height = parseInt(match[2], 10);
      resolutions.push({ width, height, pixels: width * height });
    }

    if (resolutions.length === 0) return null;

    // Sort by pixel count descending and return the largest
    resolutions.sort((a, b) => b.pixels - a.pixels);
    return `${resolutions[0].width}x${resolutions[0].height}`;
  } catch {
    return null;
  }
}

async function findWebcam(deviceOverride?: string): Promise<string | null> {
  if (deviceOverride) return deviceOverride;
  if (process.env.WEBCAM_DEVICE) return process.env.WEBCAM_DEVICE;

  try {
    const result = await $`v4l2-ctl --list-devices`.text();
    const lines = result.split("\n");

    // Prefer non-integrated camera
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(":") && !line.toLowerCase().includes("integrated")) {
        const deviceLine = lines[i + 1]?.trim();
        if (deviceLine?.startsWith("/dev/video")) {
          return deviceLine;
        }
      }
    }

    // Fallback to first device
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("/dev/video")) {
        return trimmed;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

interface SnapOptions {
  name?: string;
  device?: string;
  resolution?: string;
  skipFrames?: number;
  averageFrames?: number;
  quiet?: boolean;
}

async function snap(options: SnapOptions = {}) {
  const { hasOxipng } = await checkDependencies();
  const quiet = options.quiet || false;

  const device = await findWebcam(options.device);
  if (!device) {
    error("No webcam found. Run 'webcam.ts list' or use -d /dev/videoN");
    process.exit(1);
  }

  // Resolution priority: CLI flag > env var > auto-detect max > fallback
  let resolution = options.resolution || process.env.WEBCAM_RES;
  if (!resolution) {
    const maxRes = await getMaxResolution(device);
    resolution = maxRes || FALLBACK_RES;
  }
  const skipFrames = options.skipFrames || 30;
  const averageFrames = options.averageFrames || 3;

  await $`mkdir -p ${NOTES_DIR}`;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const baseName = options.name || `notes-${timestamp}`;

  if (!quiet) {
    log(`${c.bold}Capturing...${c.reset}`);
    log(`  Device:     ${device}`);
    log(`  Resolution: ${resolution}`);
    log(`  Frames:     skip ${skipFrames}, average ${averageFrames}`);
    log(`  Output:     ${NOTES_DIR}/${baseName}_*.png`);
    log("");
  }
  const originalPath = `${NOTES_DIR}/${baseName}_original.png`;
  const optimisedPath = `${NOTES_DIR}/${baseName}_optimised.png`;

  try {
    // Capture to original file
    await $`fswebcam -d ${device} -r ${resolution} --png 0 --no-banner -S ${skipFrames} -F ${averageFrames} ${originalPath}`.quiet();

    const originalSize = await Bun.file(originalPath).size;
    success(`${originalPath} ${dim(`(${formatBytes(originalSize)})`)}`);

    if (hasOxipng) {
      // Copy to optimised path and optimize
      await $`cp ${originalPath} ${optimisedPath}`.quiet();
      if (!quiet) log(dim("Optimizing PNG..."));
      await $`oxipng -o 4 --strip safe ${optimisedPath}`.quiet();
      const optimisedSize = await Bun.file(optimisedPath).size;
      const saved = originalSize - optimisedSize;
      success(`${optimisedPath} ${dim(`(${formatBytes(optimisedSize)}, saved ${formatBytes(saved)})`)}`);
    } else {
      if (!quiet) warn("Install oxipng for optimised copy: cargo install oxipng");
    }
  } catch (err) {
    error(`Capture failed: ${err}`);
    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function printHelp() {
  console.log(`${c.bold}webcam.ts${c.reset} - Capture photos from USB webcam

${c.bold}USAGE${c.reset}
  webcam.ts <command> [options]

${c.bold}COMMANDS${c.reset}
  list, l          List available video devices
  caps, c          Show camera capabilities and controls
  snap, s [name]   Take a photo (saves as PNG)

${c.bold}OPTIONS${c.reset}
  -d, --device <path>      Video device ${dim("(default: auto-detect external)")}
  -r, --resolution <WxH>   Capture resolution ${dim("(default: max supported)")}
  -q, --quiet              Minimal output
  -h, --help               Show this help

${c.bold}ENVIRONMENT${c.reset}
  WEBCAM_DEVICE            Override default device
  WEBCAM_RES               Override default resolution

${c.bold}EXAMPLES${c.reset}
  webcam.ts list
  webcam.ts caps
  webcam.ts snap my-notes
  webcam.ts snap -r 3840x2160 -d /dev/video2 hires

${c.bold}PREREQUISITES${c.reset}
  sudo apt install fswebcam v4l-utils
  cargo install oxipng  ${dim("(optional, for PNG optimization)")}`);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      device: { type: "string", short: "d" },
      resolution: { type: "string", short: "r" },
      quiet: { type: "boolean", short: "q", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    printHelp();
    process.exit(0);
  }

  const deps = await checkDependencies();
  if (!deps.ok) {
    process.exit(1);
  }

  const command = positionals[0];

  switch (command) {
    case "list":
    case "l":
      await listDevices();
      break;
    case "caps":
    case "c":
      await showCapabilities(values.device);
      break;
    case "snap":
    case "s":
      await snap({
        name: positionals[1],
        device: values.device,
        resolution: values.resolution,
        quiet: values.quiet,
      });
      break;
    default:
      error(`Unknown command: ${command}`);
      log("\nRun 'webcam.ts --help' for usage.");
      process.exit(1);
  }
}

main();
