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
