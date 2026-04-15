# PROXIVIST

An interactive 3D urban visibility and spatial analysis platform for Weimar, Germany. PROXIVIST lets you explore what is visible from any point in an urban environment by computing **isovist polygons** — the exact area a person can see from a given location, accounting for building obstructions.

---

## What It Does

Click anywhere on the map to place an observer. The app instantly computes the visible area using a ray-casting algorithm and renders it as a 3D overlay. Parameters like field of view, view range, eye height, age, fatigue, and stress levels all affect the computed visibility region in physically meaningful ways.

The app has three role-based modes, each exposing a different analytical lens:

| Role | Focus |
|---|---|
| **Observer** | Pedestrian experience — visibility, field of view, peripheral vision, physical state |
| **Stakeholder** | Community analyst — land use, public space proximity, interaction potential |
| **Designer** | Urban planner — all layers, export tools, environmental data, weather |

---

## Features

### Isovist Computation
- Ray-casting in 2D projected to 3D, with configurable ray count (up to 720 rays)
- Full 360° ring or directional cone with peripheral zone
- Affected by fatigue (reduces FOV up to 30%, range up to 20%), stress (reduces FOV up to 20%), and age presets

### Visualization Layers
- Isovist fill and outline
- Peripheral vision zone (lower-opacity outer ring)
- Interaction heatmap: buildings colored by use-type and proximity
- Public space proximity: parks and squares colored on a pink-to-purple gradient

### View Modes
- **Shaded** — 3D perspective with lighting and shadows
- **Blueprint** — 2D wireframe technical view
- **Footprint** — top-down 2D plan view

### Export (Designer role)
- PNG screenshot of current view
- JSON export of full session state
- Shareable URL with base64-encoded parameters

### Data Sources
- Building, road, and public space geometry from OpenStreetMap (`weimar-osm.json`)
- Real-time weather and elevation from [Open-Meteo](https://open-meteo.com/) (no API key required)

---

## Tech Stack

- **React 19** + **Vite** — UI and build tooling
- **Three.js** + **React Three Fiber** + **Drei** — 3D rendering and scene management
- **OpenStreetMap** data (pre-exported static JSON, no live queries)
- **Open-Meteo API** — free weather/elevation data

---

## Getting Started

**Prerequisites:** Node.js (18+)

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The dev server runs at `http://localhost:5173` by default.

---

## Project Structure

```
isovist-app/
├── public/
│   └── weimar-osm.json        # Pre-exported OSM data for Weimar
├── src/
│   ├── isovist.js             # Core ray-casting algorithm
│   ├── heatmap.js             # Color gradients and area calculations
│   ├── buildingInfo.js        # OSM building classification and icons
│   ├── viewerParams.js        # Viewer parameter models and modifiers
│   ├── useOSMData.js          # Hook for loading/parsing OSM data
│   ├── useWeatherData.js      # Hook for Open-Meteo integration
│   ├── App.jsx                # Root: role selection, state, panel routing
│   └── components/
│       ├── Scene.jsx          # Three.js Canvas and scene setup
│       ├── IsovistOverlay.jsx # 3D isovist geometry
│       ├── Buildings.jsx      # 3D building meshes with tooltips
│       ├── PublicSpaces.jsx   # Parks and squares with proximity coloring
│       ├── Roads.jsx          # Road ribbon geometry
│       ├── ViewerParamsPanel.jsx
│       ├── ControlPanel.jsx
│       ├── InfoPanel.jsx
│       ├── StakeholderPanel.jsx
│       ├── DesignerPanel.jsx
│       └── ExportPanel.jsx
└── vite.config.js
```

---

## How the Isovist Algorithm Works

1. Extract all building edge segments from OSM footprints.
2. Cast `N` rays (configurable, default 720) outward from the observer position, distributed across the configured field of view arc.
3. For each ray, find the nearest intersection with any building edge using parametric line-segment intersection.
4. If no intersection within `maxRadius`, clip the ray at `maxRadius`.
5. Collect the hit points into a polygon — this is the isovist.

The result is re-computed whenever the observer moves or any viewer parameter changes.

---

## Map Center

The scene is centered on Weimar, Germany at **50.9795°N, 11.3225°E**. Geographic coordinates from OSM are projected to metric scene coordinates (meters from center).

---

## Live Demo

Deployed to GitHub Pages: `https://basakpnar.github.io/isovist-app/`
