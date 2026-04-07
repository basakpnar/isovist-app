import { useState, useEffect } from 'react';

// Weimar center matches the bbox center used when fetching weimar-osm.json
const WEIMAR_CENTER = { lat: 50.9795, lon: 11.3225 };

export const CENTER = WEIMAR_CENTER;

// Convert geo coords to local scene coords (meters from center)
export function geoToScene(lat, lon) {
  const x = (lon - CENTER.lon) * (111320 * Math.cos((CENTER.lat * Math.PI) / 180));
  const z = -(lat - CENTER.lat) * 111320;
  return [x, z];
}

function classifyBuilding(tags) {
  const b = tags?.building ?? '';
  if (tags?.shop || tags?.amenity ||
      b === 'commercial' || b === 'retail' || b === 'kiosk') return 2.5;
  if (b === 'hotel')                                           return 2.2;
  if (b === 'office')                                         return 2.0;
  if (b === 'civic' || b === 'public' ||
      b === 'school' || b === 'university')                   return 1.5;
  if (b === 'apartments')                                     return 1.2;
  return 1.0;
}

function parseOSMData(data) {
  const nodes = {};
  for (const el of data.elements) {
    if (el.type === 'node') nodes[el.id] = { lat: el.lat, lon: el.lon };
  }

  const buildings = [];
  const roads = [];
  const publicSpaces = [];

  for (const el of data.elements) {
    if (el.type !== 'way') continue;
    const coords = el.nodes?.map((nid) => nodes[nid]).filter(Boolean);
    if (!coords || coords.length < 2) continue;

    const sceneCoords = coords.map((n) => geoToScene(n.lat, n.lon));
    const t = el.tags || {};

    const isPublicSpace =
      t.leisure === 'park' || t.leisure === 'garden' ||
      t.place === 'square' || t.landuse === 'recreation_ground' ||
      (t.highway === 'pedestrian' && t.area === 'yes');

    if (t.building) {
      const levels = parseInt(t['building:levels'] || t['height'] || '3', 10);
      const height = isNaN(levels) ? 9 : Math.min(levels * 3, 80);
      const interactionMultiplier = classifyBuilding(t);
      buildings.push({
        coords: sceneCoords, height, id: el.id, interactionMultiplier,
        info: {
          name:       t.name       || null,
          building:   t.building   || null,
          amenity:    t.amenity    || null,
          shop:       t.shop       || null,
          office:     t.office     || null,
          tourism:    t.tourism    || null,
          historic:   t.historic   || null,
          healthcare: t.healthcare || null,
          levels:     t['building:levels'] || null,
          street:     t['addr:street']     || null,
          number:     t['addr:housenumber']|| null,
        },
      });
    } else if (isPublicSpace && sceneCoords.length >= 3) {
      publicSpaces.push({
        coords: sceneCoords,
        name: t.name || null,
        type: t.leisure || t.place || t.landuse || t.highway,
        id: el.id,
      });
    } else if (t.highway) {
      roads.push({ coords: sceneCoords, type: t.highway, id: el.id });
    }
  }

  return { buildings, roads, publicSpaces };
}

export function useOSMData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/weimar-osm.json')
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load data file (HTTP ${r.status})`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(parseOSMData(json));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
