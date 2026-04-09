const ROLES = [
  {
    id: 'observer',
    label: 'Observer',
    tagline: 'Pedestrian · Spatial Experience',
    description:
      "Explore the city through a pedestrian\u2019s eyes. Understand what is visible from any point, how far your gaze reaches, and how the built environment shapes your field of view.",
    icon: (
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16 C8 6 24 6 30 16 C24 26 8 26 2 16 Z" />
        <circle cx="16" cy="16" r="5" />
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
    accent: '#4080ff',
    layers: ['Isovist field of view', 'Visibility range', 'Direction & periphery'],
  },
  {
    id: 'stakeholder',
    label: 'Stakeholder',
    tagline: 'Community · Land Use & Public Space',
    description:
      'Evaluate urban land use, interaction potential, and access to public space. Understand which areas are rich in activity and how proximity to parks and squares varies across the city.',
    icon: (
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="18" width="6" height="10" rx="1" />
        <rect x="13" y="12" width="6" height="16" rx="1" />
        <rect x="22" y="6" width="6" height="22" rx="1" />
        <path d="M2 28 L30 28" strokeWidth="1.4" />
      </svg>
    ),
    accent: '#20df80',
    layers: ['Interaction heatmap', 'Public spaces proximity', 'Land use classification'],
  },
  {
    id: 'designer',
    label: 'Designer',
    tagline: 'Urban Planner · Full Analysis',
    description:
      'Access every layer and parameter of the analysis. Adjust isovist settings, view modes, and export data. A full toolkit for spatial planning and urban design decision-making.',
    icon: (
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 26 L14 10 L18 18 L22 12 L26 26" />
        <circle cx="14" cy="10" r="2" fill="currentColor" stroke="none" />
        <circle cx="22" cy="12" r="2" fill="currentColor" stroke="none" />
        <path d="M2 28 L30 28" strokeWidth="1.4" />
        <path d="M4 4 L4 28" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      </svg>
    ),
    accent: '#a855f7',
    layers: ['All layers', 'Parameter controls', 'View mode & export'],
  },
];

export { ROLES };

export function RoleSelector({ onSelect }) {
  return (
    <div style={S.overlay}>
      <div style={S.inner}>
        <div style={S.header}>
          <div style={S.appName}>PROXIVIST</div>
          <div style={S.appSub}>Isovist · Visibility · Land Use &amp; Function · Weimar</div>
        </div>

        <div style={S.prompt}>Choose your perspective</div>

        <div style={S.cards}>
          {ROLES.map((role) => (
            <RoleCard key={role.id} role={role} onSelect={onSelect} />
          ))}
        </div>

        <div style={S.footer}>2 × 2 km · OpenStreetMap · Weimar, Germany</div>
      </div>
    </div>
  );
}

function RoleCard({ role, onSelect }) {
  return (
    <button style={S.card} onClick={() => onSelect(role.id)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = role.accent + '88';
        e.currentTarget.style.background  = 'rgba(255,255,255,0.05)';
        e.currentTarget.querySelector('.accent-line').style.width = '100%';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background  = 'rgba(255,255,255,0.02)';
        e.currentTarget.querySelector('.accent-line').style.width = '0%';
      }}
    >
      {/* accent underline */}
      <div className="accent-line" style={{ ...S.accentLine, background: role.accent }} />

      <div style={{ ...S.iconWrap, color: role.accent }}>{role.icon}</div>

      <div style={S.roleLabel}>{role.label}</div>
      <div style={{ ...S.roleTagline, color: role.accent + 'cc' }}>{role.tagline}</div>

      <p style={S.roleDesc}>{role.description}</p>

      <ul style={S.layerList}>
        {role.layers.map((l) => (
          <li key={l} style={S.layerItem}>
            <span style={{ ...S.layerDot, background: role.accent }} />
            {l}
          </li>
        ))}
      </ul>

      <div style={{ ...S.cta, color: role.accent }}>Enter →</div>
    </button>
  );
}

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 40%, #0d0d22 0%, #060610 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'system-ui, sans-serif',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
    padding: '0 24px',
    maxWidth: 960,
    width: '100%',
  },
  header: {
    textAlign: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: '0.22em',
    color: '#fff',
    lineHeight: 1,
  },
  appSub: {
    fontSize: 11,
    letterSpacing: '0.1em',
    color: '#7ab',
    marginTop: 8,
  },
  prompt: {
    fontSize: 13,
    color: '#556',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  cards: {
    display: 'flex',
    gap: 16,
    width: '100%',
  },
  card: {
    flex: 1,
    position: 'relative',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '28px 24px 22px',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#ccc',
    transition: 'border-color 0.2s, background 0.2s',
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: '0%',
    borderRadius: 1,
    transition: 'width 0.3s ease',
  },
  iconWrap: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#fff',
    marginBottom: 4,
  },
  roleTagline: {
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  roleDesc: {
    fontSize: 12,
    color: '#778',
    lineHeight: 1.65,
    margin: '0 0 18px',
  },
  layerList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  layerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#99a',
  },
  layerDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    flexShrink: 0,
    opacity: 0.7,
  },
  cta: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.06em',
  },
  footer: {
    fontSize: 10,
    color: '#334',
    letterSpacing: '0.08em',
  },
};
