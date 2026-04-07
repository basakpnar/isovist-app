import { useState } from 'react';
import { computeEffectiveParams } from '../viewerParams';
import { heatmapColor, publicSpaceColor } from '../heatmap';

const BUILDING_TYPES = [
  { label: 'Residential', score: 1.2 / 2.5, mult: '×1.2' },
  { label: 'Civic',       score: 1.5 / 2.5, mult: '×1.5' },
  { label: 'Office',      score: 2.0 / 2.5, mult: '×2.0' },
  { label: 'Commercial',  score: 2.5 / 2.5, mult: '×2.5' },
];

const HEATMAP_GRADIENT =
  'linear-gradient(to right,' +
  ' rgb(30,58,95) 0%,' +
  ' rgb(26,122,110) 30%,' +
  ' rgb(138,154,32) 55%,' +
  ' rgb(200,90,10) 75%,' +
  ' rgb(187,26,0) 100%)';

const SPACES_GRADIENT =
  'linear-gradient(to right,' +
  ' rgb(26,10,61) 0%,' +
  ' rgb(109,40,217) 35%,' +
  ' rgb(192,38,211) 65%,' +
  ' rgb(255,45,120) 100%)';

export function InfoPanel({ viewerParams, hasOrigin }) {
  const ep = computeEffectiveParams(viewerParams);
  const [heatmapOpen, setHeatmapOpen] = useState(true);
  const [spacesOpen,  setSpacesOpen]  = useState(true);

  if (!hasOrigin) {
    return (
      <div style={S.panel}>
        <span style={S.hint}>
          Click on the ground to place a viewer and compute an isovist
        </span>
        <span style={S.sub}>
          Orbit: left drag&nbsp;·&nbsp;Pan: right drag&nbsp;·&nbsp;Zoom: scroll
        </span>
      </div>
    );
  }

  return (
    <div style={S.panel}>
      {/* ── Parameter chips ── */}
      <div style={S.paramRow}>
        <Chip label="FOV"        value={ep.isDirectional ? `${ep.fovH.toFixed(0)}°` : '360°'} />
        <Chip label="Range"      value={`${ep.range.toFixed(0)} m`} />
        <Chip label="Acuity"     value={`${Math.round(ep.numRays / 7.2)}%`} />
        <Chip label="Peripheral" value={`${ep.peripheralAngle.toFixed(0)}°`} />
        <Chip label="Light"      value={viewerParams.vision.lightSensitivity.value} />
      </div>

      <div style={S.divider} />

      {/* ── Interaction heatmap legend ── */}
      <div style={S.sectionHeader} onClick={() => setHeatmapOpen(!heatmapOpen)}>
        <span style={S.legendLabel}>INTERACTION HEATMAP</span>
        <span style={{ ...S.chevron, transform: heatmapOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
      </div>

      {heatmapOpen && (
        <>
          <div style={S.barWrap}>
            <div style={{ ...S.bar, background: HEATMAP_GRADIENT }} />
            {BUILDING_TYPES.map((bt) => (
              <div key={bt.label} style={{ ...S.tick, left: `${bt.score * 100}%` }} />
            ))}
          </div>
          <div style={S.typeRow}>
            <span style={S.edgeLabel}>Low</span>
            {BUILDING_TYPES.map((bt) => (
              <div key={bt.label} style={{ ...S.typeItem, left: `${bt.score * 100}%` }}>
                <span style={{ ...S.typeDot, background: heatmapColor(bt.score) }} />
                <span style={S.typeLabel}>{bt.label}</span>
                <span style={S.typeMult}>{bt.mult}</span>
              </div>
            ))}
            <span style={{ ...S.edgeLabel, marginLeft: 'auto' }}>High</span>
          </div>
        </>
      )}

      <div style={S.divider} />

      {/* ── Public spaces legend ── */}
      <div style={S.sectionHeader} onClick={() => setSpacesOpen(!spacesOpen)}>
        <span style={S.legendLabel}>PUBLIC SPACES</span>
        <span style={{ ...S.chevron, transform: spacesOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
      </div>

      {spacesOpen && (
        <>
          <div style={S.barWrap}>
            <div style={{ ...S.bar, background: SPACES_GRADIENT }} />
          </div>
          <div style={S.spaceRow}>
            <span style={S.edgeLabel}>Far</span>
            <div style={S.spaceTypes}>
              {[0.0, 0.35, 0.65, 1.0].map((score, i) => (
                <div key={i} style={S.spaceItem}>
                  <span style={{ ...S.typeDot, background: publicSpaceColor(score) }} />
                </div>
              ))}
            </div>
            <span style={{ ...S.edgeLabel, marginLeft: 'auto' }}>Close</span>
          </div>
          <div style={S.spaceNote}>Parks · Squares · Gardens</div>
        </>
      )}
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div style={S.chip}>
      <span style={S.chipLabel}>{label}</span>
      <span style={S.chipValue}>{value}</span>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  panel: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(10,10,20,0.82)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    backdropFilter: 'blur(8px)',
    padding: '10px 16px 12px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 11,
    color: '#ccc',
    pointerEvents: 'none',
    zIndex: 10,
    minWidth: 440,
  },
  hint: {
    display: 'block',
    color: '#ddd',
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    display: 'block',
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
  },
  paramRow: {
    display: 'flex',
    gap: 6,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '4px 10px',
    minWidth: 56,
  },
  chipLabel: {
    fontSize: 9,
    color: '#555',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 12,
    color: '#ddd',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.07)',
    margin: '8px 0 6px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    cursor: 'pointer',
    pointerEvents: 'all',
  },
  legendLabel: {
    fontSize: 9,
    letterSpacing: '0.12em',
    color: '#555',
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 12,
    color: '#444',
    transition: 'transform 0.2s',
  },
  barWrap: {
    position: 'relative',
    height: 10,
    marginBottom: 4,
  },
  bar: {
    position: 'absolute',
    inset: 0,
    borderRadius: 5,
  },
  tick: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    background: 'rgba(255,255,255,0.5)',
    transform: 'translateX(-50%)',
    borderRadius: 1,
  },
  typeRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 32,
  },
  typeItem: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  typeDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  typeLabel: {
    fontSize: 9,
    color: '#aaa',
    whiteSpace: 'nowrap',
  },
  typeMult: {
    fontSize: 8,
    color: '#555',
  },
  edgeLabel: {
    fontSize: 9,
    color: '#555',
    flexShrink: 0,
  },
  spaceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  spaceTypes: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  spaceItem: {
    display: 'flex',
    alignItems: 'center',
  },
  spaceNote: {
    fontSize: 8,
    color: '#444',
    textAlign: 'center',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};
