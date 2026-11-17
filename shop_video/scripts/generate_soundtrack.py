"""Procedurally synthesize and mix an original BLACKPHANTOM cinematic-tech score.

The Remotion composition supplies the authoritative frame rate, duration, and
scene cuts. All music and effects are synthesized locally; no external songs
or audio samples are used.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

try:
    import numpy as np
    import soundfile as sf
    from scipy.signal import butter, sosfilt
except ImportError as exc:
    raise SystemExit(
        "Missing audio dependency. Install with: "
        "python -m pip install numpy scipy soundfile"
    ) from exc


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SR = 48_000
BPM = 128
BEAT = 60.0 / BPM
BAR = BEAT * 4

COMPOSITION_ID = "BlackPhantomMontageStories"
DEFAULT_VIDEO = Path("output/BLACKPHANTOM_1080x1920_Stories.mp4")
DEFAULT_OUTPUT_DIR = Path("output/audio")
DEFAULT_MIXED_VIDEO = Path(
    "output/BLACKPHANTOM_1080x1920_Stories_with_music.mp4"
)

# Minor-key progression: Dm9, Bbmaj7, Fadd9, Cadd9.
CHORDS = (
    (146.83, 174.61, 220.00, 261.63, 329.63),
    (116.54, 146.83, 174.61, 220.00),
    (87.31, 110.00, 130.81, 196.00),
    (130.81, 164.81, 196.00, 293.66),
)
BASS_ROOTS = (36.71, 29.14, 43.65, 32.70)
SCENE_ENERGY = {
    "BlackPhantomIntro": 0.30,
    "BlackPhantomWebDevelopment": 0.43,
    "BlackPhantomAutomation": 0.55,
    "BlackPhantomEcommerce": 0.66,
    "BlackPhantomSoftware": 0.72,
    "BlackPhantomCarousel3D": 0.88,
    "BlackPhantomDataLandscape": 0.76,
    "BlackPhantomFinalOutro": 1.00,
    "BlackPhantomQRFinal": 0.50,
}


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def synth(freq: float, duration: float, kind: str = "saw") -> np.ndarray:
    """Basic oscillator from the task brief with a short attack and release."""
    count = max(0, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR

    if kind == "saw":
        signal = 2.0 * np.remainder(t * freq, 1.0) - 1.0
    elif kind == "sine":
        signal = np.sin(2.0 * np.pi * freq * t)
    elif kind == "square":
        signal = np.sign(np.sin(2.0 * np.pi * freq * t))
    else:
        signal = np.zeros_like(t)

    attack = np.clip(t / 0.015, 0.0, 1.0)
    release = np.clip((duration - t) / 0.15, 0.0, 1.0)
    return (signal * attack * release).astype(np.float32)


def lowpass(signal: np.ndarray, cutoff: float) -> np.ndarray:
    sos = butter(4, min(cutoff, SR * 0.48), fs=SR, btype="lowpass", output="sos")
    return sosfilt(sos, signal).astype(np.float32, copy=False)


def highpass(signal: np.ndarray, cutoff: float) -> np.ndarray:
    sos = butter(3, max(20.0, cutoff), fs=SR, btype="highpass", output="sos")
    return sosfilt(sos, signal).astype(np.float32, copy=False)


def bandpass(signal: np.ndarray, low: float, high: float) -> np.ndarray:
    sos = butter(
        3,
        (max(20.0, low), min(high, SR * 0.48)),
        fs=SR,
        btype="bandpass",
        output="sos",
    )
    return sosfilt(sos, signal).astype(np.float32, copy=False)


def kick(duration: float = 0.45) -> np.ndarray:
    t = np.arange(int(SR * duration), dtype=np.float32) / SR
    phase = 2.0 * np.pi * (48.0 * t + 95.0 * (1.0 - np.exp(-28.0 * t)) / 28.0)
    body = np.sin(phase) * np.exp(-13.0 * t)
    click = np.exp(-95.0 * t) * 0.08
    return (body + click).astype(np.float32)


def impact(duration: float = 1.5, seed: int = 174) -> np.ndarray:
    t = np.arange(int(SR * duration), dtype=np.float32) / SR
    rng = np.random.default_rng(seed)
    noise = rng.normal(0.0, 1.0, len(t)).astype(np.float32)
    sub = np.sin(2.0 * np.pi * (55.0 * t - 22.0 * t * t / 2.0))
    return (
        lowpass(noise, 1800.0) * 0.35 + sub * 0.8
    ).astype(np.float32) * np.exp(-3.0 * t).astype(np.float32)


def add(track: np.ndarray, sound: np.ndarray, start: float, volume: float = 1.0) -> None:
    offset = int(round(start * SR))
    source_start = max(0, -offset)
    target_start = max(0, offset)
    if target_start >= len(track) or source_start >= len(sound):
        return
    length = min(len(sound) - source_start, len(track) - target_start)
    if length > 0:
        track[target_start : target_start + length] += (
            sound[source_start : source_start + length] * volume
        )


def add_stereo(
    track: np.ndarray,
    sound: np.ndarray,
    start: float,
    volume: float = 1.0,
    pan: float = 0.0,
) -> None:
    """Equal-power pan a mono sound or add an already-stereo sound."""
    offset = int(round(start * SR))
    source_start = max(0, -offset)
    target_start = max(0, offset)
    if target_start >= len(track) or source_start >= len(sound):
        return

    source_length = sound.shape[0]
    length = min(source_length - source_start, len(track) - target_start)
    if length <= 0:
        return

    part = sound[source_start : source_start + length]
    if part.ndim == 2:
        track[target_start : target_start + length] += part * volume
        return

    angle = (clamp01((pan + 1.0) * 0.5)) * (math.pi / 2.0)
    track[target_start : target_start + length, 0] += part * (volume * math.cos(angle))
    track[target_start : target_start + length, 1] += part * (volume * math.sin(angle))


def note_pad(chord: tuple[float, ...], duration: float, seed: int) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    left = np.zeros(count, dtype=np.float32)
    right = np.zeros(count, dtype=np.float32)

    for index, freq in enumerate(chord):
        detune = 1.0 + (index - len(chord) / 2.0) * 0.0008
        left_freq = freq * (detune - 0.0014)
        right_freq = freq * (detune + 0.0014)
        left_saw = 2.0 * np.remainder(t * left_freq, 1.0) - 1.0
        right_saw = 2.0 * np.remainder(t * right_freq, 1.0) - 1.0
        left += 0.64 * np.sin(2.0 * np.pi * left_freq * t) + 0.20 * left_saw
        right += 0.64 * np.sin(2.0 * np.pi * right_freq * t) + 0.20 * right_saw

    left = lowpass(left / max(1, len(chord)), 1250.0)
    right = lowpass(right / max(1, len(chord)), 1250.0)
    attack = min(0.48, duration * 0.25)
    release = min(0.42, duration * 0.25)
    env = np.ones(count, dtype=np.float32)
    attack_count = max(1, int(attack * SR))
    release_count = max(1, int(release * SR))
    env[:attack_count] *= np.linspace(0.0, 1.0, attack_count, dtype=np.float32)
    env[-release_count:] *= np.linspace(1.0, 0.0, release_count, dtype=np.float32)

    # A subtle deterministic movement keeps the pad wide but avoids static beating.
    phase = np.arange(count, dtype=np.float32) / SR
    drift = 0.96 + 0.04 * np.sin(2.0 * np.pi * (0.09 + (seed % 5) * 0.006) * phase)
    return np.column_stack((left * env * drift, right * env / drift)).astype(np.float32)


def pluck(freq: float, duration: float = 0.22) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    saw = 2.0 * np.remainder(t * freq, 1.0) - 1.0
    tone = 0.58 * saw + 0.34 * np.sin(2.0 * np.pi * freq * t)
    tone += 0.08 * np.sin(2.0 * np.pi * freq * 2.0 * t)
    envelope = np.exp(-9.0 * t)
    envelope *= np.clip((duration - t) / 0.035, 0.0, 1.0)
    return lowpass((tone * envelope).astype(np.float32), 5200.0)


def sub_note(freq: float, duration: float = 0.36) -> np.ndarray:
    t = np.arange(int(SR * duration), dtype=np.float32) / SR
    bend = freq * (1.0 + 0.035 * np.exp(-24.0 * t))
    phase = 2.0 * np.pi * np.cumsum(bend, dtype=np.float32) / SR
    envelope = np.exp(-5.5 * t) * np.clip(t / 0.008, 0.0, 1.0)
    fundamental = np.sin(phase) * envelope
    second = 0.11 * np.sin(2.0 * phase) * np.exp(-8.0 * t)
    return lowpass((fundamental + second).astype(np.float32), 115.0)


def snare(duration: float, rng: np.random.Generator) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    noise = rng.normal(0.0, 1.0, count).astype(np.float32)
    noise = bandpass(noise, 900.0, 9500.0)
    body = np.sin(2.0 * np.pi * (185.0 - 28.0 * t) * t) * np.exp(-18.0 * t)
    return (0.8 * noise + 0.25 * body) * np.exp(-14.0 * t).astype(np.float32)


def hi_hat(duration: float, rng: np.random.Generator) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    noise = rng.normal(0.0, 1.0, count).astype(np.float32)
    metallic = bandpass(noise, 6000.0, 15000.0)
    return metallic * np.exp(-42.0 * t).astype(np.float32)


def whoosh(duration: float, seed: int) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    x = np.linspace(0.0, 1.0, count, dtype=np.float32)
    rng = np.random.default_rng(seed)
    noise = rng.normal(0.0, 1.0, count).astype(np.float32)
    filtered = bandpass(noise, 350.0, 10_000.0)
    envelope = np.clip(np.sin(np.pi * x), 0.0, 1.0) ** 1.25
    sweep = np.sin(2.0 * np.pi * (230.0 * t + 1250.0 * t * t / max(0.01, 2.0 * duration)))
    return (filtered * envelope * 0.72 + sweep * envelope * 0.20).astype(np.float32)


def riser(duration: float, seed: int) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    x = np.linspace(0.0, 1.0, count, dtype=np.float32)
    rng = np.random.default_rng(seed)
    noise = highpass(rng.normal(0.0, 1.0, count).astype(np.float32), 1700.0)
    envelope = x**2.2
    end_f = 280.0 + (2100.0 * x)
    phase = 2.0 * np.pi * np.cumsum(end_f, dtype=np.float32) / SR
    tone = np.sin(phase) * x**1.5
    return (noise * envelope * 0.48 + tone * 0.16).astype(np.float32)


def tonal_accent(root: float, duration: float = 0.8) -> np.ndarray:
    count = max(1, int(SR * duration))
    t = np.arange(count, dtype=np.float32) / SR
    envelope = np.exp(-5.0 * t)
    low = np.sin(2.0 * np.pi * root * t) * np.exp(-7.0 * t)
    chord = np.sin(2.0 * np.pi * root * 2.0 * t)
    chord += 0.52 * np.sin(2.0 * np.pi * root * 2.5 * t + 0.2)
    shimmer = np.sin(2.0 * np.pi * root * 4.0 * t + 0.4) * np.exp(-8.0 * t)
    return (0.64 * low + 0.22 * chord * envelope + 0.10 * shimmer).astype(np.float32)


def build_energy_curve(
    scene_timeline: list[dict[str, Any]], duration_samples: int, fps: float
) -> np.ndarray:
    curve = np.full(duration_samples, 0.3, dtype=np.float32)
    if not scene_timeline:
        return curve

    energies = [SCENE_ENERGY.get(scene["id"], 0.6) for scene in scene_timeline]
    frame_samples = SR / fps
    for index, scene in enumerate(scene_timeline):
        start = max(0, int(scene["from"] * frame_samples))
        end_frame = scene["from"] + scene["durationInFrames"]
        end = min(duration_samples, int(end_frame * frame_samples))
        if end > start:
            curve[start:end] = energies[index]

    # Ease between the energy levels at each visual cut.
    blend_samples = int(0.55 * SR)
    for index in range(1, len(scene_timeline)):
        cut = int(scene_timeline[index]["from"] * frame_samples)
        start = max(0, cut)
        end = min(duration_samples, cut + blend_samples)
        if end <= start:
            continue
        x = np.linspace(0.0, 1.0, end - start, dtype=np.float32)
        eased = x * x * (3.0 - 2.0 * x)
        previous = energies[index - 1]
        following = energies[index]
        curve[start:end] = previous + (following - previous) * eased
    return curve


def duck_envelope(program_audio: np.ndarray, samples: int) -> np.ndarray:
    """Create a smooth 0.28–1.0 gain envelope from source-program loudness."""
    frame_size = int(0.02 * SR)
    frame_count = max(1, int(math.ceil(len(program_audio) / frame_size)))
    padded = np.zeros((frame_count * frame_size, 2), dtype=np.float32)
    copy_count = min(len(program_audio), len(padded))
    padded[:copy_count] = program_audio[:copy_count]
    blocks = padded.reshape(frame_count, frame_size, 2)
    rms = np.sqrt(np.mean(blocks * blocks, axis=(1, 2), dtype=np.float64)).astype(np.float32)

    activity = np.clip((rms - 0.008) / (0.075 - 0.008), 0.0, 1.0)
    activity = activity * activity * (3.0 - 2.0 * activity)
    target = 1.0 - 0.72 * activity

    smoothed = np.empty_like(target)
    current = 1.0
    hop_seconds = frame_size / SR
    for index, wanted in enumerate(target):
        tau = 0.045 if wanted < current else 0.32
        coefficient = math.exp(-hop_seconds / tau)
        current = float(wanted) + (current - float(wanted)) * coefficient
        smoothed[index] = current

    centers = (np.arange(frame_count, dtype=np.float64) + 0.5) * frame_size
    sample_positions = np.arange(samples, dtype=np.float64)
    return np.interp(
        sample_positions,
        centers,
        smoothed,
        left=float(smoothed[0]),
        right=float(smoothed[-1]),
    ).astype(np.float32)


def make_fade(duration_samples: int) -> np.ndarray:
    fade_in = min(int(1.0 * SR), max(1, duration_samples // 2))
    fade_out = min(int(3.4 * SR), max(1, duration_samples // 2))
    envelope = np.ones(duration_samples, dtype=np.float32)
    if fade_in > 1:
        envelope[:fade_in] *= np.linspace(0.0, 1.0, fade_in, dtype=np.float32)
    if fade_out > 1:
        envelope[-fade_out:] *= np.linspace(1.0, 0.0, fade_out, dtype=np.float32)
    return envelope


def generate(
    duration: float,
    scene_timeline: list[dict[str, Any]],
    fps: float,
) -> tuple[np.ndarray, np.ndarray]:
    """Return separate stereo music and cinematic-SFX tracks."""
    count = int(round(duration * SR))
    if count < 1:
        raise ValueError("Duration must be positive.")

    tracks = {
        name: np.zeros((count, 2), dtype=np.float32)
        for name in (
            "pads",
            "sub_bass",
            "arpeggio",
            "kick",
            "snare",
            "hi_hats",
            "atmosphere",
            "scene_accents",
            "impacts",
            "whooshes",
            "risers",
            "sub_drops",
        )
    }
    energy = build_energy_curve(scene_timeline, count, fps)
    rng = np.random.default_rng(42)
    hat_rng = np.random.default_rng(128)
    snare_rng = np.random.default_rng(8128)

    # Wide, filtered minor-key pads, one chord per bar.
    bars = int(math.ceil(duration / BAR))
    for bar_index in range(bars):
        start = bar_index * BAR
        if start >= duration:
            break
        chord_index = bar_index % len(CHORDS)
        chord_duration = min(BAR + 0.28, duration - start)
        pad = note_pad(CHORDS[chord_index], chord_duration, bar_index)
        sample = min(count - 1, int(start * SR))
        level = 0.075 + 0.095 * float(energy[sample])
        add_stereo(tracks["pads"], pad, start, level)

    # Low sub-bass pulse follows the same progression and ducks around kick hits.
    total_beats = int(math.ceil(duration / BEAT))
    kick_sound = kick()
    for beat_index in range(total_beats):
        time = beat_index * BEAT
        if time >= duration:
            break
        sample = min(count - 1, int(time * SR))
        level = float(energy[sample])
        beat_in_bar = beat_index % 4
        kick_accent = 1.22 if beat_in_bar == 0 else (1.05 if beat_in_bar == 2 else 0.76)
        add_stereo(tracks["kick"], kick_sound, time, (0.105 + 0.125 * level) * kick_accent)

        if beat_in_bar in (1, 3):
            drum = snare(0.24 if beat_in_bar == 3 else 0.20, snare_rng)
            add_stereo(tracks["snare"], drum, time, 0.055 + 0.09 * level, pan=0.03 if beat_in_bar == 1 else -0.03)

        chord_index = (beat_index // 4) % len(CHORDS)
        bass = sub_note(BASS_ROOTS[chord_index], 0.38)
        duck = 0.12 if beat_in_bar in (0, 2) else 0.16
        add_stereo(tracks["sub_bass"], bass, time, (0.12 + 0.105 * level) * (1.0 - duck))

        # A syncopated open-hat pulse gradually enters after the introductory bars.
        if beat_in_bar == 3 and beat_index > 3:
            hat = hi_hat(0.13, hat_rng)
            add_stereo(tracks["hi_hats"], hat, time + BEAT * 0.5, 0.025 + 0.055 * level, pan=0.62 if beat_index % 2 else -0.62)

    # Eighth-note arpeggio, introduced gently and brightened as the montage grows.
    eighth = BEAT / 2.0
    arp_steps = int(math.ceil(duration / eighth))
    for step in range(arp_steps):
        time = step * eighth
        if time >= duration:
            break
        bar_index = int(time / BAR)
        chord = CHORDS[bar_index % len(CHORDS)]
        pattern = (0, 2, 1, 3, 2, 4, 3, 2)
        note_index = pattern[step % len(pattern)] % len(chord)
        freq = chord[note_index] * (2.0 if step % 8 in (4, 5, 6, 7) else 1.0)
        sample = min(count - 1, int(time * SR))
        level = float(energy[sample])
        tone = pluck(freq, 0.205)
        velocity = 0.018 + 0.105 * level
        if step % 8 == 0:
            velocity *= 1.20
        pan = (-0.48, -0.16, 0.18, 0.50)[step % 4]
        add_stereo(tracks["arpeggio"], tone, time, velocity, pan=pan)

    # Quiet synthetic air bed adds movement between impacts.
    air_rng = np.random.default_rng(1742)
    air = bandpass(air_rng.normal(0.0, 1.0, count).astype(np.float32), 480.0, 2600.0)
    slow = 0.55 + 0.45 * np.sin(
        2.0 * np.pi * np.arange(count, dtype=np.float32) / SR * 0.075
    )
    air *= slow.astype(np.float32)
    add_stereo(tracks["atmosphere"], air, 0.0, 0.009, pan=0.0)

    # Build a rhythmic lift and an impact exactly on each Remotion scene cut.
    for index, cut in enumerate(scene_timeline[1:], start=1):
        cut_time = float(cut["startSeconds"])
        if cut_time >= duration:
            continue
        sample = min(count - 1, int(cut_time * SR))
        level = float(energy[sample])
        next_root = BASS_ROOTS[index % len(BASS_ROOTS)]
        add_stereo(tracks["scene_accents"], tonal_accent(next_root), cut_time, 0.14 + 0.12 * level)

        if cut_time > 0.28:
            lift = riser(1.25, 300 + index)
            add_stereo(tracks["risers"], lift, cut_time - 1.25, 0.075 + 0.075 * level, pan=-0.08)
            sweep = whoosh(0.95, 700 + index)
            add_stereo(tracks["whooshes"], sweep, cut_time - 0.62, 0.12 + 0.12 * level, pan=0.08)

        hit = impact(1.75, seed=174 + index * 19)
        add_stereo(tracks["impacts"], hit, cut_time, 0.34 + 0.30 * level)

    # Layer a small, pitched-down sub-drop under the smoke-logo entrance.
    smoke_scene = next(
        (scene for scene in scene_timeline if scene["id"] == "BlackPhantomFinalOutro"),
        None,
    )
    if smoke_scene:
        hit = sub_note(33.0, 1.15)
        add_stereo(tracks["sub_drops"], hit, float(smoke_scene["startSeconds"]), 0.48)

    music = tracks["pads"].copy()
    for name in ("sub_bass", "arpeggio", "kick", "snare", "hi_hats", "atmosphere", "scene_accents"):
        music += tracks[name]
    sfx = tracks["impacts"].copy()
    for name in ("whooshes", "risers", "sub_drops"):
        sfx += tracks[name]
    del tracks

    # Long synthetic reverb tails, made from deterministic multi-tap delays.
    for channel, delay_seconds, gain in ((0, 0.13, 0.18), (1, 0.19, 0.16), (0, 0.27, 0.10), (1, 0.34, 0.09)):
        delay = int(delay_seconds * SR)
        if delay < count:
            sfx[delay:, channel] += sfx[:-delay, channel] * gain

    fade = make_fade(count)
    music *= fade[:, None]
    sfx *= fade[:, None]

    if not np.isfinite(music).all() or not np.isfinite(sfx).all():
        raise FloatingPointError("The generated soundtrack contains non-finite samples.")

    # Modest master gain control is applied identically to both stems, preserving
    # their relationship and ensuring that music + SFX exactly equals the mix.
    peak = float(np.max(np.abs(music + sfx)))
    if peak > 0.0:
        master = min(2.5, 0.88 / peak)
        music *= master
        sfx *= master
    return music, sfx


def resolve_tool(name: str) -> str:
    found = shutil.which(name)
    if found:
        return found
    suffix = ".exe" if sys.platform == "win32" else ""
    bundled = (
        PROJECT_ROOT
        / "node_modules"
        / "@remotion"
        / "compositor-win32-x64-msvc"
        / f"{name}{suffix}"
    )
    if bundled.exists():
        return str(bundled)
    raise RuntimeError(f"{name} was not found in PATH or Remotion's bundled tools.")


def run_json(command: list[str], cwd: Path) -> dict[str, Any]:
    result = subprocess.run(
        command,
        cwd=cwd,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(result.stdout)


def get_remotion_timeline(composition_id: str) -> dict[str, Any]:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js is required to read the Remotion composition timeline.")
    helper = PROJECT_ROOT / "scripts" / "read_remotion_timeline.cjs"
    return run_json([node, str(helper), composition_id], PROJECT_ROOT)


def probe_video(ffprobe: str, video: Path) -> dict[str, Any]:
    data = run_json(
        [
            ffprobe,
            "-v",
            "error",
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            str(video),
        ],
        PROJECT_ROOT,
    )
    video_streams = [stream for stream in data.get("streams", []) if stream.get("codec_type") == "video"]
    if not video_streams:
        raise RuntimeError(f"No video stream found in {video}.")
    return {
        "duration": float(data.get("format", {}).get("duration", 0.0)),
        "video": video_streams[0],
        "audio_streams": [stream for stream in data.get("streams", []) if stream.get("codec_type") == "audio"],
    }


def normalize_path(value: Path) -> Path:
    return value if value.is_absolute() else PROJECT_ROOT / value


def display_path(value: Path) -> str:
    try:
        return str(value.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(value)


def mix_audio_stems(
    ffmpeg: str,
    music_wav: Path,
    sfx_wav: Path,
    mix_wav: Path,
    duration: float,
) -> None:
    filter_complex = (
        "[0:a:0][1:a:0]"
        "amix=inputs=2:duration=longest:dropout_transition=0:normalize=0,"
        f"atrim=duration={duration:.6f},"
        "loudnorm=I=-16:LRA=11:TP=-1.5[aout]"
    )
    mix_wav.parent.mkdir(parents=True, exist_ok=True)
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "warning",
        "-y",
        "-i",
        str(music_wav),
        "-i",
        str(sfx_wav),
        "-filter_complex",
        filter_complex,
        "-map",
        "[aout]",
        "-c:a",
        "pcm_s24le",
        "-ar",
        str(SR),
        "-ac",
        "2",
        "-t",
        f"{duration:.6f}",
        str(mix_wav),
    ]
    subprocess.run(command, cwd=PROJECT_ROOT, check=True)


def mix_audio_with_program(
    ffmpeg: str,
    video: Path,
    ducked_music: Path,
    sfx_wav: Path,
    mix_wav: Path,
    duration: float,
    master_gain: float,
) -> None:
    filter_complex = (
        "[0:a:0]aresample=48000,apad,"
        f"atrim=duration={duration:.6f}[program];"
        "[program][1:a:0][2:a:0]"
        "amix=inputs=3:duration=longest:dropout_transition=0:normalize=0,"
        f"volume={master_gain:.8f},"
        "loudnorm=I=-16:LRA=11:TP=-1.5[aout]"
    )
    mix_wav.parent.mkdir(parents=True, exist_ok=True)
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "warning",
        "-y",
        "-i",
        str(video),
        "-i",
        str(ducked_music),
        "-i",
        str(sfx_wav),
        "-filter_complex",
        filter_complex,
        "-map",
        "[aout]",
        "-c:a",
        "pcm_s24le",
        "-ar",
        str(SR),
        "-ac",
        "2",
        "-t",
        f"{duration:.6f}",
        str(mix_wav),
    ]
    subprocess.run(command, cwd=PROJECT_ROOT, check=True)


def mix_video(
    ffmpeg: str,
    video: Path,
    mix_wav: Path,
    output_video: Path,
) -> None:
    output_video.parent.mkdir(parents=True, exist_ok=True)
    if video.resolve() == output_video.resolve():
        raise ValueError("The output video must not overwrite the silent source video.")

    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "warning",
        "-y",
        "-i",
        str(video),
        "-i",
        str(mix_wav),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "320k",
        "-ar",
        str(SR),
        "-shortest",
        str(output_video),
    ]
    subprocess.run(command, cwd=PROJECT_ROOT, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, default=DEFAULT_VIDEO, help="Source MP4 (default: Stories montage).")
    parser.add_argument("--composition", default=COMPOSITION_ID, help="Registered Remotion composition ID.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help="Directory for WAV stems and timeline JSON.")
    parser.add_argument("--output-video", type=Path, default=DEFAULT_MIXED_VIDEO, help="Final MP4 with generated audio.")
    parser.add_argument("--no-video-mix", action="store_true", help="Only generate the WAV files; do not invoke FFmpeg muxing.")
    args = parser.parse_args()

    video = normalize_path(args.video)
    output_dir = normalize_path(args.output_dir)
    output_video = normalize_path(args.output_video)
    if not video.exists():
        raise SystemExit(f"Source video not found: {video}")

    timeline = get_remotion_timeline(args.composition)
    ffprobe = resolve_tool("ffprobe")
    ffmpeg = resolve_tool("ffmpeg")
    media = probe_video(ffprobe, video)

    expected_duration = float(timeline["durationSeconds"])
    actual_duration = media["duration"]
    tolerance = 1.0 / float(timeline["fps"])
    if abs(actual_duration - expected_duration) > tolerance:
        raise RuntimeError(
            f"Remotion reports {expected_duration:.3f}s, but {video.name} is "
            f"{actual_duration:.3f}s. Render the matching composition before mixing."
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    stem = "BLACKPHANTOM_Stories"
    music_path = output_dir / f"{stem}_music.wav"
    sfx_path = output_dir / f"{stem}_sfx.wav"
    mix_path = output_dir / f"{stem}_mix.wav"
    timeline_path = output_dir / f"{stem}_remotion_timeline.json"

    music, sfx = generate(expected_duration, timeline["scenes"], float(timeline["fps"]))
    sf.write(music_path, music, SR, subtype="PCM_24")
    sf.write(sfx_path, sfx, SR, subtype="PCM_24")
    timeline_path.write_text(json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")

    has_audio = bool(media["audio_streams"])
    ducked_music_path = output_dir / f"{stem}_music_ducked.wav"
    if has_audio:
        print("Source audio detected; ducking the generated music and preserving the original program audio.")
        with tempfile.TemporaryDirectory(prefix="blackphantom_audio_") as temporary_dir:
            extracted_voice = Path(temporary_dir) / "source_program.wav"
            subprocess.run(
                [
                    ffmpeg,
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-y",
                    "-i",
                    str(video),
                    "-map",
                    "0:a:0",
                    "-vn",
                    "-ac",
                    "2",
                    "-ar",
                    str(SR),
                    "-c:a",
                    "pcm_s24le",
                    str(extracted_voice),
                ],
                cwd=PROJECT_ROOT,
                check=True,
            )
            program, program_sample_rate = sf.read(
                extracted_voice, dtype="float32", always_2d=True
            )
            if program_sample_rate != SR:
                raise RuntimeError(
                    f"Extracted source audio is {program_sample_rate} Hz; expected {SR} Hz."
                )

            program_stereo = np.zeros_like(music)
            copied = min(len(program), len(program_stereo))
            program_stereo[:copied] = program[:copied]
            voice_envelope = duck_envelope(program_stereo, len(music))
            ducked_music = music * voice_envelope[:, None]
            sf.write(ducked_music_path, ducked_music, SR, subtype="PCM_24")

            mix_peak = float(np.max(np.abs(program_stereo + ducked_music + sfx)))
            master_gain = min(1.0, 0.94 / mix_peak) if mix_peak > 0.0 else 1.0
            mix_audio_with_program(
                ffmpeg,
                video,
                ducked_music_path,
                sfx_path,
                mix_path,
                expected_duration,
                master_gain,
            )
            print(
                "Music ducking range: "
                f"{float(np.min(voice_envelope)):.2f}–{float(np.max(voice_envelope)):.2f} gain"
            )
    else:
        mix_audio_stems(ffmpeg, music_path, sfx_path, mix_path, expected_duration)

    print(f"Composition: {timeline['compositionId']} ({timeline['width']}x{timeline['height']} @ {timeline['fps']} fps)")
    print(f"Duration: {expected_duration:.3f}s / {timeline['durationInFrames']} frames")
    print("Scene cuts:")
    for cut in timeline["sceneCuts"]:
        print(f"  frame {cut['frame']:4d}  {cut['timeSeconds']:7.3f}s  {cut['id']}")
    print(f"Music WAV:  {display_path(music_path)}")
    print(f"SFX WAV:    {display_path(sfx_path)}")
    print(f"Final mix:  {display_path(mix_path)}")
    print(f"Timeline:   {display_path(timeline_path)}")

    if args.no_video_mix:
        return

    if not has_audio:
        print("No source audio stream; muxing the generated mix without changing the video stream.")
    mix_video(ffmpeg, video, mix_path, output_video)
    print(f"Final video: {display_path(output_video)}")


if __name__ == "__main__":
    main()
