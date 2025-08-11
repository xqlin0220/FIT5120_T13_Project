/**
 * @fileoverview
 * Utility functions for working with public transport stops.
 *
 * Features:
 *  - Load transit stops from a GeoJSON file
 *  - Calculate distance between two points using Haversine formula
 *  - Find the nearest transit stop to a given location
 *  - Classify stop proximity into categories (green/yellow/red/grey)
 *
 * Dependencies:
 *  - Node.js `fs` and `path` modules
 *
 * Author: [Your Name]
 * Date: [YYYY-MM-DD]
 */

import fs from 'fs';
import path from 'path';

/** Earth radius in meters */
const R = 6371000;
/**
 * Converts degrees to radians.
 * @param {number} d - Degrees
 * @returns {number} Radians
 */
const toRad = d => (d * Math.PI) / 180;

/**
 * Calculates the great-circle distance between two coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function haversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Array to store loaded transit stops */
let STOPS = [];
/** Cache mapping "lat,lon" strings to nearest stop data for quick lookups */
const CACHE = new Map();

/**
 * Loads transit stops from a GeoJSON file into memory.
 * @param {string} filePath - Path to the GeoJSON file (relative or absolute)
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

      // determine the mode of transport
      const mode =
        props.mode ||
        props.route_type ||
        props.transport ||
        props.public_transport ||
        'other';

      return { id: props.stop_id || idx, name, mode, lat, lon };
    })
    // filter out invalid stops
    .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lon));

  console.log(`Loaded ${STOPS.length} transit stops from ${abs}`);
}

/**
 * Finds the nearest stop to a given latitude/longitude.
 * Uses caching for repeated queries to the same coordinates.
 * @param {number} lat - Latitude of the location
 * @param {number} lon - Longitude of the location
 * @returns {{id:string|number,name:string,mode:string,lat:number,lon:number,distance_m:number} | null}
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
 * Classifies the proximity to a stop based on distance.
 * @param {number} meters - Distance in meters
 * @returns {{label:string, color:'green'|'yellow'|'red'|'grey'}}
 */
export function classifyGreen(meters) {
  if (!Number.isFinite(meters)) return { label: 'Unknown', color: 'grey' };
  if (meters <= 50) return { label: '😀', color: 'green' };
  if (meters <= 600) return { label: '😐', color: 'yellow' };
  return { label: '😭', color: 'red' };
}
