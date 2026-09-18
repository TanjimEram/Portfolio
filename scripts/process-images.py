#!/usr/bin/env python
"""
One-off image pipeline for the hero portrait and the signature.

    python scripts/process-images.py            # both
    python scripts/process-images.py portrait   # or: signature

Sources (HEIC straight off the phone) live in public/images/. sharp's prebuilt libvips can't decode
HEVC-encoded HEIC, so this uses Python instead:

    pip install pillow-heif "rembg[cpu]" potracer scipy

Outputs
  public/images/profile/tanjim.png        cut-out on transparency, 1200px long edge
  public/images/profile/tanjim.webp       same; tanjim-sm.webp is the 800px version for phones
  public/images/signature.svg             traced strokes, one <path> so it can draw itself (Footer / hero)
  public/images/signature.png             raster fallback, black on transparency

Not a build step — run it again only when the source photos change.
"""
import sys
from pathlib import Path

import numpy as np
import pillow_heif
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage

pillow_heif.register_heif_opener()

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / 'public' / 'images'
LONG_EDGE = 1200


def find_source(stem: str) -> Path:
    for p in IMAGES.iterdir():
        if p.stem.lower() == stem.lower() and p.suffix.lower() in ('.heic', '.heif', '.jpg', '.jpeg', '.png'):
            return p
    sys.exit(f'no {stem}.heic in {IMAGES}')


def fit(im: Image.Image, long_edge: int) -> Image.Image:
    s = long_edge / max(im.size)
    return im if s >= 1 else im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


# ---------------------------------------------------------------- portrait
def portrait() -> None:
    from rembg import new_session, remove

    src = find_source('myself')
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    print(f'portrait: {src.name} {im.size}')
    # alpha matting is O(pixels) in memory; 1500px is plenty for a 1200px output
    im = fit(im, 1500)

    # cut out the person (alpha matting would refine hair further but needs several GB of RAM)
    session = new_session('u2net_human_seg')
    cut = remove(im, session=session, post_process_mask=True).convert('RGBA')

    # trim to the visible pixels (keep the bottom edge: the photo is cropped at the legs)
    alpha = np.asarray(cut.split()[3])
    ys, xs = np.where(alpha > 8)
    pad = round(cut.width * 0.02)
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, cut.width), cut.height)
    cut = cut.crop(box)

    out = IMAGES / 'profile'
    out.mkdir(exist_ok=True)
    full = fit(cut, LONG_EDGE)
    full.save(out / 'tanjim.png', optimize=True)
    full.save(out / 'tanjim.webp', quality=86, method=6)
    small = fit(cut, 800)  # phones
    small.save(out / 'tanjim-sm.webp', quality=84, method=6)
    print(f'  -> {out / "tanjim.png"} {full.size}, tanjim.webp, tanjim-sm.webp {small.size}')


# ---------------------------------------------------------------- signature
def signature() -> None:
    import potrace

    src = find_source('signature')
    im = ImageOps.exif_transpose(Image.open(src)).convert('L')
    print(f'signature: {src.name} {im.size}')

    # flatten the paper (divide by a heavy blur) so uneven lighting doesn't survive the threshold
    a = np.asarray(im, dtype=np.float32)
    paper = np.asarray(im.filter(ImageFilter.GaussianBlur(60)), dtype=np.float32)
    ink = (a / np.maximum(paper, 1)) < 0.72

    # keep the connected strokes of the signature itself; drop specks and anything touching the frame
    # (the photo has other pen marks at its edges)
    labels, n = ndimage.label(ink)
    sizes = ndimage.sum(ink, labels, range(1, n + 1))
    h, w = ink.shape
    keep = np.zeros_like(ink)
    for i, (sl, size) in enumerate(zip(ndimage.find_objects(labels), sizes), 1):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if size < 400 or y0 < 20 or x0 < 20 or y1 > h - 20 or x1 > w - 20:
            continue
        keep |= labels == i

    ys, xs = np.where(keep)
    mask = Image.fromarray((keep * 255).astype(np.uint8)).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    # the photo was taken with the paper turned: rotate so it reads left → right
    mask = mask.rotate(-90, expand=True)

    # downscale with antialiasing, re-threshold, then dilate 2px so it reads bolder than the photo
    mask = fit(mask, 1400)
    bits = np.asarray(mask) > 110
    bits = ndimage.binary_dilation(bits, iterations=2)
    pad = 24
    bits = np.pad(bits, pad)
    hh, ww = bits.shape

    # raster fallback: black strokes, alpha from the bitmap
    png = Image.new('RGBA', (ww, hh), (0, 0, 0, 0))
    png.putalpha(Image.fromarray((bits * 255).astype(np.uint8)))
    png.save(IMAGES / 'signature.png', optimize=True)

    # trace: one path with every closed curve as a subpath, so stroke-dashoffset draws it stroke by stroke
    path = potrace.Bitmap(~bits).trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.25)  # potracer: False = ink
    d = []
    for curve in path:
        pt = lambda p: f'{p.x:.1f} {p.y:.1f}'
        d.append(f'M{pt(curve.start_point)}')
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f'L{pt(seg.c)}L{pt(seg.end_point)}')
            else:
                d.append(f'C{pt(seg.c1)} {pt(seg.c2)} {pt(seg.end_point)}')
        d.append('Z')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ww} {hh}" fill="currentColor" '
           f'role="img" aria-label="Signature">\n  <path pathLength="1" d="{"".join(d)}"/>\n</svg>\n')
    (IMAGES / 'signature.svg').write_text(svg, encoding='utf8')
    print(f'  -> signature.svg ({len(path)} curves, {len(svg) // 1024} KB), signature.png {png.size}')


if __name__ == '__main__':
    which = sys.argv[1:] or ['portrait', 'signature']
    if 'portrait' in which:
        portrait()
    if 'signature' in which:
        signature()
