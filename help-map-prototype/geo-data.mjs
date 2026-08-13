// geo-data.mjs — bakes real Natural Earth geometry (world-atlas TopoJSON) into
// plain SVG path data with zero runtime dependencies.
//
// Two consumers share this: build.mjs (standalone prototype.html) and
// build-client.mjs (lazy data module for the feed-prototype client).
//
//   TopoJSON -> GeoJSON -> d3 geoNaturalEarth1 -> simplified, quantized,
//   relative SVG path strings.
//
// The detail (50m) layer is cut into a spatial grid so the runtime only paints
// the cells that intersect the viewport. Fill and coastline are stored
// SEPARATELY on purpose: the fill is clipped as a polygon (its artificial edges
// along cell borders are invisible because neighbouring fills overlap), while
// the coastline is clipped as an open polyline, so no stroke is ever drawn
// along a cell seam.
//

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as topojson from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo';

export const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- parameters
// Internal map units. 1 unit ~ 1.25 km at the equator. Everything is quantized
// to integers on this grid, so path strings stay short but deep zoom still
// looks like geography rather than lego.
const GRID_W = 32000;

// Spatial grid for the detail layer.
const GX = 24, GY = 12;
// Fills are clipped to a slightly larger rect than strokes, so neighbouring
// cells overlap instead of abutting — kills the antialiasing hairline seam.
const FILL_OVERLAP = 4;

const LODS = {
  // shown while zoomed out — coarse, and small enough to keep ungridded
  world: { file: 'countries-110m.json', tol: 8.0, minRing: 8.0, precision: 4, grid: false },
  // shown once zoomed in — needs real coastlines and small islands (~1.2 km)
  detail: { file: 'countries-50m.json', tol: 0.4, minRing: 1.2, precision: 1.0, grid: true },
};

// ------------------------------------------------------------------ geometry

/** Records the projected pen strokes d3-geo emits, in map units. */
class Capture {
  constructor() { this.subs = []; this._cur = null; }
  beginPath() {}
  moveTo(x, y) { this._cur = [[x, y]]; this.subs.push({ pts: this._cur, closed: false }); }
  lineTo(x, y) { this._cur.push([x, y]); }
  closePath() { if (this.subs.length) this.subs[this.subs.length - 1].closed = true; }
  arc() {}
}

/** Iterative Douglas–Peucker on projected coordinates. */
function simplify(pts, tol) {
  const n = pts.length;
  if (n < 3) return pts;
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const tol2 = tol * tol;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let best = -1, bestD = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let d2;
      if (len2 === 0) {
        const ex = px - ax, ey = py - ay;
        d2 = ex * ex + ey * ey;
      } else {
        let t = ((px - ax) * dx + (py - ay) * dy) / len2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = px - (ax + t * dx), ey = py - (ay + t * dy);
        d2 = ex * ex + ey * ey;
      }
      if (d2 > bestD) { bestD = d2; best = i; }
    }
    if (bestD > tol2) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

/** Quantize to the integer grid and drop repeated points. */
function quantize(pts) {
  const out = [];
  let px = NaN, py = NaN;
  for (const [x, y] of pts) {
    const qx = Math.round(x), qy = Math.round(y);
    if (qx === px && qy === py) continue;
    out.push([qx, qy]);
    px = qx; py = qy;
  }
  return out;
}

function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

/** Compact relative-integer SVG path text. */
function encode(subs) {
  let d = '';
  for (const { pts, closed } of subs) {
    if (!pts.length) continue;
    let [px, py] = pts[0];
    d += `M${px} ${py}`;
    if (pts.length > 1) {
      d += 'l';
      for (let i = 1; i < pts.length; i++) {
        const [x, y] = pts[i];
        const dx = x - px, dy = y - py;
        d += (dx < 0 ? '' : ' ') + dx + (dy < 0 ? '' : ' ') + dy;
        px = x; py = y;
      }
    }
    if (closed) d += 'z';
  }
  return d;
}

/** Projected + simplified + quantized subpaths for one geometry. */
function collect(geo, cfg, isArea) {
  projection.precision(cfg.precision);
  const cap = new Capture();
  geoPath(projection, cap)(geo);
  const subs = [];
  let after = 0;
  for (const sub of cap.subs) {
    const pts = quantize(simplify(sub.pts, cfg.tol));
    if (isArea) {
      if (pts.length < 3) continue;
      const b = bbox(pts);
      if (Math.max(b[2] - b[0], b[3] - b[1]) < cfg.minRing) continue;
    } else {
      if (pts.length < 2) continue;
    }
    after += pts.length;
    subs.push({ pts, closed: sub.closed, bb: bbox(pts) });
  }
  return { subs, after };
}

