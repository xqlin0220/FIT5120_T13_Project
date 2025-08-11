/* eslint-env node */
/**
 * @fileoverview
 * Database access layer for parking recommendations.
 *
 * Responsibilities:
 *  - Manage MySQL connection pool
 *  - Translate UI inputs (day, time, postcode) into SQL filters
 *  - Query aggregated availability from ReadyData
 *  - Fallback to most recent unoccupied records when aggregation returns empty
 *  - Enrich rows with nearest public transit stop and a proximity "green" classification
 *
 * Environment variables:
 *  - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * External helpers:
 *  - nearestStop(lat, lon): returns the closest transit stop with distance_m
 *  - classifyGreen(meters): maps a distance to { label, color }
 */

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

/**
 * Health check for database connectivity.
 * Uses a pooled connection and releases it immediately after ping.
 * @returns {Promise<boolean>} true if ping succeeds
 */
export async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}


/**
 * Converts a 12-hour label like "3:00 PM" or "12:00 AM" to an integer hour in 24-hour format.
 * Accepts strings of shape "H:MM AM|PM" or "H AM|PM" (minutes are ignored for coarse filtering).
 * Returns null when the label is missing or unparseable.
 *
 * Examples:
 *  - "12:00 AM" -> 0
 *  - "12:00 PM" -> 12
 *  - "3 PM"     -> 15
 *
 * @param {string|null|undefined} label
 * @returns {number|null} hour in [0..23] or null
 */
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

/**
 * Adds nearest public transit stop information and a proximity "green" classification
 * to each result row. This does not mutate the input objects; it returns new objects.
 *
 * Input row fields used:
 *  - lat, lon (optional; if absent, nearestStop is null and green is grey/unknown)
 *
 * Output row fields added:
 *  - nearestStop: { id, name, mode, distance_m } | null
 *  - green: { label: string, color: 'green'|'yellow'|'red'|'grey' }
 *
 * @template T
 * @param {Array<T & {lat?: number, lon?: number}>} rows
 * @returns {Array<T & {
 *   nearestStop: {id:any,name:string,mode:string,distance_m:number}|null,
 *   green: {label:string,color:'green'|'yellow'|'red'|'grey'}
 * }>}
 */
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


/**
 * Retrieves up to 3 recommended parking rows filtered by day, time window, and postcode.
 * The main query aggregates availability and sorts by freeRate (descending) then latestTs.
 * If the main query yields no rows, a fallback query returns the most recent unoccupied rows.
 *
 * Inputs:
 *  - day: string|null (matches ReadyData.day_of_week)
 *  - time: string|null (12-hour label; converted to a coarse [hour-1 .. hour+1] window)
 *  - postcode: string|number|null (commas removed before comparison)
 *
 * Returned rows (main query):
 *  - address, postcode (comma-free), suburb
 *  - freeRate: ratio [0..1]
 *  - totalSamples: count of records in group
 *  - latestTs: latest Status_Timestamp (ISO datetime)
 *  - lat, lon: group averages to represent a centroid
 *
 * @param {{day?: string|null, time?: string|null, postcode?: string|number|null}} params
 * @returns {Promise<Array<{
 *   address: string,
 *   postcode: string,
 *   suburb: string,
 *   freeRate: number,
 *   totalSamples: number,
 *   latestTs: string,
 *   lat: number|null,
 *   lon: number|null,
 *   nearestStop: {id:any,name:string,mode:string,distance_m:number}|null,
 *   green: {label:string,color:'green'|'yellow'|'red'|'grey'}
 * }>>}
 */
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
