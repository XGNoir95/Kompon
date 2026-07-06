import crypto from "node:crypto";
import axios from "axios";

const FEED_URLS = {
  hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
};

const CACHE_TTL_MS = 30_000;
const memoryCache = new Map();

const SOUTH_ASIA_PLACE_RE = /\b(bangladesh|india|pakistan|nepal|bhutan|sri lanka|maldives|afghanistan|bay of bengal|andaman|nicobar|kashmir|himalaya|himalayas|myanmar|burma)\b/i;
const ASIA_PLACE_RE = /\b(indonesia|japan|philippines|china|taiwan|vietnam|thailand|myanmar|burma|laos|cambodia|malaysia|singapore|brunei|timor|papua|russia|kamchatka|kuril|iran|iraq|turkey|georgia|armenia|azerbaijan|kazakhstan|kyrgyzstan|tajikistan|uzbekistan|turkmenistan|mongolia|korea|arabian sea|sumatra|java|banda sea|molucca|taiwan region)\b/i;

function toNumberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isWithinSouthAsia(lat, lon, place = "") {
  if (SOUTH_ASIA_PLACE_RE.test(place)) return true;
  if (lat === null || lon === null) return false;

  // Broad South Asia / Bay of Bengal / Myanmar seismic neighborhood.
  return lat >= -1 && lat <= 38.8 && lon >= 60 && lon <= 101.5;
}

function isWithinAsia(lat, lon, place = "") {
  if (isWithinSouthAsia(lat, lon, place)) return true;
  if (ASIA_PLACE_RE.test(place)) return true;
  if (lat === null || lon === null) return false;

  // Broad Asia-Pacific and West/Central Asia seismic area.
  return lat >= -12 && lat <= 82 && lon >= 25 && lon <= 180;
}

function getRegionInfo({ lat, lon, place }) {
  if (isWithinSouthAsia(lat, lon, place)) {
    return {
      region_level: "south_asia",
      region_label: "South Asia",
      region_priority: 3,
    };
  }

  if (isWithinAsia(lat, lon, place)) {
    return {
      region_level: "asia",
      region_label: "Asia",
      region_priority: 2,
    };
  }

  return {
    region_level: "global",
    region_label: "Global",
    region_priority: 1,
  };
}

function normalizeFeature(feature) {
  const props = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates || [];
  const lon = toNumberOrNull(coordinates[0]);
  const lat = toNumberOrNull(coordinates[1]);
  const depthKm = toNumberOrNull(coordinates[2]);
  const timeMs = toNumberOrNull(props.time);
  const updatedMs = toNumberOrNull(props.updated);
  const place = props.place || "Unknown location";
  const regionInfo = getRegionInfo({ lat, lon, place });

  return {
    id: feature?.id || props.code || props.ids || crypto.randomUUID(),
    magnitude: toNumberOrNull(props.mag),
    place,
    time: timeMs ? new Date(timeMs).toISOString() : null,
    updated: updatedMs ? new Date(updatedMs).toISOString() : null,
    depth_km: depthKm,
    coordinates:
      lat !== null && lon !== null
        ? {
            lat,
            lon,
            depth_km: depthKm,
          }
        : null,
    status: props.status || null,
    tsunami: Number(props.tsunami || 0) === 1,
    alert: props.alert || null,
    felt: toNumberOrNull(props.felt),
    cdi: toNumberOrNull(props.cdi),
    mmi: toNumberOrNull(props.mmi),
    significance: toNumberOrNull(props.sig),
    source: props.net || "USGS",
    url: props.url || null,
    detail_url: props.detail || null,
    type: props.type || "earthquake",
    ...regionInfo,
  };
}

function cacheKey({ window, minMagnitude, limit, focus }) {
  return `${window}:${minMagnitude}:${limit}:${focus}`;
}

function parseFocus(value) {
  if (["south_asia", "asia", "global"].includes(value)) return value;
  return "south_asia";
}

function sortEarthquakes(a, b, focus) {
  const aTime = new Date(a.time || 0).getTime();
  const bTime = new Date(b.time || 0).getTime();

  if (focus === "global") {
    return bTime - aTime;
  }

  const aPriority = a.region_priority || 1;
  const bPriority = b.region_priority || 1;

  if (aPriority !== bPriority) {
    return bPriority - aPriority;
  }

  return bTime - aTime;
}

export async function getRecentEarthquakes({
  window = "day",
  minMagnitude = 0,
  limit = 12,
  focus = "south_asia",
} = {}) {
  const safeWindow = FEED_URLS[window] ? window : "day";
  const safeMinMagnitude = Math.max(0, Number(minMagnitude) || 0);
  const safeLimit = Math.min(40, Math.max(1, Number(limit) || 12));
  const safeFocus = parseFocus(focus);
  const key = cacheKey({
    window: safeWindow,
    minMagnitude: safeMinMagnitude,
    limit: safeLimit,
    focus: safeFocus,
  });

  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      ...cached.payload,
      cache: "memory",
    };
  }

  const response = await axios.get(FEED_URLS[safeWindow], {
    timeout: 10_000,
    headers: {
      Accept: "application/geo+json, application/json",
      "User-Agent": "Kompon earthquake notification panel",
    },
  });

  const features = Array.isArray(response.data?.features)
    ? response.data.features
    : [];

  const earthquakes = features
    .map(normalizeFeature)
    .filter((quake) => quake.type === "earthquake")
    .filter((quake) => (quake.magnitude ?? 0) >= safeMinMagnitude)
    .sort((a, b) => sortEarthquakes(a, b, safeFocus))
    .slice(0, safeLimit);

  const payload = {
    source: "USGS Earthquake Hazards Program",
    feed_window: safeWindow,
    min_magnitude: safeMinMagnitude,
    focus: safeFocus,
    count: earthquakes.length,
    fetched_at: new Date().toISOString(),
    metadata: response.data?.metadata || null,
    earthquakes,
  };

  memoryCache.set(key, {
    timestamp: Date.now(),
    payload,
  });

  return {
    ...payload,
    cache: "fresh",
  };
}

export default { getRecentEarthquakes };
