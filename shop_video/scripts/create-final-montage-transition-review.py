"""Build a frame-by-frame review sheet for all six rendered transition previews."""

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DURATIONS = [12, 12, 10, 10, 10, 8]
FPS = 30
SAMPLES = [25, 30]
THUMB = (180, 320)
LABEL_H = 32
GAP = 12
COLS = 6


def ffmpeg_binary() -> Path:
    suffix = ".exe" if __import__("os").name == "nt" else ""
    path = next((ROOT / "node_modules" / "@remotion").glob(f"compositor-*/ffmpeg{suffix}"), None)
    if path is None:
        raise FileNotFoundError("Remotion's bundled ffmpeg executable was not found.")
    return path


def main() -> None:
    ffmpeg = ffmpeg_binary()
    out_dir = ROOT / "output" / "final_montage_previews"
    frames_dir = out_dir / "transition-review-frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 15) if font_path.exists() else ImageFont.load_default()
    rows = []

    for index, transition_frames in enumerate(DURATIONS, start=1):
        sample_frames = [0, 25, 30, 30 + transition_frames // 2, 29 + transition_frames, 30 + transition_frames + 15]
        video = out_dir / f"transition_{index:02d}.mp4"
        if not video.exists():
            raise FileNotFoundError(f"Missing transition preview: {video}")
        row = []
        for sample in sample_frames:
            destination = frames_dir / f"transition-{index:02d}-frame-{sample:03d}.png"
            subprocess.run(
                [
                    str(ffmpeg), "-hide_banner", "-loglevel", "error", "-y",
                    "-ss", f"{sample / FPS:.6f}", "-i", str(video),
                    "-frames:v", "1", str(destination),
                ],
                check=True,
            )
            row.append((sample, destination))
        rows.append(row)

    cell_w, cell_h = THUMB[0], THUMB[1] + LABEL_H
    sheet = Image.new("RGB", (COLS * cell_w + (COLS + 1) * GAP, len(rows) * cell_h + (len(rows) + 1) * GAP), "#03080D")
    draw = ImageDraw.Draw(sheet)
    for row_index, row in enumerate(rows):
        for column, (frame, path) in enumerate(row):
            left = GAP + column * (cell_w + GAP)
            top = GAP + row_index * (cell_h + GAP)
            labels = ["PRE 1s", "PRE EDGE", "START", "MID", "END", "POST"]
            label = f"T{row_index + 1} · {labels[column]} ({frame})"
            draw.text((left + 3, top + 8), label, font=font, fill="#EAF6F5")
            image = Image.open(path).convert("RGB").resize(THUMB, Image.Resampling.LANCZOS)
            sheet.paste(image, (left, top + LABEL_H))

    destination = out_dir / "transition_review_contact.png"
    sheet.save(destination, optimize=True)
    print(destination)


if __name__ == "__main__":
    main()
