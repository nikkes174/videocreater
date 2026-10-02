"""Synthesised sound design for the reel: drums, bass, risers, impacts, reverb."""
from __future__ import annotations

import math
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
BPM = 120.0
BEAT = 60.0 / BPM
CUTS = [2.0, 4.0, 6.0, 7.0, 8.0, 9.0, 11.5, 14.0]


# ----------------------------------------------------------------- helpers
def _t(dur):
    return np.arange(int(SR * dur)) / SR


def _at(buf, x, t0):
    i = int(t0 * SR)
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i:i + n] += x[:n]
    return buf


def _noise(n, seed=0):
    return np.random.RandomState(seed).randn(n).astype(np.float32)


def _lp(x, cut, res=0.7):
    cut = np.asarray(cut, np.float64)
    w = 2 * math.pi * cut / SR
    a = np.exp(-w * res)
    b = (1 - a) * np.sqrt(np.maximum(1e-9, 1 - a * a))
    # time varying one-pole: run it with lfilter per unique coefficient is slow,
    # so approximate with a short 2-tap smoothing loop instead
    if a.size == 1:
        return lfilter([float(b)], [1, -float(a)], x).astype(np.float32)
    y = np.empty_like(x, dtype=np.float64)
    prev = 0.0
    for i in range(len(x)):
        b0 = b[i]
        y[i] = b0 * x[i] - a[i] * prev
        prev = y[i]
    return y.astype(np.float32)


def _hp(x, cut):
    w = 2 * math.pi * cut / SR
    a = math.exp(-w * 0.7)
    b = math.sqrt(max(1e-9, 1 - a * a))
    return (x - lfilter([b], [1, -a], x)).astype(np.float32)


def _bp(x, lo, hi):
    return _hp(_lp(x, hi), lo)


# ------------------------------------------------------------------ voices
def kick(amp=1.0, f0=150.0, f1=44.0, tau=0.30, click=0.3):
    t = _t(0.6)
    f = f1 + (f0 - f1) * np.exp(-t / 0.028)
    y = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t / tau)
    y += _noise(len(t)) * np.exp(-t / 0.0035) * click
    y = _lp(y, 3000)
    return (y / 0.9 * amp).astype(np.float32)


def sub(amp=1.0):
    t = _t(0.45)
    f = 52.0
    y = np.sin(2 * math.pi * f * t) * np.exp(-t / 0.16)
    return (y * amp).astype(np.float32)


def snare(amp=1.0):
    n = int(SR * 0.3)
    t = np.arange(n) / SR
    body = np.sin(2 * math.pi * 186 * t) * np.exp(-t / 0.07) * 0.5
    nz = _bp(_noise(n, 3), 900, 7000) * np.exp(-t / 0.10)
    return ((body + nz) / 0.8 * amp).astype(np.float32)


def hat(amp=1.0, tau=0.035, seed=1):
    n = int(SR * 0.16)
    t = np.arange(n) / SR
    return (_hp(_noise(n, seed), 6500) * np.exp(-t / tau) * 2.4 * amp).astype(np.float32)


def bass(f, dur=0.42, amp=1.0):
    t = _t(dur)
    ph = 2 * math.pi * f * t
    saw = (ph % (2 * math.pi)) / math.pi - 1.0
    sq = np.sign(np.sin(ph))
    y = saw * 0.6 + sq * 0.4
    env = np.minimum(1.0, t / 0.006) * np.exp(-t / (dur * 0.55))
    y = _lp(y, 260 + 1500 * np.exp(-t / 0.05)) * env
    return (y * amp).astype(np.float32)


def pluck(f, amp=1.0, dur=0.30):
    t = _t(dur)
    y = (2 * np.abs(2 * ((f * t) % 1.0) - 1.0) - 1.0)
    y = _lp(y, 4200) * np.exp(-t / (dur * 0.4))
    return (y * 0.5 * amp).astype(np.float32)


def pad(freqs, dur, amp=1.0):
    t = _t(dur)
    y = np.zeros_like(t)
    for f in freqs:
        for det in (-0.4, 0.0, 0.4):
            y += np.sin(2 * math.pi * (f + det) * t + len(y) * 0.001)
    y /= max(1, 3 * len(freqs))
    a = np.minimum(1.0, t / 0.9) * np.minimum(1.0, (dur - t) / 0.9)
    return (_lp(y * a, 1900) * 0.9 * amp).astype(np.float32)


