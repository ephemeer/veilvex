#!/usr/bin/env python3
"""
Frame analysis for scripts/qa-flicker.mjs (run with `python3 -I`, needs Pillow + numpy).

Input:  <capture dir>/meta.json  — { viewport, t0, timeOrigin, frames: [{file, t}], fonts: {...}, expect: [...] }
        <capture dir>/frames/*.png — compositor frames recorded with CDP Page.startScreencast
Output: JSON on stdout  { stats, findings: [{type, severity, t, dt, region, frames, evidence, detail}] }
        <capture dir>/evidence/*.png — before / during / after strips for every finding

What is flagged
  flash      a tile region changes abruptly and then returns to its previous pixels (A→B→A) within
             `window` ms. Smooth entrances (fade + rise) ramp gradually and never return, so they are
             not flagged; a region painted at the wrong place for a frame, a hidden→visible→hidden
             element or a value that is overwritten and restored is.
  brightness the whole frame (or a large part of it) gets much lighter and dark again — a white/light
             flash on a dark page.
  fout       text tiles re-render in the frames where `document.fonts` reports a load finished, with
             any layout-shift entries in that window: the fallback → web font swap is visible.
  scrollbar  only informational: the classic scrollbar thumb changed (the page height changed).
Tiles that change in most frames (marquee, typing dots, caret) are "continuous" and excluded.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

TILE = 16          # tile size in half-resolution pixels (= 32 CSS px)
T_CHANGE = 4.0     # mean |Δ| per tile (0–255) to count as changed
T_SIMILAR = 2.5    # mean |Δ| per tile to count as "back to the previous pixels"
T_AMP = 18.0       # the intermediate state must differ at least this much from A
ABRUPT = 0.6       # the biggest single-frame step must carry ≥60% of the amplitude (else: animation)
CONTINUOUS = 0.6   # tiles changing in >60% of frame pairs are continuous animations → excluded
BRIGHT_STEP = 25.0 # frame-mean luminance jump between consecutive frames
BRIGHT_ABS = 40.0  # frame-mean luminance above the darkest contentful frame


def tile_means(a):
    h, w = a.shape
    H, W = h // TILE, w // TILE
    return a[: H * TILE, : W * TILE].reshape(H, TILE, W, TILE)


def tile_diff(a, b):
    return np.abs(tile_means(a) - tile_means(b)).mean(axis=(1, 3))


def components(mask):
    """4-connected components of a boolean tile mask → list of (rows, cols) index arrays."""
    seen = np.zeros_like(mask, dtype=bool)
    out = []
    H, W = mask.shape
    for r in range(H):
        for c in range(W):
            if not mask[r, c] or seen[r, c]:
                continue
            stack = [(r, c)]
            seen[r, c] = True
            cells = []
            while stack:
                y, x = stack.pop()
                cells.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            out.append(cells)
    return out


def bbox(cells):
    ys = [c[0] for c in cells]
    xs = [c[1] for c in cells]
    # tile coords → CSS px (half-res tile of 16 px = 32 css px)
    s = TILE * 2
    return [min(xs) * s, min(ys) * s, (max(xs) - min(xs) + 1) * s, (max(ys) - min(ys) + 1) * s]


def overlaps(a, b):
    return a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]


def strip(dir_, frames_meta, idx, region, label, out_name):
    """Save before / during / after crops around `region` with the region outlined."""
    ims = []
    pad = 48
    for i in idx:
        im = Image.open(os.path.join(dir_, frames_meta[i]['file'])).convert('RGB')
        W, H = im.size
        x, y, w, h = region
        box = (max(0, x - pad), max(0, y - pad), min(W, x + w + pad), min(H, y + h + pad))
        crop = im.crop(box)
        d = ImageDraw.Draw(crop)
        d.rectangle((x - box[0], y - box[1], x - box[0] + w, y - box[1] + h), outline=(255, 64, 64), width=2)
        ims.append(crop)
    maxh = max(im.size[1] for im in ims)
    scale = min(1.0, 420 / maxh)
    ims = [im.resize((max(1, int(im.size[0] * scale)), max(1, int(im.size[1] * scale)))) for im in ims]
    gap = 12
    total_w = sum(im.size[0] for im in ims) + gap * (len(ims) + 1)
    total_h = max(im.size[1] for im in ims) + 48
    canvas = Image.new('RGB', (total_w, total_h), (20, 20, 24))
    d = ImageDraw.Draw(canvas)
    x = gap
    for im, i in zip(ims, idx):
        canvas.paste(im, (x, 36))
        d.text((x, 6), f"frame {i} · {round(frames_meta[i]['t'])} ms", fill=(230, 230, 230))
        x += im.size[0] + gap
    d.text((gap, total_h - 14), label[:160], fill=(200, 200, 200))
    os.makedirs(os.path.join(dir_, 'evidence'), exist_ok=True)
    path = os.path.join(dir_, 'evidence', out_name)
    canvas.save(path)
    return path


def main():
    dir_ = sys.argv[1]
    meta = json.load(open(os.path.join(dir_, 'meta.json'), encoding='utf-8'))
    fm = meta['frames']
    # frames painted before the navigation committed belong to the previous document (about:blank is white)
    commit = meta.get('commitAt')
    if commit is not None:
        kept = [f for f in fm if f['t'] - meta['t0'] >= commit - 5]
        if len(kept) >= 2:
            fm = kept
    if len(fm) < 2:
        print(json.dumps({'stats': {'frames': len(fm)}, 'findings': []}))
        return
    window_ms = float(meta.get('window', 1500))
    t0 = meta['t0']
    expect = meta.get('expect', [])  # regions where changes are expected: [{region:[x,y,w,h], why}]
    vw = meta['viewport']['width']
    desktop = vw >= 1024

    gray = []
    for f in fm:
        im = Image.open(os.path.join(dir_, f['file'])).convert('L')
        im = im.reduce(2)
        gray.append(np.asarray(im, dtype=np.float32))
    N = len(gray)
    rel = [f['t'] - t0 for f in fm]

    # per-pair tile diffs
    D = [tile_diff(gray[i], gray[i + 1]) for i in range(N - 1)]
    H, W = D[0].shape
    changed = np.array([d > T_CHANGE for d in D])
    # frames painted while the document was scrolling: everything moves, so no pixel comparison there
    scroll = sorted(meta.get('scroll') or [])
    if scroll:
        def sy_at(t):
            v = scroll[0][1]
            for st, sv in scroll:
                if st <= t:
                    v = sv
                else:
                    break
            return v
        scrolling = np.array([sy_at(rel[i]) != sy_at(rel[i + 1] + 20) for i in range(N - 1)])
        changed[scrolling] = False
    continuous = changed.mean(axis=0) > CONTINUOUS if N > 10 else np.zeros((H, W), dtype=bool)
    scrollbar = np.zeros((H, W), dtype=bool)
    if desktop:
        scrollbar[:, W - 1:] = True  # the rightmost tile column holds the classic scrollbar

    findings = []
    # ---- brightness ----------------------------------------------------------------------------
    means = np.array([g.mean() for g in gray])
    first_content = next((i for i in range(N) if means[i] > 0.5), 0)
    base = means[first_content:].min() if first_content < N else means.min()
    for i in range(N - 1):
        step = means[i + 1] - means[i]
        if abs(step) > BRIGHT_STEP or (means[i + 1] - base > BRIGHT_ABS and means[i] - base <= BRIGHT_ABS):
            path = strip(dir_, fm, [max(0, i - 1), i + 1, min(N - 1, i + 2)], [0, 0, vw, meta['viewport']['height']],
                         f'brightness {means[i]:.1f} → {means[i + 1]:.1f}', f'brightness-{i:03d}.png')
            findings.append({'type': 'brightness', 'severity': 'high', 't': round(rel[i + 1]), 'dt': round(rel[i + 1] - rel[i]),
                             'region': [0, 0, vw, meta['viewport']['height']], 'frames': [i, i + 1], 'evidence': path,
                             'detail': f'frame mean luminance {means[i]:.1f} → {means[i + 1]:.1f} (dark page: white/light flash)'})

    # ---- flashes: A → B → A --------------------------------------------------------------------
    cooldown = np.zeros((H, W), dtype=int)  # tile is quiet until this frame index
    for i in range(N - 2):
        cand = changed[i] & ~continuous & ~scrollbar & (cooldown <= i)
        if not cand.any():
            continue
        M = np.zeros((H, W), dtype=np.float32)   # amplitude: max |frame_j − frame_i| for j in (i, k)
        S = D[i].copy() if rel[i + 1] - rel[i] <= 40 else np.zeros((H, W), dtype=np.float32)  # biggest abrupt (≤40 ms) step
        for k in range(i + 2, N):
            if rel[k] - rel[i] > window_ms:
                break
            dj = tile_diff(gray[i], gray[k - 1])
            M = np.maximum(M, dj)
            if rel[k] - rel[k - 1] <= 40:
                S = np.maximum(S, D[k - 1])
            back = tile_diff(gray[i], gray[k]) < T_SIMILAR
            hit = cand & back & (M > T_AMP) & ((S >= ABRUPT * M) | (k - i <= 3))
            if not hit.any():
                continue
            back_k = tile_diff(gray[i], gray[k]) > 2 * T_SIMILAR  # tiles that did NOT come back (monotonic change)
            for cells in components(hit):
                region = bbox(cells)
                exp = next((e for e in expect if overlaps(region, e['region'])), None)
                # a 1–2 tile revert next to tiles that changed in the same frames and stayed changed is the
                # edge of an element that moved/entered (its bottom edge passing through) — not a flash
                edge = False
                if len(cells) <= 2:
                    for y, x in cells:
                        for dy in (-1, 0, 1):
                            for dx in (-1, 0, 1):
                                ny, nx = y + dy, x + dx
                                if (dy or dx) and 0 <= ny < H and 0 <= nx < W and changed[i][ny, nx] and back_k[ny, nx]:
                                    edge = True
                if edge and not exp:
                    exp = {'why': 'edge of a moving/entering element'}
                # the frame where the tile differs most from A
                peak = max(range(i + 1, k), key=lambda j: tile_diff(gray[i], gray[j])[cells[0][0], cells[0][1]])
                amp = float(max(tile_diff(gray[i], gray[peak])[y, x] for y, x in cells))
                area = len(cells)
                one_frame = k - i <= 2
                sev = 'low' if exp else ('high' if (area >= 4 or one_frame) else 'medium')
                label = f"{'one-frame ' if one_frame else ''}flash {round(rel[i])}→{round(rel[peak])}→{round(rel[k])} ms, {area} tile(s), amp {amp:.0f}" + (f" — expected: {exp['why']}" if exp else '')
                n = len(findings)
                path = strip(dir_, fm, [i, peak, k], region, label, f'flash-{n:03d}.png')
                findings.append({'type': 'flash', 'severity': sev, 't': round(rel[i + 1]), 'dt': round(rel[k] - rel[i]),
                                 'region': region, 'frames': [i, peak, k], 'evidence': path, 'tiles': area, 'amplitude': round(amp, 1),
                                 'oneFrame': one_frame, 'expected': exp['why'] if exp else None, 'detail': label})
                for y, x in cells:
                    cooldown[y, x] = k + 1
            cand &= ~hit
            if not cand.any():
                break

    # ---- FOUT: text re-rendering when a font load finishes ----------------------------------------
    fonts = meta.get('fonts') or {}
    for done in fonts.get('done', []):
        t_done = done['t']  # ms relative to t0 (converted by the driver)
        # the subset is swapped in the first frames after the file arrived (decode + style + layout)
        pairs = [i for i in range(N - 1) if t_done - 20 <= rel[i + 1] <= t_done + 350]
        if not pairs:
            continue
        mask = np.zeros((H, W), dtype=bool)
        for i in pairs:
            mask |= changed[i] & ~continuous & ~scrollbar
        if not mask.any():
            continue
        cells = [(y, x) for y in range(H) for x in range(W) if mask[y, x]]
        region = bbox(cells)
        i0, i1 = pairs[0], min(N - 1, pairs[-1] + 1)
        shifts = [ls for ls in meta.get('layoutShifts', []) if t_done - 20 <= ls['t'] <= t_done + 450]
        cls = round(sum(s['value'] for s in shifts), 4)
        label = f"font swap at {round(t_done)} ms: {len(cells)} text tile(s) re-rendered, layout shift {cls}"
        path = strip(dir_, fm, [i0, i1, min(N - 1, i1 + 1)], region, label, f'fout-{round(t_done)}.png')
        findings.append({'type': 'fout', 'severity': 'high' if cls >= 0.005 or len(cells) >= 12 else 'medium', 't': round(t_done), 'dt': 0,
                         'region': region, 'frames': [i0, i1], 'evidence': path, 'tiles': len(cells), 'cls': cls,
                         'faces': done.get('faces', []), 'shifts': shifts[:6], 'detail': label})

    # ---- scrollbar (informational) ------------------------------------------------------------------
    if desktop:
        sb = [i for i in range(N - 1) if (changed[i] & scrollbar).any()]
        if sb:
            findings.append({'type': 'scrollbar', 'severity': 'low', 't': round(rel[sb[0]]), 'dt': round(rel[sb[-1]] - rel[sb[0]]),
                             'region': [vw - 32, 0, 32, meta['viewport']['height']], 'frames': [sb[0], sb[-1]], 'evidence': None,
                             'detail': f'scrollbar thumb changed in {len(sb)} frame pair(s) — the page height changed'})

    stats = {
        'frames': N,
        'duration': round(rel[-1] - rel[0]),
        'fps': round((N - 1) / max(0.001, (rel[-1] - rel[0]) / 1000), 1),
        'firstFrame': round(rel[0]),
        'firstContentfulFrame': round(rel[first_content]) if first_content < N else None,
        'continuousTiles': int(continuous.sum()),
        'meanLuminance': [round(float(m), 1) for m in means[:: max(1, N // 40)]],
    }
    print(json.dumps({'stats': stats, 'findings': findings}))


if __name__ == '__main__':
    main()
