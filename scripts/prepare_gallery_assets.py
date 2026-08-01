"""Create responsive WebP assets from David's curated Google Photos album.

Usage:
    python scripts/prepare_gallery_assets.py <extracted-album-directory>
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SELECTIONS = {
    "white-subway-kitchen": "20260717_175840.jpg",
    "white-subway-detail": "20260717_175708.jpg",
    "modern-hex-kitchen": "20260529_124933.jpg",
    "diamond-mosaic-kitchen": "20251204_191722.jpg",
    "classic-subway-kitchen": "20260213_142900.jpg",
    "pale-blue-arabesque-kitchen": "20260718_181356.jpg",
    "brass-kitchen-detail": "20260718_181257.jpg",
    "herringbone-glass-shower": "20260718_155629.jpg",
    "freestanding-tub-tile": "20260718_155457.jpg",
    "marble-look-tub-surround": "20260408_181513.jpg",
    "patterned-bathroom-floor": "20260718_155344.jpg",
    "wood-look-plank-floor": "20260729_160240.jpg",
    "light-tile-floor": "20260728_161642.jpg",
    "stone-feature-wall": "20260417_160353.jpg",
}

WIDTHS = {"sm": 720, "lg": 1600}


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    if image.width <= width:
        return image.copy()
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the extracted album photos")
    args = parser.parse_args()

    source = args.source.resolve()
    output = Path(__file__).resolve().parents[1] / "source" / "assets" / "portfolio"
    output.mkdir(parents=True, exist_ok=True)

    missing = [filename for filename in SELECTIONS.values() if not (source / filename).is_file()]
    if missing:
        raise FileNotFoundError(f"Missing selected album photos: {', '.join(missing)}")

    for slug, filename in SELECTIONS.items():
        with Image.open(source / filename) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            for suffix, width in WIDTHS.items():
                resized = resize_to_width(image, width)
                destination = output / f"{slug}-{suffix}.webp"
                resized.save(destination, "WEBP", quality=82, method=6)
                print(f"{destination.name}: {resized.width}x{resized.height}")

    with Image.open(source / SELECTIONS["white-subway-kitchen"]) as opened:
        hero = ImageOps.exif_transpose(opened).convert("RGB")
        social = ImageOps.fit(
            hero,
            (1200, 630),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.56),
        )
        social_destination = output.parent / "social-share.jpg"
        social.save(social_destination, "JPEG", quality=88, optimize=True, progressive=True)
        print(f"{social_destination.name}: {social.width}x{social.height}")


if __name__ == "__main__":
    main()
