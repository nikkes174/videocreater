"""BlackPhantom 15s showreel - scenes, staging and direction."""
from __future__ import annotations

import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from . import core as C
from .core import (H, W, CYAN, VIOLET, MAGENTA, AMBER, WHITE, DIM, NIGHT, INK,
                   Type, add, black, blank, blur, clamp, draw, down, ease_in_out_cubic,
                   ease_in_out_quint, ease_out_back, ease_out_cubic, ease_out_elastic,
                   ease_out_expo, ease_out_quint, fbm1, from_np, hx, lerp, mix, noise1,
                   place, place_scaled, pulse, sstep, smoothstep, span, splat, tint,
                   to_np, tw, up, wipe_x, wipe_y)
from .core import place_c, place_r

# ------------------------------------------------------------------ palette
P = dict(cyan=CYAN, violet=VIOLET, magenta=MAGENTA, amber=AMBER, white=WHITE,
         dim=DIM, night=NIGHT, ink=INK,
         deep=hx("#03050B"), bg=hx("#070B15"), bg2=hx("#0C1426"))

# ------------------------------------------------------------------- locale
RU = dict(
    hook=["ЦИФРА, КОТОРАЯ", "ДВИГАЕТ", "БИЗНЕС"],
    hook_sub="ЦИФРОВАЯ ТРАНСФОРМАЦИЯ ДЛЯ БИЗНЕСА",
    stack_label="ОБЪЁМ РАБОТ",
    stack=[("01", "АЙДЕНТИКА", "ЗНАК · СЕТКА · ЯЗЫК"),
           ("02", "МОТИОН-ДИЗАЙН", "ТИТРЫ · 2D / 3D"),
           ("03", "3D И VХФ", "ЧАСТИЦЫ · СВЕТ"),
           ("04", "ЗВУК И САУНД", "МУЗЫКА · ЭФФЕКТЫ")],
    mont_a=["ЦИФРОВОЙ", "ПРОДУКТ"],
    mont_a_sub="ИНТЕРФЕЙСЫ И МИКРОВЗАИМОДЕЙСТВИЯ",
    mont_b=["ЧАСТИЦЫ", "2400 УЗЛОВ"],
    mont_c=["ИДЕЯ", "ДИЗАЙН", "ДВИЖЕНИЕ"],
    mont_c_sub="ТРИ СЛОВА, КОТОРЫЕ ДВИГАЮТ РЫНОК",
    statement=["КАЖДЫЙ КАДР", "ЭТО КОД"],
    statement_sub="BLACKPHANTOM · MOTION DESIGN",
    studio="MOTION DESIGN STUDIO",
    credits="РЕЖИССУРА · ДИЗАЙН · 3D · КОМПОЗИТ · ЗВУК",
    cta="blackphantom.studio",
    made_for="ДЛЯ AXION · CLOUD & DATA",
    outro="ШОУРИЛ 2026",
    hud_brand="BLACKPHANTOM",
    tag="MOTION / BRAND / 3D",
)

EN = dict(
    hook=["DIGITAL THAT", "MOVES", "BUSINESS"],
    hook_sub="DIGITAL TRANSFORMATION FOR COMPANIES",
    stack_label="SCOPE OF WORK",
    stack=[("01", "BRAND IDENTITY", "MARK · GRID · VOICE"),
           ("02", "MOTION DESIGN", "TITLES · 2D / 3D"),
           ("03", "3D AND VFX", "PARTICLES · LIGHT"),
           ("04", "SOUND DESIGN", "MUSIC · SFX")],
    mont_a=["DIGITAL", "PRODUCT"],
    mont_a_sub="INTERFACES AND MICROINTERACTIONS",
    mont_b=["PARTICLES", "2400 NODES"],
    mont_c=["IDEA", "DESIGN", "MOTION"],
    mont_c_sub="THREE WORDS THAT MOVE MARKETS",
    statement=["EVERY FRAME", "IS CODE"],
    statement_sub="BLACKPHANTOM · MOTION DESIGN",
    studio="MOTION DESIGN STUDIO",
    credits="DIRECTION · DESIGN · 3D · COMPOSITING · SOUND",
    cta="blackphantom.studio",
    made_for="FOR AXION · CLOUD & DATA",
    outro="SHOWREEL 2026",
    hud_brand="BLACKPHANTOM",
    tag="MOTION / BRAND / 3D",
)

# --------------------------------------------------------------------- type
T_HUGE = Type("black", 250, 6)
T_BIG = Type("black", 134, 1)
T_MED = Type("black", 104, 1)
T_SM = Type("black", 62, 6)
T_XS = Type("black", 38, 14)
T_SUB = Type("light", 54, 2)
T_TECH = Type("tech", 44, 16, "SemiBold Condensed")
T_TECH_S = Type("tech", 30, 22, "SemiBold Condensed")
T_TECH_XS = Type("tech", 24, 18, "SemiBold Condensed")
T_MONO = Type("mono", 30, 4)
T_MONO_S = Type("mono", 24, 3)
T_MONO_XS = Type("mono", 20, 3)
T_WORD = Type("black", 128, 34)
T_NUM = Type("black", 300, 0)
T_CTA = Type("tech", 46, 8, "SemiBold")
T_HERO = Type("black", 172, 1)
T_KIN = Type("black", 236, 4)
T_CODE = Type("mono", 26, 0)
T_STMT1 = Type("black", 148, 2)
T_STMT2 = Type("black", 196, 2)
T_STACK_T = Type("black", 104, 1)

BRAND = "BLACKPHANTOM"

# ================================================================= backdrop
_HZ = H * 0.60


_SKY_CACHE = {}


def _sky_base():
    key = (H, W)
    b = _SKY_CACHE.get(key)
    if b is None:
        f = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None]
        col = P["bg2"] * (1.0 - f) * 0.55 + P["bg"] * f * 0.9
        b = np.repeat(col[:, None, :], W, axis=1).astype(np.float32)
        _SKY_CACHE[key] = b
    return b


def base_sky(t, warm=0.0):
    """Vertical gradient + breathing radial light."""
    img = _sky_base().copy()
    g = _radial(0.5, 0.62, 0.78, 0.72) * (0.26 + 0.05 * math.sin(t * 1.7))
    img += g[..., None] * mix(P["cyan"], P["violet"], 0.5 + 0.35 * math.sin(t * 0.4))
    if warm > 0:
        img += (_radial(0.5, 0.1, 0.9, 0.5) * (0.04 + warm * 0.05))[..., None] * P["violet"]
    return img


