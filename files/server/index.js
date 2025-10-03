import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);

// --- SQLite Setup ---
let db;
(async () => {
  db = await open({
    filename: process.env.DATABASE_URL || "./sqlite.db",
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pm25 REAL,
      no2 REAL,
      temperature REAL,
      humidity REAL,
      timestamp TEXT
    );
  `);
})();

// --- API Helpers ---

// NASA TEMPO placeholder (Replace with real endpoint if available)
async function fetchTempoData() {
  const apiKey = process.env.TEMPO_API_KEY;
  const lat = process.env.LOCATION_LAT || "38.8951";
  const lon = process.env.LOCATION_LON || "-77.0364";
  try {
    // TODO: Replace with real NASA TEMPO API fetch if you have access
    return {
      pm25: 25 + Math.random() * 10,
      no2: 8 + Math.random() * 2,
      o3: 30 + Math.random() * 10,
      source: "tempo",
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return { error: "TEMPO fetch error", source: "tempo" };
  }
}

// OpenAQ
async function fetchOpenAQData() {
  const lat = process.env.LOCATION_LAT || "38.8951";
  const lon = process.env.LOCATION_LON || "-77.0364";
  const radius = 10000;
  try {
    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=${radius}`;
    const resp = await fetch(url);
    const json = await resp.json();
    let pm25, no2, o3;
    if (json?.results && json.results.length > 0) {
      const values = {};
      for (const m of json.results[0].measurements) {
        if (m.parameter === "pm25") values.pm25 = m.value;
        if (m.parameter === "no2") values.no2 = m.value;
        if (m.parameter === "o3") values.o3 = m.value;
      }
      pm25 = values.pm25;
      no2 = values.no2;
      o3 = values.o3;
    }
    return {
      pm25,
      no2,
      o3,
      source: "openaq",
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return { error: "OpenAQ fetch error", source: "openaq" };
  }
}

// OpenWeatherMap
async function fetchWeatherData() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const lat = process.env.LOCATION_LAT || "38.8951";
  const lon = process.env.LOCATION_LON || "-77.0364";
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const resp = await fetch(url);
    const json = await resp.json();
    return {
      temperature: json.main.temp,
      humidity: json.main.humidity,
      wind: json.wind.speed,
      source: "weather",
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return { error: "Weather fetch error", source: "weather" };
  }
}

async function getLatestArduinoReading() {
  const row = await db.get(
    "SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1"
  );
  if (!row) return null;
  return {
    pm25: row.pm25,
    no2: row.no2,
    temperature: row.temperature,
    humidity: row.humidity,
    timestamp: row.timestamp,
    source: "arduino",
  };
}

// --- API Routes ---

app.get("/api/air-quality", async (req, res) => {
  const [tempo, openaq, weather, arduino] = await Promise.all([
    fetchTempoData(),
    fetchOpenAQData(),
    fetchWeatherData(),
    getLatestArduinoReading(),
  ]);
  res.json({
    tempo,
    openaq,
    weather,
    arduino: arduino || {},
    lastUpdated: new Date().toISOString(),
  });
});

app.post("/api/sensors", async (req, res) => {
  const { pm25, no2, temperature, humidity, timestamp } = req.body;
  if (
    typeof pm25 !== "number" ||
    typeof no2 !== "number" ||
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    !timestamp
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  await db.run(
    "INSERT INTO sensor_readings (pm25, no2, temperature, humidity, timestamp) VALUES (?, ?, ?, ?, ?)",
    pm25,
    no2,
    temperature,
    humidity,
    timestamp
  );
  res.json({ success: true });
});

app.get("/api/history", async (req, res) => {
  const rows = await db.all(
    "SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 100"
  );
  res.json(rows.reverse());
});

// Mock Endpoints
app.get("/api/mock/air-quality", async (req, res) => {
  res.json({
    tempo: {
      pm25: 33,
      no2: 12,
      o3: 41,
      source: "tempo",
      timestamp: new Date().toISOString(),
    },
    openaq: {
      pm25: 29,
      no2: 14,
      o3: 39,
      source: "openaq",
      timestamp: new Date().toISOString(),
    },
    weather: {
      temperature: 26,
      humidity: 60,
      wind: 2.4,
      source: "weather",
      timestamp: new Date().toISOString(),
    },
    arduino: {
      pm25: 35,
      no2: 13,
      temperature: 27,
      humidity: 55,
      timestamp: new Date().toISOString(),
      source: "arduino",
    },
    lastUpdated: new Date().toISOString(),
  });
});

app.get("/api/mock/history", (req, res) => {
  const now = Date.now();
  const history = [];
  for (let i = 0; i < 24; i++) {
    history.push({
      pm25: 25 + Math.random() * 15,
      no2: 8 + Math.random() * 5,
      temperature: 25 + Math.random() * 5,
      humidity: 50 + Math.random() * 15,
      timestamp: new Date(now - i * 3600 * 1000).toISOString(),
    });
  }
  res.json(history.reverse());
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Air Quality API running on port ${PORT}`);
});