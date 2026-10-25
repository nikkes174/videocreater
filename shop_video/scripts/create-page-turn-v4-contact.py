"""Build the requested Page Turn V4 contact sheet and slogan motion strip."""

from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "output" / "unlimitsub_page_turn_intro_v4.mp4"
CONTACT = ROOT / "output" / "unlimitsub_page_turn_intro_v4_contact.png"
CONTACT_FRAMES_DIR = ROOT / "output" / "unlimitsub_page_turn_intro_v4_contact-frames"
MOTION_CONTACT = ROOT / "output" / "unlimitsub_page_turn_intro_v4_slogan_motion.png"
MOTION_FRAMES_DIR = ROOT / "output" / "unlimitsub_page_turn_intro_v4_slogan-frames"
REVIEW_FRAMES = (0, 20, 30, 40, 50, 64, 70, 75, 80, 85, 90, 100, 112, 130, 149)
SLOGAN_FRAMES = tuple(range(70, 101))
FPS = 30


def extract(ffmpeg: Path, frames: tuple[int, ...], destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    for frame in frames:
        target = destination / f"frame-{frame:03d}.png"
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


def build_contact_sheet(
    frames: tuple[int, ...],
    frame_dir: Path,
    output: Path,
    columns: int,
    thumb_width: int,
    thumb_height: int,
    label_height: int,
    gap: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> None:
    rows = (len(frames) + columns - 1) // columns
    cell_height = label_height + thumb_height
    sheet = Image.new(
        "RGB",
        (columns * thumb_width + (columns + 1) * gap, rows * cell_height + (rows + 1) * gap),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)
    for index, frame in enumerate(frames):
        source = frame_dir / f"frame-{frame:03d}.png"
        if not source.exists():
            raise FileNotFoundError(f"Missing review frame: {source}")
        image = Image.open(source).convert("RGB").resize(
            (thumb_width, thumb_height), Image.Resampling.LANCZOS
        )
        column = index % columns
        row = index // columns
        left = gap + column * (thumb_width + gap)
        top = gap + row * (cell_height + gap)
        draw.text((left, top + 6), f"FRAME {frame:03d}", font=font, fill="#EAF6F5")
        sheet.paste(image, (left, top + label_height))
    sheet.save(output, optimize=True)
    print(f"Created {output} ({sheet.width}x{sheet.height})")


def main() -> None:
    ffmpeg = next(
        (path for path in (ROOT / "node_modules" / "@remotion").glob("compositor-*/ffmpeg.exe")),
        None,
    )
    if ffmpeg is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg.exe was not found.")
    if not VIDEO.exists():
        raise FileNotFoundError(f"Rendered video not found: {VIDEO}")

    extract(ffmpeg, REVIEW_FRAMES, CONTACT_FRAMES_DIR)
    extract(ffmpeg, SLOGAN_FRAMES, MOTION_FRAMES_DIR)

    font_path = Path("C:/Windows/Fonts/arial.ttf")
    review_font = ImageFont.truetype(str(font_path), 23) if font_path.exists() else ImageFont.load_default()
    motion_font = ImageFont.truetype(str(font_path), 17) if font_path.exists() else ImageFont.load_default()
    build_contact_sheet(REVIEW_FRAMES, CONTACT_FRAMES_DIR, CONTACT, 3, 600, 338, 42, 24, review_font)
    build_contact_sheet(SLOGAN_FRAMES, MOTION_FRAMES_DIR, MOTION_CONTACT, 5, 440, 248, 30, 16, motion_font)


if __name__ == "__main__":
    main()
