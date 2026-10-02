"""Render the BlackPhantom 15s showreel to an H.264/AAC mp4."""
from __future__ import annotations

import argparse
import math
import os
import subprocess
import sys
import time

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from blackphantom_reel import core as C
from blackphantom_reel import scenes as S

DURATION = 15.0

# (name, t0, t1, fn)
TIMELINE = [
    ("ignition", 0.0, 2.0, S.sc_ignition),
    ("hook", 2.0, 4.0, S.sc_hook),
    ("stack", 4.0, 6.0, S.sc_stack),
    ("mont_a", 6.0, 7.0, S.sc_mont_a),
    ("mont_b", 7.0, 8.0, S.sc_mont_b),
    ("mont_c", 8.0, 9.0, S.sc_mont_c),
    ("statement", 9.0, 11.5, S.sc_statement),
    ("endcard", 11.5, 14.0, S.sc_endcard),
    ("outro", 14.0, 15.0, S.sc_outro),
]
CUTS = [t for _, t, _, _ in TIMELINE][1:]

CAMERA = {  # per-scene slow push / drift
    "ignition": dict(zoom=(1.00, 1.05), dx=(0, 0), dy=(0, -18)),
    "hook": dict(zoom=(1.02, 1.07), dx=(0, 0), dy=(0, 22)),
    "stack": dict(zoom=(1.02, 1.07), dx=(18, -14), dy=(0, 0)),
    "mont_a": dict(zoom=(1.00, 1.08), dx=(0, -30), dy=(0, 0)),
    "mont_b": dict(zoom=(1.08, 1.02), dx=(0, 0), dy=(0, 0)),
    "mont_c": dict(zoom=(1.01, 1.09), dx=(0, 0), dy=(0, 0)),
    "statement": dict(zoom=(1.03, 1.12), dx=(0, 0), dy=(0, -12)),
    "endcard": dict(zoom=(1.03, 1.00), dx=(0, 0), dy=(0, 0)),
    "outro": dict(zoom=(1.00, 1.05), dx=(0, 0), dy=(0, 0)),
}

GLITCH_AT = [8.94, 9.06, 10.10, 10.18, 10.72, 10.86]


def shot_at(t):
    for name, t0, t1, fn in TIMELINE:
        if t < t1 or name == TIMELINE[-1][0]:
            return name, t0, t1, fn
    return TIMELINE[-1]


