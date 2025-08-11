/* eslint-env node */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getRecommendations, ping } from './db/index.js';
import { initGeoStops } from './utils/geoStops.js';
dotenv.config();

const app = express();

// Dynamic CORS configuration: allow any frontend URL during development

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint to verify API and DB connectivity
app.get('/health', async (req, res) => {
  try {
    await ping();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

initGeoStops(process.env.GEOJSON_PATH || '../public_transport_stops.geojson');

// POST endpoint for frontend to request parking recommendations
app.post('/api/recommend', async (req, res) => {
  const { day = null, time = null, postcode = null } = req.body || {};
  if (!day || !postcode) {
    return res.status(400).json({ error: 'Missing fields: day/postcode' });
  }

  try {
    const results = await getRecommendations({ day, time, postcode });
    return res.json({ results });
  } catch (e) {
    console.error('getRecommendations error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Root endpoint: basic API info
app.get('/', (req, res) => {
  res.send('API is running. Try POST /api/recommend');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