def riser(dur, amp=1.0, seed=5):
    n = int(SR * dur)
    t = np.arange(n) / SR
    nz = _bp(_noise(n, seed), 300, 9000)
    f = 220 * (1 + 9 * (t / dur) ** 2.2)
    sweep = np.sin(2 * math.pi * np.cumsum(f) / SR) * 0.35
    a = (t / dur) ** 2.4
    return ((nz * 0.7 + sweep) * a * amp * 1.6).astype(np.float32)


def impact(amp=1.0, seed=7):
    dur = 1.8
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = 40 + 90 * np.exp(-t / 0.05)
    body = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t / 0.32)
    nz = _lp(_noise(n, seed), 900) * np.exp(-t / 0.10)
    shimmer = _bp(_noise(n, seed + 1), 2500, 12000) * np.exp(-t / 0.28) * 0.25
    return ((body * 1.1 + nz * 0.9 + shimmer) * amp).astype(np.float32)


def whoosh(amp=1.0, up=True, seed=11):
    dur = 0.5
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = np.linspace(400, 7000, n) if up else np.linspace(7000, 400, n)
    y = np.zeros(n)
    for i in range(n):
        pass
    # cheap swept bandpass by filtering in 8 chunks
    chunk = n // 8
    for k in range(8):
        sl = slice(k * chunk, (k + 1) * chunk)
        y[sl] = _bp(_noise(chunk, seed + k), f[k * chunk] * 0.6, f[k * chunk])
    a = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return (y * a * amp * 1.4).astype(np.float32)


# ------------------------------------------------------------------ reverb
def reverb(x, room=0.86, wet=0.32):
    out = np.zeros_like(x)
    for d, g in ((1557, 0.78), (1617, 0.76), (1491, 0.74), (1422, 0.72), (1277, 0.70)):
        dd = int(d * SR / 44100.0)
        buf = np.zeros(len(x) + dd)
        buf[:len(x)] = x
        acc = np.zeros(len(x))
        idx = 0
        tap = x.copy()
        for _ in range(int(room * 22)):
            acc[:len(x) - dd] += tap[dd:] * g ** (1 + _ * 0.35)
            tap = np.concatenate([np.zeros(dd), tap[:-dd]])[:len(x)]
        out += acc * 0.25
    for d, g in ((225, 0.7), (556, 0.7)):
        dd = int(d * SR / 44100.0)
        y = np.zeros(len(x) + dd)
        y[dd:] = out
        y[:dd] = 0
        y = y[:len(x)]
        out = -g * y + lfilter([1 - g], [1, 0], out)
    return x * (1 - wet * 0.5) + out * wet


