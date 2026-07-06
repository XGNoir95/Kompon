import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { getRecentEarthquakes } from "../services/earthquakeFeedClient.js";

const router = Router();

function parseWindow(value) {
  if (["hour", "day", "week"].includes(value)) return value;
  return "day";
}

function parseFocus(value) {
  if (["south_asia", "asia", "global"].includes(value)) return value;
  return "south_asia";
}

// GET /v1/earthquakes/recent?window=day&limit=12&min_magnitude=0&focus=south_asia
router.get("/recent", rateLimit("news"), async (req, res) => {
  try {
    const result = await getRecentEarthquakes({
      window: parseWindow(req.query.window),
      limit: req.query.limit,
      minMagnitude: req.query.min_magnitude,
      focus: parseFocus(req.query.focus),
    });

    return res.status(200).json({
      ...result,
      disclaimer:
        "Earthquake data is sourced from the USGS real-time GeoJSON feed. South Asian and Asian events are prioritized when available. For life-safety decisions, verify with official emergency and geological agencies.",
    });
  } catch (err) {
    console.error("[Earthquakes] Feed error:", err.message);
    return res.status(502).json({
      error: "Failed to retrieve recent earthquake data.",
      earthquakes: [],
    });
  }
});

export default router;
