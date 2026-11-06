"""Create a labeled storyboard from scene boundaries and transition beats."""

import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "output" / "unlimitsub_final_stories_1080x1920.mp4"
OUTPUT = ROOT / "output" / "unlimitsub_final_stories_contact.png"
CLIP_NAMES = [
    "first_cadr_vertical.mp4",
    "first_v2_cadr_vertical.mp4",
    "three_cadr_vertical.mp4",
    "two_cadr_vertical.mp4",
    "five_cadr_vertical.mp4",
    "four_cadr_vertical.mp4",
    "end_cadr_vertical.mp4",
]
CLIP_FRAMES = [150, 210, 165, 172, 225, 180, 105]
TRANSITION_FRAMES = [12, 12, 10, 10, 10, 8]
FPS = 30
THUMB = (180, 320)
LABEL_H = 36
GAP = 16
COLUMNS = 5


def bundled_ffmpeg() -> Path:
    suffix = ".exe" if __import__("os").name == "nt" else ""
    ffmpeg = next((ROOT / "node_modules" / "@remotion").glob(f"compositor-*/ffmpeg{suffix}"), None)
    if ffmpeg is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg executable was not found.")
    return ffmpeg


def frame_labels() -> dict[int, list[str]]:
    starts = [0]
    for index in range(1, len(CLIP_FRAMES)):
        starts.append(starts[-1] + CLIP_FRAMES[index - 1] + TRANSITION_FRAMES[index - 1])
    total_frames = starts[-1] + CLIP_FRAMES[-1]
    labels: dict[int, list[str]] = {}

    def add(frame: int, label: str) -> None:
        labels.setdefault(max(0, min(total_frames - 1, frame)), []).append(label)

    for index, (start, duration) in enumerate(zip(starts, CLIP_FRAMES), start=1):
        add(start, f"SCENE {index} · START")
        add(start + duration // 2, f"SCENE {index} · MID")
        add(start + duration - 1, f"SCENE {index} · END")

    for index, duration in enumerate(TRANSITION_FRAMES, start=1):
        start = starts[index] - duration
        add(start, f"TRANSITION {index} · START")
        add(start + duration // 2, f"TRANSITION {index} · MID")
        add(start + duration - 1, f"TRANSITION {index} · END")

    add(total_frames - 1, "FINAL FRAME")
    return labels


def main() -> None:
    if not VIDEO.exists():
        raise FileNotFoundError(f"Final video not found: {VIDEO}")
    ffmpeg = bundled_ffmpeg()
    labels = frame_labels()
    frames_dir = ROOT / "output" / "final-montage-contact-frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    extracted: dict[int, Path] = {}

    for frame in labels:
        destination = frames_dir / f"frame-{frame:04d}.png"
        subprocess.run(
            [
                str(ffmpeg), "-hide_banner", "-loglevel", "error", "-y",
                "-ss", f"{frame / FPS:.6f}", "-i", str(VIDEO),
                "-frames:v", "1", str(destination),
            ],
            check=True,
        )
        extracted[frame] = destination

    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 15) if font_path.exists() else ImageFont.load_default()
    cards = list(labels.items())
    rows = math.ceil(len(cards) / COLUMNS)
    cell_w, cell_h = THUMB[0], THUMB[1] + LABEL_H
    sheet = Image.new(
        "RGB",
        (COLUMNS * cell_w + (COLUMNS + 1) * GAP, rows * cell_h + (rows + 1) * GAP),
        "#03080D",
    )
    draw = ImageDraw.Draw(sheet)

    for index, (frame, frame_text) in enumerate(cards):
        row, column = divmod(index, COLUMNS)
        left = GAP + column * (cell_w + GAP)
        top = GAP + row * (cell_h + GAP)
        timestamp = f"{frame / FPS:06.2f}s · F{frame:04d}"
        title = " / ".join(frame_text)
        draw.text((left + 3, top + 2), timestamp, font=font, fill="#72DEDB")
        draw.text((left + 3, top + 18), title[:34], font=font, fill="#EAF6F5")
        image = Image.open(extracted[frame]).convert("RGB").resize(THUMB, Image.Resampling.LANCZOS)
        sheet.paste(image, (left, top + LABEL_H))

    sheet.save(OUTPUT, optimize=True)
    print(f"Contact sheet saved: {OUTPUT}")
    print(f"Frames represented: {len(cards)}")


if __name__ == "__main__":
    main()
