"""Create the required review contact sheet for the Page Turn intro."""

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "output" / "unlimitsub_page_turn_intro.mp4"
OUTPUT = ROOT / "output" / "unlimitsub_page_turn_intro_contact.png"
FRAME_DIR = ROOT / "output" / "unlimitsub_page_turn_intro_contact-frames"
FRAMES = (0, 20, 30, 40, 50, 64, 78, 95, 112, 130, 149)
FPS = 30
THUMB_WIDTH = 600
THUMB_HEIGHT = 338
LABEL_HEIGHT = 42
GAP = 24
COLUMNS = 3


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
    for frame in FRAMES:
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

    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 23) if font_path.exists() else ImageFont.load_default()
    rows = (len(FRAMES) + COLUMNS - 1) // COLUMNS
    cell_height = LABEL_HEIGHT + THUMB_HEIGHT
    sheet = Image.new(
        "RGB",
        (COLUMNS * THUMB_WIDTH + (COLUMNS + 1) * GAP, rows * cell_height + (rows + 1) * GAP),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)

    for index, frame in enumerate(FRAMES):
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
