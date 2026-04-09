import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { NorthArrow, NorthArrowUpdater } from './NorthArrow';

// Exposes the Three.js renderer to the parent via a ref, for screenshots
function GlCapture({ glRef }) {
  const { gl } = useThree();
  useEffect(() => { glRef.current = gl; }, [gl, glRef]);
  return null;
}
import { Buildings } from './Buildings';
import { Roads } from './Roads';
import { PublicSpaces } from './PublicSpaces';
import { IsovistOverlay } from './IsovistOverlay';
import { computeIsovist } from '../isovist';
import { computeEffectiveParams } from '../viewerParams';

const GROUND_SIZE = 1050;

function CameraController({ viewMode }) {
  const { camera, controls } = useThree();
  const prevMode = useRef(viewMode);

  useEffect(() => {
    if (prevMode.current === viewMode) return;
    prevMode.current = viewMode;
    if (viewMode === 'blueprint' || viewMode === 'footprint') {
      camera.position.set(0, 900, 0.01);
      camera.lookAt(0, 0, 0);
      if (controls) controls.target.set(0, 0, 0);
    } else {
      camera.position.set(0, 400, 400);
      camera.lookAt(0, 0, 0);
      if (controls) controls.target.set(0, 0, 0);
    }
  }, [viewMode, camera, controls]);

  return null;
}

function Ground({ color, viewMode, onGroundClick }) {
  const Material = viewMode === 'shaded'
    ? <meshLambertMaterial color={color} />
    : <meshBasicMaterial color={color} />;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
      receiveShadow={viewMode === 'shaded'}
      onClick={onGroundClick}
    >
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      {Material}
    </mesh>
  );
}

function Lighting({ viewMode }) {
  if (viewMode !== 'shaded') return <ambientLight intensity={1.0} />;
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[500, 800, 300]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={1500}
        shadow-camera-left={-550}
        shadow-camera-right={550}
        shadow-camera-top={550}
        shadow-camera-bottom={-550}
      />
    </>
  );
}

export function Scene({ buildings, roads, publicSpaces, settings, viewerParams, glRef, onOriginChange, showHeatmap = true, showSpaces = true, showBuildingFootprints = false, showSpaceAreas = false }) {
  const { viewMode, building: buildingColor, ground: groundColor, sky: skyColor, road: roadColor } = settings;

  const [isovistState, setIsovistState] = useState(null);
  const [origin, setOrigin]             = useState(null);
  const controlsRef  = useRef();
  const northArrowRef = useRef();

  const recompute = useCallback((x, geoZ) => {
    const ep = computeEffectiveParams(viewerParams);

    const poly = computeIsovist(
      [x, geoZ], buildings, ep.range, ep.numRays, ep.fovH, ep.lookDirection
    );

    let periphPoly = null;
    if (ep.peripheralAngle > 0) {
      const periphFov = Math.min(ep.fovH + 2 * ep.peripheralAngle, 360);
      periphPoly = computeIsovist(
        [x, geoZ], buildings, ep.range,
        Math.max(36, Math.round(ep.numRays * 0.5)), periphFov, ep.lookDirection
      );
    }

    setIsovistState({ poly, periphPoly, opacity: ep.opacity, eyeHeight: ep.eyeHeight });
  }, [buildings, viewerParams]);

  // Re-run whenever params change and an origin already exists
  useEffect(() => {
    if (origin) recompute(origin[0], origin[1]);
  }, [viewerParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGroundClick = useCallback((e) => {
    e.stopPropagation();
    const { x, z } = e.point;
    const geoZ = -z;
    setOrigin([x, geoZ]);
    onOriginChange?.([x, geoZ]);
    recompute(x, geoZ);
  }, [recompute, onOriginChange]);

  return (
    <>
    <Canvas
      shadows={viewMode === 'shaded'}
      camera={{ position: [0, 400, 400], fov: 45, near: 1, far: 5000 }}
      style={{ background: skyColor }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <GlCapture glRef={glRef} />
      <NorthArrowUpdater arrowRef={northArrowRef} />
      <CameraController viewMode={viewMode} />
      <Lighting viewMode={viewMode} />

      <Ground color={groundColor} viewMode={viewMode} onGroundClick={handleGroundClick} />
      {showSpaces  && <PublicSpaces publicSpaces={publicSpaces} origin={origin} showAreas={showSpaceAreas} />}
      <Buildings buildings={buildings} color={buildingColor} viewMode={viewMode} origin={showHeatmap ? origin : null} showFootprint={showBuildingFootprints} />
      <Roads roads={roads} color={roadColor} viewMode={viewMode} />

      {isovistState && origin && (
        <IsovistOverlay
          polygon={isovistState.poly}
          peripheralPolygon={isovistState.periphPoly}
          origin={origin}
          opacity={isovistState.opacity}
          eyeHeight={isovistState.eyeHeight}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={50}
        maxDistance={1100}
        maxPolarAngle={Math.PI / 2.05}
      />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ff4060', '#20df80', '#4080ff']} labelColor="white" />
      </GizmoHelper>
    </Canvas>
    <NorthArrow ref={northArrowRef} />
    </>
  );
}
