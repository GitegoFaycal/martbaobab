// Snaps a coordinate to the nearest known place using centre points of
// Rwanda's districts, sectors and cells (geoBoundaries / NISR, CC BY 4.0).
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const centroids = require("../data/rwanda-centroids.json");

// Rwanda's bounding box, with a little slack.
const BOUNDS = { minLat: -2.95, maxLat: -0.95, minLng: 28.75, maxLng: 30.95 };

export function insideRwanda(lat, lng) {
  return lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat && lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng;
}

// Equirectangular distance in km: fine at Rwanda's scale.
export function distanceKm(a, b) {
  const toRad = Math.PI / 180;
  const x = (b.lng - a.lng) * toRad * Math.cos(((a.lat + b.lat) / 2) * toRad);
  const y = (b.lat - a.lat) * toRad;
  return Math.sqrt(x * x + y * y) * 6371;
}

function nearest(list, point) {
  let best = null;
  let bestKm = Infinity;
  for (const item of list) {
    const km = distanceKm(item, point);
    if (km < bestKm) {
      bestKm = km;
      best = item;
    }
  }
  return best ? { item: best, km: bestKm } : null;
}

// Precise snap: nearest cell gives cell, sector and district at once.
export function snapPrecise(lat, lng) {
  const point = { lat, lng };
  const cell = nearest(centroids.cells, point);
  if (!cell) return null;
  return {
    place: { district: cell.item.district, sector: cell.item.sector, cell: cell.item.name, village: "" },
    distanceKm: Math.round(cell.km * 10) / 10,
  };
}

// Coarse snap (IP-based): district only.
export function snapDistrict(lat, lng) {
  const district = nearest(centroids.districts, { lat, lng });
  if (!district) return null;
  return {
    place: { district: district.item.name, sector: "", cell: "", village: "" },
    distanceKm: Math.round(district.km * 10) / 10,
  };
}

export function placeCentre(place = {}) {
  if (place.cell) {
    const hit = centroids.cells.find((c) => c.district === place.district && c.sector === place.sector && c.name === place.cell);
    if (hit) return { lat: hit.lat, lng: hit.lng };
  }
  if (place.sector) {
    const hit = centroids.sectors.find((s) => s.district === place.district && s.name === place.sector);
    if (hit) return { lat: hit.lat, lng: hit.lng };
  }
  if (place.district) {
    const hit = centroids.districts.find((d) => d.name === place.district);
    if (hit) return { lat: hit.lat, lng: hit.lng };
  }
  return null;
}

// ?near=lat,lng&radius=km on list endpoints.
export function parseNear(query = {}, defaultRadius = 25) {
  const raw = String(query.near || "");
  if (!raw) return null;
  const [a, b] = raw.split(",");
  const lat = Number(a);
  const lng = Number(b);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !insideRwanda(lat, lng)) return null;
  const radius = Math.min(150, Math.max(1, Number(query.radius) || defaultRadius));
  return { lat, lng, radius };
}

// Bounding box for a first pass in SQL; the exact distance is computed after.
export function bboxWhere(near) {
  const dLat = near.radius / 111;
  const dLng = near.radius / (111 * Math.cos((near.lat * Math.PI) / 180));
  return { lat: { gte: near.lat - dLat, lte: near.lat + dLat }, lng: { gte: near.lng - dLng, lte: near.lng + dLng } };
}

// Sorts rows by distance from `near`, drops those outside the radius, and
// attaches distanceKm. coordsOf(row) returns {lat,lng} or null.
export function rankByDistance(rows, near, coordsOf) {
  return rows
    .map((row) => {
      const c = coordsOf(row);
      const km = c && Number.isFinite(c.lat) && Number.isFinite(c.lng) ? distanceKm(near, c) : null;
      return { row, km };
    })
    .filter((x) => x.km !== null && x.km <= near.radius)
    .sort((a, b) => a.km - b.km)
    .map((x) => ({ ...x.row, distanceKm: Math.round(x.km * 10) / 10 }));
}

export const NEAR_SCAN_LIMIT = 400;
