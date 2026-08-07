"""Create responsive WebP assets for verified same-job project sequences.

Usage:
    python scripts/prepare_project_story_assets.py <curated-photo-directory>

The input directory is expected to contain the stable filenames listed in
SELECTIONS. Images are resized without upscaling and written to the source
asset tree used by the project-page generator.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SELECTIONS = {
    "modern-hex-kitchen-before": "hex-before.jpg",
    "modern-hex-kitchen-progress": "hex-progress.jpg",
    "modern-hex-kitchen-range-detail": "hex-after-sink.jpg",
    "light-tile-floor-before": "floor-before.jpg",
    "light-tile-floor-prep": "floor-prep.jpg",
}

WIDTHS = {"sm": 720, "lg": 1600}


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    if image.width <= width:
        return image.copy()
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Folder containing the curated project photos")
    args = parser.parse_args()

    source = args.source.resolve()
    output = Path(__file__).resolve().parents[1] / "source" / "assets" / "project-galleries"
    output.mkdir(parents=True, exist_ok=True)

    missing = [filename for filename in SELECTIONS.values() if not (source / filename).is_file()]
    if missing:
        raise FileNotFoundError(f"Missing selected project photos: {', '.join(missing)}")

    for stem, filename in SELECTIONS.items():
        with Image.open(source / filename) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            for suffix, width in WIDTHS.items():
                resized = resize_to_width(image, width)
                destination = output / f"{stem}-{suffix}.webp"
                resized.save(destination, "WEBP", quality=84, method=6)
                print(f"{destination.name}: {resized.width}x{resized.height}")


if __name__ == "__main__":
    main()
