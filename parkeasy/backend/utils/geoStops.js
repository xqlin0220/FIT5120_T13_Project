
import fs from 'fs';
import path from 'path';

const R = 6371000;
const toRad = d => (d * Math.PI) / 180;

function haversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}


let STOPS = [];
// key = "lat,lon" → {stop, distance_m}
const CACHE = new Map();

/**
 * 加载 GeoJSON
 * @param {string} filePath
 */
export function initGeoStops(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const raw = fs.readFileSync(abs, 'utf8');
  const gj = JSON.parse(raw);

  STOPS = (gj.features || [])
    .filter(f => f?.geometry?.type === 'Point')
    .map((f, idx) => {
      const [lon, lat] = f.geometry.coordinates || [];
      const props = f.properties || {};

      const name =
        props.name ||
        props.stop_name ||
        props.title ||
        props.station_name ||
        `Stop #${idx + 1}`;

      // 交通方式（可选）
      const mode =
        props.mode ||
        props.route_type ||
        props.transport ||
        props.public_transport ||
        'other';

      return { id: props.stop_id || idx, name, mode, lat, lon };
    })
    // 过滤坐标完整的数据
    .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lon));

  console.log(`🚏 Loaded ${STOPS.length} transit stops from ${abs}`);
}

/**

 * @returns { {id,name,mode,lat,lon,distance_m} | null }
 */
export function nearestStop(lat, lon) {
  if (!STOPS.length) return null;
  const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  const cached = CACHE.get(key);
  if (cached) return cached;

  let best = null;
  let bestDist = Infinity;

  for (const s of STOPS) {
    const d = haversine(lat, lon, s.lat, s.lon);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }

  if (!best) return null;
  const withDist = { ...best, distance_m: Math.round(bestDist) };
  CACHE.set(key, withDist);
  return withDist;
}

/**

 * @param {number} meters
 * @returns {{label:string,color:'green'|'yellow'|'red'|'grey'}}
 */
export function classifyGreen(meters) {
  if (!Number.isFinite(meters)) return { label: 'Unknown', color: 'grey' };
  if (meters <= 50) return { label: '😀', color: 'green' };
  if (meters <= 600) return { label: '😐', color: 'yellow' };
  return { label: '😭', color: 'red' };
}