_RAD_CACHE = {}


def _radial(cx, cy, rx, ry):
    key = (round(cx, 3), round(cy, 3), round(rx, 3), round(ry, 3))
    r = _RAD_CACHE.get(key)
    if r is None:
        x = (C._XX - cx * W) / (rx * W)
        y = (C._YY - cy * H) / (ry * H)
        r = np.exp(-(x * x + y * y) * 1.9).astype(np.float32)
        _RAD_CACHE[key] = r
    return r


_GRID_ROWS = None


def grid_mask(t, speed=1.0, zoom=1.0, intensity=1.0, color_fade=True, horizon=_HZ):
    """Perspective floor grid, scrolling toward camera."""
    off = t * speed
    m = draw((W, H), lambda d, q: _grid_draw(d, q, off, zoom, horizon), quality=0.5)
    f = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None]
    wgt = smoothstep(horizon / H, horizon / H + 0.22, f) * (1.0 - 0.55 * smoothstep(0.86, 1.02, f))
    return m * wgt * intensity


def _grid_draw(d, q, off, zoom, horizon):
    Wq, Hq = W * q, H * q
    hz = horizon * q
    step = 150.0 * q / zoom
    n = 26
    vp = (Wq * 0.5, hz)
    for i in range(-n, n + 1):
        xb = Wq * 0.5 + (i * step + (off * 90.0 * q) % step)
        d.line([vp, (xb, Hq + 40 * q)], fill=110, width=max(1, int(1.6 * q)))
    for k in range(n + 1):
        f = ((k + (off * 0.55)) % n) / n
        y = hz + (Hq - hz) * (f ** 2.35)
        d.line([(0, y), (Wq, y)], fill=int(70 + 90 * f), width=max(1, int(1.6 * q)))


def dust(t, n=230, seed=3, speed=1.0, gain=0.5, spread=(0.0, 1.0), rmin=1.2, rmax=3.4):
    rs = np.random.RandomState(seed)
    x0 = rs.rand(n) * W
    y0 = rs.rand(n)
    sp = rs.rand(n)
    x = x0 + np.sin(t * 0.35 + sp * 6.0) * 26 * speed
    y = (y0 + t * 0.014 * (0.3 + sp) * speed) % 1.0
    y = spread[0] + y * (spread[1] - spread[0])
    r = rmin + rs.rand(n) * (rmax - rmin)
    w = (0.25 + 0.75 * rs.rand(n)) * gain * (0.65 + 0.35 * np.sin(t * 2.0 + sp * 9))
    m = blank()
    splat(m, x, y * H, r, w.astype(np.float32), power=1.6)
    return m


def stream_particles(t, n=200, seed=5, gain=1.0, len_=30, speed=1.0,
                     box=(0, 0, 1, 1), col=None, zpar=0.5):
    """Data-stream streaks travelling on one axis with depth parallax."""
    rs = np.random.RandomState(seed)
    base = rs.rand(n)
    z = rs.rand(n)
    px = ((base + t * (0.25 + z * 0.9) * speed) % 1.0)
    py = ((rs.rand(n) + t * 0.02 * speed) % 1.0)
    x = box[0] * W + px * (box[2] - box[0]) * W
    y = box[1] * H + py * (box[3] - box[1]) * H
    w = ((0.15 + zpar * z) ** 2 * gain).astype(np.float32)
    m = blank()
    for i in range(n):
        L = len_ * (0.3 + z[i])
        C.splat_streak(m, x[i], y[i], -L * 0.5, 0, max(2, int(L)), 1.0 + 2.6 * z[i], w[i])
    return m


# ============================================================== brand mark
PHI = (1.0 + math.sqrt(5.0)) / 2.0
_HEX = [(0.0, -0.52), (0.45, -0.26), (0.45, 0.26), (0.0, 0.52),
        (-0.45, 0.26), (-0.45, -0.26)]
# phantom blades (unit space; right wing is the mirror)
_WING_L = [(-0.06, -0.34), (-0.30, 0.0), (-0.06, 0.34), (-0.45, 0.105), (-0.45, -0.105)]


def mark_parts(cx, cy, size, t_ring, wing_l, wing_r):
    """Brand mark: hexagon ring + two 'phantom wings'."""
    ring = blank()
    wing = blank()

    def to_px(p):
        return (cx + p[0] * size, cy + p[1] * size)

    if t_ring > 0.001:
        pts = [to_px(p) for p in _HEX] + [to_px(_HEX[0])]
        draw_poly(ring, pts, max(1.8, size * 0.013), t_ring, quality=0.6)
    for pts, sgn, prog in ((_WING_L, -1.0, wing_l), (_WING_L, 1.0, wing_r)):
        if prog <= 0.002:
            continue
        off = (1.0 - prog) * 0.60 * sgn * size
        p = [(cx + (a if sgn > 0 else -a) * size + off, cy + b * size) for a, b in pts]
        C.draw_fill(wing, p, gain=1.0)
    return ring, wing


def draw_poly(mask, pts, width, prog, closed=False, rounded=True, quality=1.0):
    """Polyline with length trim (prog 0..1)."""
    seq = list(pts) + ([pts[0]] if closed else [])
    lengths = [math.dist(seq[i], seq[i + 1]) for i in range(len(seq) - 1)]
    total = sum(lengths)
    target = total * clamp(prog)
    done = 0.0
    seg = []
    for i, L in enumerate(lengths):
        if done >= target:
            break
        f = min(1.0, (target - done) / max(1e-6, L))
        a, b = seq[i], seq[i + 1]
        seg.append((a, (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)))
        done += L
    if len(seg) >= 1:
        m = draw((W, H), lambda d, q: _polyline(d, q, seg, width, rounded), quality=quality)
        np.maximum(mask, m, out=mask)


def _polyline(d, q, seg, width, rounded):
    """seg = [(a, b), ...] point pairs."""
    wpx = max(2, int(round(width * q)))
    pts = [seg[0][0]]
    for a, b in seg:
        pts.append(b)
    pts = [(p[0] * q, p[1] * q) for p in pts]
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=255, width=wpx)
    if rounded:
        r = wpx / 2.0
        for p in (pts[0], pts[-1]):
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=255)
        for p in pts[1:-1]:
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=255)


