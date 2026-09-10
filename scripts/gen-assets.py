"""ポートフォリオ用の画像アセット(PWAアイコン / OGP / apple-touch)を生成する。
使い方: python scripts/gen-assets.py
"""
from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")

SERIF = "C:/Windows/Fonts/yumin.ttf"
SERIF_B = "C:/Windows/Fonts/yumindb.ttf"
SANS = "C:/Windows/Fonts/meiryo.ttc"
SANS_B = "C:/Windows/Fonts/meiryob.ttc"

ACCENT = (255, 45, 85)
ACCENT2 = (56, 189, 248)


def gradient(size, c1, c2, diagonal=True):
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x / (w - 1) * 0.55 + y / (h - 1) * 0.45) if diagonal else (y / (h - 1))
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img


def glow_layer(size, spots):
    """spots: [(cx, cy, r, (r,g,b), alpha)]"""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    for cx, cy, r, col, a in spots:
        tmp = Image.new("RGBA", size, (0, 0, 0, 0))
        d = ImageDraw.Draw(tmp)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (a,))
        tmp = tmp.filter(ImageFilter.GaussianBlur(r / 2.2))
        layer = Image.alpha_composite(layer, tmp)
    return layer


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return m


def make_icon(size: int) -> Image.Image:
    radius = int(size * 0.203)
    base = gradient((size, size), (11, 16, 32), (27, 11, 28))
    base = base.convert("RGBA")
    base = Image.alpha_composite(
        base,
        glow_layer((size, size), [(size * 0.5, size * 0.42, size * 0.36, ACCENT, 60)]),
    )

    cross = gradient((size, size), ACCENT, ACCENT2).convert("RGBA")
    cmask = Image.new("L", (size, size), 0)
    cd = ImageDraw.Draw(cmask)
    vw = int(size * 0.133)
    hh = int(size * 0.129)
    x0 = (size - vw) // 2
    cd.rounded_rectangle([x0, int(size * 0.1875), x0 + vw, int(size * 0.8125)], radius=int(vw * 0.38), fill=255)
    y0 = int(size * 0.355)
    cd.rounded_rectangle([int(size * 0.25), y0, int(size * 0.75), y0 + hh], radius=int(hh * 0.40), fill=255)
    base.paste(cross, (0, 0), cmask)

    # 中心のロック(十字の交点)
    d = ImageDraw.Draw(base)
    r = int(size * 0.039)
    d.ellipse([size / 2 - r, size * 0.42 - r, size / 2 + r, size * 0.42 + r], fill=(11, 16, 32, 235))
    r2 = int(size * 0.0175)
    d.ellipse([size / 2 - r2, size * 0.42 - r2, size / 2 + r2, size * 0.42 + r2], fill=ACCENT + (255,))

    # 下のライン
    lw = int(size * 0.0195)
    d.rounded_rectangle([int(size * 0.234), int(size * 0.918), int(size * 0.422), int(size * 0.918) + lw], radius=lw // 2, fill=ACCENT + (200,))
    d.rounded_rectangle([int(size * 0.578), int(size * 0.918), int(size * 0.766), int(size * 0.918) + lw], radius=lw // 2, fill=ACCENT2 + (200,))

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), rounded_mask((size, size), radius))
    return out


def draw_spaced_text(d, xy, text, font, fill, spacing=0, anchor_left=True):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        w = d.textlength(ch, font=font)
        x += w + spacing
    return x


