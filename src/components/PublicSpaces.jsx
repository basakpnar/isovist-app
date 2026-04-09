import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { buildingCentroid, publicSpaceColor, polygonArea, formatArea } from '../heatmap';

const NEUTRAL_COLOR  = '#4c1d95';   // muted indigo before an origin is set
const NEUTRAL_OPACITY = 0.25;
const ACTIVE_OPACITY  = 0.55;
const MAX_DIST        = 300;

const SPACE_TYPE_LABEL = {
  park:               'Park',
  garden:             'Garden',
  square:             'Square',
  recreation_ground:  'Recreation Ground',
  pedestrian:         'Pedestrian Square',
};

function PublicSpace({ coords, name, origin, role, viewMode, spaceType }) {
  const [hovered, setHovered] = useState(false);
  const stakeholder = role === 'stakeholder';
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

  const centroid  = useMemo(() => buildingCentroid(coords), [coords]);
  const area      = useMemo(() => polygonArea(coords), [coords]);
  const typeLabel = SPACE_TYPE_LABEL[spaceType] || 'Public Space';

  if (!geometry) return null;

  return (
    <group>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, 0]}
        onPointerOver={stakeholder ? (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; } : undefined}
        onPointerOut={stakeholder  ? () => { setHovered(false); document.body.style.cursor = 'auto'; } : undefined}
      >
        <meshBasicMaterial color={color} transparent opacity={hovered ? Math.min(opacity + 0.2, 0.85) : opacity} depthWrite={false} />
      </mesh>

      {/* Place name label (always) */}
      {name && (
        <Html
          position={[centroid[0], 12, -centroid[1]]}
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: 'none', textAlign: 'center' }}
        >
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
        </Html>
      )}

      {/* Stakeholder hover tooltip */}
      {stakeholder && hovered && (
        <Html
          position={[centroid[0], 18, -centroid[1]]}
          center
          zIndexRange={[100, 100]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={PS.panel}>
            <div style={PS.type}>{typeLabel}</div>
            {name && <div style={PS.name}>{name}</div>}
            {viewMode === 'footprint' && (
              <div style={PS.area}>{formatArea(area)}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function PublicSpaces({ publicSpaces = [], origin, role, viewMode }) {
  return (
    <group>
      {publicSpaces.map((ps) => (
        <PublicSpace
          key={ps.id}
          coords={ps.coords}
          name={ps.name}
          spaceType={ps.type}
          origin={origin}
          role={role}
          viewMode={viewMode}
        />
      ))}
    </group>
  );
}

const PS = {
  panel: {
    background: 'rgba(8,8,18,0.92)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 11px',
    fontFamily: 'system-ui, sans-serif',
    minWidth: 110,
    backdropFilter: 'blur(6px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    textAlign: 'left',
  },
  type: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'rgba(255,100,200,0.9)',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  name: {
    fontSize: 11,
    color: '#ccc',
    fontWeight: 500,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  area: {
    fontSize: 10,
    color: 'rgba(32,223,128,0.8)',
    fontWeight: 600,
    borderTop: '1px solid rgba(255,255,255,0.07)',
    paddingTop: 4,
    fontVariantNumeric: 'tabular-nums',
  },
};
