// Rwanda's administrative tree: province > district > sector > cell > village.
// The dataset (~400 KB) is loaded on demand the first time a picker needs it.
import { PROVINCES, getSavedDistrict, saveDistrict } from "./rwanda";

let cache = null;
let loading = null;

export function loadLocations() {
  if (cache) return Promise.resolve(cache);
  loading ??= import("../data/rwanda-locations.json").then((module) => {
    cache = module.default;
    return cache;
  });
  return loading;
}

export function provinceOf(district) {
  return Object.keys(PROVINCES).find((province) => PROVINCES[province].includes(district)) || "";
}

function districtNode(data, district) {
  const province = provinceOf(district);
  return (data && province && data[province] && data[province][district]) || null;
}

export function sectorsOf(data, district) {
  const node = districtNode(data, district);
  return node ? Object.keys(node).sort() : [];
}

export function cellsOf(data, district, sector) {
  const node = districtNode(data, district);
  return node && node[sector] ? Object.keys(node[sector]).sort() : [];
}

export function villagesOf(data, district, sector, cell) {
  const node = districtNode(data, district);
  return node && node[sector] && node[sector][cell] ? [...node[sector][cell]].sort() : [];
}

export const EMPTY_LOCATION = { district: "", sector: "", cell: "", village: "" };
const LEVELS = ["district", "sector", "cell", "village"];
const LOCATION_KEY = "loco.location";

// Changing a level clears everything below it.
export function withLevel(location, level, value) {
  const next = { ...EMPTY_LOCATION, ...location, [level]: value };
  for (const below of LEVELS.slice(LEVELS.indexOf(level) + 1)) next[below] = "";
  return next;
}

export function getSavedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (raw) return { ...EMPTY_LOCATION, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { ...EMPTY_LOCATION, district: getSavedDistrict() };
}

export function saveLocation(location) {
  saveDistrict(location?.district || "");
  try {
    if (location?.district) localStorage.setItem(LOCATION_KEY, JSON.stringify({ ...EMPTY_LOCATION, ...location }));
    else localStorage.removeItem(LOCATION_KEY);
  } catch {
    // ignore
  }
}

export function locationFromParams(params) {
  return {
    district: params.get("district") ?? "",
    sector: params.get("sector") || "",
    cell: params.get("cell") || "",
    village: params.get("village") || "",
  };
}

// "Kimironko, Gasabo" or "Bibare, Kimironko, Gasabo": most specific first.
export function locationLabel(location, fallback = "") {
  const parts = [location?.village, location?.cell, location?.sector, location?.district].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
}

export function placeLabel(place, fallback = "Rwanda") {
  return locationLabel({ village: place?.village, cell: place?.cell, sector: place?.sector, district: place?.district }, fallback);
}
