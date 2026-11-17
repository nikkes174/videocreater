"""Extract requested review frames and build one contact sheet per M.A.C scene."""
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SCENES = {
    "mac_fragment_01_intro": [0, 30, 60, 90, 120, 149],
    "mac_fragment_02_statement": [0, 45, 90, 135, 180, 239],
    "mac_fragment_03_services": [0, 75, 150, 225, 300, 389],
    "mac_fragment_04_advantages": [0, 60, 119, 180, 239, 300, 374, 430, 539],
    "mac_fragment_05_qr": [0, 45, 90, 120, 180, 239],
    "mac_final_fullhd_1920x1080": [0, 119, 120, 149, 150, 329, 330, 359, 360, 689, 690, 719, 720, 1199, 1200, 1229, 1230, 1409, 1439],
}
FPS = 30
THUMB_W, THUMB_H, LABEL_H, GAP, COLS = 600, 338, 40, 20, 3

def main():
    ffmpeg = next((p for p in (ROOT / "node_modules" / "@remotion").glob("compositor-*/ffmpeg.exe")), None)
    if not ffmpeg:
        raise FileNotFoundError("Remotion bundled ffmpeg.exe not found")
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    font = ImageFont.truetype(str(font_path), 22) if font_path.exists() else ImageFont.load_default()
    for name, frames in SCENES.items():
        video = ROOT / "output" / f"{name}.mp4"
        if not video.exists():
            raise FileNotFoundError(video)
        frame_dir = ROOT / "output" / f"{name}-frames"
        frame_dir.mkdir(parents=True, exist_ok=True)
        images = []
        for frame in frames:
            target = frame_dir / f"frame-{frame:03d}.png"
            subprocess.run([str(ffmpeg), "-hide_banner", "-loglevel", "error", "-y", "-i", str(video), "-ss", f"{frame/FPS:.6f}", "-frames:v", "1", str(target)], check=True)
            images.append(Image.open(target).convert("RGB").resize((THUMB_W, THUMB_H), Image.Resampling.LANCZOS))
        rows = math.ceil(len(frames) / COLS)
        cell_h = LABEL_H + THUMB_H
        sheet = Image.new("RGB", (COLS*THUMB_W+(COLS+1)*GAP, rows*cell_h+(rows+1)*GAP), "#100b18")
        draw = ImageDraw.Draw(sheet)
        for i, (frame, image) in enumerate(zip(frames, images)):
            x, y = GAP+(i%COLS)*(THUMB_W+GAP), GAP+(i//COLS)*(cell_h+GAP)
            draw.text((x, y+6), f"{name}  •  FRAME {frame:03d}", fill="#f3eff7", font=font)
            sheet.paste(image, (x, y+LABEL_H))
        out = ROOT / "output" / f"{name}_contact.png"
        sheet.save(out, optimize=True)
        print(out)

if __name__ == "__main__":
    main()
