import { useState } from 'react';
import { useWeatherData } from '../useWeatherData';

const ACCENT = '#a855f7';

// ── Icons ──────────────────────────────────────────────────────────────────
const ICONS = {
  environmental: (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2 C5 5 5 11 8 14" />
      <path d="M2 8 L14 8" />
    </svg>
  ),
  geographical: (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2 C6 2 4 5 4 8 C4 12 8 14 8 14 C8 14 12 12 12 8 C12 5 10 2 8 2 Z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  ownership: (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7 V5 C5 3 11 3 11 5 V7" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  funding: (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4 L8 5 M8 11 L8 12" />
      <path d="M5.5 6.5 C5.5 5 10.5 5 10.5 7 C10.5 9 5.5 9 5.5 11 C5.5 13 10.5 13 10.5 11.5" />
    </svg>
  ),
};

// ── Static placeholder sections (ownership, funding) ──────────────────────
const STATIC_SECTIONS = [
  {
    id: 'ownership',
    label: 'Ownership',
    fields: [
      { label: 'Cadastral ID',   value: '—', unit: '',  note: 'Pending data' },
      { label: 'Owner Type',     value: '—', unit: '',  note: 'Public / private · pending' },
      { label: 'Tenure',         value: '—', unit: '',  note: 'Freehold / leasehold · pending' },
      { label: 'Acquisition',    value: '—', unit: '',  note: 'Status · pending' },
      { label: 'Last Transfer',  value: '—', unit: '',  note: 'Year · pending' },
    ],
  },
  {
    id: 'funding',
    label: 'Funding',
    fields: [
      { label: 'Total Budget Est.',  value: '—', unit: '€',  note: 'Pending data' },
      { label: 'EU Grant Potential', value: '—', unit: '%',  note: 'ERDF / Cohesion · pending' },
      { label: 'Municipal Alloc.',   value: '—', unit: '€',  note: 'Budget year · pending' },
      { label: 'Private Investment', value: '—', unit: '€',  note: 'PPP potential · pending' },
      { label: 'Subsidy Index',      value: '—', unit: '',   note: 'Score · pending' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export function DesignerPanel({ hasOrigin }) {
  const { weather, loading: wLoading } = useWeatherData();
  const [open, setOpen] = useState({
    environmental: true,
    geographical: false,
    ownership: false,
    funding: false,
  });

  const toggle = (id) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  // Build live fields from weather data
  const envFields = [
    {
      label: 'Solar Radiation',
      value: weather ? weather.solarPerDay : '…',
      unit: 'kWh/m²/day',
      note: weather ? `${weather.forecastDays}-day avg · Open-Meteo` : 'loading…',
      live: true,
    },
    {
      label: 'Wind Speed (avg)',
      value: weather ? weather.windAvg : '…',
      unit: 'km/h',
      note: weather ? `max ${weather.windMax} km/h · Open-Meteo` : 'loading…',
      live: true,
    },
    {
      label: 'Wind Speed (max)',
      value: weather ? weather.windMax : '…',
      unit: 'km/h',
      note: weather ? `${weather.forecastDays}-day forecast` : 'loading…',
      live: true,
    },
    {
      label: 'Temperature (avg)',
      value: weather ? weather.tempAvg : '…',
      unit: '°C',
      note: weather ? `${weather.tempMin}° – ${weather.tempMax}° range` : 'loading…',
      live: true,
    },
    {
      label: 'Precipitation',
      value: weather ? weather.precipPerDay : '…',
      unit: 'h/day',
      note: weather ? `Rain hours · ${weather.forecastDays}-day avg` : 'loading…',
      live: true,
    },
    {
      label: 'Air Quality Index',
      value: '—',
      unit: 'AQI',
      note: 'WHO · pending data',
      live: false,
    },
    {
      label: 'Noise Level',
      value: '—',
      unit: 'dB(A)',
      note: 'Day avg · pending data',
      live: false,
    },
    {
      label: 'Green Coverage',
      value: '—',
      unit: '%',
      note: '300 m radius · pending',
      live: false,
    },
  ];

  const geoFields = [
    {
      label: 'Coordinates',
      value: '50.975 / 11.325',
      unit: '',
      note: 'WGS 84 · Weimar centre',
      live: true,
    },
    {
      label: 'Elevation',
      value: weather ? `${weather.elevation}` : '…',
      unit: 'm a.s.l.',
      note: weather ? 'Open-Meteo DEM' : 'loading…',
      live: true,
    },
    { label: 'Parcel Area',  value: '—', unit: 'm²', note: 'Cadastre · pending', live: false },
    { label: 'Slope',        value: '—', unit: '°',  note: 'Average · pending',  live: false },
    { label: 'Flood Zone',   value: '—', unit: '',   note: 'Risk class · pending', live: false },
  ];

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
      <div style={S.panelTitle}>
        TECHNICAL DATA
        {weather && (
          <span style={S.fetchNote}>· live weather as of {weather.fetchedAt}</span>
        )}
      </div>

      {/* Environmental */}
      <Section id="environmental" open={open} toggle={toggle} fields={envFields} loading={wLoading} />

      <div style={S.divider} />

      {/* Geographical */}
      <Section id="geographical" open={open} toggle={toggle} fields={geoFields} loading={wLoading} />

      {/* Ownership + Funding (static) */}
      {STATIC_SECTIONS.map(sec => (
        <div key={sec.id}>
          <div style={S.divider} />
          <Section id={sec.id} open={open} toggle={toggle} fields={sec.fields} loading={false} />
        </div>
      ))}
    </div>
  );
}

function Section({ id, open, toggle, fields, loading }) {
  const label = id.charAt(0).toUpperCase() + id.slice(1);
  return (
    <>
      <div style={S.secHeader} onClick={() => toggle(id)}>
        <div style={S.secHeaderLeft}>
          <span style={{ color: ACCENT + 'cc' }}>{ICONS[id]}</span>
          <span style={S.secLabel}>{label.toUpperCase()}</span>
        </div>
        <span style={{ ...S.chevron, transform: open[id] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
      </div>
      {open[id] && (
        <div style={S.fieldGrid}>
          {fields.map((f, i) => (
            <Field key={i} {...f} loading={loading && f.live} />
          ))}
        </div>
      )}
    </>
  );
}

function Field({ label, value, unit, note, loading }) {
  return (
    <div style={{ ...S.field, borderColor: loading ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)' }}>
      <span style={S.fieldLabel}>{label}</span>
      <span style={S.fieldValue}>
        {loading ? <span style={S.loadingDot}>·  ·  ·</span> : value}
        {!loading && unit && <span style={S.fieldUnit}> {unit}</span>}
      </span>
      <span style={S.fieldNote}>{note}</span>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
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
  fetchNote: {
    fontSize: 8,
    color: '#445',
    letterSpacing: '0.04em',
    textTransform: 'none',
    fontStyle: 'italic',
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
    border: '1px solid',
    transition: 'border-color 0.3s',
  },
  fieldLabel: {
    fontSize: 8,
    color: '#556',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 13,
    color: '#aab',
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
  loadingDot: {
    fontSize: 10,
    color: '#445',
    letterSpacing: '0.2em',
  },
};
