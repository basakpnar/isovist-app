import { useState } from 'react';
import { DEFAULT_VIEWER_PARAMS } from '../viewerParams';

// Compact-encode only the values (not metadata) so the URL stays short
function encodeState(settings, viewerParams) {
  const compact = {
    s: settings,
    v: {
      lookDirection: viewerParams.lookDirection,
      vision:       Object.fromEntries(Object.entries(viewerParams.vision).map(([k, p]) => [k, p.value])),
      physical:     Object.fromEntries(Object.entries(viewerParams.physical).map(([k, p]) => [k, p.value])),
      dynamicState: Object.fromEntries(Object.entries(viewerParams.dynamicState).map(([k, p]) => [k, p.value])),
    },
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(compact))));
}

// Restore viewerParams from compact values, merging into DEFAULT_VIEWER_PARAMS metadata
function decodeViewerParams(compactV) {
  const defaults = DEFAULT_VIEWER_PARAMS;
  const out = { ...defaults, lookDirection: compactV.lookDirection ?? defaults.lookDirection };
  for (const group of ['vision', 'physical', 'dynamicState']) {
    if (!compactV[group]) continue;
    out[group] = { ...defaults[group] };
    for (const [key, val] of Object.entries(compactV[group])) {
      if (defaults[group][key]) out[group][key] = { ...defaults[group][key], value: val };
    }
  }
  return out;
}

export function decodeShareHash(hash, setSettings, setViewerParams) {
  if (!hash.startsWith('#share=')) return;
  try {
    const json = decodeURIComponent(escape(atob(hash.slice(7))));
    const { s, v } = JSON.parse(json);
    if (s) setSettings(s);
    if (v) setViewerParams(decodeViewerParams(v));
  } catch {
    // ignore malformed hash
  }
}

export function ExportPanel({ settings, viewerParams, glRef }) {
  const [toast, setToast] = useState(null); // 'screenshot' | 'json' | 'link' | null

  function flash(key) {
    setToast(key);
    setTimeout(() => setToast(null), 2200);
  }

  function handleScreenshot() {
    const gl = glRef?.current;
    if (!gl) return;
    try {
      // Force a render so the buffer is fresh
      const dataUrl = gl.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `isovist-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.png`;
      a.click();
      flash('screenshot');
    } catch (e) {
      console.error('Screenshot failed:', e);
    }
  }

  function handleSaveJSON() {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      viewerParams: {
        lookDirection: viewerParams.lookDirection,
        vision:       Object.fromEntries(Object.entries(viewerParams.vision).map(([k, p]) => [k, p.value])),
        physical:     Object.fromEntries(Object.entries(viewerParams.physical).map(([k, p]) => [k, p.value])),
        dynamicState: Object.fromEntries(Object.entries(viewerParams.dynamicState).map(([k, p]) => [k, p.value])),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `isovist-params-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('json');
  }

  function handleCopyLink() {
    const encoded = encodeState(settings, viewerParams);
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    navigator.clipboard.writeText(url).then(() => flash('link'));
  }

  return (
    <div style={S.panel}>
      <ActionBtn
        label="Screenshot"
        icon="⬇"
        done={toast === 'screenshot'}
        doneLabel="Saved!"
        onClick={handleScreenshot}
      />
      <div style={S.divider} />
      <ActionBtn
        label="Save JSON"
        icon="{ }"
        done={toast === 'json'}
        doneLabel="Saved!"
        onClick={handleSaveJSON}
      />
      <div style={S.divider} />
      <ActionBtn
        label="Copy Link"
        icon="⬡"
        done={toast === 'link'}
        doneLabel="Copied!"
        onClick={handleCopyLink}
      />
    </div>
  );
}

function ActionBtn({ label, icon, done, doneLabel, onClick }) {
  return (
    <button style={{ ...S.btn, ...(done ? S.btnDone : {}) }} onClick={onClick} title={label}>
      <span style={S.icon}>{done ? '✓' : icon}</span>
      <span style={S.label}>{done ? doneLabel : label}</span>
    </button>
  );
}

const S = {
  panel: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    background: 'rgba(10,10,20,0.82)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    backdropFilter: 'blur(8px)',
    overflow: 'hidden',
    zIndex: 10,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: 'transparent',
    border: 'none',
    color: '#bbb',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    transition: 'color 0.15s, background 0.15s',
    whiteSpace: 'nowrap',
  },
  btnDone: {
    color: '#66cc88',
  },
  icon: {
    fontSize: 13,
    opacity: 0.8,
  },
  label: {
    fontSize: 11,
    letterSpacing: '0.03em',
  },
  divider: {
    width: 1,
    height: 20,
    background: 'rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
};