def grade(img, t, name, lang):
    """Global finishing pass: bloom -> tonemap -> camera -> fx -> output."""
    # --- bloom (tight glow, not fog)
    img = C.bloom(img, 0.70, 0.50, 24, f=4)
    img += C.bloom(img, 0.94, 0.55, 44, f=3) * 0.28

    # --- tone map: filmic-ish shoulder, keeps highlights from clipping hard
    x = img * 1.06
    img = (x * (1.0 + x / 3.2)) / (1.0 + x)

    # --- camera
    cam = CAMERA.get(name, dict(zoom=(1, 1), dx=(0, 0), dy=(0, 0)))
    p = (t - [s[1] for s in TIMELINE if s[0] == name][0]) / max(1e-6, [s[2] for s in TIMELINE if s[0] == name][0] -
                                                              [s[1] for s in TIMELINE if s[0] == name][0])
    p = min(1.0, max(0.0, p))
    e = C.ease_in_out_cubic(p)
    zoom = C.lerp(*cam["zoom"], e)
    dx = C.lerp(*cam["dx"], e)
    dy = C.lerp(*cam["dy"], e)

    # --- cut transitions
    flash, whip, punch = 0.0, 0.0, 0.0
    for cut in CUTS:
        dt = t - cut
        if -0.02 < dt < 0.30:
            f = max(0.0, 1.0 - dt / 0.22) ** 2.2
            flash = max(flash, f * (0.55 if abs(cut - 9.0) < 0.01 else 0.30))
            whip = max(whip, f * (34.0 if cut in (6.0, 8.0, 9.0) else 16.0))
            punch = max(punch, f * 0.05)
    zoom += punch
    if whip > 0.5:
        img = C.whip_blur(img, whip)
    img = C.transform(img, zoom=zoom, dx=dx, dy=dy)

    # --- glitch bursts
    for gt in GLITCH_AT:
        dt = t - gt
        if 0 <= dt < 0.16:
            f = (1.0 - dt / 0.16) ** 1.6
            img = C.blocks_glitch(img, t, seed=int(gt * 100), strength=f)
    g = 0.0
    for gt in GLITCH_AT:
        d = abs(t - gt)
        g = max(g, max(0.0, 1.0 - d / 0.14))
    img = C.ca(img, 0.9 + 13.0 * g + 2.5 * C.pulse(t, 1.28, 0.2))
    img = C.ca_axis(img, 2.0 * g)

    # --- flash / light leak
    if flash > 0.001:
        img += (flash * 0.85) * C.mix(C.WHITE, S.CYAN, 0.35)
    leak = max(0.0, 1.0 - abs(t - 1.30) / 0.55) * max(0.0, 1.0 - abs(t - 9.05) / 0.4)
    if leak > 0.002:
        m = C._radial(0.86, 0.12, 0.7, 0.9) * leak * 0.5
        img += m[..., None] * C.mix(C.MAGENTA, C.AMBER, 0.5)

    # --- broadcast HUD on top of the camera move
    img += S.hud_for(name, t)

    # --- finishing
    img = C.scanlines(img, 0.55)
    img = C.vignette(img, 1.0)
    img = C.grain(img, 0.022, seed=int(t * 1000) % 977)
    img = np.clip(img, 0.0, 1.0)

    # --- global fades
    fin = C.sstep(0.0, 0.18, t) * (1.0 - C.sstep(14.55, 15.0, t))
    return img * fin


def render_frame(t, lang):
    name, t0, t1, fn = shot_at(t)
    img = fn(t - t0, lang, (t0, t1))
    return grade(img, t, name, lang)


