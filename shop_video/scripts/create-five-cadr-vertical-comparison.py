"""Create frame-matched landscape/portrait comparison for five_cadr.mp4."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "public" / "assets" / "full-promo" / "five_cadr.mp4"
VERTICAL = ROOT / "output" / "five_cadr_vertical.mp4"
OUTPUT = ROOT / "output" / "five_cadr_vertical_comparison.png"
FRAME_DIR = ROOT / "output" / "five_cadr_vertical_comparison_frames"
FPS = 30
FRAMES = (0, 20, 40, 60, 80, 100, 120, 145, 170, 195, 224)


def bundled_ffmpeg() -> Path:
    suffix = ".exe" if __import__("os").name == "nt" else ""
    package_root = ROOT / "node_modules" / "@remotion"
    result = next(
        (
            package / f"ffmpeg{suffix}"
            for package in package_root.glob("compositor-*")
            if (package / f"ffmpeg{suffix}").exists()
        ),
        None,
    )
    if result is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg was not found.")
    return result


def extract(ffmpeg: Path, video: Path, frame: int, destination: Path) -> None:
    subprocess.run(
        [
            str(ffmpeg),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-ss",
            f"{frame / FPS:.6f}",
            "-i",
            str(video),
            "-frames:v",
            "1",
            str(destination),
        ],
        check=True,
    )


def main() -> None:
    for source in (ORIGINAL, VERTICAL):
        if not source.exists():
            raise FileNotFoundError(f"Required video is missing: {source}")

    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True)
    ffmpeg = bundled_ffmpeg()

    landscape_box = (432, 243)
    portrait_box = (198, 352)
    cell_width = 670
    cell_height = 410
    gap = 20
    columns = 3
    rows = (len(FRAMES) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        (columns * cell_width + (columns + 1) * gap, rows * cell_height + (rows + 1) * gap),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    title_font = ImageFont.truetype(str(font_path), 17) if font_path.exists() else ImageFont.load_default()
    label_font = ImageFont.truetype(str(font_path), 13) if font_path.exists() else ImageFont.load_default()

    for index, frame in enumerate(FRAMES):
        original_path = FRAME_DIR / f"original-{frame:03d}.png"
        vertical_path = FRAME_DIR / f"vertical-{frame:03d}.png"
        extract(ffmpeg, ORIGINAL, frame, original_path)
        extract(ffmpeg, VERTICAL, frame, vertical_path)

        column, row = index % columns, index // columns
        left = gap + column * (cell_width + gap)
        top = gap + row * (cell_height + gap)
        draw.text((left, top), f"КАДР {frame:03d}  ·  {frame / FPS:.2f} с", font=title_font, fill="#EAF6F5")
        draw.text((left, top + 27), "ОРИГИНАЛ 16:9", font=label_font, fill="#9EB5BA")
        draw.text((left + 448, top + 27), "ВЕРТИКАЛЬНАЯ ВЕРСИЯ 9:16", font=label_font, fill="#9EB5BA")

        with Image.open(original_path) as image:
            landscape = ImageOps.contain(image.convert("RGB"), landscape_box, Image.Resampling.LANCZOS)
        with Image.open(vertical_path) as image:
            portrait = ImageOps.contain(image.convert("RGB"), portrait_box, Image.Resampling.LANCZOS)

        landscape_x = left
        portrait_x = left + 448
        image_top = top + 50
        sheet.paste(landscape, (landscape_x, image_top + (portrait_box[1] - landscape.height) // 2))
        sheet.paste(portrait, (portrait_x, image_top))

    sheet.save(OUTPUT, optimize=True)
    print(f"Created frame-matched comparison: {OUTPUT} ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
