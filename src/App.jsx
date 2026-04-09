import { useEffect, useRef, useState } from 'react';
import { useOSMData } from './useOSMData';
import { Scene } from './components/Scene';
import { ControlPanel, getDefaultSettings } from './components/ControlPanel';
import { ViewerParamsPanel } from './components/ViewerParamsPanel';
import { ExportPanel, decodeShareHash } from './components/ExportPanel';
import { InfoPanel } from './components/InfoPanel';
import { StakeholderPanel } from './components/StakeholderPanel';
import { DesignerPanel } from './components/DesignerPanel';
import { RoleSelector, ROLES } from './components/RoleSelector';
import { DEFAULT_VIEWER_PARAMS } from './viewerParams';
import './index.css';

export default function App() {
  const { data, loading, error } = useOSMData();
  const [settings, setSettings]         = useState(getDefaultSettings);
  const [viewerParams, setViewerParams] = useState(DEFAULT_VIEWER_PARAMS);
  const [origin, setOrigin]             = useState(null);
  const [role, setRole]                 = useState(null);   // null = selector screen
  const glRef = useRef(null);

  const roleMeta = ROLES.find(r => r.id === role);

  // Observer sees heatmap + spaces; stakeholder sees spaces (for footprint/area layer); designer has own panel
  const canHeatmap = role === 'observer';
  const canSpaces  = role === 'observer' || role === 'stakeholder';
  const [showHeatmap, setShowHeatmap]             = useState(true);
  const [showSpaces,  setShowSpaces]              = useState(true);
  const [showBuildingFootprints, setShowBuildingFootprints] = useState(false);
  const [showSpaceAreas,         setShowSpaceAreas]         = useState(false);

  // Restore state from a shared link on first load
  useEffect(() => {
    decodeShareHash(window.location.hash, setSettings, setViewerParams);
  }, []);

  if (!role) return <RoleSelector onSelect={setRole} />;

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
        showHeatmap={canHeatmap && showHeatmap}
        showSpaces={canSpaces && showSpaces}
        showBuildingFootprints={role === 'stakeholder' && showBuildingFootprints}
        showSpaceAreas={role === 'stakeholder' && showSpaceAreas}
      />

      {/* Right-side panels per role */}
      <div style={styles.panels}>
        {role === 'observer' && <ViewerParamsPanel params={viewerParams} onChange={setViewerParams} />}
        {role === 'designer' && <ControlPanel settings={settings} onChange={setSettings} />}
      </div>
      {role === 'designer' && <ExportPanel settings={settings} viewerParams={viewerParams} glRef={glRef} />}

      {/* Bottom info panel — different per role */}
      {role === 'observer' && (
        <InfoPanel
          viewerParams={viewerParams}
          hasOrigin={!!origin}
          showHeatmap={showHeatmap}
          showSpaces={showSpaces}
          onToggleHeatmap={() => setShowHeatmap(v => !v)}
          onToggleSpaces={() => setShowSpaces(v => !v)}
          role={role}
        />
      )}
      {role === 'stakeholder' && (
        <StakeholderPanel
          hasOrigin={!!origin}
          showBuildingFootprints={showBuildingFootprints}
          showSpaceAreas={showSpaceAreas}
          onToggleBuildingFootprints={() => setShowBuildingFootprints(v => !v)}
          onToggleSpaceAreas={() => setShowSpaceAreas(v => !v)}
        />
      )}
      {role === 'designer'    && <DesignerPanel    hasOrigin={!!origin} />}

      <div style={styles.title}>
        <div style={styles.titleMain}>PROXIVIST</div>
        <div style={styles.titleSub}>Isovist · Visibility · Land Use &amp; Function · Weimar</div>
        <div style={styles.titleMeta}>2 × 2 km · OSM</div>
        {/* Role badge + switch */}
        <div style={styles.roleBadgeRow}>
          <span style={{ ...styles.roleBadge, borderColor: roleMeta.accent + '66', color: roleMeta.accent }}>
            {roleMeta.label.toUpperCase()}
          </span>
          <button style={styles.switchBtn} onClick={() => { setRole(null); setOrigin(null); }}>
            Switch role
          </button>
        </div>
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
  roleBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    fontSize: 8,
    letterSpacing: '0.14em',
    border: '1px solid',
    borderRadius: 4,
    padding: '2px 6px',
    fontFamily: 'system-ui, sans-serif',
  },
  switchBtn: {
    fontSize: 9,
    color: '#556',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    letterSpacing: '0.06em',
    textDecoration: 'underline',
    fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'all',
  },
};