def make_og() -> Image.Image:
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), (6, 10, 21, 255))

    # グリッド
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, 56):
        gd.line([(x, 0), (x, H)], fill=(120, 165, 255, 16), width=1)
    for y in range(0, H, 56):
        gd.line([(0, y), (W, y)], fill=(120, 165, 255, 16), width=1)
    img = Image.alpha_composite(img, grid)

    img = Image.alpha_composite(
        img,
        glow_layer((W, H), [(120, 40, 380, ACCENT, 95), (1080, 120, 330, ACCENT2, 80), (620, 700, 420, ACCENT, 40)]),
    )

    d = ImageDraw.Draw(img)

    # 左端のバー
    d.rounded_rectangle([70, 96, 76, 200], radius=3, fill=ACCENT + (255,))

    # 名前
    f_name = ImageFont.truetype(SERIF_B, 104)
    d.text((92, 78), "十字架", font=f_name, fill=(240, 244, 255, 255))
    left = 92 + d.textlength("十字架", font=f_name)
    f_man = ImageFont.truetype(SANS_B, 72)
    d.text((left + 6, 112), "_mania", font=f_man, fill=ACCENT + (255,))

    # ロール
    f_role = ImageFont.truetype(SANS_B, 26)
    x = draw_spaced_text(d, (94, 226), "HOKKAIDO / STUDENT / L/ACC", f_role, (147, 164, 196, 255), spacing=6)

    # 説明
    f_sub = ImageFont.truetype(SANS, 30)
    d.text((94, 288), "Hikamer / 雰囲気デベロッパー / Next.js・Python・HoI4 modding", font=f_sub, fill=(200, 212, 236, 255))

    # プロジェクトチップ
    f_chip = ImageFont.truetype(SANS_B, 24)
    chips = ["なれあいったー", "Hikabooru", "TwiGacha", "サンサンサンデー", "イラストさがしったー"]
    cx, cy = 94, 356
    for c in chips:
        w = d.textlength(c, font=f_chip)
        if cx + w + 40 > 760:
            cx, cy = 94, cy + 62
        d.rounded_rectangle([cx, cy, cx + w + 34, cy + 48], radius=24, outline=(29, 44, 74, 255), width=2,
                            fill=(17, 28, 51, 200))
        d.text((cx + 17, cy + 11), c, font=f_chip, fill=(233, 238, 251, 255))
        cx += w + 48

    # 右のエンブレム
    ex, ey, er = 985, 300, 175
    ring = glow_layer((W, H), [(ex, ey, er, ACCENT, 55)])
    img = Image.alpha_composite(img, ring)
    d = ImageDraw.Draw(img)
    d.ellipse([ex - er, ey - er, ex + er, ey + er], fill=(12, 20, 37, 255), outline=(255, 45, 85, 200), width=3)
    d.ellipse([ex - er + 16, ey - er + 16, ex + er - 16, ey + er - 16], outline=(56, 189, 248, 120), width=2)
    vw2 = 46
    d.rounded_rectangle([ex - vw2 // 2, ey - 128, ex + vw2 // 2, ey + 128], radius=16, fill=ACCENT + (255,))
    d.rounded_rectangle([ex - 96, ey - 34, ex + 96, ey + 30], radius=16, fill=ACCENT2 + (255,))
    d.ellipse([ex - 13, ey - 13, ex + 13, ey + 13], fill=(12, 20, 37, 255))
    d.ellipse([ex - 6, ey - 6, ex + 6, ey + 6], fill=ACCENT + (255,))

    # フッター
    d.line([(94, 546), (1106, 546)], fill=(29, 44, 74, 255), width=1)
    f_foot = ImageFont.truetype(SANS_B, 26)
    d.text((94, 566), "hikamers.app", font=f_foot, fill=ACCENT2 + (255,))
    f_foot2 = ImageFont.truetype(SANS, 24)
    d.text((620, 568), "X / GitHub / note / Qiita  —  @maebahesioru2", font=f_foot2, fill=(147, 164, 196, 255))

    return img.convert("RGB")


def main():
    os.makedirs(PUB, exist_ok=True)
    for size in (192, 512, 180):
        icon = make_icon(size)
        name = "apple-icon.png" if size == 180 else f"icon-{size}.png"
        icon.save(os.path.join(PUB, name))
        print("wrote", name, icon.size)
    og = make_og()
    og.save(os.path.join(PUB, "og.png"), quality=92)
    print("wrote og.png", og.size)


if __name__ == "__main__":
    main()
