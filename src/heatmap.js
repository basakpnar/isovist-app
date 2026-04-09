// ─── Colour gradient stops: [score, [r, g, b]] ───────────────────────────────
const STOPS = [
  [0.00, [30,  58,  95]],   // cold blue   #1e3a5f
  [0.30, [26, 122, 110]],   // teal        #1a7a6e
  [0.55, [138, 154, 32]],   // olive       #8a9a20
  [0.75, [200,  90, 10]],   // orange      #c85a0a
  [1.00, [187,  26,  0]],   // hot red     #bb1a00
];

/** Map a 0–1 score to a CSS rgb() colour via the gradient above. */
export function heatmapColor(score) {
  const t = Math.max(0, Math.min(1, score));

  let lo = STOPS[0];
  let hi = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (t >= STOPS[i][0] && t <= STOPS[i + 1][0]) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }

  const span = hi[0] - lo[0];
  const f    = span > 0 ? (t - lo[0]) / span : 0;
  const r    = Math.round(lo[1][0] + f * (hi[1][0] - lo[1][0]));
  const g    = Math.round(lo[1][1] + f * (hi[1][1] - lo[1][1]));
  const b    = Math.round(lo[1][2] + f * (hi[1][2] - lo[1][2]));

  return `rgb(${r},${g},${b})`;
}

/** Centroid of a building footprint (geoToScene coords). */
export function buildingCentroid(coords) {
  let sx = 0, sz = 0;
  for (const [x, z] of coords) { sx += x; sz += z; }
  return [sx / coords.length, sz / coords.length];
}

// ─── Pink/purple gradient for public spaces ──────────────────────────────────
const PUBLIC_STOPS = [
  [0.00, [26,  10,  61]],   // deep indigo
  [0.35, [109, 40, 217]],   // violet
  [0.65, [192, 38, 211]],   // fuchsia
  [1.00, [255, 45, 120]],   // hot pink
];

/** Map a 0–1 proximity score to a CSS rgb() colour for public spaces. */
export function publicSpaceColor(score) {
  const t = Math.max(0, Math.min(1, score));
  let lo = PUBLIC_STOPS[0];
  let hi = PUBLIC_STOPS[PUBLIC_STOPS.length - 1];
  for (let i = 0; i < PUBLIC_STOPS.length - 1; i++) {
    if (t >= PUBLIC_STOPS[i][0] && t <= PUBLIC_STOPS[i + 1][0]) {
      lo = PUBLIC_STOPS[i]; hi = PUBLIC_STOPS[i + 1]; break;
    }
  }
  const span = hi[0] - lo[0];
  const f    = span > 0 ? (t - lo[0]) / span : 0;
  const r    = Math.round(lo[1][0] + f * (hi[1][0] - lo[1][0]));
  const g    = Math.round(lo[1][1] + f * (hi[1][1] - lo[1][1]));
  const b    = Math.round(lo[1][2] + f * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
}

/**
 * Area of a polygon in m² using the Shoelace formula.
 * coords = [[x, z], ...] in scene metres (geoToScene space).
 */
export function polygonArea(coords) {
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const [x1, z1] = coords[i];
    const [x2, z2] = coords[(i + 1) % n];
    area += x1 * z2 - x2 * z1;
  }
  return Math.abs(area / 2);
}

/** Format an area value: m² below 10 000, ha above. */
export function formatArea(m2) {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
  return `${Math.round(m2)} m²`;
}

/**
 * Compute a heatmap colour for every building in the array.
 * @param {Array}           buildings  - each has .coords and .interactionMultiplier
 * @param {[number,number]} origin     - [x, z] isovist origin in geoToScene space
 * @param {number}          maxDist    - normalisation radius in scene metres (default 300)
 * @returns {string[]}                 - CSS colour per building, same order as input
 */
export function computeBuildingColors(buildings, origin, maxDist = 300) {
  const [ox, oz] = origin;
  return buildings.map((b) => {
    const [cx, cz] = buildingCentroid(b.coords);
    const dist     = Math.hypot(cx - ox, cz - oz);
    const distFactor = 1 - Math.min(dist / maxDist, 1);
    const score    = (b.interactionMultiplier / 2.5) * distFactor;
    return heatmapColor(score);
  });
}
