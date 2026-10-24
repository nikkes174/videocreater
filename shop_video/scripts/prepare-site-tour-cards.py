"""Extract exact product-card layers from the supplied site screenshots.

The source pages use a pure-black canvas, so an exterior flood fill removes
only the connected page background while preserving dark pixels inside photos.
Run from shop_video with: python scripts/prepare-site-tour-cards.py
"""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets" / "site-tour"
OUTPUT = ASSETS / "cards"

# (source screenshot, filename, screenshot-space crop rectangle)
CARDS = [
    ("img_1.png", "roblox-3000.png", (20, 94, 303, 455)),
    ("img_1.png", "pubg-3850.png", (294, 7, 581, 359)),
    ("img_1.png", "telegram-premium.png", (861, 362, 1147, 735)),
]


def remove_exterior_black(image: Image.Image, threshold: int = 5) -> Image.Image:
    """Make the connected near-black page background transparent, not photo blacks."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    mask = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_page_black(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return max(red, green, blue) <= threshold

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if not mask[index] and is_page_black(x, y):
            mask[index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y > 0:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    alpha = Image.new("L", rgba.size, 255)
    alpha.putdata([0 if value else 255 for value in mask])
    rgba.putalpha(alpha)
    return rgba


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, output_name, box in CARDS:
        source = Image.open(ASSETS / source_name)
        card = remove_exterior_black(source.crop(box))
        card.save(OUTPUT / output_name, optimize=True)
        print(f"{OUTPUT / output_name}: {card.width}x{card.height}")


if __name__ == "__main__":
    main()