// ------------------------------------------------------------------ clipping

/** Sutherland–Hodgman: clip a closed ring to a rect. Keeps orientation. */
function clipRing(pts, x0, y0, x1, y1) {
  const edge = (input, inside, cut) => {
    const res = [];
    const n = input.length;
    for (let i = 0; i < n; i++) {
      const A = input[(i + n - 1) % n], B = input[i];
      const aIn = inside(A), bIn = inside(B);
      if (bIn) { if (!aIn) res.push(cut(A, B)); res.push(B); }
      else if (aIn) res.push(cut(A, B));
    }
    return res;
  };
  let o = pts;
  o = edge(o, p => p[0] >= x0, (A, B) => { const t = (x0 - A[0]) / (B[0] - A[0]); return [x0, A[1] + t * (B[1] - A[1])]; });
  if (o.length < 3) return null;
  o = edge(o, p => p[0] <= x1, (A, B) => { const t = (x1 - A[0]) / (B[0] - A[0]); return [x1, A[1] + t * (B[1] - A[1])]; });
  if (o.length < 3) return null;
  o = edge(o, p => p[1] >= y0, (A, B) => { const t = (y0 - A[1]) / (B[1] - A[1]); return [A[0] + t * (B[0] - A[0]), y0]; });
  if (o.length < 3) return null;
  o = edge(o, p => p[1] <= y1, (A, B) => { const t = (y1 - A[1]) / (B[1] - A[1]); return [A[0] + t * (B[0] - A[0]), y1]; });
  return o.length < 3 ? null : o;
}

/** Liang–Barsky segment clip. Returns [A',B'] or null. */
function clipSeg(A, B, x0, y0, x1, y1) {
  let t0 = 0, t1 = 1;
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const p = [-dx, dx, -dy, dy], q = [A[0] - x0, x1 - A[0], A[1] - y0, y1 - A[1]];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return null; continue; }
    const r = q[i] / p[i];
    if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
    else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[A[0] + t0 * dx, A[1] + t0 * dy], [A[0] + t1 * dx, A[1] + t1 * dy]];
}

/**
 * Clip a subpath as an OPEN polyline — the whole point is that no segment is
 * ever invented along the cell border, so strokes never show a seam. Both
 * neighbours cut the same segment against the same line and round the result
 * identically, so the coastline stays continuous across the seam.
 */
function clipLine(pts, closed, x0, y0, x1, y1) {
  const outs = [];
  let cur = null;
  const n = pts.length, last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const A = pts[i], B = pts[(i + 1) % n];
    const s = clipSeg(A, B, x0, y0, x1, y1);
    if (!s) { cur = null; continue; }
    const a = [Math.round(s[0][0]), Math.round(s[0][1])];
    const b = [Math.round(s[1][0]), Math.round(s[1][1])];
    if (a[0] === b[0] && a[1] === b[1]) continue;
    if (cur && cur[cur.length - 1][0] === a[0] && cur[cur.length - 1][1] === a[1]) cur.push(b);
    else { cur = [a, b]; outs.push(cur); }
  }
  return outs;
}

function overlaps(bb, x0, y0, x1, y1) {
  return bb[0] <= x1 && bb[2] >= x0 && bb[1] <= y1 && bb[3] >= y0;
}
function inside(bb, x0, y0, x1, y1) {
  return bb[0] >= x0 && bb[2] <= x1 && bb[1] >= y0 && bb[3] <= y1;
}

// -------------------------------------------------------------- projection

const projection = geoNaturalEarth1();
const sphere = { type: 'Sphere' };
projection.precision(0.5);
projection.fitWidth(GRID_W, sphere);
const bounds = geoPath(projection).bounds(sphere);
const MAP = {
  x0: Math.floor(bounds[0][0]), y0: Math.floor(bounds[0][1]),
  x1: Math.ceil(bounds[1][0]), y1: Math.ceil(bounds[1][1]),
};
MAP.w = MAP.x1 - MAP.x0;
MAP.h = MAP.y1 - MAP.y0;

