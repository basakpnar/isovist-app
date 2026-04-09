import { useMemo, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { computeBuildingColors, polygonArea, formatArea } from '../heatmap';
import { describeBuildingFunction, SKIP_CATEGORIES } from '../buildingInfo';

function Building({ coords, height, color, viewMode, info, role }) {
  const [hovered,     setHovered]     = useState(false);
  const timeoutRef = useRef(null);
  const stakeholder = role === 'stakeholder';

  const { extrudeGeo, edgesGeo, footprintGeo, flatGeo } = useMemo(() => {
    if (coords.length < 3) return {};
    const shape = new THREE.Shape();
    shape.moveTo(coords[0][0], coords[0][1]);
    for (let i = 1; i < coords.length; i++) shape.lineTo(coords[i][0], coords[i][1]);
    shape.closePath();

    const extrudeGeo   = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: height, bevelEnabled: false });
    const edgesGeo     = new THREE.EdgesGeometry(extrudeGeo);
    const footprintGeo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: 0.5, bevelEnabled: false });
    const flatGeo      = new THREE.ShapeGeometry(shape);
    return { extrudeGeo, edgesGeo, footprintGeo, flatGeo };
  }, [coords, height]);

  const area = useMemo(() => polygonArea(coords), [coords]);

  const centroid = useMemo(() => {
    let sx = 0, sz = 0;
    for (const [x, z] of coords) { sx += x; sz += z; }
    return [sx / coords.length, sz / coords.length];
  }, [coords]);

  const onOver = useCallback((e) => {
    e.stopPropagation();
    clearTimeout(timeoutRef.current);
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const onOut = useCallback(() => {
    // small delay so the tooltip doesn't flicker on mesh edge crossings
    timeoutRef.current = setTimeout(() => {
      setHovered(false);
      document.body.style.cursor = 'auto';
    }, 80);
  }, []);

  if (!extrudeGeo) return null;

  const rotation = [-Math.PI / 2, 0, 0];
  const fn       = describeBuildingFunction(info);
  // Stakeholder: all buildings hoverable; others: skip residential/utility
  const canHover = stakeholder || !SKIP_CATEGORIES.has(fn.category);

  return (
    <group>
      {/* ── Visual mesh (view-mode dependent) ── */}
      {viewMode === 'blueprint' && (
        <lineSegments geometry={edgesGeo} rotation={rotation}>
          <lineBasicMaterial color={color} linewidth={1} />
        </lineSegments>
      )}
      {viewMode === 'footprint' && (
        <mesh geometry={footprintGeo} rotation={rotation}>
          <meshBasicMaterial color={color} />
        </mesh>
      )}
      {viewMode === 'shaded' && (
        <mesh geometry={extrudeGeo} rotation={rotation} castShadow receiveShadow>
          <meshLambertMaterial color={color} />
        </mesh>
      )}

      {/* ── Invisible hover target (non-residential/utility only) ── */}
      {canHover && (
        <mesh
          geometry={extrudeGeo}
          rotation={rotation}
          onPointerOver={onOver}
          onPointerOut={onOut}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* ── Tooltip ── */}
      {hovered && canHover && (
        <Html
          position={[centroid[0], height + 8, -centroid[1]]}
          center
          zIndexRange={[100, 100]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={T.panel}>
            <div style={T.header}>
              <svg
                viewBox="0 0 24 24" width="13" height="13"
                fill="none" stroke="rgba(255,255,255,0.9)"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d={fn.icon} />
              </svg>
              <span style={T.label}>{fn.label}</span>
            </div>
            {info?.name && <div style={T.name}>{info.name}</div>}
            {fn.detail && <div style={T.detail}>{fn.detail}</div>}
            {/* Area shown in stakeholder footprint view */}
            {stakeholder && viewMode === 'footprint' && (
              <div style={T.area}>{formatArea(area)}</div>
            )}
            {!stakeholder && info?.levels && (
              <div style={T.meta}>
                {info.levels} {Number(info.levels) === 1 ? 'floor' : 'floors'}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function Buildings({ buildings, color = '#e8e0d0', viewMode = 'shaded', origin = null, role }) {
  const heatColors = useMemo(
    () => origin ? computeBuildingColors(buildings, origin) : null,
    [buildings, origin]
  );

  return (
    <group>
      {buildings.map((b, i) => (
        <Building
          key={b.id}
          coords={b.coords}
          height={b.height}
          color={heatColors ? heatColors[i] : color}
          viewMode={viewMode}
          info={b.info}
          role={role}
        />
      ))}
    </group>
  );
}

// ─── Tooltip styles ──────────────────────────────────────────────────────────
const T = {
  panel: {
    background: 'rgba(8,8,18,0.92)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 11px',
    fontFamily: 'system-ui, sans-serif',
    minWidth: 130,
    maxWidth: 220,
    backdropFilter: 'blur(6px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    whiteSpace: 'normal',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.09em',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 11,
    color: '#ccc',
    fontWeight: 500,
    lineHeight: 1.35,
    marginBottom: 3,
  },
  detail: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  meta: {
    fontSize: 9,
    color: '#444',
    marginTop: 3,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: 3,
  },
  area: {
    fontSize: 10,
    color: 'rgba(32,223,128,0.8)',
    fontWeight: 600,
    marginTop: 4,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: 4,
    fontVariantNumeric: 'tabular-nums',
  },
};
