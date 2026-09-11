// Shared between api/external-listings.js and api/location-suggest.js.
import { adminDb } from "./firebase-admin.js";
import { FieldValue } from "firebase-admin/firestore";

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

export const USAGE_LIMIT = 250;

// Multi-key support with automatic failover. Keys live in Firestore at
// settings/integrations.realtyApiKeys, keyed by a short id (not an array —
// a map lets usage counts be updated atomically with dot-notation without
// a read-modify-write race). settings/integrations.activeRealtyKeyId
// points at the one currently in use.
//
// Resolution: if the active key is missing or at/over USAGE_LIMIT, this
// automatically finds another key with room and switches to it — silently,
// with no visible interruption to whoever's searching. If every key is at
// the limit, returns null; callers should fall back to the persistent
// listings cache (api/external-listings.js already checks that first) and
// otherwise return an empty result quietly rather than an error.
//
// A REALTYAPI_KEY env var, if set, always overrides this entirely (no
// usage tracking applied to it) — useful for local testing without
// touching the real key rotation.
let resolveCache = { value: null, at: 0 };
const RESOLVE_CACHE_TTL_MS = 60 * 1000;

export async function resolveActiveKey() {
  if (process.env.REALTYAPI_KEY) return { id: "env", key: process.env.REALTYAPI_KEY };
  if (resolveCache.value && Date.now() - resolveCache.at < RESOLVE_CACHE_TTL_MS) return resolveCache.value;

  const ref = adminDb().collection("settings").doc("integrations");
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data();
  const keys = data.realtyApiKeys || {};
  const keyIds = Object.keys(keys);
  if (!keyIds.length) return null;

  let activeId = data.activeRealtyKeyId;
  let active = keys[activeId];

  if (!active || (active.usageCount || 0) >= USAGE_LIMIT) {
    const withRoom = keyIds.find(id => (keys[id].usageCount || 0) < USAGE_LIMIT);
    if (!withRoom) return null; // every key exhausted
    activeId = withRoom;
    active = keys[activeId];
    await ref.set({ activeRealtyKeyId: activeId }, { merge: true }); // persist the switch for future requests too
  }

  const result = { id: activeId, key: active.key };
  resolveCache = { value: result, at: Date.now() };
  return result;
}

// Call once per successful real provider call (not per search — a search
// can call 2 providers, which is 2 credits). No-op for the env var
// override, which isn't tracked.
export async function trackUsage(keyId, by = 1) {
  if (keyId === "env" || !keyId) return;
  try {
    await adminDb().collection("settings").doc("integrations")
      .update({ [`realtyApiKeys.${keyId}.usageCount`]: FieldValue.increment(by) });
  } catch (err) {
    console.error("Usage tracking failed:", err.message);
  }
  // A cached resolution could now be stale (this key may have just hit the
  // limit) — clear it so the next resolveActiveKey() call reads fresh.
  resolveCache = { value: null, at: 0 };
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
