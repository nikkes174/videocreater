"""Create the UnlimitSub Page Turn V5 review contact sheet."""

from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "output" / "unlimitsub_page_turn_intro_v5.mp4"
CONTACT = ROOT / "output" / "unlimitsub_page_turn_intro_v5_contact.png"
FRAME_DIR = ROOT / "output" / "unlimitsub_page_turn_intro_v5_contact-frames"
REVIEW_FRAMES = (0, 8, 16, 24, 30, 40, 50, 60, 64, 70, 76, 82, 88, 94, 100, 108, 116, 124, 136, 149)
FPS = 30
THUMB_WIDTH = 480
THUMB_HEIGHT = 270
LABEL_HEIGHT = 34
GAP = 20
COLUMNS = 4


def main() -> None:
    ffmpeg = next(
        (path for path in (ROOT / "node_modules" / "@remotion").glob("compositor-*/ffmpeg.exe")),
        None,
    )
    if ffmpeg is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg.exe was not found.")
    if not VIDEO.exists():
        raise FileNotFoundError(f"Rendered video not found: {VIDEO}")

    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    for frame in REVIEW_FRAMES:
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
                f"{frame / FPS:.6f}",
                "-frames:v",
                "1",
                str(target),
            ],
            check=True,
        )

    rows = (len(REVIEW_FRAMES) + COLUMNS - 1) // COLUMNS
    cell_height = LABEL_HEIGHT + THUMB_HEIGHT
    sheet = Image.new(
        "RGB",
        (COLUMNS * THUMB_WIDTH + (COLUMNS + 1) * GAP, rows * cell_height + (rows + 1) * GAP),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 19) if font_path.exists() else ImageFont.load_default()

    for index, frame in enumerate(REVIEW_FRAMES):
        source = FRAME_DIR / f"frame-{frame:03d}.png"
        if not source.exists():
            raise FileNotFoundError(f"Missing review frame: {source}")
        with Image.open(source) as image:
            thumbnail = image.convert("RGB").resize(
                (THUMB_WIDTH, THUMB_HEIGHT), Image.Resampling.LANCZOS
            )
        column = index % COLUMNS
        row = index // COLUMNS
        left = GAP + column * (THUMB_WIDTH + GAP)
        top = GAP + row * (cell_height + GAP)
        draw.text((left, top + 4), f"FRAME {frame:03d}", font=font, fill="#EAF6F5")
        sheet.paste(thumbnail, (left, top + LABEL_HEIGHT))

    sheet.save(CONTACT, optimize=True)
    print(f"Created {CONTACT} ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
