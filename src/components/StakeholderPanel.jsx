import { useState } from 'react';

const ACCENT = '#20df80';

const COST_GRADIENT =
  'linear-gradient(to right,' +
  ' rgb(20,80,40) 0%,' +
  ' rgb(30,180,90) 40%,' +
  ' rgb(200,200,20) 70%,' +
  ' rgb(220,100,10) 100%)';

const PHASES = [
  { label: 'Feasibility',   weeks: '4–8 wk',   color: 'rgba(32,223,128,0.5)' },
  { label: 'Planning',      weeks: '8–16 wk',  color: 'rgba(32,223,128,0.65)' },
  { label: 'Permitting',    weeks: '12–24 wk', color: 'rgba(32,223,128,0.8)' },
  { label: 'Construction',  weeks: '16–52 wk', color: ACCENT },
];

const QUALITY_FACTORS = [
  { label: 'Connectivity',    desc: 'Access to roads & transit' },
  { label: 'Centrality',      desc: 'Proximity to active uses' },
  { label: 'Green proximity', desc: 'Distance to parks & spaces' },
  { label: 'Noise exposure',  desc: 'Road & industrial noise' },
];

export function StakeholderPanel({ hasOrigin }) {
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [qualityOpen,  setQualityOpen]  = useState(true);

  if (!hasOrigin) {
    return (
      <div style={S.panel}>
        <span style={S.hint}>Click on the ground to select a project location</span>
        <span style={S.sub}>Cost and timeline estimates will appear here</span>
      </div>
    );
  }

  return (
    <div style={S.panel}>

      {/* ── Location activity score ── */}
      <div style={S.sectionLabel}>LOCATION ACTIVITY SCORE</div>
      <div style={S.barWrap}>
        <div style={{ ...S.bar, background: COST_GRADIENT }} />
        {/* placeholder marker — will be computed from real data */}
        <div style={S.marker} title="Location score pending data" />
      </div>
      <div style={S.scoreRow}>
        <span style={S.edgeLabel}>Low activity</span>
        <span style={{ ...S.pendingBadge }}>— awaiting data</span>
        <span style={{ ...S.edgeLabel, marginLeft: 'auto' }}>High activity</span>
      </div>

      <div style={S.divider} />

      {/* ── Cost estimation ── */}
      <div style={S.sectionLabel}>ESTIMATED PROJECT COST</div>
      <div style={S.costCards}>
        <CostCard label="Base Construction" value="—" unit="€ / m²" note="Area-dependent · pending" accent={ACCENT} />
        <CostCard label="Location Premium"  value="—" unit="multiplier" note="Activity-dependent · pending" accent={ACCENT} />
        <CostCard label="Total Estimate"    value="—" unit="€" note="Base × area × premium" accent={ACCENT} bold />
      </div>

      <div style={S.divider} />

      {/* ── Timeline ── */}
      <div style={S.sectionHeader} onClick={() => setTimelineOpen(!timelineOpen)}>
        <span style={S.sectionLabel}>PROJECT TIMELINE</span>
        <span style={{ ...S.chevron, transform: timelineOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
      </div>
      {timelineOpen && (
        <div style={S.phases}>
          {PHASES.map((ph, i) => (
            <div key={i} style={S.phase}>
              <div style={{ ...S.phaseBar, background: ph.color }} />
              <div style={S.phaseLabel}>{ph.label}</div>
              <div style={S.phaseWeeks}>{ph.weeks}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.divider} />

      {/* ── Spatial quality factors ── */}
      <div style={S.sectionHeader} onClick={() => setQualityOpen(!qualityOpen)}>
        <span style={S.sectionLabel}>SPATIAL QUALITY FACTORS</span>
        <span style={{ ...S.chevron, transform: qualityOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
      </div>
      {qualityOpen && (
        <div style={S.qualityGrid}>
          {QUALITY_FACTORS.map((f, i) => (
            <div key={i} style={S.qualityItem}>
              <div style={S.qualityDot} />
              <div>
                <div style={S.qualityLabel}>{f.label}</div>
                <div style={S.qualityDesc}>{f.desc}</div>
              </div>
              <div style={{ ...S.qualityValue }}>—</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function CostCard({ label, value, unit, note, accent, bold }) {
  return (
    <div style={{ ...S.costCard, borderColor: bold ? accent + '55' : 'rgba(255,255,255,0.07)' }}>
      <div style={S.costCardLabel}>{label}</div>
      <div style={{ ...S.costCardValue, color: bold ? accent : '#ddd', fontWeight: bold ? 700 : 500 }}>{value}</div>
      <div style={{ ...S.costCardUnit, color: bold ? accent + 'aa' : '#444' }}>{unit}</div>
      <div style={S.costCardNote}>{note}</div>
    </div>
  );
}

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
    pointerEvents: 'auto',
    zIndex: 10,
    minWidth: 500,
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
  sectionLabel: {
    fontSize: 9,
    letterSpacing: '0.12em',
    color: '#555',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    cursor: 'pointer',
    pointerEvents: 'all',
  },
  chevron: {
    fontSize: 12,
    color: '#444',
    transition: 'transform 0.2s',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.07)',
    margin: '8px 0 6px',
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
  marker: {
    position: 'absolute',
    top: -2,
    left: '50%',
    width: 3,
    height: 14,
    background: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    transform: 'translateX(-50%)',
    border: '1px solid rgba(255,255,255,0.5)',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 2,
  },
  edgeLabel: {
    fontSize: 9,
    color: '#555',
    flexShrink: 0,
  },
  pendingBadge: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    color: '#445',
    fontStyle: 'italic',
  },
  costCards: {
    display: 'flex',
    gap: 8,
    marginBottom: 2,
  },
  costCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid',
    borderRadius: 7,
    padding: '8px 10px',
  },
  costCardLabel: {
    fontSize: 8,
    color: '#556',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  costCardValue: {
    fontSize: 18,
    lineHeight: 1,
    marginBottom: 2,
    fontVariantNumeric: 'tabular-nums',
  },
  costCardUnit: {
    fontSize: 8,
    marginBottom: 4,
    letterSpacing: '0.04em',
  },
  costCardNote: {
    fontSize: 8,
    color: '#445',
    fontStyle: 'italic',
  },
  phases: {
    display: 'flex',
    gap: 6,
    marginBottom: 2,
  },
  phase: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  phaseBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  phaseLabel: {
    fontSize: 9,
    color: '#aaa',
    textAlign: 'center',
  },
  phaseWeeks: {
    fontSize: 8,
    color: '#556',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  qualityGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  qualityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  qualityDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: ACCENT,
    opacity: 0.5,
    flexShrink: 0,
  },
  qualityLabel: {
    fontSize: 10,
    color: '#aaa',
  },
  qualityDesc: {
    fontSize: 8,
    color: '#556',
  },
  qualityValue: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#445',
    fontStyle: 'italic',
  },
};
