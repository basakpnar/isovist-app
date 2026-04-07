/**
 * Compute a 2D isovist from a point by casting rays and finding intersections
 * with building edges.
 *
 * @param {[number, number]} origin     - [x, z] scene coordinates of the observer
 * @param {Array}            buildings  - array of {coords: [[x,z],...]} objects
 * @param {number}           maxRadius  - maximum ray distance (scene metres)
 * @param {number}           numRays    - number of rays (resolution)
 * @param {number}           fovDeg     - arc to sweep in degrees; 360 = full ring
 * @param {number}           lookDirDeg - centre bearing in degrees (0 = +X axis)
 * @returns {Array<[number,number]>}    - polygon vertices
 */
export function computeIsovist(
  origin,
  buildings,
  maxRadius = 300,
  numRays   = 720,
  fovDeg    = 360,
  lookDirDeg = 0
) {
  const [ox, oz] = origin;

  // Collect all building edges
  const edges = [];
  for (const building of buildings) {
    const pts = building.coords;
    for (let i = 0; i < pts.length - 1; i++) {
      edges.push([pts[i], pts[i + 1]]);
    }
  }

  const isFullRing  = fovDeg >= 355;
  const arcRad      = Math.min(fovDeg, 360) * (Math.PI / 180);
  const centerRad   = lookDirDeg * (Math.PI / 180);
  const startAngle  = isFullRing ? 0 : centerRad - arcRad / 2;
  const angleStep   = arcRad / numRays;

  const polygon = [];

  for (let i = 0; i <= numRays; i++) {
    const angle = startAngle + i * angleStep;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);

    let minT = maxRadius;

    for (const [[x1, z1], [x2, z2]] of edges) {
      const ex    = x2 - x1;
      const ez    = z2 - z1;
      const denom = dx * ez - dz * ex;
      if (Math.abs(denom) < 1e-10) continue;

      const fx = x1 - ox;
      const fz = z1 - oz;
      const t  = (fx * ez - fz * ex) / denom;
      const s  = (fx * dz - fz * dx) / denom;

      if (t >= 0 && t < minT && s >= 0 && s <= 1) {
        minT = t;
      }
    }

    polygon.push([ox + dx * minT, oz + dz * minT]);
  }

  // For a directed cone, bookend with the origin so the shape closes as a wedge
  if (!isFullRing) {
    polygon.unshift([ox, oz]);
    polygon.push([ox, oz]);
  }

  return polygon;
}
