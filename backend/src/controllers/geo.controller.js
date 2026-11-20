import asyncHandler from "../utils/asyncHandler.js";
import { insideRwanda, placeCentre, snapDistrict, snapPrecise } from "../services/geo.service.js";

// GET /api/whereami            -> coarse place from the visitor's network (Vercel geo headers)
// GET /api/whereami?lat=&lng=  -> precise place from device coordinates
// Nothing is stored; the browser keeps the result on the device.
export const whereAmI = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "private, no-store");

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng) && req.query.lat !== undefined) {
    if (!insideRwanda(lat, lng)) {
      return res.status(200).json({ success: true, place: null, source: "gps", reason: "outside_rwanda" });
    }
    const hit = snapPrecise(lat, lng);
    return res.status(200).json({ success: true, place: hit?.place || null, source: "gps", approximate: false, distanceKm: hit?.distanceKm ?? null });
  }

  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  const ipLat = Number(req.headers["x-vercel-ip-latitude"]);
  const ipLng = Number(req.headers["x-vercel-ip-longitude"]);

  if (country && country !== "RW") {
    return res.status(200).json({ success: true, place: null, source: "ip", reason: "outside_rwanda" });
  }
  if (!Number.isFinite(ipLat) || !Number.isFinite(ipLng) || !insideRwanda(ipLat, ipLng)) {
    return res.status(200).json({ success: true, place: null, source: "ip", reason: "unknown" });
  }

  const hit = snapDistrict(ipLat, ipLng);
  return res.status(200).json({
    success: true,
    place: hit?.place || null,
    source: "ip",
    approximate: true,
    city: req.headers["x-vercel-ip-city"] ? decodeURIComponent(String(req.headers["x-vercel-ip-city"])) : null,
  });
});

// GET /api/whereami/centre?district&sector&cell -> centre point of a place
export const centreOfPlace = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "public, max-age=86400");
  const centre = placeCentre({ district: req.query.district, sector: req.query.sector, cell: req.query.cell });
  return res.status(200).json({ success: true, centre });
});
