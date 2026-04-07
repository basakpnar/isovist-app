import { useMemo } from 'react';
import * as THREE from 'three';

const ROAD_WIDTHS = {
  motorway: 6,
  trunk: 5,
  primary: 4,
  secondary: 3,
  tertiary: 2.5,
  residential: 2,
  service: 1.5,
  footway: 1,
  path: 0.8,
  cycleway: 1,
  default: 2,
};

function Road({ coords, type, color, viewMode }) {
  const width = ROAD_WIDTHS[type] || ROAD_WIDTHS.default;

  const geometry = useMemo(() => {
    if (coords.length < 2) return null;
    const points = coords.map(([x, z]) => new THREE.Vector2(x, z));
    const shape = new THREE.Shape();

    // Build a ribbon along the road
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.001) continue;
      const nx = (-dy / len) * (width / 2);
      const ny = (dx / len) * (width / 2);

      if (i === 0) {
        shape.moveTo(a.x + nx, a.y + ny);
      } else {
        shape.lineTo(a.x + nx, a.y + ny);
      }
      shape.lineTo(b.x + nx, b.y + ny);
    }
    for (let i = points.length - 2; i >= 0; i--) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.001) continue;
      const nx = (-dy / len) * (width / 2);
      const ny = (dx / len) * (width / 2);
      shape.lineTo(b.x - nx, b.y - ny);
      shape.lineTo(a.x - nx, a.y - ny);
    }
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, [coords, width]);

  if (!geometry) return null;

  const Material = viewMode === 'shaded'
    ? <meshLambertMaterial color={color} />
    : <meshBasicMaterial color={color} />;

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      {Material}
    </mesh>
  );
}

export function Roads({ roads, color = '#b0a898', viewMode = 'shaded' }) {
  return (
    <group>
      {roads.map((r) => (
        <Road key={r.id} coords={r.coords} type={r.type} color={color} viewMode={viewMode} />
      ))}
    </group>
  );
}
