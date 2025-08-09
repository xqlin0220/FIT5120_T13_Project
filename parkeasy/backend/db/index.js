
/* eslint-env node */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

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
  if (up === 'AM') {
    if (h === 12) h = 0;
  } else if (up === 'PM') {
    if (h !== 12) h += 12;
  }
  return h; // 0..23
}
/**
 * 根据 day_of_week + postcode 过滤
 * @param {Object} p
 * @param {string|null} p.day  
 * @param {string|null} p.time      
 * @param {string|number|null} p.postcode
 */
export async function getRecommendations({ day = null, time = null, postcode = null }) {
  const hour = to24h(time);
  const hStart = hour == null ? null : Math.max(0, hour - 1);
  const hEnd   = hour == null ? null : Math.min(23, hour + 1);

  //  postcode 清洗
  const cleanPostcode = postcode ? String(postcode).replace(/,/g, '') : null;

  
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

  if (rows.length > 0) return rows;

  //  Unoccupied
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
  return fallback;
}