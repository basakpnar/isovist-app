import { useState } from 'react';
import { computeEffectiveParams } from '../viewerParams';

function setGroupValue(params, group, key, value) {
  return {
    ...params,
    [group]: { ...params[group], [key]: { ...params[group][key], value } },
  };
}

export function ViewerParamsPanel({ params, onChange }) {
  const [collapsed, setCollapsed] = useState(false);

  const ep = computeEffectiveParams(params);
  const v  = params.vision;

  function setVal(key, value) {
    onChange(setGroupValue(params, 'vision', key, value));
  }

  return (
    <div style={S.panel}>
      <div style={S.header} onClick={() => setCollapsed(!collapsed)}>
        <span>VIEWER PARAMS</span>
        <span style={{ ...S.chevron, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▾</span>
      </div>

      {!collapsed && (
        <div style={S.body}>
          {/* Look Direction */}
          <SliderRow
            label="Look Direction"
            value={params.lookDirection}
            min={0} max={360} step={1} unit="°"
            description="Gaze bearing — only applies when FOV < 360°"
            disabled={!ep.isDirectional}
            onChange={(val) => onChange({ ...params, lookDirection: val })}
          />

          {ep.isDirectional && (
            <div style={S.badge}>effective FOV {ep.fovH.toFixed(0)}° · range {ep.range.toFixed(0)} m</div>
          )}

          <div style={S.divider} />

          {/* Vision */}
          <SliderRow label="FOV Horizontal" value={v.fovHorizontal.value}
            min={v.fovHorizontal.min} max={v.fovHorizontal.max} step={1} unit="°"
            description={v.fovHorizontal.description}
            onChange={(val) => setVal('fovHorizontal', val)} />

          <SliderRow label="View Range" value={v.viewRange.value}
            min={v.viewRange.min} max={v.viewRange.max} step={1} unit="m"
            description={v.viewRange.description}
            onChange={(val) => setVal('viewRange', val)} />

          <SliderRow label="Visual Acuity" value={v.visualAcuity.value}
            min={v.visualAcuity.min} max={v.visualAcuity.max} step={0.05} unit=""
            description={v.visualAcuity.description}
            onChange={(val) => setVal('visualAcuity', val)} />

          <SliderRow label="Peripheral Angle" value={v.peripheralAngle.value}
            min={v.peripheralAngle.min} max={v.peripheralAngle.max} step={1} unit="°"
            description={v.peripheralAngle.description}
            onChange={(val) => setVal('peripheralAngle', val)} />

          <SelectRow label="Light Sensitivity" value={v.lightSensitivity.value}
            options={v.lightSensitivity.options}
            description={v.lightSensitivity.description}
            onChange={(val) => setVal('lightSensitivity', val)} />
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderRow({ label, value, min, max, step, unit, description, onChange, disabled }) {
  const displayVal = typeof value === 'number'
    ? (step < 0.1 ? value.toFixed(2) : step < 1 ? value.toFixed(1) : Math.round(value))
    : value;

  return (
    <div style={{ ...S.row, opacity: disabled ? 0.3 : 1 }}>
      <div style={S.rowTop}>
        <span style={S.label}>{label}</span>
        <span style={S.val}>{displayVal}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={S.slider}
      />
      {description && !disabled && (
        <div style={S.desc}>{description}</div>
      )}
    </div>
  );
}

function SelectRow({ label, value, options, description, onChange }) {
  return (
    <div style={S.row}>
      <div style={S.rowTop}>
        <span style={S.label}>{label}</span>
      </div>
      <div style={S.toggleGroup}>
        {options.map((opt) => (
          <button
            key={opt}
            style={{ ...S.toggleBtn, ...(value === opt ? S.toggleBtnActive : {}) }}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      {description && <div style={S.desc}>{description}</div>}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  panel: {
    width: 210,
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
    fontWeight: 600,
    letterSpacing: '0.1em',
    fontSize: 11,
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer',
  },
  chevron: {
    fontSize: 14,
    transition: 'transform 0.2s',
    color: '#888',
  },
  body: {
    padding: '10px 14px 12px',
  },
  badge: {
    fontSize: 10,
    color: '#4488ff',
    marginTop: -4,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.07)',
    margin: '8px 0 10px',
  },
  row: {
    marginBottom: 10,
  },
  rowTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: {
    fontSize: 11,
    color: '#bbb',
  },
  val: {
    fontSize: 11,
    color: '#ddd',
    fontVariantNumeric: 'tabular-nums',
  },
  slider: {
    width: '100%',
    height: 3,
    accentColor: '#4488ff',
    cursor: 'pointer',
  },
  toggleGroup: {
    display: 'flex',
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: '4px 2px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4,
    color: '#888',
    cursor: 'pointer',
    fontSize: 11,
  },
  toggleBtnActive: {
    background: 'rgba(100,160,255,0.2)',
    border: '1px solid rgba(100,160,255,0.45)',
    color: '#fff',
  },
  desc: {
    fontSize: 9,
    color: '#555',
    marginTop: 3,
    lineHeight: 1.4,
  },
};