// Runtime needs lon/lat -> map units without shipping d3. geoNaturalEarth1 is a
// closed-form polynomial; export scale/translate and verify the port here.
const scale = projection.scale();
const [tx, ty] = projection.translate();
function rawNE1(lambda, phi) {
  const p2 = phi * phi, p4 = p2 * p2;
  return [
    lambda * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4))),
    phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4))),
  ];
}
function projectPort([lon, lat]) {
  const [x, y] = rawNE1(lon * Math.PI / 180, lat * Math.PI / 180);
  return [scale * x + tx, ty - scale * y];
}
let maxErr = 0;
for (const p of [[0, 0], [33.04, 34.68], [-9.14, 38.72], [140, -35], [-70, 60], [179, -50], [20, 80]]) {
  const a = projection(p), b = projectPort(p);
  maxErr = Math.max(maxErr, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}
if (!(maxErr < 1e-6)) throw new Error(`projection port mismatch: ${maxErr}`);

// ------------------------------------------------------------------- layers

const cellW = MAP.w / GX, cellH = MAP.h / GY;
function cellRect(i, j) {
  return [MAP.x0 + i * cellW, MAP.y0 + j * cellH, MAP.x0 + (i + 1) * cellW, MAP.y0 + (j + 1) * cellH];
}

/** Cut collected subpaths into per-cell path strings. */
function gridify(subs, mode) {
  const out = new Array(GX * GY).fill('');
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
    const [cx0, cy0, cx1, cy1] = cellRect(i, j);
    const pad = mode === 'fill' ? FILL_OVERLAP : 0;
    const x0 = cx0 - pad, y0 = cy0 - pad, x1 = cx1 + pad, y1 = cy1 + pad;
    const acc = [];
    for (const s of subs) {
      if (!overlaps(s.bb, x0, y0, x1, y1)) continue;
      if (inside(s.bb, x0, y0, x1, y1)) {           // целиком внутри — резать нечего
        acc.push({ pts: s.pts, closed: mode === 'fill' ? true : s.closed });
        continue;
      }
      if (mode === 'fill') {
        const r = clipRing(s.pts, x0, y0, x1, y1);
        if (r) { const q = quantize(r); if (q.length >= 3) acc.push({ pts: q, closed: true }); }
      } else {
        for (const line of clipLine(s.pts, s.closed, x0, y0, x1, y1)) {
          if (line.length >= 2) acc.push({ pts: line, closed: false });
        }
      }
    }
    out[j * GX + i] = encode(acc);
  }
  return out;
}

const layers = {};
const report = [];
const collected = {};
for (const [name, cfg] of Object.entries(LODS)) {
  const topo = JSON.parse(readFileSync(join(HERE, cfg.file), 'utf8'));
  const countries = topo.objects.countries;
  const landGeo = topojson.merge(topo, countries.geometries);
  const bordGeo = topojson.mesh(topo, countries, (a, b) => a !== b);

  const land = collect(landGeo, cfg, true);
  const bord = collect(bordGeo, cfg, false);
  collected[name] = { land, bord };
  const kb = n => (n / 1024).toFixed(0);

  if (cfg.grid) {
    const fill = gridify(land.subs, 'fill');
    const coast = gridify(land.subs, 'line');
    const border = gridify(bord.subs, 'line');
    layers[name] = { grid: true, fill, coast, bord: border };
    const sum = a => a.reduce((s, x) => s + x.length, 0);
    report.push(`${name.padEnd(6)} сетка ${GX}x${GY}: непустых ячеек ${fill.filter(Boolean).length}/${GX * GY} | ` +
      `заливка ${kb(sum(fill))} КБ, берег ${kb(sum(coast))} КБ, границы ${kb(sum(border))} КБ ` +
      `(суша ${land.after} точек, границы ${bord.after})`);
  } else {
    const fill = encode(land.subs.map(s => ({ pts: s.pts, closed: true })));
    const border = encode(bord.subs);
    layers[name] = { grid: false, fill, coast: fill, bord: border };
    report.push(`${name.padEnd(6)} без сетки: заливка+берег ${kb(fill.length)} КБ, границы ${kb(border.length)} КБ`);
  }
}

const sphereD = encode(collect(sphere, { tol: 0.6, minRing: 0, precision: 0.5 }, true).subs
  .map(s => ({ pts: s.pts, closed: true })));
const gratD = encode(collect(geoGraticule().step([20, 20])(), { tol: 1.5, minRing: 0, precision: 1.5 }, false).subs);

const data = {
  view: { x: MAP.x0, y: MAP.y0, w: MAP.w, h: MAP.h },
  grid: { gx: GX, gy: GY },
  proj: { scale, tx, ty },
  sphere: sphereD,
  graticule: gratD,
  lod: layers,
};


export const mapData = data;
export const buildReport = report;

// Строительные блоки — чтобы потребитель мог собрать свой вариант сетки
// (клиенту нужен 50m только там, где есть кейсы, а остальной мир — обзорным
// слоем: так покрытие остаётся полным, а вес — клиентским).
export const gridParts = { collected, gridify, GX, GY, bounds: MAP };