def stroke_text(T, text, tr=None, weight=0.012):
    """Outline (stroke-only) version of a text mask."""
    m, ox, oy = T.mask(text, tr)
    if m.shape[0] < 4:
        return m
    r = max(1.0, m.shape[0] * weight)
    im = Image.fromarray((C.clip01(m) * 255).astype(np.uint8), "L")
    edge = im.filter(ImageFilter.MaxFilter(3))
    out = np.asarray(edge, np.float32) / 255.0 - m
    return np.clip(out, 0, 1)


# ================================================================== HUD
# NOTE: HUD disabled by design cleanup — technical edge labels
# (SHOWREEL / 15 SEC, AXION — BRAND FILM 2026, timecode, edge brand)
# are no longer rendered. Function signatures kept so render.py
# (grade -> hud_for) keeps working; output is intentionally blank.
def hud(t, op=1.0, show_brand=True, tc=True, brand=None):
    return black()


def hud_for(name, t):
    """HUD is composited after the camera move so it stays pinned."""
    if name == "ignition":
        return hud(t, 0.62 * sstep(1.70, 2.00, t), show_brand=False, tc=False)
    if name in ("mont_a", "mont_b", "mont_c"):
        return hud(t, 0.62, show_brand=False, tc=True)
    if name == "endcard":
        return hud(t, 0.80, show_brand=False, tc=True)
    if name == "outro":
        return hud(t, 0.0)
    return hud(t, 0.82, show_brand=(name in ("stack", "statement", "hook")), tc=True)