# ------------------------------------------------------------------- output
def ffmpeg_writer(path, w, h, fps, crf=16, preset="slow", audio=None):
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(fps), "-i", "-"]
    if audio:
        cmd += ["-i", audio]
    cmd += ["-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p",
            "-profile:v", "high", "-level", "4.2", "-x264-params", "ref=4:bframes=3",
            "-movflags", "+faststart", "-color_primaries", "bt709", "-color_trc", "bt709",
            "-colorspace", "bt709"]
    if audio:
        cmd += ["-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-shortest"]
    cmd += [path]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def run(args):
    """Render one slice (or the whole thing) and encode it to an intermediate mp4."""
    lang = S.RU if args.lang == "ru" else S.EN
    here = os.path.dirname(os.path.abspath(__file__))
    outdir = os.path.join(here, "out")
    os.makedirs(outdir, exist_ok=True)
    n = int(DURATION * args.fps)

    W, H = C.setup(int(C.W * args.scale), int(C.H * args.scale))
    S.W, S.H = W, H
    S._RAD_CACHE.clear()
    C.FPS = args.fps

    # ---------------------------------------------------------------- stills
    if args.still:
        for t in args.still:
            img = render_frame(t, lang)
            p = os.path.join(outdir, f"still_{args.lang}_{t:05.2f}.png")
            Image.fromarray((img * 255 + 0.5).astype(np.uint8)).save(p)
            print("still", p, flush=True)
        return

    lo, hi = 0, n
    part = args.out
    if args.slice >= 0:
        k = args.workers
        step = (n + k - 1) // k
        lo, hi = args.slice * step, min(n, (args.slice + 1) * step)
        part = os.path.join(outdir, f"part_{args.slice:02d}_{args.tag}.mp4")

    proc = ffmpeg_writer(part, W, H, args.fps, args.crf, args.preset, None)
    t_start = time.time()
    for f in range(lo, hi):
        t = f / args.fps
        img = render_frame(t, lang)
        proc.stdin.write((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    proc.stdin.close()
    proc.wait()
    print(f"  slice {args.slice} [{lo}:{hi}] -> {os.path.basename(part)}"
          f"  ({time.time() - t_start:.1f}s)", flush=True)


def assemble(args, parts, out):
    lst = os.path.join(os.path.dirname(parts[0]), "parts.txt")
    with open(lst, "w") as f:
        for p in parts:
            f.write("file '%s'\n" % os.path.abspath(p).replace("\\", "/"))
    tmp = out + ".v.mp4"
    run_ff(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", tmp])
    audio = os.path.join(os.path.dirname(out), f"track_{args.lang}.wav")
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", tmp]
    if os.path.exists(audio) and not args.no_audio:
        cmd += ["-i", audio, "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2", "-shortest"]
    else:
        cmd += ["-c:a", "none"]
    cmd += ["-c:v", "copy", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    if os.path.exists(tmp):
        os.remove(tmp)
    for p in parts:
        os.remove(p)


def run_ff(args_list):
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"] + args_list)
    if r.returncode != 0:
        raise SystemExit("ffmpeg failed")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="ru", choices=["ru", "en"])
    ap.add_argument("--out", default=None)
    ap.add_argument("--scale", type=float, default=1.0, help="resolution scale")
    ap.add_argument("--fps", type=int, default=C.FPS)
    ap.add_argument("--still", type=float, nargs="*", default=None,
                    help="render single stills at these timestamps instead of a video")
    ap.add_argument("--no-audio", action="store_true")
    ap.add_argument("--crf", type=int, default=16)
    ap.add_argument("--preset", default="slow")
    ap.add_argument("--workers", type=int, default=max(1, min(10, (os.cpu_count() or 2) - 2)))
    ap.add_argument("--slice", type=int, default=-1, help="internal: render one slice")
    ap.add_argument("--tag", default="x", help="internal: run id")
    args = ap.parse_args()

    if args.slice >= 0:
        run(args)
        return

    if args.still:
        run(args)
        return

    here = os.path.dirname(os.path.abspath(__file__))
    outdir = os.path.join(here, "out")
    os.makedirs(outdir, exist_ok=True)
    out = args.out or os.path.join(outdir, f"blackphantom_showreel_{args.lang}.mp4")

    if not args.no_audio and not os.path.exists(os.path.join(outdir, f"track_{args.lang}.wav")):
        from blackphantom_reel import audio as A
        A.render_track(os.path.join(outdir, f"track_{args.lang}.wav"), DURATION)

    if args.workers > 1:
        tag = f"{args.lang}{int(time.time()) % 10000}"
        root = os.path.dirname(here)
        env = dict(os.environ)
        env["PYTHONPATH"] = root + os.pathsep + env.get("PYTHONPATH", "")
        env["PYTHONUNBUFFERED"] = "1"
        procs = []
        for i in range(args.workers):
            cmd = [sys.executable, "-m", "blackphantom_reel.render",
                   "--lang", args.lang, "--scale", str(args.scale), "--fps", str(args.fps),
                   "--crf", str(args.crf), "--preset", "veryfast",
                   "--workers", str(args.workers), "--slice", str(i), "--tag", tag]
            if args.no_audio:
                cmd.append("--no-audio")
            procs.append(subprocess.Popen(cmd, cwd=root, env=env))
        t0 = time.time()
        for p in procs:
            if p.wait() != 0:
                raise SystemExit("worker failed")
        parts = [os.path.join(outdir, f"part_{i:02d}_{tag}.mp4") for i in range(args.workers)]
        parts = [p for p in parts if os.path.exists(p)]
        assemble(args, parts, out)
        print(f"  -> {out}  ({os.path.getsize(out) / 1e6:.1f} MB, {time.time() - t0:.1f}s)")
        return

    run(args)
    audio = None if args.no_audio else os.path.join(outdir, f"track_{args.lang}.wav")
    if audio and os.path.exists(audio):
        tmp = out + ".v.mp4"
        os.replace(out, tmp)
        assemble(args, [tmp], out)
    print(f"  -> {out}  ({os.path.getsize(out) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
