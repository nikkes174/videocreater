"""Create key-scene and transition-control sheets for the vertical promo."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "output/unlimitsub_full_promo_9x16.mp4")
MANIFEST = ROOT / "src" / "config" / "fullPromoManifest.json"
OUTPUT_STEM = VIDEO.stem
SCENE_CONTACT = ROOT / "output" / f"{OUTPUT_STEM}_contact.png"
TRANSITION_CONTACT = ROOT / "output" / f"{OUTPUT_STEM}_transitions_contact.png"
TRANSITION_FRAME_DIR = ROOT / "output" / f"{OUTPUT_STEM}_transition_frames"
FPS = 30


def bundled_binary(name: str) -> Path:
    suffix = ".exe" if __import__("os").name == "nt" else ""
    package_root = ROOT / "node_modules" / "@remotion"
    result = next(
        (
            package / f"{name}{suffix}"
            for package in package_root.glob("compositor-*")
            if (package / f"{name}{suffix}").exists()
        ),
        None,
    )
    if result is None:
        raise FileNotFoundError(f"Remotion's bundled {name} was not found.")
    return result


def extract(ffmpeg: Path, frame: int, destination: Path) -> None:
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
            str(VIDEO),
            "-frames:v",
            "1",
            str(destination),
        ],
        check=True,
    )


def create_sheet(
    entries: list[tuple[str, Path]],
    output: Path,
    columns: int,
    thumb_width: int,
    thumb_height: int,
) -> None:
    gap = 18
    label_height = 34
    rows = (len(entries) + columns - 1) // columns
    cell_height = thumb_height + label_height
    sheet = Image.new(
        "RGB",
        (columns * thumb_width + (columns + 1) * gap, rows * cell_height + (rows + 1) * gap),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 18) if font_path.exists() else ImageFont.load_default()
    for index, (label, image_path) in enumerate(entries):
        if not image_path.exists():
            raise FileNotFoundError(f"Missing contact frame: {image_path}")
        with Image.open(image_path) as image:
            thumbnail = image.convert("RGB").resize(
                (thumb_width, thumb_height), Image.Resampling.LANCZOS
            )
        column, row = index % columns, index // columns
        left = gap + column * (thumb_width + gap)
        top = gap + row * (cell_height + gap)
        draw.text((left, top + 5), label, font=font, fill="#EAF6F5")
        sheet.paste(thumbnail, (left, top + label_height))
    sheet.save(output, optimize=True)
    print(f"Created {output} ({sheet.width}x{sheet.height})")


def main() -> None:
    if not VIDEO.exists():
        raise FileNotFoundError(f"Rendered final video is missing: {VIDEO}")
    if not MANIFEST.exists():
        raise FileNotFoundError(f"Generated scene manifest is missing: {MANIFEST}")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    ffmpeg = bundled_binary("ffmpeg")
    frame_dir = ROOT / "output" / f"{OUTPUT_STEM}_contact-frames"
    frame_dir.mkdir(parents=True, exist_ok=True)

    starts: list[int] = []
    next_start = 0
    for index, scene in enumerate(manifest["scenes"]):
        starts.append(next_start)
        if index < len(manifest["scenes"]) - 1:
            next_scene = manifest["scenes"][index + 1]
            next_start += (
                scene["durationInFrames"]
                - manifest["transitionFrames"]
                - next_scene["preRollFrames"]
            )

    key_local_frames = (134, 105, 82, 86, 209, 164, 104)
    scene_entries: list[tuple[str, Path]] = []
    for index, (scene, start, local_frame) in enumerate(
        zip(manifest["scenes"], starts, key_local_frames), start=1
    ):
        local_frame = min(local_frame, scene["durationInFrames"] - 1)
        global_frame = start + local_frame
        destination = frame_dir / f"scene-{index:02d}-frame-{global_frame:04d}.png"
        extract(ffmpeg, global_frame, destination)
        scene_entries.append((f"SCENE {index:02d}  {scene['file']}  F{global_frame:04d}", destination))

    create_sheet(scene_entries, SCENE_CONTACT, 3, 540, 960)

    TRANSITION_FRAME_DIR.mkdir(parents=True, exist_ok=True)
    transition_entries: list[tuple[str, Path]] = []
    for index in range(len(manifest["scenes"]) - 1):
        transition_start = starts[index + 1] + manifest["scenes"][index + 1]["preRollFrames"]
        positions = (
            ("before", transition_start - 1),
            ("middle", transition_start + manifest["transitionFrames"] // 2),
            ("after", transition_start + manifest["transitionFrames"]),
        )
        for label, frame in positions:
            destination = TRANSITION_FRAME_DIR / f"transition-{index + 1:02d}-{label}.png"
            extract(ffmpeg, frame, destination)
            transition_entries.append((f"T{index + 1} {label.upper()}  F{frame:04d}", destination))

    create_sheet(transition_entries, TRANSITION_CONTACT, 3, 360, 640)


if __name__ == "__main__":
    main()
