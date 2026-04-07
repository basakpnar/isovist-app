import { useEffect, useRef, useState } from 'react';
import { useOSMData } from './useOSMData';
import { Scene } from './components/Scene';
import { ControlPanel, getDefaultSettings } from './components/ControlPanel';
import { ViewerParamsPanel } from './components/ViewerParamsPanel';
import { ExportPanel, decodeShareHash } from './components/ExportPanel';
import { InfoPanel } from './components/InfoPanel';
import { DEFAULT_VIEWER_PARAMS } from './viewerParams';
import './index.css';

export default function App() {
  const { data, loading, error } = useOSMData();
  const [settings, setSettings]         = useState(getDefaultSettings);
  const [viewerParams, setViewerParams] = useState(DEFAULT_VIEWER_PARAMS);
  const [origin, setOrigin]             = useState(null);
  const glRef = useRef(null);

  // Restore state from a shared link on first load
  useEffect(() => {
    decodeShareHash(window.location.hash, setSettings, setViewerParams);
  }, []);

  if (error) {
    return (
      <div style={styles.overlay}>
        <p style={{ color: '#ff6b6b' }}>Failed to load OSM data: {error}</p>
        <p style={{ color: '#aaa', fontSize: 13 }}>Check your network connection and try again.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.spinner} />
        <p style={{ color: '#ccc', marginTop: 16 }}>Loading Weimar city data…</p>
        <p style={{ color: '#888', fontSize: 12 }}>Fetching buildings & roads from OpenStreetMap</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene
        buildings={data.buildings}
        roads={data.roads}
        publicSpaces={data.publicSpaces}
        settings={settings}
        viewerParams={viewerParams}
        glRef={glRef}
        onOriginChange={setOrigin}
      />

      <div style={styles.panels}>
        <ViewerParamsPanel params={viewerParams} onChange={setViewerParams} />
        <ControlPanel settings={settings} onChange={setSettings} />
      </div>

      <ExportPanel settings={settings} viewerParams={viewerParams} glRef={glRef} />

      <InfoPanel viewerParams={viewerParams} hasOrigin={!!origin} />

      <div style={styles.title}>
        <div style={styles.titleMain}>PROXIVIST</div>
        <div style={styles.titleSub}>Isovist · Visibility · Land Use &amp; Function · Weimar</div>
        <div style={styles.titleMeta}>2 × 2 km · OSM</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a2e',
    color: '#ccc',
    fontFamily: 'system-ui, sans-serif',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #333',
    borderTop: '4px solid #4488ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  panels: {
    position: 'absolute',
    top: 16,
    right: 16,
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    maxHeight: 'calc(100vh - 32px)',
  },
  title: {
    position: 'absolute',
    top: 16,
    left: 16,
    background: 'rgba(10,10,20,0.82)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    backdropFilter: 'blur(8px)',
    padding: '10px 16px',
    pointerEvents: 'none',
  },
  titleMain: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#fff',
    lineHeight: 1,
  },
  titleSub: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: 10,
    letterSpacing: '0.08em',
    color: '#7ab',
    marginTop: 4,
  },
  titleMeta: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#445',
    marginTop: 3,
    letterSpacing: '0.06em',
  },
};