# ------------------------------------------------------------------- track
def build(duration=15.0, seed=0):
    rs = np.random.RandomState(seed)
    np.random.seed(seed)
    n = int(duration * SR) + SR
    drums = np.zeros(n, np.float32)
    bassb = np.zeros(n, np.float32)
    music = np.zeros(n, np.float32)
    sfx = np.zeros(n, np.float32)

    # --- intro riser
    _at(sfx, riser(2.0, 0.55, seed=2), 0.02)
    _at(sfx, whoosh(0.5, True, 3), 1.70)
    _at(sfx, impact(0.85), 2.0)

    # --- drums: 4 on the floor, clap on 2 & 4
    for b in range(int(duration / BEAT)):
        t0 = b * BEAT
        if t0 >= 9.0:
            break
        strong = 1.0 if t0 < 6.0 else 0.92
        _at(drums, kick(0.95 * strong), t0)
        if int(round(t0 / BEAT)) % 2 == 1:
            _at(drums, snare(0.42), t0)
        _at(drums, hat(0.30 if t0 < 6.0 else 0.24), t0)
        if 6.0 <= t0 < 9.0:
            _at(drums, hat(0.16, 0.02, 9), t0 + BEAT * 0.5)
        if 11.5 <= t0 < 14.0:
            _at(drums, hat(0.18, 0.03, 5), t0 + BEAT * 0.5)
        if t0 in (13.0, 13.5):
            _at(drums, snare(0.30 + 0.2 * (t0 - 13.0) * 2), t0)
        if t0 in (13.5,):
            _at(drums, kick(0.7), t0 + BEAT * 0.5)

    # --- sub drops on the section starts
    for t0 in (2.0, 4.0, 6.0, 8.0, 9.0, 11.5):
        _at(drums, sub(0.9), t0)

    # --- bass line, D minor
    root = 36.71  # D1
    patt = [(0.0, 1.0), (0.25, 1.0), (0.5, 1.5), (0.75, 1.0)]
    scale = [1.0, 1.0, 1.5, 1.1892, 1.0, 1.5, 2.0, 1.5]
    for b in range(int(duration / BEAT) - 1):
        t0 = b * BEAT
        if t0 < 1.0 or t0 > 12.0:
            continue
        amp = 0.9 if t0 < 9.0 else 0.7
        for off, ln in patt:
            f = root * scale[(b * 2 + int(off * 4)) % len(scale)]
            _at(bassb, bass(f, BEAT * ln * 0.95, amp), t0 + off * BEAT)

    # --- pad + arpeggio
    chords = [[146.83, 174.61, 220.0], [146.83, 174.61, 261.63],
              [130.81, 164.81, 196.0], [174.61, 220.0, 261.63]]
    for i, ch in enumerate(chords):
        t0 = 2.0 + i * 2.4
        if t0 >= duration:
            break
        _at(music, pad(ch, 2.6, 0.85), t0)
    # sustained beds for the statement + end card
    _at(music, pad([146.83, 220.0, 293.66], 3.0, 1.5), 9.0)
    _at(music, pad([174.61, 261.63, 349.23], 3.0, 1.6), 11.4)
    _at(music, pad([146.83, 174.61, 220.0], 1.8, 1.3), 13.2)
    arp = [587.33, 698.46, 880.0, 1046.5]
    for b in range(int((13.6 - 2.0) / BEAT)):
        t0 = 2.0 + b * BEAT
        if t0 >= 13.6:
            break
        f = arp[(b + (2 if t0 >= 8 else 0)) % len(arp)]
        amp = 0.5 if t0 < 9.0 else (0.42 if t0 < 11.5 else 0.34)
        _at(music, pluck(f, amp), t0)
        _at(music, pluck(f * 2, 0.14 if t0 < 11.5 else 0.08), t0 + BEAT * 0.5)

    # --- transitions
    for i, c in enumerate(CUTS):
        _at(sfx, whoosh(0.55 if i % 2 == 0 else 0.4, i % 2 == 0, 13 + i), c - 0.16)
        if i in (0, 2, 4, 5, 7):
            _at(sfx, impact(0.8 if i in (0, 4, 7) else 0.5), c)
    for t0, dur in ((1.0, 1.0), (5.0, 1.0), (8.0, 1.0), (10.5, 1.0), (13.0, 1.0)):
        if t0 + dur < duration + 0.4:
            _at(sfx, riser(dur, 0.45, seed=int(t0 * 7)), t0)
    _at(sfx, impact(0.95), 14.0)
    _at(sfx, impact(0.45), 14.5)

    # --- mix
    drums_wet = reverb(drums, 0.80, 0.10)
    sfx_wet = reverb(sfx, 0.88, 0.42)
    mix = drums_wet * 0.85 + bassb * 0.72 + music * 0.5 + sfx_wet * 0.7
    mix = mix[:int(duration * SR)]

    # master: glue compression-ish + fades
    mix = np.tanh(mix * 1.25) * 0.85
    mix *= 0.85
    fi = min(int(0.02 * SR), len(mix))
    mix[:fi] *= np.linspace(0, 1, fi)
    fo = min(int(0.5 * SR), len(mix))
    mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    peak = float(np.abs(mix).max()) or 1.0
    mix = mix / peak * 0.92
    return mix


def stereo(mono, width=0.16):
    d = int(0.012 * SR)
    left = mono.copy()
    right = np.concatenate([np.zeros(d), mono[:-d]]) * 0.92
    hs = np.array([1.0, 0.0])
    env_l = _hp(mono, 180) * 0.0
    return np.stack([left, right], axis=1)


def render_track(path, duration=15.0, seed=0):
    mono = build(duration, seed)
    st = stereo(mono)
    st *= 0.97
    data = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    return path


if __name__ == "__main__":
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "track_test.wav")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    render_track(p, 15.0)
    print(p, os.path.getsize(p) / 1e6, "MB")
