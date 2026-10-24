"""Create a labeled contact sheet from seven frames across the current tour."""

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
FRAME_DIR = ROOT / "output" / "site-tour-v2-frames"
VIDEO = ROOT / "output" / "unlimitsub_site_tour_v2.mp4"
MANIFEST = ROOT / "src" / "config" / "siteTourAssets.json"
OUTPUT = ROOT / "output" / "unlimitsub_site_tour_v2_contact.png"
THUMB_WIDTH = 600
THUMB_HEIGHT = 338
LABEL_HEIGHT = 42
GAP = 24
COLUMNS = 3
ROWS = 3


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    duration_in_frames = int(manifest["durationInFrames"])
    frames = tuple(round(index * (duration_in_frames - 1) / 6) for index in range(7))
    ffmpeg = next(
        (path for path in (ROOT / "node_modules" / "@remotion").glob("compositor-*/ffmpeg.exe")),
        None,
    )
    if ffmpeg is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg.exe was not found.")
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    for frame in frames:
        target = FRAME_DIR / f"frame-{frame:03d}.png"
        subprocess.run(
            [
                str(ffmpeg),
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(VIDEO),
                "-ss",
                f"{frame / int(manifest['fps']):.6f}",
                "-frames:v",
                "1",
                str(target),
            ],
            check=True,
        )

    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 23) if font_path.exists() else ImageFont.load_default()
    cell_height = LABEL_HEIGHT + THUMB_HEIGHT
    sheet = Image.new(
        "RGB",
        (COLUMNS * THUMB_WIDTH + (COLUMNS + 1) * GAP, ROWS * cell_height + (ROWS + 1) * GAP),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)

    for index, frame in enumerate(frames):
        source = FRAME_DIR / f"frame-{frame:03d}.png"
        if not source.exists():
            raise FileNotFoundError(f"Missing review frame: {source}")
        image = Image.open(source).convert("RGB").resize(
            (THUMB_WIDTH, THUMB_HEIGHT), Image.Resampling.LANCZOS
        )
        column = index % COLUMNS
        row = index // COLUMNS
        left = GAP + column * (THUMB_WIDTH + GAP)
        top = GAP + row * (cell_height + GAP)
        draw.text((left, top + 8), f"FRAME {frame:03d}", font=font, fill="#EAF6F5")
        sheet.paste(image, (left, top + LABEL_HEIGHT))

    sheet.save(OUTPUT, optimize=True)
    print(f"Created {OUTPUT} ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
