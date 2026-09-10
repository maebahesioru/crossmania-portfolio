"""ヒーローキャラ画像の高画質化パイプライン。

元画像(446x559)を Real-ESRGAN(ncnn/4xplus-anime) で4倍に超解像し、
白フチ除去・アルファ整理・余白トリムを行った上で、
表示サイズの2倍強までスーパーサンプリング縮小して配信する。

使い方:
  python scripts/upscale-hero.py <元PNG> [--model realesrgan-x4plus-anime]

前提: .tools/resrgan/realesrgan-ncnn-vulkan.exe (Real-ESRGAN ncnn portable)
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXE = os.path.join(ROOT, ".tools", "resrgan", "realesrgan-ncnn-vulkan.exe")
WORK = os.path.join(ROOT, ".tools", "work")
PUB = os.path.join(ROOT, "public")

# 表示最大幅 497 CSS px → Retina 2x で 994px。余裕を見て 1240px に落とす
TARGET_W = 1240


def upscale(src: str, model: str) -> Image.Image:
    os.makedirs(WORK, exist_ok=True)
    inp = os.path.join(WORK, "in.png")
    out = os.path.join(WORK, "out_4x.png")
    Image.open(src).convert("RGBA").save(inp)
    subprocess.run(
        [EXE, "-i", "in.png", "-o", "out_4x.png", "-n", model, "-s", "4", "-f", "png"],
        cwd=WORK,
        check=True,
        stdout=subprocess.DEVNULL,
    )
    return Image.open(out).convert("RGBA")


def defringe_and_tighten(im: Image.Image, lo: float = 18.0, hi: float = 240.0) -> Image.Image:
    """明背景から切り抜いた半透明ピクセルの白フチを除去し、アルファの帯を締める。"""
    arr = np.asarray(im).astype(np.float32)
    rgb, a = arr[..., :3], arr[..., 3] / 255.0

    with np.errstate(divide="ignore", invalid="ignore"):
        unmixed = (rgb - (1.0 - a)[..., None] * 255.0) / np.maximum(a[..., None], 1e-3)
    unmixed = np.clip(unmixed, 0, 255)
    # ほぼ不透明な部分は元の色を尊重する
    blend = np.clip((0.92 - a) / 0.92, 0, 1)[..., None]
    new_rgb = np.clip(rgb * (1 - blend) + unmixed * blend, 0, 255)

    a2 = np.clip((a * 255.0 - lo) / (hi - lo), 0, 1)
    return Image.fromarray(
        np.dstack([new_rgb, a2 * 255.0]).astype(np.uint8), "RGBA"
    )


def trim(im: Image.Image, pad: int) -> Image.Image:
    mask = im.getchannel("A").point(lambda v: 255 if v > 8 else 0)
    x0, y0, x1, y1 = mask.getbbox()
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def edge_stats(im: Image.Image) -> tuple[int, int]:
    x = np.asarray(im.convert("RGBA")).astype(np.float32)
    al = x[..., 3] / 255.0
    edge = (al > 0.06) & (al < 0.85)
    bright = int(((x[..., :3].mean(axis=2) > 232) & edge).sum())
    return bright, int(edge.sum())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--model", default="realesrgan-x4plus-anime")
    ap.add_argument("--target-width", type=int, default=TARGET_W)
    args = ap.parse_args()

    if not os.path.exists(EXE):
        sys.exit(f"Real-ESRGAN が見つかりません: {EXE}")

    src_im = Image.open(args.src).convert("RGBA")
    print(f"input : {src_im.size}  bright-edge={edge_stats(src_im)}")

    big = upscale(args.src, args.model)
    print(f"4x    : {big.size}")

    clean = defringe_and_tighten(big)
    clean = trim(clean, pad=16)
    print(f"clean : {clean.size}  bright-edge={edge_stats(clean)}")

    # スーパーサンプリング縮小(過剰シャープのハローを消しつつ精細さを残す)
    w = min(args.target_width, clean.width)
    h = round(clean.height * w / clean.width)
    final = clean.resize((w, h), Image.LANCZOS)
    print(f"final : {final.size}  bright-edge={edge_stats(final)}")

    png = os.path.join(PUB, "hero-character.png")
    webp = os.path.join(PUB, "hero-character.webp")
    final.save(png, optimize=True)
    final.save(webp, quality=92, method=6)
    for p in (png, webp):
        print(f"wrote {os.path.basename(p)}  {os.path.getsize(p)//1024} KB")
    print(f"INTRINSIC {final.width}x{final.height}")


if __name__ == "__main__":
    main()
