import { useMemo } from 'react';
import * as THREE from 'three';

function makeShapeGeo(polygon) {
  if (!polygon || polygon.length < 3) return null;
  const shape = new THREE.Shape();
  shape.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i++) {
    shape.lineTo(polygon[i][0], polygon[i][1]);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function makeOutlineMesh(polygon) {
  if (!polygon || polygon.length < 3) return null;
  const pts = [...polygon, polygon[0]].map(([x, z]) => new THREE.Vector3(x, z, 0));
  const geo  = new THREE.BufferGeometry().setFromPoints(pts);
  const mat  = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 });
  return new THREE.Line(geo, mat);
}

export function IsovistOverlay({
  polygon,
  peripheralPolygon = null,
  origin,
  opacity   = 0.35,
  eyeHeight = 1.7,
}) {
  const mainGeo        = useMemo(() => makeShapeGeo(polygon),           [polygon]);
  const outlineMesh    = useMemo(() => makeOutlineMesh(polygon),        [polygon]);
  const peripheralGeo  = useMemo(() => makeShapeGeo(peripheralPolygon), [peripheralPolygon]);

  if (!mainGeo || !origin) return null;

  const rot = [-Math.PI / 2, 0, 0];
  const ox  = origin[0];
  const oz  = -origin[1]; // geoZ → world Z

  return (
    <group>
      {/* Peripheral zone */}
      {peripheralGeo && (
        <mesh geometry={peripheralGeo} rotation={rot} position={[0, 0.15, 0]}>
          <meshBasicMaterial
            color="#88aaff"
            transparent
            opacity={opacity * 0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main isovist fill */}
      <mesh geometry={mainGeo} rotation={rot} position={[0, 0.2, 0]}>
        <meshBasicMaterial
          color="#4a90ff"
          transparent
          opacity={Math.min(opacity * 1.3, 0.75)}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Isovist boundary outline */}
      {outlineMesh && (
        <primitive object={outlineMesh} rotation={rot} position={[0, 0.35, 0]} />
      )}

      {/* Ground ring */}
      <mesh position={[ox, 0.3, oz]} rotation={rot}>
        <ringGeometry args={[4.5, 6.5, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Outer sphere — white outline */}
      <mesh position={[ox, eyeHeight, oz]}>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Inner sphere — vivid orange */}
      <mesh position={[ox, eyeHeight, oz]}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
    </group>
  );
}
