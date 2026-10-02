"""BlackPhantom reel - low level motion graphics toolkit.

Pure numpy + Pillow. Everything is float32 RGB in 0..1, no external assets.
"""
from __future__ import annotations

import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 60
SCALE = 1.0
FDIR = "C:/Windows/Fonts/"


# ------------------------------------------------------------------ colour
def hx(s):
    s = s.lstrip("#")
    return np.array([int(s[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


def mix(c1, c2, t):
    if np.isscalar(t):
        return (c1 + (c2 - c1) * t).astype(np.float32)
    t = np.asarray(t, np.float32)[..., None]
    return c1 + (c2 - c1) * t


INK = hx("#05070E")
NIGHT = hx("#080C18")
CYAN = hx("#22E7FF")
VIOLET = hx("#7B5CFF")
MAGENTA = hx("#FF2E88")
AMBER = hx("#FFB347")
WHITE = hx("#EAF2FF")
DIM = hx("#5A6B8C")


# -------------------------------------------------------------------- math
def clamp(x, lo=0.0, hi=1.0):
    return np.clip(x, lo, hi)


def lerp(a, b, t):
    return a + (b - a) * t


def inv(a, b, x):
    return (x - a) / (b - a)


def wipe_x(cut, width, soft=26.0):
    """Soft-edged reveal: 1 where x < cut (wipe travels left->right). (1, width)"""
    xs = np.arange(width, dtype=np.float32)[None, :]
    return 1.0 - smoothstep(cut - soft, cut + soft, xs)


def wipe_y(cut, height, soft=40.0):
    """Soft-edged reveal: 1 where y < cut (wipe travels bottom->top). (height, 1)"""
    ys = np.arange(height, dtype=np.float32)[:, None]
    return 1.0 - smoothstep(cut - soft, cut + soft, ys)


def span(t, t0, t1):
    return clamp((t - t0) / max(1e-6, t1 - t0))


def smoothstep(e0, e1, x):
    t = clamp((np.asarray(x, np.float32) - e0) / (e1 - e0 + 1e-9))
    return t * t * (3.0 - 2.0 * t)


def sstep(e0, e1, x):
    """Scalar smoothstep."""
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0 + 1e-9)))
    return t * t * (3.0 - 2.0 * t)


def ease_out_expo(x):
    x = clamp(x)
    return 1.0 - np.power(2.0, -10.0 * x)


def ease_in_expo(x):
    x = clamp(x)
    return np.where(x <= 0.0, 0.0, np.power(2.0, 10.0 * (x - 1.0)))


def ease_out_cubic(x):
    x = clamp(x)
    return 1.0 - np.power(1.0 - x, 3)


def ease_in_out_cubic(x):
    x = clamp(x)
    return np.where(x < 0.5, 4 * x ** 3, 1.0 - np.power(-2 * x + 2, 3) / 2)


def ease_out_back(x, s=1.9):
    x = clamp(x)
    c = x - 1.0
    return 1.0 + (s + 1) * c ** 3 + s * c ** 2


def ease_out_elastic(x, p=0.32):
    x = clamp(x)
    if x <= 0.0 or x >= 1.0:
        return np.where(x <= 0.0, 0.0, 1.0)
    return np.power(2, -11 * x) * math.sin((x - p / 4) * (2 * math.pi) / p) + 1.0


def ease_in_out_quint(x):
    x = clamp(x)
    return np.where(x < 0.5, 16 * x ** 5, 1.0 - np.power(-2 * x + 2, 5) / 2)


def ease_out_quint(x):
    x = clamp(x)
    return 1.0 - np.power(1.0 - x, 5)


def ease_in_out_expo(x):
    x = clamp(x)
    return np.where(x <= 0.0, 0.0, np.where(x >= 1.0, 1.0,
                                            np.power(2, 10 * x - 10) * (1 - np.power(2, -10 * x))))


def pulse(x, center, width):
    """0..1..0 bump."""
    d = abs(np.asarray(x, np.float32) - center) / width
    return clamp(1.0 - d)


def noise1(x, seed=0):
    """Smooth 1D value noise, period 1."""
    i = np.floor(x).astype(np.int32)
    f = x - i
    u = f * f * (3 - 2 * f)
    a = _h1(i, seed)
    b = _h1(i + 1, seed)
    return a + (b - a) * u


def _h1(i, seed):
    n = (i.astype(np.int64) * np.int64(374761393) + np.int64(seed * 668265263))
    n = (n ^ (n >> 13)) * np.int64(1274126177)
    n = n ^ (n >> 16)
    return ((n & 0xFFFFFF).astype(np.float32) / float(0xFFFFFF))


def fbm1(x, seed=0, oct=3):
    v = np.zeros_like(np.asarray(x, np.float32))
    amp, frq = 1.0, 1.0
    for o in range(oct):
        v += amp * noise1(np.asarray(x, np.float32) * frq, seed + o * 17)
        amp *= 0.5
        frq *= 2.03
    return v / (2 ** (oct - 1) - 1)


def shake(t, seed=1, amp=6.0, freq=13.0):
    """Smooth camera shake -> (dx, dy, rot)."""
    dx = (noise1(np.array([t * freq], np.float32) + seed) * 2 - 1) * amp
    dy = (noise1(np.array([t * freq * 1.31], np.float32) + seed * 7) * 2 - 1) * amp
    rz = (noise1(np.array([t * freq * 0.77], np.float32) + seed * 13) * 2 - 1) * amp * 0.02
    return float(dx[0]), float(dy[0]), float(rz[0])


# ------------------------------------------------------------------ layers
def blank():
    return np.zeros((H, W), np.float32)


def black():
    return np.zeros((H, W, 3), np.float32)


def tint(mask, rgb):
    return mask[..., None] * rgb


def add(dst, rgb, mask, gain=1.0):
    return dst + mask[..., None] * rgb * gain


def over(dst, rgb, mask):
    """Standard alpha over for premultiplied-ish float layers."""
    a = mask[..., None]
    return rgb * a + dst * (1.0 - a)


def screen(dst, src, gain=1.0):
    return 1.0 - (1.0 - dst) * (1.0 - clip01(src * gain))


def clip01(x):
    return np.clip(x, 0.0, 1.0)


# ------------------------------------------------------------- PIL bridging
def to_np(img):
    return np.asarray(img, np.float32) * (1.0 / 255.0)


def from_np(a):
    return Image.fromarray((clip01(a) * 255.0 + 0.5).astype(np.uint8), "L")


def blur(mask, radius, quality=1.0):
    if radius <= 0:
        return mask
    if quality < 1.0:
        small = from_np(mask).resize((max(4, int(W * quality)), max(4, int(H * quality))),
                                     Image.BILINEAR)
        small = small.filter(ImageFilter.GaussianBlur(radius * quality))
        return to_np(small.resize((W, H), Image.BILINEAR))
    return to_np(from_np(mask).filter(ImageFilter.GaussianBlur(radius)))


def down(mask, f=4):
    im = from_np(mask)
    return to_np(im.resize((max(2, int(W / f)), max(2, int(H / f))), Image.BILINEAR))


def up(mask, f=4):
    im = from_np(mask)
    return to_np(im.resize((W, H), Image.BILINEAR))


def draw(size, fn, radius=0.0, quality=1.0):
    """Rasterise with ImageDraw into a float mask. size=(w,h) at full scale."""
    w, h = size
    q = 1.0 if quality >= 1.0 else quality
    iw, ih = max(2, int(w * q)), max(2, int(h * q))
    img = Image.new("L", (iw, ih), 0)
    fn(ImageDraw.Draw(img), q)
    if radius > 0:
        img = img.filter(ImageFilter.GaussianBlur(radius * q))
    if q < 1.0:
        img = img.resize((w, h), Image.BILINEAR)
    return to_np(img)


# --------------------------------------------------------------- particles
_KERNEL_CACHE = {}


def blob_kernel(radius, power=2.2):
    key = (int(radius), power)
    k = _KERNEL_CACHE.get(key)
    if k is None:
        r = int(radius)
        ys, xs = np.mgrid[-r:r + 1, -r:r + 1]
        d2 = (xs ** 2 + ys ** 2) / float(radius ** 2)
        k = np.exp(-d2 * 2.3).astype(np.float32) * (1.0 - np.minimum(d2, 1.0)) ** power
        k /= k.max()
        _KERNEL_CACHE[key] = k
    return k


def splat(mask, xs, ys, radii, weights, power=2.2):
    """Additive soft point splats (vector loop over particles, tiny kernels)."""
    Hh, Ww = mask.shape
    for x, y, r, w in zip(xs, ys, radii, weights):
        if w <= 0.002:
            continue
        k = blob_kernel(max(1.0, r), power)
        kr, kc = k.shape[0] // 2, k.shape[0] // 2
        x0, y0 = int(round(x)) - kr, int(round(y)) - kr
        xs0, xs1 = max(0, x0), min(Ww, x0 + k.shape[1])
        ys0, ys1 = max(0, y0), min(Hh, y0 + k.shape[0])
        if xs0 >= xs1 or ys0 >= ys1:
            continue
        sub = k[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
        mask[ys0:ys1, xs0:xs1] += sub * w
    return mask


def splat_streak(mask, x, y, dx, dy, length, width, weight, color_mix=None):
    """Directional motion-blur streak (single particle, cheap)."""
    steps = int(length)
    if steps < 2:
        return
    for i in range(steps):
        f = 1.0 - i / float(steps)
        px, py = x - dx * i, y - dy * i
        r = width * (0.4 + 0.6 * f)
        k = blob_kernel(max(1.0, r), 2.0)
        kr, kc = k.shape[0] // 2, k.shape[0] // 2
        x0, y0 = int(round(px)) - kr, int(round(py)) - kr
        xs0, xs1 = max(0, x0), min(W, x0 + k.shape[1])
        ys0, ys1 = max(0, y0), min(H, y0 + k.shape[0])
        if xs0 >= xs1 or ys0 >= ys1:
            continue
        mask[ys0:ys1, xs0:xs1] += k[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0] * weight * f * f
    return mask


_STREAK_K = {}


def anamorphic(dst, x, y, length, width, rgb, amp):
    """Horizontal lens flare / anamorphic streak, additive."""
    global _STREAK_K
    key = (int(length), int(width))
    k = _STREAK_K.get(key)
    if k is None:
        xs = np.arange(-int(length), int(length) + 1, dtype=np.float32)
        k = np.exp(-(xs ** 2) / (2.0 * (length * 0.28) ** 2)).astype(np.float32)
        _STREAK_K[key] = k
    n = int(width)
    ys = np.arange(-n, n + 1, dtype=np.float32)
    prof = np.exp(-(ys ** 2) / (2.0 * (width * 0.5) ** 2)).astype(np.float32)
    strip = np.outer(prof, k)
    kh, kw = strip.shape
    x0, y0 = int(round(x)) - kw // 2, int(round(y)) - kh // 2
    xs0, xs1 = max(0, x0), min(W, x0 + kw)
    ys0, ys1 = max(0, y0), min(H, y0 + kh)
    if xs0 >= xs1 or ys0 >= ys1:
        return dst
    dst[ys0:ys1, xs0:xs1] += strip[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0][..., None] * rgb * amp
    return dst


# -------------------------------------------------------------- typography
_FONTS = {
    "black": "seguibl.ttf",
    "bold": "segoeuib.ttf",
    "semi": "seguisb.ttf",
    "light": "segoeuil.ttf",
    "thin": "seguili.ttf",
    "mono": "consola.ttf",
    "mono_b": "consolab.ttf",
    "tech": "bahnschrift.ttf",
    "impact": "impact.ttf",
    "narrow": "bahnschrift.ttf",
}
_FCACHE = {}


def font(kind, size, variation=None):
    key = (kind, int(size), variation)
    f = _FCACHE.get(key)
    if f is None:
        f = ImageFont.truetype(FDIR + _FONTS[kind], int(size))
        if variation:
            try:
                f.set_variation_by_name(variation)
            except Exception:
                pass
        _FCACHE[key] = f
    return f


def tw(text, f, tr=0.0):
    if not text:
        return 0.0
    return f.getlength(text) + tr * (len(text) - 1)


def draw_tracked(d, xy, text, f, fill=255, tr=0.0):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill, anchor="ls")
        x += f.getlength(ch) + tr
    return x


class Type:
    """Caching typesetter -> trimmed float masks."""

    _ALL = []

    def __init__(self, kind, size, tr=0.0, variation=None, pad=0.10):
        self.kind, self.base, self.var, self.pad = kind, int(size), variation, pad
        self.size = int(self.base * SCALE)
        self.tr = tr
        self.f = font(kind, self.size, variation)
        self._cache = {}
        Type._ALL.append(self)

    def mask(self, text, track=None):
        tr = self.tr if track is None else track
        key = (text, tr)
        if key in self._cache:
            return self._cache[key]
        f = self.f
        p = max(2, int(self.size * self.pad))
        w = int(tw(text, f, tr)) + 2 * p
        asc, desc = f.getmetrics()
        h = asc + desc + 2 * p
        img = Image.new("L", (max(2, w), max(2, h)), 0)
        d = ImageDraw.Draw(img)
        draw_tracked(d, (p, p + asc), text, f, 255, tr)
        m = to_np(img)
        ys, xs = np.nonzero(m > 0.004)
        if len(xs):
            x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            m = m[y0:y1, x0:x1].copy()
        else:
            m = np.zeros((4, 4), np.float32)
        out = (m, x0 - p, y0 - p)  # mask + offset relative to text origin (baseline-left)
        self._cache[key] = out
        return out

    def width(self, text, track=None):
        return tw(text, self.f, self.tr if track is None else track)

    def ascent(self):
        return self.f.getmetrics()[0]


def place(dst, layer, x, y, rgb, gain=1.0, blur_px=0.0):
    """Place a trimmed mask at integer-ish position (x,y = top-left), additively."""
    m, ox, oy = layer
    h, w = m.shape[:2]
    X, Y = int(round(x)) - ox, int(round(y)) - oy
    xs0, xs1 = max(0, X), min(W, X + w)
    ys0, ys1 = max(0, Y), min(H, Y + h)
    if xs0 >= xs1 or ys0 >= ys1:
        return dst
    sub = m[ys0 - Y:ys1 - Y, xs0 - X:xs1 - X]
    if blur_px > 0:
        sub = blur(sub, blur_px)
    if dst.ndim == 2:
        dst[ys0:ys1, xs0:xs1] += sub * gain
    else:
        dst[ys0:ys1, xs0:xs1] += sub[..., None] * rgb * gain
    return dst


def place_scaled(dst, layer, cx, cy, scale, rgb, gain=1.0, blur_px=0.0):
    """Place centred at cx,cy with uniform scale."""
    m, ox, oy = layer
    h, w = m.shape[:2]
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    if (nw, nh) != (w, h):
        m = to_np(from_np(m).resize((nw, nh), Image.BILINEAR))
    x = cx - nw // 2 + ox * scale
    y = cy - nh // 2 + oy * scale
    return place(dst, (m, 0, 0), x, y, rgb, gain, blur_px)


def place_c(dst, layer, cx, y, rgb, gain=1.0, blur_px=0.0):
    """Place a trimmed mask horizontally centred on cx."""
    m, ox, oy = layer
    return place(dst, layer, cx - m.shape[1] * 0.5 + ox, y, rgb, gain, blur_px)


def place_r(dst, layer, rx, y, rgb, gain=1.0, blur_px=0.0):
    """Place a trimmed mask with its right edge on rx."""
    m, ox, oy = layer
    return place(dst, layer, rx - m.shape[1] + ox, y, rgb, gain, blur_px)


def draw_fill(mask, pts, gain=1.0, quality=0.6):
    """Filled polygon into a float mask."""
    m = draw((W, H), lambda d, q: d.polygon([(p[0] * q, p[1] * q) for p in pts], fill=255),
             quality=quality)
    np.maximum(mask, m * gain, out=mask)
    return mask


def reveal_focus(m, focus, softness=0.55):
    """Sharp <-> defocused text reveal."""
    focus = clamp(focus)
    if focus >= 0.995:
        return m
    b = blur(m, lerp(26.0, 3.0, focus) * (1.0 - focus * 0.4) + 2.0)
    return b * lerp(0.55, 1.0, focus)


# ------------------------------------------------------------------ effects
def bloom(rgb, thresh=0.55, strength=0.7, radius=26, f=5):
    lum = rgb.max(axis=2)
    m = clip01((lum - thresh) / max(1e-4, 1.0 - thresh))
    m *= (lum > thresh)
    if m.max() <= 0.002:
        return rgb
    small = down(m, f)
    small = to_np(from_np(small).filter(ImageFilter.GaussianBlur(radius / f * 0.9)))
    small = to_np(from_np(small).filter(ImageFilter.GaussianBlur(radius / f * 2.6)))
    b = up(small, f)
    return rgb + b[..., None] * strength


def ca(rgb, amount, cx=None, cy=None):
    """Radial chromatic aberration (sub-pixel, per channel)."""
    a = abs(float(amount))
    if a < 0.35:
        return rgb
    if a < 4.0:
        # tiny split: uniform integer roll is indistinguishable and much cheaper
        return ca_axis(rgb, round(a * 0.6), axis=1)
    out = np.empty_like(rgb)
    xs0 = np.arange(W, dtype=np.float32)[None, :]
    mag = np.clip(_R, 0.0, 1.6) * (a / 1.6)
    for i, sgn in enumerate((1.0, 0.0, -1.0)):
        xs = xs0 - mag * sgn
        x0 = np.floor(xs)
        f = xs - x0
        i0 = np.clip(x0.astype(np.int32), 0, W - 1)
        i1 = np.clip(x0.astype(np.int32) + 1, 0, W - 1)
        ch = rgb[..., i]
        out[..., i] = (np.take_along_axis(ch, i0, axis=1) * (1.0 - f)
                       + np.take_along_axis(ch, i1, axis=1) * f)
    return out


def ca_axis(rgb, amount, axis=1):
    """Cheap 1-axis RGB split (px) with edge clamping."""
    a = int(round(abs(amount)))
    if a < 1:
        return rgb
    out = rgb.copy()
    if axis == 1:
        out[..., 0] = np.roll(rgb[..., 0], a, axis=1)
        out[..., 2] = np.roll(rgb[..., 2], -a, axis=1)
    else:
        out[..., 0] = np.roll(rgb[..., 0], a, axis=0)
        out[..., 2] = np.roll(rgb[..., 2], -a, axis=0)
    return out


_YY, _XX = np.mgrid[0:H, 0:W].astype(np.float32)


def setup(w, h):
    """(Re)build resolution dependent precomputation."""
    global W, H, SCALE, _YY, _XX, _NX, _NY, _R, VIGNETTE, SCANLINE
    W, H = int(w) // 2 * 2, int(h) // 2 * 2
    SCALE = min(W / 1920.0, H / 1080.0)
    for t in Type._ALL:
        t.size = max(6, int(t.base * SCALE))
        t.f = font(t.kind, t.size, t.var)
        t._cache.clear()
    _YY, _XX = np.mgrid[0:H, 0:W].astype(np.float32)
    _NX = (_XX - W * 0.5) / (W * 0.5)
    _NY = (_YY - H * 0.5) / (H * 0.5)
    _R = np.sqrt(_NX ** 2 * 0.82 + _NY ** 2).astype(np.float32)
    VIGNETTE = (1.0 - 0.70 * smoothstep(0.52, 1.40, _R) ** 1.25).astype(np.float32)
    SCANLINE = (1.0 - 0.030 * (np.sin(_YY * 2.0) > 0.55)).astype(np.float32)
    return W, H


_NX = (_XX - W * 0.5) / (W * 0.5)
_NY = (_YY - H * 0.5) / (H * 0.5)
_R = np.sqrt(_NX ** 2 * 0.82 + _NY ** 2).astype(np.float32)
VIGNETTE = (1.0 - 0.70 * smoothstep(0.52, 1.40, _R) ** 1.25).astype(np.float32)
C_YY = _YY
SCANLINE = (1.0 - 0.030 * (np.sin(_YY * 2.0) > 0.55)).astype(np.float32)


def vignette(rgb, amount=1.0):
    return rgb * (1.0 - (1.0 - VIGNETTE) * amount)[..., None]


def scanlines(rgb, amount=1.0):
    return rgb * (1.0 - (1.0 - SCANLINE) * amount)[..., None]


def grain(rgb, amount=0.03, seed=0, chroma=0.25):
    rs = np.random.RandomState((int(seed) * 7919 + 13) & 0x7FFFFFFF)
    n = rs.rand(H, W).astype(np.float32) - 0.5
    out = rgb + n[..., None] * amount
    if chroma > 0:
        out += n[..., None] * chroma * amount * np.array([0.6, -0.4, 0.9], np.float32)
    return out


def transform(rgb, zoom=1.0, dx=0.0, dy=0.0, rot=0.0, resample=None):
    """Camera move. zoom>=1 avoids empty borders."""
    zoom = max(1.0, float(zoom))
    if abs(zoom - 1.0) < 1e-4 and abs(dx) < 0.02 and abs(dy) < 0.02 and abs(rot) < 1e-4:
        return rgb
    a = math.radians(rot)
    ca_, sa = math.cos(a), math.sin(a)
    s = 1.0 / zoom
    cx, cy = W * 0.5, H * 0.5
    # dest -> src : p_s = R(-rot) * s * (p_d - c - d) + c
    m = (ca_ * s, sa * s, cx - s * (ca_ * (cx + dx) + sa * (cy + dy)),
         -sa * s, ca_ * s, cy - s * (-sa * (cx + dx) + ca_ * (cy + dy)))
    img = Image.fromarray((clip01(rgb) * 255.0 + 0.5).astype(np.uint8), "RGB")
    out = img.transform((W, H), Image.AFFINE, m,
                        resample=Image.BILINEAR if resample is None else resample)
    return np.asarray(out, np.float32) * (1.0 / 255.0)



def whip_blur(rgb, amount, direction="h"):
    """Directional smear (cheap: repeated box shift accumulation)."""
    a = int(round(amount))
    if a < 1:
        return rgb
    acc = np.zeros_like(rgb)
    n = 7
    for i in range(n):
        o = int(round(-a + 2 * a * i / (n - 1)))
        if direction == "h":
            acc += np.roll(rgb, o, axis=1)
        else:
            acc += np.roll(rgb, o, axis=0)
    return acc / n


def blocks_glitch(rgb, t, seed=3, strength=1.0, y_bias=0.0):
    """Datamosh-ish horizontal block displacement."""
    if strength <= 0.001:
        return rgb
    out = rgb.copy()
    rs = np.random.RandomState(seed)
    rows = []
    y = 0
    while y < H:
        hgt = int(rs.randint(6, 46) * strength) + 2
        rows.append((y, hgt))
        y += hgt
    for (y, hgt) in rows:
        r = float(
            noise1(
                np.array([t * 9.0 + y * 0.03], np.float32),
                seed + y % 13,
            )[0]
        )
        if r < 0.72 - 0.25 * strength:
            continue
        dx = int((r - 0.6) * 260 * strength)
        sl = out[max(0, y):min(H, y + hgt)]
        out[max(0, y):min(H, y + hgt)] = np.roll(sl, dx, axis=1)
    return out
