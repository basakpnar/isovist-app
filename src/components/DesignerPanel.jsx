import { useState } from 'react';

const ACCENT = '#a855f7';

const SECTIONS = [
  {
    id: 'environmental',
    label: 'Environmental',
    icon: (
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 2 C5 5 5 11 8 14" />
        <path d="M2 8 L14 8" />
      </svg>
    ),
    fields: [
      { label: 'Air Quality Index',  value: '—', unit: 'AQI',  note: 'WHO · pending' },
      { label: 'Solar Exposure',     value: '—', unit: 'kWh/m²', note: 'Annual avg · pending' },
      { label: 'Noise Level',        value: '—', unit: 'dB(A)', note: 'Day avg · pending' },
      { label: 'Wind Speed',         value: '—', unit: 'm/s',  note: 'Annual avg · pending' },
      { label: 'Green Coverage',     value: '—', unit: '%',    note: '300 m radius · pending' },
    ],
  },
  {
    id: 'geographical',
    label: 'Geographical',
    icon: (
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2 C6 2 4 5 4 8 C4 12 8 14 8 14 C8 14 12 12 12 8 C12 5 10 2 8 2 Z" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    fields: [
      { label: 'Coordinates',   value: '—',  unit: 'lat / lon', note: 'WGS 84 · pending' },
      { label: 'Elevation',     value: '—',  unit: 'm a.s.l.',  note: 'DEM · pending' },
      { label: 'Parcel Area',   value: '—',  unit: 'm²',        note: 'Cadastre · pending' },
      { label: 'Slope',         value: '—',  unit: '°',         note: 'Average · pending' },
      { label: 'Flood Zone',    value: '—',  unit: '',          note: 'Risk class · pending' },
    ],
  },
  {
    id: 'ownership',
    label: 'Ownership',
    icon: (
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="10" height="7" rx="1" />
        <path d="M5 7 V5 C5 3 11 3 11 5 V7" />
        <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    fields: [
      { label: 'Cadastral ID',    value: '—', unit: '',       note: 'Pending' },
      { label: 'Owner Type',      value: '—', unit: '',       note: 'Public / private · pending' },
      { label: 'Tenure',          value: '—', unit: '',       note: 'Freehold / leasehold · pending' },
      { label: 'Acquisition',     value: '—', unit: '',       note: 'Status · pending' },
      { label: 'Last Transfer',   value: '—', unit: '',       note: 'Year · pending' },
    ],
  },
  {
    id: 'funding',
    label: 'Funding',
    icon: (
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4 L8 5 M8 11 L8 12" />
        <path d="M5.5 6.5 C5.5 5 10.5 5 10.5 7 C10.5 9 5.5 9 5.5 11 C5.5 13 10.5 13 10.5 11.5" />
      </svg>
    ),
    fields: [
      { label: 'Total Budget Est.', value: '—', unit: '€',  note: 'Pending data' },
      { label: 'EU Grant Potential', value: '—', unit: '%', note: 'ERDF / Cohesion · pending' },
      { label: 'Municipal Alloc.',   value: '—', unit: '€', note: 'Budget year · pending' },
      { label: 'Private Investment', value: '—', unit: '€', note: 'PPP potential · pending' },
      { label: 'Subsidy Index',      value: '—', unit: '',  note: 'Score · pending' },
    ],
  },
];

export function DesignerPanel({ hasOrigin }) {
  const [open, setOpen] = useState({ environmental: true, geographical: false, ownership: false, funding: false });

  const toggle = (id) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  if (!hasOrigin) {
    return (
      <div style={S.panel}>
        <span style={S.hint}>Click on the ground to select a location</span>
        <span style={S.sub}>Environmental, geographical, ownership and funding data will appear here</span>
      </div>
    );
  }

  return (
    <div style={S.panel}>
      <div style={S.panelTitle}>TECHNICAL DATA</div>
      {SECTIONS.map((sec, si) => (
        <div key={sec.id}>
          {si > 0 && <div style={S.divider} />}
          <div style={S.secHeader} onClick={() => toggle(sec.id)}>
            <div style={S.secHeaderLeft}>
              <span style={{ color: ACCENT + 'cc' }}>{sec.icon}</span>
              <span style={S.secLabel}>{sec.label.toUpperCase()}</span>
            </div>
            <span style={{ ...S.chevron, transform: open[sec.id] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
          </div>
          {open[sec.id] && (
            <div style={S.fieldGrid}>
              {sec.fields.map((f, i) => (
                <div key={i} style={S.field}>
                  <span style={S.fieldLabel}>{f.label}</span>
                  <span style={S.fieldValue}>
                    {f.value}
                    {f.unit && <span style={S.fieldUnit}> {f.unit}</span>}
                  </span>
                  <span style={S.fieldNote}>{f.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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
    pointerEvents: 'none',
    zIndex: 10,
    minWidth: 520,
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
  panelTitle: {
    fontSize: 9,
    letterSpacing: '0.14em',
    color: ACCENT + 'aa',
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.07)',
    margin: '6px 0',
  },
  secHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    pointerEvents: 'all',
    marginBottom: 4,
  },
  secHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  secLabel: {
    fontSize: 9,
    letterSpacing: '0.12em',
    color: '#667',
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 12,
    color: '#444',
    transition: 'transform 0.2s',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 12px',
    paddingBottom: 2,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    padding: '4px 6px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 5,
    border: '1px solid rgba(255,255,255,0.04)',
  },
  fieldLabel: {
    fontSize: 8,
    color: '#556',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 13,
    color: '#889',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  fieldUnit: {
    fontSize: 9,
    color: '#556',
  },
  fieldNote: {
    fontSize: 8,
    color: '#445',
    fontStyle: 'italic',
  },
};
