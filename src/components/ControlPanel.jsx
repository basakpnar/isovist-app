import { useState } from 'react';

const PRESETS = {
  shaded: {
    dark:  { building: '#e8e0d0', ground: '#2e2a25', sky: '#1a1a2e', road: '#4a4540' },
    light: { building: '#f0ebe4', ground: '#d4cfc8', sky: '#dfe4ec', road: '#b8b0a5' },
  },
  blueprint: {
    dark:  { building: '#00e5ff', ground: '#0d1f3c', sky: '#060e1f', road: '#1a4a7a' },
    light: { building: '#0055cc', ground: '#b8cce4', sky: '#d6e4f5', road: '#6699cc' },
  },
  footprint: {
    dark:  { building: '#4a4a6a', ground: '#1e1e2e', sky: '#12121e', road: '#2a2a40' },
    light: { building: '#9090b8', ground: '#e8e6f0', sky: '#f0eef8', road: '#c0bcd8' },
  },
};

export function ControlPanel({ settings, onChange, role }) {
  const [collapsed, setCollapsed] = useState(false);

  function setMode(viewMode) {
    const colors = PRESETS[viewMode][settings.theme];
    onChange({ ...settings, viewMode, ...colors });
  }

  function setTheme(theme) {
    const colors = PRESETS[settings.viewMode][theme];
    onChange({ ...settings, theme, ...colors });
  }

  function setColor(key, value) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header} onClick={() => setCollapsed(!collapsed)}>
        <span style={styles.title}>SETTINGS</span>
        <span style={{ ...styles.chevron, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▾</span>
      </div>

      {!collapsed && (
        <div style={styles.body}>
          {/* View Mode */}
          <Section label="View Mode">
            <ToggleGroup
              options={role === 'stakeholder'
                ? [{ value: 'footprint', label: 'Footprint' }, { value: 'shaded', label: 'Shaded' }]
                : [{ value: 'shaded', label: 'Shaded' }, { value: 'blueprint', label: 'Blueprint' }, { value: 'footprint', label: 'Footprint' }]
              }
              value={settings.viewMode}
              onChange={setMode}
            />
          </Section>

          {/* Theme */}
          <Section label="Theme">
            <ToggleGroup
              options={[
                { value: 'dark',  label: '● Dark'  },
                { value: 'light', label: '○ Light' },
              ]}
              value={settings.theme}
              onChange={setTheme}
            />
          </Section>

          {/* Color Controls */}
          <Section label="Colors">
            <ColorRow label="Buildings" value={settings.building} onChange={(v) => setColor('building', v)} />
            <ColorRow label="Ground"    value={settings.ground}   onChange={(v) => setColor('ground', v)}   />
            <ColorRow label="Sky"       value={settings.sky}      onChange={(v) => setColor('sky', v)}      />
            <ColorRow label="Roads"     value={settings.road}     onChange={(v) => setColor('road', v)}     />
          </Section>

          {/* Reset */}
          <button
            style={styles.resetBtn}
            onClick={() => onChange({ ...settings, ...PRESETS[settings.viewMode][settings.theme] })}
          >
            Reset colors
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionLabel}>{label}</div>
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={styles.toggleGroup}>
      {options.map((opt) => (
        <button
          key={opt.value}
          style={{
            ...styles.toggleBtn,
            ...(value === opt.value ? styles.toggleBtnActive : {}),
          }}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={styles.colorRow}>
      <span style={styles.colorLabel}>{label}</span>
      <div style={styles.colorRight}>
        <div style={{ ...styles.colorSwatch, background: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.colorInput}
          title={value}
        />
      </div>
    </div>
  );
}

export function getDefaultSettings() {
  return { viewMode: 'shaded', theme: 'dark', ...PRESETS.shaded.dark };
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  panel: {
    width: 220,
    background: 'rgba(10,10,20,0.82)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#ccc',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 12,
    backdropFilter: 'blur(8px)',
    userSelect: 'none',
    zIndex: 10,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  title: {
    fontWeight: 600,
    letterSpacing: '0.1em',
    fontSize: 11,
    color: '#fff',
  },
  chevron: {
    fontSize: 14,
    transition: 'transform 0.2s',
    color: '#888',
  },
  body: {
    padding: '8px 0 12px',
  },
  section: {
    padding: '8px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '0.12em',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  toggleGroup: {
    display: 'flex',
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: '5px 4px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 5,
    color: '#aaa',
    cursor: 'pointer',
    fontSize: 11,
    transition: 'all 0.15s',
  },
  toggleBtnActive: {
    background: 'rgba(100,160,255,0.25)',
    border: '1px solid rgba(100,160,255,0.5)',
    color: '#fff',
  },
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  colorLabel: {
    color: '#aaa',
    fontSize: 11,
  },
  colorRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.15)',
    pointerEvents: 'none',
  },
  colorInput: {
    width: 28,
    height: 20,
    padding: 0,
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    background: 'transparent',
  },
  resetBtn: {
    margin: '8px 14px 0',
    width: 'calc(100% - 28px)',
    padding: '5px 0',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 5,
    color: '#888',
    cursor: 'pointer',
    fontSize: 11,
  },
};