def timecode(t):
    f = int(t * C.FPS)
    return "00:%02d:%02d:%02d" % ((f // C.FPS // 60) % 60, (f // C.FPS) % 60, f % C.FPS)


# ================================================================ scene 01
def sc_ignition(t, L, shot):
    img = base_sky(t, warm=0.4) * 0.5
    img += grid_mask(t * 0.4, 0.35, 1.0, 0.22)[..., None] * P["cyan"] * 0.5

    # -- convergence particles (streaks flying into the mark)
    rs = np.random.RandomState(11)
    n = 240
    cx, cy, size = W * 0.5, H * 0.5, 210.0
    dl = rs.rand(n) * 0.42
    jit = rs.rand(n)
    ang = rs.rand(n) * math.tau
    rad = (0.35 + 1.25 * rs.rand(n)) * W * 0.62
    sx = W * 0.5 + np.cos(ang) * rad
    sy = H * 0.5 + np.sin(ang) * rad * 0.62
    p = clamp((t - 0.18 - dl) / 0.87).astype(np.float32)
    pe = np.power(1.0 - p, 5) * -1.0 + 1.0
    x = sx + (cx - sx) * pe
    y = sy + (cy - sy) * pe
    spd = (1.0 - p) * (t > 0.18)
    m = blank()
    for i in range(n):
        L_ = 6 + 70 * spd[i] * (0.4 + jit[i] * 0.6)
        C.splat_streak(m, x[i], y[i], -L_ * 0.5, 0, max(2, int(L_)),
                       1.2 + 3.0 * spd[i], 0.9 * spd[i] ** 1.4)
    img += m[..., None] * mix(CYAN, VIOLET, 0.35 + 0.3 * math.sin(t * 3)) * 1.15

    # -- thin light line
    lw = ease_out_expo(span(t, 0.0, 0.5))
    m = blank()
    if lw > 0.01:
        draw_poly(m, [(W * 0.5 - 900 * lw, cy), (W * 0.5 + 900 * lw, cy)], 2.0 + 7 * lw, 1.0)
    img += m[..., None] * WHITE * (1.6 * lw) * (1.0 - 0.5 * span(t, 0.6, 1.4))

    # -- mark assembly
    ring_p = ease_in_out_cubic(span(t, 0.42, 1.05))
    wl = ease_out_back(span(t, 0.60, 1.25))
    wr = ease_out_back(span(t, 0.68, 1.33))
    ring, wing = mark_parts(W * 0.5, H * 0.5 - 118, size, ring_p, wl, wr)
    g = 0.85 + 0.5 * pulse(t, 1.28, 0.22)
    img += blur(ring, 1.6)[..., None] * mix(CYAN, WHITE, 0.25) * 1.8
    img += blur(wing, 2.2)[..., None] * WHITE * 1.12
    img += blur(wing, 22)[..., None] * CYAN * 0.95 * g

    # shockwave
    sw = span(t, 1.24, 1.75)
    if sw > 0.001 and sw < 0.999:
        rr = 60 + ease_out_expo(sw) * 900
        m = draw((W, H), lambda d, q: d.ellipse(
            [(W * 0.5 - rr) * q, (H * 0.5 - 118 - rr) * q,
             (W * 0.5 + rr) * q, (H * 0.5 - 118 + rr) * q],
            outline=255, width=max(1, int(4 * q * (1 - sw)))), quality=0.4)
        img += m[..., None] * mix(CYAN, WHITE, 0.5) * 1.6 * (1 - sw)

    # -- wordmark: tracking settles
    tr = lerp(300, 34, ease_out_expo(span(t, 1.15, 1.95)))
    wp = span(t, 1.15, 1.9)
    wm = T_WORD.mask(BRAND, tr)
    place_c(img, wm, W * 0.5, H * 0.5 + 108, WHITE, wp * 1.2, blur_px=lerp(9, 0, wp))
    m = blank()
    place_c(m, wm, W * 0.5, H * 0.5 + 108, WHITE, wp)
    img += blur(m, 16)[..., None] * CYAN * 0.8 * wp

    sub = T_TECH_S.mask("MOTION DESIGN SHOWREEL")
    place_c(img, sub, W * 0.5, H * 0.5 + 262, mix(WHITE, CYAN, 0.45),
            0.9 * span(t, 1.55, 2.0))
    # NOTE: technical label "SIGNAL ACQUIRED" removed (edge HUD-style markup).

    return img


# ================================================================= scene 02
def sc_hook(t, L, shot):
    img = base_sky(t, warm=1.0) * 0.62
    img += grid_mask(t * 0.9, 1.0, 1.0, 0.5)[..., None] * mix(CYAN, VIOLET, 0.4) * 0.45
    img += (_radial(0.76, 0.44, 0.5, 0.75) * 0.14)[..., None] * VIOLET
    img += dust(t, 170, 9, 0.6, 0.34)[..., None] * mix(WHITE, CYAN, 0.5)

    lines = L["hook"]
    x0 = 140.0
    types = [T_BIG, T_HERO, T_BIG]
    gap = [26, 30, 0]
    y = 262.0
    btm = y
    for i, txt in enumerate(lines):
        T = types[i]
        st = 0.10 + i * 0.17
        q = span(t, st, st + 0.52)
        m, ox, oy = T.mask(txt)
        mw, mh = m.shape[1], m.shape[0]
        if q > 0.001:
            e = ease_out_quint(q)
            yy = y + lerp(58, 0, e)
            ramp = smoothstep(0.0, 120, m.max(axis=0))
            cut = -ramp * 130.0 + e * (mw + 200.0)
            mask = wipe_x(cut, mw, 24) * (0.3 + 0.7 * smoothstep(0, 1, q))
            col = mix(CYAN, WHITE, 0.3 + 0.15 * math.sin(t * 5)) if i == 1 else WHITE
            place(img, (m * mask, ox, oy), x0, yy, col, 1.05 * smoothstep(0, 0.25, q),
                  blur_px=lerp(7, 0, e))
            m2 = blank()
            place(m2, (m * mask, ox, oy), x0, yy, WHITE, 1.0, blur_px=lerp(7, 0, e))
            img += blur(m2, 26)[..., None] * (CYAN if i == 1 else VIOLET) * 0.38 * e
        y += mh + gap[i]
        btm = y

    # underline draw under the accent line
    uq = span(t, 1.02, 1.55)
    if uq > 0.001:
        e = ease_out_expo(uq)
        uy = 262 + T_BIG.mask(lines[0])[0].shape[0] + 26 + T_HERO.mask(lines[1])[0].shape[0] + 30
        m = blank()
        draw_poly(m, [(x0, uy), (x0 + 520 * e, uy)], 6.0, 1.0)
        img += m[..., None] * CYAN * 2.0
        img += blur(m, 22)[..., None] * CYAN * 1.0

    # right column: vertical ladder (decorative lines only;
    # technical index labels 01-04 removed).
    for i in range(4):
        yy = 300 + i * 128
        act = (i == 1)
        q = ease_out_expo(span(t, 0.25 + i * 0.09, 0.7 + i * 0.09))
        m = blank()
        draw_poly(m, [(W - 330, yy), (W - 330 + (200 if act else 120) * q, yy)],
                  4.0 if act else 3.0, 1.0)
        img += m[..., None] * (mix(CYAN, WHITE, 0.4) if act else mix(DIM, WHITE, 0.2)) * \
            (1.1 if act else 0.8)

    place(img, T_TECH_XS.mask("AXION"), 140, 176, mix(CYAN, WHITE, 0.3), 1.0)
    m = blank()
    draw_poly(m, [(140, 232), (140 + 190, 232)], 2.0, ease_out_expo(span(t, 0.05, 0.6)))
    img += m[..., None] * CYAN * 1.2
    place(img, T_MONO_XS.mask(L["hook_sub"]), 140, H - 168, mix(DIM, WHITE, 0.3),
          1.0 * span(t, 0.8, 1.4))
    return img


# ================================================================= scene 03
def sc_stack(t, L, shot):
    img = base_sky(t) * 0.7
    img += (_radial(0.12, 0.5, 0.75, 0.9) * 0.35)[..., None] * CYAN * 0.5
    img += grid_mask(t * 0.5, 0.6, 1.0, 0.20)[..., None] * CYAN * 0.35

    # header
    q = span(t, 0.0, 0.4)
    place(img, T_TECH_XS.mask(L["stack_label"]), 96, 190, mix(CYAN, WHITE, 0.2), 0.95 * q)
    m = blank()
    draw_poly(m, [(96, 250), (W - 96, 250)], 3.0, ease_out_expo(span(t, 0.05, 0.9)))
    add(img, mix(CYAN, WHITE, 0.4), m, 0.9)

    rows = L["stack"]
    y0 = 330
    rh = 168
    for i, (num, title, tag) in enumerate(rows):
        st = 0.16 + i * 0.135
        q = span(t, st, st + 0.5)
        e = ease_out_quint(q)
        dy = lerp(46, 0, e)
        al = smoothstep(0, 0.35, q)
        yy = y0 + i * rh + dy
        col = mix(WHITE, CYAN, 0.88) if i == 1 else WHITE
        Tm = T_MED
        m, ox, oy = Tm.mask(title)
        mw, mh = m.shape[1], m.shape[0]
        clip = wipe_x(e * (mw + 110) + 40, mw, 30)
        # index
        place(img, T_MONO.mask(num), 96, yy + 14, mix(CYAN, WHITE, 0.1), 1.0 * al)
        # title
        place(img, (m * clip, ox, oy), 216, yy, col, 1.05 * al, blur_px=lerp(6, 0, e))
        # tag sits on the title baseline, to its right
        tq = span(t, st + 0.18, st + 0.62)
        tx = 216 + mw + 46
        place(img, T_MONO_XS.mask(tag), tx, yy + mh - 26, mix(DIM, WHITE, 0.25),
              1.0 * al * smoothstep(0, 0.5, tq))
        # rule + progress bar above the row
        bx0, bx1 = 96, W - 96
        bp = ease_out_expo(span(t, st + 0.05, st + 0.8))
        ry = yy - 28
        m = blank()
        draw_poly(m, [(bx0, ry), (bx1, ry)], 2.0, 1.0)
        add(img, mix(CYAN, WHITE, 0.1), m, 0.35 * al)
        if bp > 0.02:
            m2 = blank()
            draw_poly(m2, [(bx0, ry), (bx0 + (bx1 - bx0) * bp, ry)], 4.0, 1.0)
            img += m2[..., None] * mix(CYAN, WHITE, 0.25) * 1.25 * al
            img += blur(m2, 16)[..., None] * CYAN * 0.85 * al
            tipx = bx0 + (bx1 - bx0) * bp
            mm = blank()
            C.splat(mm, np.array([tipx]), np.array([ry]), np.array([11.0]), np.array([1.0]))
            img += mm[..., None] * WHITE * 1.5 * al
        # right counter
        cnt = "%02d%%" % int(round(100 * min(1.0, span(t, st + 0.05, st + 0.8))))
        place_r(img, T_MONO_S.mask(cnt), W - 96, yy + mh - 36,
                mix(WHITE, CYAN, 0.5), 0.95 * al)

    img += dust(t, 120, 4, 0.5, 0.22)[..., None] * WHITE
    return img


# ================================================================= scene 04
def _panel_chart(w, h, t):
    img = np.zeros((h, w, 3), np.float32)
    m = draw((w, h), lambda d, q: d.rounded_rectangle([0, 0, w - 1, h - 1], 18 * q,
                                                      fill=46, outline=150, width=max(1, int(2 * q))),
             quality=1.0)
    img += m[..., None] * mix(CYAN, WHITE, 0.55) * 0.55
    # header
    hd = draw((w, h), lambda d, q: d.rounded_rectangle([0, 0, w - 1, 54 * q], 18 * q, fill=90),
              quality=1.0)
    img += hd[..., None] * mix(CYAN, WHITE, 0.6) * 0.35
    pts = [(0.08, 0.72), (0.24, 0.52), (0.36, 0.62), (0.5, 0.30), (0.62, 0.42),
           (0.76, 0.18), (0.9, 0.28)]
    n = len(pts)
    rev = ease_out_cubic(span(t, 0.05, 0.85))
    segs = []
    for i in range(n - 1):
        a, b = pts[i], pts[i + 1]
        f = clamp((rev * (n - 1) - i))
        segs.append(((a[0] * w, a[1] * h),
                     ((a[0] + (b[0] - a[0]) * f) * w, (a[1] + (b[1] - a[1]) * f) * h)))
    m = draw((w, h), lambda d, q: _polyline(d, q, segs, 4.0, True), quality=1.0)
    img += m[..., None] * CYAN * 1.6
    # glow
    g = np.asarray(Image.fromarray((C.clip01(m) * 255).astype(np.uint8), "L")
                   .filter(ImageFilter.GaussianBlur(9)), np.float32) / 255.0
    img += g[..., None] * CYAN * 1.1
    # moving dot on the line
    k = min(len(segs) - 1, int(rev * (n - 1)))
    fx = segs[k][1][0] / w
    fy = segs[k][1][1] / h
    dm = np.zeros((h, w), np.float32)
    C.splat(dm, np.array([fx * w]), np.array([fy * h]), np.array([9.0]), np.array([1.0]))
    img += dm[..., None] * WHITE * 2.0
    return img


def _panel_bars(w, h, t):
    img = np.zeros((h, w, 3), np.float32)
    m = draw((w, h), lambda d, q: d.rounded_rectangle([0, 0, w - 1, h - 1], 18 * q,
                                                      fill=46, outline=150, width=max(1, int(2 * q))))
    img += m[..., None] * mix(VIOLET, WHITE, 0.5) * 0.5
    vals = [0.35, 0.62, 0.48, 0.86, 0.55, 0.74]
    bw = w / 9.0
    for i, v in enumerate(vals):
        q = ease_out_cubic(span(t, 0.05 + i * 0.05, 0.5 + i * 0.05))
        v2 = v * q
        x0 = bw * (1.0 + i * 1.15)
        y1 = h - 46
        y0 = y1 - (h - 150) * v2
        m = draw((w, h), lambda d, q2: d.rounded_rectangle(
            [x0, y0, x0 + bw * 0.72, y1], 6 * q2, fill=255))
        col = mix(CYAN, VIOLET, i / 5.0)
        img += m[..., None] * col * 1.3
        g = np.asarray(Image.fromarray((C.clip01(m) * 255).astype(np.uint8), "L")
                       .filter(ImageFilter.GaussianBlur(10)), np.float32) / 255.0
        img += g[..., None] * col * 0.9
    return img


def _panel_code(w, h, t, L=None):
    img = np.zeros((h, w, 3), np.float32)
    m = draw((w, h), lambda d, q: d.rounded_rectangle([0, 0, w - 1, h - 1], 18 * q,
                                                      fill=46, outline=150, width=max(1, int(2 * q))))
    img += m[..., None] * mix(AMBER, WHITE, 0.4) * 0.45
    code = ["m01 = black_phantom()", "  .kinetics(60)", "  .glow(0.8)",
            "  .grade(cinematic)", "return render()"]
    rev = ease_out_cubic(span(t, 0.08, 0.9))
    for i, ln in enumerate(code):
        q = clamp(rev * len(code) - i)
        if q <= 0.01:
            continue
        T = T_CODE
        col = mix(WHITE, CYAN, 0.4) if i == 0 else mix(DIM, WHITE, 0.55 + 0.3 * (i % 2))
        place(img, T.mask(ln)[:1] and T.mask(ln), 34, 74 + i * 42, col, 0.95 * q)
    # caret
    if (t * 3) % 1 < 0.5:
        m = draw((w, h), lambda d, q: d.rectangle([w - 60, 74 + 4 * 42, w - 52, 74 + 4 * 42 + 26],
                                                  fill=255))
        img += m[..., None] * CYAN
    return img


def _place_panel(dst, pan, cx, cy, scale, gain=1.0, blur_px=0.0):
    nh, nw = int(pan.shape[0] * scale), int(pan.shape[1] * scale)
    im = Image.fromarray((C.clip01(pan) * 255).astype(np.uint8), "RGB")
    if (nw, nh) != (pan.shape[1], pan.shape[0]):
        im = im.resize((nw, nh), Image.BICUBIC)
    arr = np.asarray(im, np.float32) / 255.0
    if blur_px > 0:
        arr = blur(arr.mean(axis=2), blur_px)[..., None] * 0 + arr * 0
        arr = np.dstack([blur(arr[..., i], blur_px) for i in range(3)])
    x0, y0 = int(cx - nw / 2), int(cy - nh / 2)
    xs0, xs1 = max(0, x0), min(W, x0 + nw)
    ys0, ys1 = max(0, y0), min(H, y0 + nh)
    if xs0 < xs1 and ys0 < ys1:
        dst[ys0:ys1, xs0:xs1] += arr[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0] * gain
    return dst


def sc_mont_a(t, L, shot):
    img = base_sky(t, warm=0.5) * 0.45
    img += grid_mask(t * 3.2, 3.0, 1.15, 0.6)[..., None] * mix(CYAN, VIOLET, 0.5) * 0.45
    img += stream_particles(t, 150, 12, 0.9, 46, 2.2, (0.30, 0.0, 1.0, 1.0))[..., None] * CYAN

    # headline, left
    y = 336.0
    for i, txt in enumerate(L["mont_a"]):
        st = 0.04 + i * 0.10
        q = span(t, st, st + 0.38)
        m, ox, oy = T_BIG.mask(txt)
        mw, mh = m.shape[1], m.shape[0]
        if q > 0.001:
            e = ease_out_quint(q)
            clip = wipe_x(e * (mw + 240), mw, 40)
            col = WHITE if i == 0 else mix(WHITE, CYAN, 0.85)
            place(img, (m * clip, ox, oy), 110, y + lerp(50, 0, e), col,
                  1.05 * smoothstep(0, 0.3, q), blur_px=lerp(8, 0, e))
            m2 = blank()
            place(m2, (m * clip, ox, oy), 110, y, WHITE, 1.0, blur_px=lerp(8, 0, e))
            img += blur(m2, 26)[..., None] * mix(CYAN, VIOLET, i) * 0.45 * e
        y += mh + 22
    m = blank()
    draw_poly(m, [(110, 250), (110 + 250 * ease_out_expo(span(t, 0.04, 0.55)), 250)], 6.0, 1.0)
    img += m[..., None] * CYAN * 1.5
    place(img, T_MONO_XS.mask(L["mont_a_sub"]), 110, y + 34, mix(DIM, WHITE, 0.2),
          1.0 * span(t, 0.35, 0.75))

    # panels cascade in from the right with depth
    specs = [(0.00, _panel_chart, 0.86, 1300, 420, 1.00),
             (0.14, _panel_bars, 0.72, 1520, 600, 0.60),
             (0.28, _panel_code, 0.60, 1280, 762, 0.30)]
    for off, fn, sc_, px, py, depth in specs:
        q = span(t, off, off + 0.58)
        pan = fn(430, 268, t)
        e = ease_out_quint(q)
        _place_panel(img, pan, lerp(px + 520 + depth * 300, px, e), py, sc_ * lerp(0.88, 1.0, e),
                     1.0, lerp(10, 0, e) * depth + lerp(2, 0, e))

    # NOTE: technical "FPS" counter removed (debug-style HUD markup).
    return img


# ================================================================= scene 05
def ico():
    v = [(-1, PHI, 0), (1, PHI, 0), (-1, -PHI, 0), (1, -PHI, 0),
         (0, -1, PHI), (0, 1, PHI), (0, -1, -PHI), (0, 1, -PHI),
         (PHI, 0, -1), (PHI, 0, 1), (-PHI, 0, -1), (-PHI, 0, 1)]
    v = np.array(v, np.float32)
    v /= (PHI)
    faces = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
             (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
             (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
             (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)]
    edges = set()
    for a, b, c in faces:
        for i, j in ((a, b), (b, c), (c, a)):
            edges.add((min(i, j), max(i, j)))
    return v, sorted(edges)


_ICO_V, _ICO_E = ico()


def _rot(p, rx, ry):
    ca, sa = math.cos(ry), math.sin(ry)
    p = p @ np.array([[ca, 0, sa], [0, 1, 0], [-sa, 0, ca]], np.float32)
    ca, sa = math.cos(rx), math.sin(rx)
    p = p @ np.array([[1, 0, 0], [0, ca, -sa], [0, sa, ca]], np.float32)
    return p


def sc_mont_b(t, L, shot):
    img = base_sky(t, warm=0.2) * 0.55
    img += grid_mask(t * 1.4, 1.2, 1.0, 0.35)[..., None] * VIOLET * 0.45
    cx, cy = W * 0.5, H * 0.5 - 20
    v = _rot(_ICO_V, t * 0.55 + 0.4, t * 0.9)
    depth = 3.4
    z = v[:, 2]
    f = depth / (depth - z)
    px = cx + v[:, 0] * f * 300.0
    py = cy + v[:, 1] * f * 300.0
    edge = blank()
    for a, b in _ICO_E:
        d0 = (z[a] + z[b]) * 0.5
        al = clamp(C.lerp(0.25, 1.0, (d0 + 1.0) * 0.5)) ** 1.6
        col = mix(CYAN, VIOLET, clamp((d0 + 1.0) * 0.5))
        m = draw((W, H), lambda d, q, a=a, b=b: d.line(
            [(px[a] * q, py[a] * q), (px[b] * q, py[b] * q)], fill=255,
            width=max(1, int(3.2 * q))), quality=0.5)
        img += m[..., None] * col * 2.0 * al
        edge += m * al
    img += blur(edge, 12)[..., None] * CYAN * 0.8
    # vertex sparks
    vm = blank()
    C.splat(vm, px, py, 6.0 + 10.0 * clamp((z + 1) * 0.5), (0.4 + 0.9 * clamp((z + 1) * 0.5)).astype(np.float32))
    img += vm[..., None] * WHITE * 1.4
    img += blur(vm, 26)[..., None] * CYAN * 0.7

    # orbiting particle ring
    n = 190
    a0 = np.arange(n) * math.tau / 42.0
    rs = np.random.RandomState(21)
    sp = rs.rand(n)
    ang = a0 + t * (0.7 + 0.5 * sp)
    rad = 330 + 40 * np.sin(ang * 3.0 + t * 1.4)
    ox = cx + np.cos(ang) * rad
    oy = cy + np.sin(ang) * rad * 0.34 + 40
    om = blank()
    C.splat(om, ox, oy, 1.6 + 2.6 * sp, (0.25 + 0.7 * sp).astype(np.float32), power=1.8)
    img += om[..., None] * mix(CYAN, MAGENTA, 0.25 * (0.5 + 0.5 * math.sin(t * 2))) * 1.3

    # labels
    for i, txt in enumerate(L["mont_b"]):
        st = 0.08 + i * 0.12
        q = span(t, st, st + 0.45)
        e = ease_out_quint(q)
        m, ox2, oy2 = T_BIG.mask(txt)
        clip = wipe_x(e * (m.shape[1] + 260), m.shape[1], 40)
        place_r(img, (m * clip, ox2, oy2), W - 120, 300 + i * 186,
               WHITE if i == 0 else mix(WHITE, CYAN, 0.85), 1.05 * smoothstep(0, 0.3, q))
    # NOTE: technical "NODES xxxx" counter removed (debug-style HUD markup).
    return img


# ================================================================= scene 06
def sc_mont_c(t, L, shot):
    img = base_sky(t, warm=0.8) * 0.45
    img += grid_mask(t * 2.0, 2.0, 1.05, 0.42)[..., None] * mix(MAGENTA, VIOLET, 0.5) * 0.4
    img += stream_particles(t, 120, 33, 0.7, 40, 1.6, (0.0, 0.0, 0.8, 1.0))[..., None] * MAGENTA

    words = L["mont_c"]
    cols = [WHITE, mix(WHITE, CYAN, 0.85), mix(CYAN, MAGENTA, 0.6)]
    for i, txt in enumerate(words):
        st = 0.02 + i * 0.24
        q = span(t, st, st + 0.64)
        if q <= 0.001 or q >= 0.999:
            continue
        e_in = ease_out_quint(clamp(q / 0.26))
        e_out = ease_in_out_cubic(clamp((q - 0.40) / 0.24))
        x = lerp(W + 340, 190, e_in) - e_out * (W + 520)
        yy = 320 + i * 196
        Tm = T_KIN
        m, ox, oy = Tm.mask(txt)
        mw, mh = m.shape[1], m.shape[0]
        lead = wipe_x(e_in * (mw + 120) - 40, mw, 40) * (1.0 - e_out)
        col = cols[i]
        sm = lerp(16, 0.0, min(1.0, q / 0.24)) * (1.0 - e_out * 0.5)
        place(img, (m * lead, ox, oy), x, yy, col, 1.05, blur_px=sm)
        m2 = blank()
        place(m2, (m * lead, ox, oy), x, yy, col, 1.0, blur_px=sm * 0.4)
        img += blur(m2, 24)[..., None] * mix(CYAN, MAGENTA, i / 2.0) * 0.55
        # NOTE: technical index labels "01/02/03" removed (interface markup).
    place(img, T_MONO_XS.mask(L["mont_c_sub"]), 100, H - 224, mix(DIM, WHITE, 0.2),
          1.0 * span(t, 0.6, 0.95))
    return img


# ================================================================= scene 07
def sc_statement(t, L, shot):
    dur = shot[1] - shot[0]
    p = clamp(t / dur)
    img = base_sky(t, warm=1.0) * 0.5
    # concentric rings
    rm = blank()
    for i in range(4):
        rr = 240 + i * 190 + 26 * math.sin(t * 1.6 + i)
        q = 1.0 - 0.22 * i
        ring_i = draw((W, H), lambda d, q2, rr=rr: d.ellipse(
            [(W * 0.5 - rr) * q2, (H * 0.5 - rr) * q2, (W * 0.5 + rr) * q2, (H * 0.5 + rr) * q2],
            outline=int(255 * q), width=max(1, int(2 * q2))), quality=0.35)
        rm = np.maximum(rm, ring_i)
    img += rm[..., None] * mix(VIOLET, CYAN, 0.5) * 0.16
    img += grid_mask(t * 0.7, 0.7, 1.0, 0.22)[..., None] * CYAN * 0.3

    lines = L["statement"]
    hold = ease_out_quint(span(t, 0.12, 0.95))
    for i, txt in enumerate(lines):
        q = span(t, 0.08 + i * 0.10, 0.72 + i * 0.10)
        e = ease_out_quint(q)
        Tm = T_STMT1 if i == 0 else T_STMT2
        m, ox, oy = Tm.mask(txt)
        # wipe travels bottom -> top
        cut = m.shape[0] * (-0.02 + e * 1.28)
        clip = wipe_y(cut, m.shape[0], 40)
        # glitch displacement moments
        g1 = pulse(t, 1.55 + i * 0.2, 0.055) + pulse(t, 2.05 + i * 0.2, 0.04)
        dx = 34 * g1 * (1 if (int(t * 60) % 2 == 0) else -1)
        col = mix(WHITE, CYAN, 0.9 - i * 0.5)
        bb = 0.85 + 0.15 * math.sin(t * 2.2 + i)
        sc_ = lerp(1.16, 1.0 + 0.02 * math.sin(t * 1.6), ease_out_expo(span(t, 0.1, 1.1)))
        cy_i = H * 0.5 - 96 + i * 252
        place_scaled(img, (m * clip, 0, 0), W * 0.5 + dx, cy_i, sc_,
                     col, 1.1 * smoothstep(0, 0.25, q) * bb)
        m2 = blank()
        place_scaled(m2, (m * clip, 0, 0), W * 0.5 + dx, cy_i, sc_, col, 1.0)
        img += blur(m2, 20)[..., None] * mix(CYAN, VIOLET, 0.4) * 0.6

    # side rules
    for sgn in (-1, 1):
        q = ease_out_expo(span(t, 0.5, 1.2))
        m = blank()
        x = W * 0.5 + sgn * 706
        draw_poly(m, [(x, H * 0.5 - 300 * q), (x, H * 0.5 + 210 * q)], 3.0, 1.0)
        img += m[..., None] * mix(CYAN, WHITE, 0.3) * 0.8

    place(img, T_TECH_S.mask(L["statement_sub"]), W * 0.5, H * 0.5 + 330, mix(CYAN, WHITE, 0.4),
          0.95 * span(t, 1.3, 1.9))
    return img


# ================================================================= scene 08
def sc_endcard(t, L, shot):
    dur = shot[1] - shot[0]
    img = base_sky(t) * 0.42
    img += grid_mask(t * 0.5, 0.5, 1.0, 0.3)[..., None] * CYAN * 0.3
    img += dust(t, 200, 8, 0.45, 0.32, spread=(0.25, 0.75))[..., None] * mix(WHITE, CYAN, 0.5)
    cx, cy = W * 0.5, 352.0

    # rotating halo + mark
    ring_p = ease_in_out_cubic(span(t, 0.05, 0.6))
    wl = ease_out_back(span(t, 0.18, 0.7))
    wr = ease_out_back(span(t, 0.24, 0.78))
    pulse_glow = 1.0 + 0.22 * math.sin(t * 2.0)
    ring, wing = mark_parts(cx, cy, 132.0, ring_p, wl, wr)
    halo = draw((W, H), lambda d, q: d.ellipse(
        [(cx - 172) * q, (cy - 172) * q, (cx + 172) * q, (cy + 172) * q],
        outline=255, width=max(1, int(2 * q))), quality=0.4) * 0.4
    for i in range(3):
        a0 = (t * 26 + i * 120) % 360
        arc = draw((W, H), lambda d, q, a0=a0: _arc(d, q, cx, cy, 172, a0, 58, 255), quality=0.4)
        img += arc[..., None] * mix(CYAN, WHITE, i / 3.0) * 0.95
    img += halo[..., None] * CYAN * 0.4
    img += blur(ring, 1.4)[..., None] * mix(CYAN, WHITE, 0.2) * 1.5
    img += blur(wing, 1.8)[..., None] * WHITE * 1.25
    img += blur(wing, 20)[..., None] * CYAN * 1.1 * pulse_glow

    # wordmark with tracking settle
    tr = lerp(210, 30, ease_out_expo(span(t, 0.15, 0.95)))
    wm = T_WORD.mask(BRAND, tr)
    wp = smoothstep(0.1, 0.6, span(t, 0.15, 0.95))
    place_c(img, wm, cx, cy + 122, WHITE, 1.15 * wp)
    m = blank()
    place_c(m, wm, cx, cy + 122, WHITE, 1.0)
    img += blur(m, 18)[..., None] * CYAN * 0.7 * wp
    place_c(img, T_TECH_S.mask(L["studio"]), cx, cy + 236, mix(CYAN, WHITE, 0.45),
            0.95 * span(t, 0.5, 1.0))

    # CTA button
    bq = ease_out_back(span(t, 0.62, 1.15))
    cta = L["cta"]
    tw_ = T_CTA.width(cta)
    bw, bh = tw_ + 150, 100
    bx, by = cx, cy + 320
    btn = draw((W, H), lambda d, q: d.rounded_rectangle(
        [(bx - bw / 2) * q, by * q, (bx + bw / 2) * q, (by + bh) * q], 12 * q,
        outline=255, width=max(1, int(2.5 * q))), quality=0.6)
    img += btn[..., None] * mix(CYAN, WHITE, 0.35) * 0.95 * bq
    img += blur(btn, 18)[..., None] * CYAN * 0.65 * bq
    img += btn[..., None] * CYAN * (0.08 + 0.08 * math.sin(t * 2.2)) * bq
    place_c(img, T_CTA.mask(cta), cx, by + 34, WHITE, 1.0 * bq)
    # soft sweep band clipped to the button
    sq = (t * 0.8) % 1.0
    xc = bx - bw / 2 + sq * bw * 1.5
    prof = np.exp(-((np.arange(W, dtype=np.float32) - xc) ** 2) / (2 * (bw * 0.16) ** 2))
    img += (prof[None, :] * btn)[..., None] * mix(CYAN, WHITE, 0.4) * 0.55 * bq

    place_c(img, T_MONO_XS.mask(L["made_for"]), cx, by + bh + 52,
            mix(DIM, WHITE, 0.2), 1.0 * span(t, 0.9, 1.3))
    place_c(img, T_MONO_XS.mask(L["credits"]), cx, H - 178, mix(DIM, WHITE, 0.25),
            0.8 * span(t, 1.0, 1.4))

    # progress bar
    pr = clamp(t / dur)
    m = blank()
    draw_poly(m, [(0, H - 46), (W, H - 46)], 3.0, 1.0)
    img += m[..., None] * mix(WHITE, DIM, 0.5) * 0.14
    m = blank()
    draw_poly(m, [(0, H - 46), (W * pr, H - 46)], 4.0, 1.0)
    img += m[..., None] * mix(CYAN, WHITE, 0.2) * 0.9
    return img


def _arc(d, q, cx, cy, r, a0, sweep, val):
    d.arc([(cx - r) * q, (cy - r) * q, (cx + r) * q, (cy + r) * q], a0, a0 + sweep,
          fill=val, width=max(1, int(3 * q)))


def _sweep(d, q, bx, by, bw, bh, s):
    x = bx - bw / 2 + s * bw * 1.4
    for i in range(14):
        f = i / 13.0
        xx = (x - bw * 0.5 * f) * q
        d.line([(xx, by * q), (xx, (by + bh) * q)],
               fill=int(255 * (1 - abs(f - 0.5) * 2) * 0.5), width=max(1, int(18 * q)))


# ================================================================= scene 09
def sc_outro(t, L, shot):
    img = base_sky(t) * 0.5
    img += grid_mask(t * 0.4, 0.35, 1.0, 0.18)[..., None] * CYAN * 0.3
    img += dust(t, 120, 6, 0.3, 0.22, spread=(0.3, 0.7))[..., None] * WHITE
    cx, cy = W * 0.5, H * 0.5 - 30
    size = lerp(70, 54, ease_in_out_cubic(span(t, 0.0, 1.0)))
    ring, wing = mark_parts(cx, cy, size, 1.0, 1.0, 1.0)
    img += blur(ring, 1.4)[..., None] * mix(CYAN, WHITE, 0.25) * 1.2
    img += blur(wing, 1.8)[..., None] * WHITE * 1.3
    img += blur(wing, 18)[..., None] * CYAN * 0.9
    tr = lerp(90, 34, ease_out_expo(span(t, 0.1, 0.6)))
    place(img, T_TECH_S.mask(L["outro"], tr), W * 0.5, cy + 96, mix(CYAN, WHITE, 0.5),
          0.9 * span(t, 0.2, 0.7))
    place(img, T_MONO_XS.mask(BRAND + "  /  " + L["cta"]), W * 0.5 - T_MONO_XS.width(BRAND + "  /  " + L["cta"]) / 2,
          cy + 150, DIM, 0.85 * span(t, 0.4, 0.9))
    # closing dot
    m = blank()
    C.splat(m, np.array([cx]), np.array([cy]), np.array([26.0]), np.array([0.10]))
    img += blur(m, 60)[..., None] * CYAN * 0.6
    return img
