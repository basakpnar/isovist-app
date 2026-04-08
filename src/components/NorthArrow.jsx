import { forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Placed inside <Canvas> — reads camera each frame and updates the DOM arrow
export function NorthArrowUpdater({ arrowRef }) {
  useFrame(({ camera }) => {
    if (!arrowRef.current) return;
    // World north = +Z in our coordinate system
    // (geoToScene: north = decreasing geoZ; world Z = -geoZ → north = +worldZ)
    const north  = new THREE.Vector3(0, 0, 1);
    const right  = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up     = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const x      = north.dot(right);
    const y      = north.dot(up);
    const angle  = Math.atan2(x, y);
    arrowRef.current.style.transform = `rotate(${angle}rad)`;
  });
  return null;
}

// Placed outside <Canvas> — the visible compass rose HTML element
export const NorthArrow = forwardRef(function NorthArrow(_, ref) {
  return (
    <div style={S.wrap} title="North arrow — rotates with the camera">
      <div ref={ref} style={S.dial}>
        <svg viewBox="0 0 48 48" width="48" height="48" overflow="visible">
          {/* Outer ring */}
          <circle cx="24" cy="24" r="22"
            fill="rgba(10,10,20,0.78)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          {/* Cardinal tick marks */}
          {[0, 90, 180, 270].map((deg) => {
            const r = deg % 180 === 0 ? Math.PI * deg / 180 : Math.PI * deg / 180;
            const ix = 24 + 18 * Math.sin(r);
            const iy = 24 - 18 * Math.cos(r);
            const ox = 24 + 22 * Math.sin(r);
            const oy = 24 - 22 * Math.cos(r);
            return <line key={deg} x1={ix} y1={iy} x2={ox} y2={oy}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1" />;
          })}

          {/* South needle — dim */}
          <path d="M24 24 L21.5 38 L24 33 L26.5 38 Z"
            fill="rgba(255,255,255,0.18)" />

          {/* North needle — bright white with a red tip */}
          <path d="M24 24 L21.5 10 L24 15 L26.5 10 Z"
            fill="white" />
          <path d="M24 10 L22.5 15 L24 15 L25.5 15 L24 10 Z"
            fill="#ff4444" />

          {/* Centre dot */}
          <circle cx="24" cy="24" r="2.5"
            fill="rgba(10,10,20,0.9)"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
          />

          {/* N label */}
          <text x="24" y="7.5"
            textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="6.5" fontWeight="700"
            fontFamily="system-ui, sans-serif" letterSpacing="0.05em"
          >N</text>
        </svg>
      </div>
    </div>
  );
});

const S = {
  wrap: {
    position: 'absolute',
    bottom: 172,
    right: 56,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 10,
  },
  dial: {
    // transform is set imperatively by NorthArrowUpdater each frame
  },
};
