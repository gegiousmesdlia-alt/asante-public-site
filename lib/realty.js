// Shared between api/external-listings.js and api/location-suggest.js.
import { getIntegrationSetting } from "./firebase-admin.js";

export const PROVIDERS = {
  sale: [
    { name: "realtor", base: "https://realtor.realtyapi.io" },
    { name: "redfin", base: "https://redfin.realtyapi.io" }
  ],
  rent: [
    { name: "apartments", base: "https://apartments.realtyapi.io" },
    { name: "redfin", base: "https://redfin.realtyapi.io" }
  ]
};

// Each provider's search-box typeahead endpoint.
// realtor: CONFIRMED live — GET /autocomplete?input=... returns
// { searchResults: [{ id, area_type, city, state_code, display_name, ... }] }
// redfin / apartments: not yet confirmed the same way — /autocomplete with
// a "query" param is the best guess based on RealtyAPI's general pattern.
// If suggestions come back empty for those two, check their PARAMS tab in
// the dashboard playground the same way we did for realtor.
export const SUGGEST_ENDPOINTS = {
  realtor: { path: "/autocomplete", param: "input" },
  redfin: { path: "/autocomplete", param: "query" },
  apartments: { path: "/autocomplete", param: "query" }
};

let keyCache = { value: null, at: 0 };
const KEY_CACHE_TTL_MS = 3 * 60 * 1000;

export async function resolveApiKey() {
  if (process.env.REALTYAPI_KEY) return process.env.REALTYAPI_KEY;
  if (keyCache.value && Date.now() - keyCache.at < KEY_CACHE_TTL_MS) return keyCache.value;
  const value = await getIntegrationSetting("realtyApiKey");
  keyCache = { value, at: Date.now() };
  return value;
}

// Vercel's Hobby (free) plan hard-caps serverless function execution at
// 10 seconds total, with no way to raise it without upgrading the plan.
// A slow or hanging provider can eat that whole budget and kill the entire
// request with no response sent at all (shows as "---" status in Vercel's
// logs, and the browser just sees a dropped connection). Used by both
// external-listings.js and location-suggest.js so one slow provider can
// never take the whole response down — whatever answers in time gets used.
export const PROVIDER_TIMEOUT_MS = 7000;

export async function fetchWithTimeout(url, options, timeoutMs = PROVIDER_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
