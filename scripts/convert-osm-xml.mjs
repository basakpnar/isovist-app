// Converts OSM XML → Overpass-compatible JSON
// Usage: node scripts/convert-osm-xml.mjs <input.xml> <output.json>
import { readFileSync, writeFileSync } from 'fs';

const [,, inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/convert-osm-xml.mjs <input.xml> <output.json>');
  process.exit(1);
}

const xml = readFileSync(inputPath, 'utf8');
const elements = [];

// Parse nodes
for (const m of xml.matchAll(/<node\s+([^>]+)\/>/g)) {
  const attrs = parseAttrs(m[1]);
  if (attrs.id && attrs.lat && attrs.lon) {
    elements.push({ type: 'node', id: +attrs.id, lat: +attrs.lat, lon: +attrs.lon });
  }
}

// Parse ways
for (const m of xml.matchAll(/<way\s([^>]+)>([\s\S]*?)<\/way>/g)) {
  const attrs = parseAttrs(m[1]);
  const body = m[2];
  const nodes = [...body.matchAll(/<nd\s+ref="(\d+)"/g)].map(n => +n[1]);
  const tags = {};
  for (const t of body.matchAll(/<tag\s+k="([^"]+)"\s+v="([^"]+)"/g)) {
    tags[t[1]] = t[2];
  }
  if (attrs.id && nodes.length) {
    elements.push({ type: 'way', id: +attrs.id, nodes, tags });
  }
}

writeFileSync(outputPath, JSON.stringify({ elements }, null, 0));
console.log(`Written ${elements.length} elements to ${outputPath}`);

function parseAttrs(str) {
  const obj = {};
  for (const m of str.matchAll(/(\w+)="([^"]*)"/g)) obj[m[1]] = m[2];
  return obj;
}
