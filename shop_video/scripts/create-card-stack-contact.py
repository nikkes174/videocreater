"""Create a labeled contact sheet for the required card-stack review frames."""

import subprocess
import sys
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FRAMES = (0, 20, 40, 60, 80, 95, 110, 135, 164)
V2_FRAMES = (0, 8, 20, 36, 48, 60, 80, 96, 118, 140, 164)
FPS = 30
THUMB_WIDTH = 600
THUMB_HEIGHT = 338
LABEL_HEIGHT = 42
GAP = 24
COLUMNS = 3


def main() -> None:
    video = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "output/unlimitsub_card_stack.mp4")
    output = ROOT / (sys.argv[2] if len(sys.argv) > 2 else "output/unlimitsub_card_stack_contact.png")
    default_frame_dir = "card-stack-frames" if output.stem == "unlimitsub_card_stack_contact" else f"{output.stem}-frames"
    frame_dir = ROOT / "output" / default_frame_dir
    frames = V2_FRAMES if output.stem == "unlimitsub_card_stack_v2_contact" else DEFAULT_FRAMES
    rows = math.ceil(len(frames) / COLUMNS)

    ffmpeg = next(
        (path for path in (ROOT / "node_modules" / "@remotion").glob("compositor-*/ffmpeg.exe")),
        None,
    )
    if ffmpeg is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg.exe was not found.")
    if not video.exists():
        raise FileNotFoundError(f"Rendered video not found: {video}")

    frame_dir.mkdir(parents=True, exist_ok=True)
    for frame in frames:
        target = frame_dir / f"frame-{frame:03d}.png"
        subprocess.run(
            [
                str(ffmpeg),
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(video),
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
    cell_height = LABEL_HEIGHT + THUMB_HEIGHT
    sheet = Image.new(
        "RGB",
        (COLUMNS * THUMB_WIDTH + (COLUMNS + 1) * GAP, rows * cell_height + (rows + 1) * GAP),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)

    for index, frame in enumerate(frames):
        source = frame_dir / f"frame-{frame:03d}.png"
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

    sheet.save(output, optimize=True)
    print(f"Created {output} ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
