"""
Generates placeholder PWA icons for The Path for Wisdom.
Simple procedural design: purple/gold theme matching the in-game palette,
an open book shape (wisdom motif) — no external art dependency.
Run: python scripts/make_icons.py
"""
from PIL import Image, ImageDraw
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

BG = (27, 23, 48)       # #1b1730 — matches game background
GOLD = (244, 211, 94)   # #f4d35e — matches title color
GOLD_DARK = (196, 168, 60)
OUTLINE = (43, 33, 24)


def draw_book(draw, cx, cy, w, h):
    # simple open-book silhouette: two trapezoid "pages" meeting at a spine
    left = [
        (cx, cy - h * 0.42),
        (cx - w * 0.46, cy - h * 0.30),
        (cx - w * 0.46, cy + h * 0.38),
        (cx, cy + h * 0.46),
    ]
    right = [
        (cx, cy - h * 0.42),
        (cx + w * 0.46, cy - h * 0.30),
        (cx + w * 0.46, cy + h * 0.38),
        (cx, cy + h * 0.46),
    ]
    draw.polygon(left, fill=GOLD, outline=OUTLINE)
    draw.polygon(right, fill=GOLD_DARK, outline=OUTLINE)
    # spine line
    draw.line([(cx, cy - h * 0.42), (cx, cy + h * 0.46)], fill=OUTLINE, width=max(2, int(w // 40)))
    # a few page lines for texture
    for i, t in enumerate([0.15, 0.35, 0.55]):
        y = cy - h * 0.15 + i * h * 0.16
        draw.line([(cx - w * 0.34, y), (cx - w * 0.10, y - h * 0.03)], fill=OUTLINE, width=1)
        draw.line([(cx + w * 0.10, y - h * 0.03), (cx + w * 0.34, y)], fill=OUTLINE, width=1)


def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), BG + (255,))
    draw = ImageDraw.Draw(img)

    if maskable:
        # maskable icons need safe content within the inner ~80% circle
        pad = size * 0.20
    else:
        pad = size * 0.12

    cx, cy = size / 2, size / 2
    book_w = size - pad * 2
    book_h = book_w * 0.62
    draw_book(draw, cx, cy, book_w, book_h)

    return img


sizes = [192, 512]
for s in sizes:
    make_icon(s).save(os.path.join(OUT_DIR, f"icon-{s}.png"))
    make_icon(s, maskable=True).save(os.path.join(OUT_DIR, f"icon-{s}-maskable.png"))

print(f"Icons written to {os.path.abspath(OUT_DIR)}")
