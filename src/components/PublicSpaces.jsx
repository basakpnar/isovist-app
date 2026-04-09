import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { buildingCentroid, publicSpaceColor, polygonArea, formatArea } from '../heatmap';

const NEUTRAL_COLOR  = '#4c1d95';   // muted indigo before an origin is set
const NEUTRAL_OPACITY = 0.25;
const ACTIVE_OPACITY  = 0.55;
const MAX_DIST        = 300;

function PublicSpace({ coords, name, origin, showAreas }) {
  const geometry = useMemo(() => {
    if (coords.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(coords[0][0], coords[0][1]);
    for (let i = 1; i < coords.length; i++) shape.lineTo(coords[i][0], coords[i][1]);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { steps: 1, depth: 0.3, bevelEnabled: false });
  }, [coords]);

  const { color, opacity } = useMemo(() => {
    if (!origin) return { color: NEUTRAL_COLOR, opacity: NEUTRAL_OPACITY };
    const [cx, cz] = buildingCentroid(coords);
    const dist  = Math.hypot(cx - origin[0], cz - origin[1]);
    const score = 1 - Math.min(dist / MAX_DIST, 1);
    return { color: publicSpaceColor(score), opacity: ACTIVE_OPACITY };
  }, [coords, origin]);

  const centroid = useMemo(() => buildingCentroid(coords), [coords]);
  const area     = useMemo(() => polygonArea(coords), [coords]);

  if (!geometry) return null;

  return (
    <group>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, 0]}
      >
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>

      {(name || showAreas) && (
        <Html
          position={[centroid[0], 12, -centroid[1]]}
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: 'none', textAlign: 'center' }}
        >
          {name && (
            <div style={{
              whiteSpace: 'nowrap',
              color: '#fff',
              fontSize: 10,
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
              opacity: origin ? 1 : 0.5,
            }}>
              {name}
            </div>
          )}
          {showAreas && (
            <div style={{
              whiteSpace: 'nowrap',
              color: 'rgba(255,100,200,0.9)',
              fontSize: 9,
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textShadow: '0 0 6px rgba(0,0,0,0.9)',
              marginTop: name ? 2 : 0,
            }}>
              {formatArea(area)}
            </div>
          )}
        </Html>
      )}
    </group>
  );
}

export function PublicSpaces({ publicSpaces = [], origin, showAreas = false }) {
  return (
    <group>
      {publicSpaces.map((ps) => (
        <PublicSpace
          key={ps.id}
          coords={ps.coords}
          name={ps.name}
          origin={origin}
          showAreas={showAreas}
        />
      ))}
    </group>
  );
}
