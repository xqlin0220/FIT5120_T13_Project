/* eslint-env node */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Import helper functions for nearest transit stop and green classification
import { nearestStop, classifyGreen } from '../utils/geoStops.js';

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}


function to24h(label) {
  if (!label) return null;
  const [hStr, ampm] = label.split(' ');
  let h = parseInt(hStr, 10);
  const up = (ampm || '').toUpperCase();
  if (Number.isNaN(h)) return null;
  if (up === 'AM') {
    if (h === 12) h = 0;// 12 AM is midnight
  } else if (up === 'PM') {
    if (h !== 12) h += 12;// Add 12 for PM except 12 PM itself
  }
  return h; // 0..23
}


function annotateWithTransit(rows) {
  return (rows || []).map((r, i) => {
    let ns = null;
    let green = { label: 'Unknown', color: 'grey' };
    // If latitude/longitude are available, find nearest transit stop
    if (r.lat != null && r.lon != null) {
      ns = nearestStop(Number(r.lat), Number(r.lon)); 
      if (ns && Number.isFinite(ns.distance_m)) {
        green = classifyGreen(ns.distance_m);
      }
    }
    return {
      ...r,
      nearestStop: ns
        ? {
            id: ns.id,
            name: ns.name,
            mode: ns.mode,
            distance_m: ns.distance_m
          }
        : null,
      green
    };
  });
}

// Fetch parking recommendations based on filters (day, time, postcode).
export async function getRecommendations({ day = null, time = null, postcode = null }) {
  const hour = to24h(time);
  const hStart = hour == null ? null : Math.max(0, hour - 1);
  const hEnd   = hour == null ? null : Math.min(23, hour + 1);

  // Remove commas from postcode
  const cleanPostcode = postcode ? String(postcode).replace(/,/g, '') : null;

  // Main query: aggregated parking free rate for each address
  const sql = `
    SELECT
      address,
      REPLACE(postcode, ',', '') AS postcode,
      suburb,
      SUM(CASE WHEN Status_Description = 'Unoccupied' THEN 1 ELSE 0 END) / COUNT(*) AS freeRate,
      COUNT(*) AS totalSamples,
      MAX(Status_Timestamp) AS latestTs,
      AVG(lat) AS lat,
      AVG(lon) AS lon
    FROM ReadyData
    WHERE ( ? IS NULL OR day_of_week = ? )
      AND ( ? IS NULL OR REPLACE(postcode, ',', '') = ? )
      ${hour == null ? '' : 'AND HOUR(Status_Timestamp) BETWEEN ? AND ?'}
    GROUP BY address, REPLACE(postcode, ',', ''), suburb
    HAVING totalSamples >= 1
    ORDER BY freeRate DESC, latestTs DESC
    LIMIT 3
  `;

  const params = hour == null
    ? [day, day, cleanPostcode, cleanPostcode]
    : [day, day, cleanPostcode, cleanPostcode, hStart, hEnd];

  const [rows] = await pool.query(sql, params);

  if (rows.length > 0) {
    return annotateWithTransit(rows);
  }

   // Fallback query: if no results, return most recent unoccupied spots
  const fallbackSql = `
    SELECT
      address,
      REPLACE(postcode, ',', '') AS postcode,
      suburb,
      1.0 AS freeRate,
      1   AS totalSamples,
      Status_Timestamp AS latestTs,
      lat, lon
    FROM ReadyData
    WHERE ( ? IS NULL OR day_of_week = ? )
      AND ( ? IS NULL OR REPLACE(postcode, ',', '') = ? )
      AND Status_Description = 'Unoccupied'
    ORDER BY Status_Timestamp DESC
    LIMIT 3
  `;
  const [fallback] = await pool.query(fallbackSql, [
    day, day, cleanPostcode, cleanPostcode
  ]);

  return annotateWithTransit(fallback);
}
