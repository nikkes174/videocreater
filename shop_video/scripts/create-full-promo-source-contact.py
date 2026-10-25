"""Create a source-inspection sheet for the seven approved promo clips."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ORDER = (
    "first_cadr.mp4",
    "first_v2_cadr.mp4",
    "three_cadr.mp4",
    "two_cadr.mp4",
    "five_cadr.mp4",
    "four_cadr.mp4",
    "end_cadr.mp4",
)
OUTPUT = ROOT / "output" / "unlimitsub_full_promo_source_review.png"
FRAME_DIR = ROOT / "output" / "unlimitsub_full_promo_source_review_frames"
THUMB = (480, 270)
LABEL_H = 36
GAP = 18
COLUMNS = 3


def binary(name: str) -> Path:
    suffix = ".exe" if __import__("os").name == "nt" else ""
    package_root = ROOT / "node_modules" / "@remotion"
    candidate = next(
        (package / f"{name}{suffix}" for package in package_root.glob("compositor-*") if (package / f"{name}{suffix}").exists()),
        None,
    )
    if candidate is None:
        raise FileNotFoundError(f"Remotion bundled {name} was not found.")
    return candidate


def metadata(ffprobe: Path, video: Path) -> dict:
    result = subprocess.run(
        [
            str(ffprobe),
            "-v",
            "error",
            "-count_frames",
            "-show_entries",
            "stream=codec_type,width,height,avg_frame_rate,nb_read_frames",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(video),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def main() -> None:
    ffmpeg = binary("ffmpeg")
    ffprobe = binary("ffprobe")
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    samples: list[tuple[str, str, Path]] = []

    for scene_index, filename in enumerate(ORDER, start=1):
        video = ROOT / "output" / filename
        if not video.exists():
            raise FileNotFoundError(f"Required source clip is missing: {video}")
        info = metadata(ffprobe, video)
        stream = next((item for item in info["streams"] if item["codec_type"] == "video"), None)
        if stream is None:
            raise RuntimeError(f"No video stream in {video}")
        frames = int(stream["nb_read_frames"])
        fps_n, fps_d = (int(part) for part in stream["avg_frame_rate"].split("/"))
        fps = fps_n / fps_d
        seconds = float(info["format"]["duration"])
        positions = (0, frames // 2, max(0, frames - 1))
        for label, frame in zip(("START", "MIDDLE", "END"), positions):
            target = FRAME_DIR / f"scene-{scene_index:02d}-{label.lower()}.png"
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
                    f"{frame / fps:.6f}",
                    "-frames:v",
                    "1",
                    str(target),
                ],
                check=True,
            )
            samples.append((f"{scene_index}. {filename} — {label} {frame}/{frames - 1}", filename, target))
        print(
            f"{scene_index}. {filename}: {stream['width']}x{stream['height']}, "
            f"{fps:.0f} fps, {seconds:.3f}s, {frames} frames"
        )

    rows = (len(samples) + COLUMNS - 1) // COLUMNS
    cell_h = LABEL_H + THUMB[1]
    sheet = Image.new(
        "RGB",
        (COLUMNS * THUMB[0] + (COLUMNS + 1) * GAP, rows * cell_h + (rows + 1) * GAP),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 17) if font_path.exists() else ImageFont.load_default()
    for index, (label, _, path) in enumerate(samples):
        with Image.open(path) as source:
            thumb = source.convert("RGB").resize(THUMB, Image.Resampling.LANCZOS)
        column, row = index % COLUMNS, index // COLUMNS
        left = GAP + column * (THUMB[0] + GAP)
        top = GAP + row * (cell_h + GAP)
        draw.text((left, top + 5), label, font=font, fill="#EAF6F5")
        sheet.paste(thumb, (left, top + LABEL_H))
    sheet.save(OUTPUT, optimize=True)
    print(f"Created {OUTPUT} ({sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
