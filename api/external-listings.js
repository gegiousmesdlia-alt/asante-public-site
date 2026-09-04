// Vercel serverless function — GET /api/external-listings
//
// Proxies to RealtyAPI.io (https://realtyapi.io) so the API key never sits
// in browser JS. RealtyAPI fronts Realtor.com, Redfin, Apartments.com and
// others behind one consistent shape: base URL "https://<provider>.realtyapi.io",
// auth header "x-realtyapi-key", search endpoint "/search/bylocation".
//
// The RealtyAPI key itself is entered by an admin through the admin panel's
// Settings tab and stored in Firestore (settings/integrations, admin-only
// read/write). This function reads it server-side via the Firebase Admin
// SDK — see lib/firebase-admin.js for the one-time setup that requires.
// A REALTYAPI_KEY env var is checked first as a manual override/fallback,
// so you can still hardcode it in Vercel directly if you'd rather skip the
// admin-panel route for this particular key.
//
// IMPORTANT — verify before relying on this in production: exact filter
// param names (price/beds/etc.) can change on RealtyAPI's side. Confirm
// current params for each provider at https://<provider>.realtyapi.io/openapi.json
// or in the interactive playground at https://realtyapi.io/dashboard before
// launch, and adjust the `params` blocks below if anything's shifted.
import { PROVIDERS, resolveApiKey, fetchWithTimeout } from "../lib/realty.js";
import { adminDb } from "../lib/firebase-admin.js";

// Persistent cache, stored in Firestore (collection "listingsCache") via
// the Firebase Admin SDK. Unlike a normal TTL cache, this NEVER expires on
// its own — once a search result is saved, it stays until an admin taps
// "Reset saved nationwide listings" in the Settings tab (which wipes the
// whole collection via /api/admin/reset-external-cache). This is a
// deliberate tradeoff: it maximizes RealtyAPI credit savings, at the cost
// of results going stale until someone resets them.
function cacheDocId(location, listingType, minPrice, maxPrice, beds, page) {
  const raw = `${listingType}|${location.toLowerCase().trim()}|${minPrice || ""}|${maxPrice || ""}|${beds || ""}|${page}`;
  return raw.replace(/[^a-z0-9]/gi, "_").slice(0, 300);
}

async function getPersistentCache(docId) {
  try {
    const snap = await adminDb().collection("listingsCache").doc(docId).get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error("Cache read failed:", err.message);
    return null;
  }
}

async function setPersistentCache(docId, body) {
  try {
    await adminDb().collection("listingsCache").doc(docId).set({ ...body, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Cache write failed:", err.message);
  }
}

function normalize(raw, source, listingType) {
  // Confirmed live for realtor.realtyapi.io /search/bylocation: the array
  // is under "searchResults" (camelCase, not nested), photos are plain URL
  // strings (not {href} objects), and primary_photo is a plain URL string
  // too. Other providers haven't been confirmed the same way yet — the
  // fallback keys below cover the previously-assumed shapes just in case
  // Redfin/Apartments differ.
  const listings = raw?.searchResults || raw?.listings || raw?.results || raw?.search_results?.listings || raw?.properties || [];
  return listings.map((item) => {
    const node = item.node || item;
    const firstPhoto = Array.isArray(node.photos) ? node.photos[0] : null;
    // Capture everything the search response already gives us for free —
    // this is what powers the detail view when a card is clicked, with no
    // second API call (and no extra credit spent) needed.
    const allPhotos = Array.isArray(node.photos)
      ? node.photos.map(p => (typeof p === "string" ? p : p?.href)).filter(Boolean)
      : [];
    return {
      id: `${source}-${node.id || node.property_id || node.listingKey || node.listing_id || Math.random().toString(36).slice(2)}`,
      source,
      listingType,
      title: node.address?.line || node.address_line || node.streetAddress || node.title || "Property",
      city: node.address?.city || node.city || "",
      state: node.address?.state_code || node.address?.state || node.state || "",
      county: node.county || null,
      price: node.price || node.list_price || node.rent?.min || node.rentMin || null,
      priceMax: node.rent?.max || node.rentMax || null,
      beds: node.beds ?? node.bedrooms ?? node.details?.beds ?? null,
      baths: node.baths ?? node.bathrooms ?? node.details?.baths ?? null,
      sqft: node.sqft || node.building_size?.size || node.details?.sqft || null,
      lotSqft: node.lot_sqft || null,
      propertyType: node.property_type || null,
      status: node.status || null,
      listDate: node.list_date || null,
      image: node.primary_photo || (typeof firstPhoto === "string" ? firstPhoto : firstPhoto?.href) || node.photo || null,
      images: allPhotos
    };
  });
}

// Vercel's Hobby (free) plan hard-caps serverless function execution at
// 10 seconds — there's no way to raise that without upgrading the plan.
// A slow or hanging provider can eat that whole budget and kill the
// request with no response at all (shows as "---" status in Vercel's
// logs, and the browser sees it as a dropped connection). The per-call
// timeout (in lib/realty.js) means one slow provider can never block the
// others — whatever answers in time gets used; anything slower just gets
// skipped for that request rather than taking the whole thing down.
async function fetchProvider(provider, params, listingType, apiKey) {
  const url = new URL(provider.base + "/search/bylocation");
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v); });

  const res = await fetchWithTimeout(url.toString(), {
    headers: { "x-realtyapi-key": apiKey }
  });
  if (!res.ok) throw new Error(`${provider.name} responded ${res.status}`);
  const data = await res.json();
  return normalize(data, provider.name, listingType);
}

// Cache the resolved key itself briefly too, so a burst of requests doesn't
// each trigger their own Firestore read.


export default async function handler(req, res) {
  const { location, type = "sale", minPrice, maxPrice, beds, page = 1 } = req.query;
  if (!location) return res.status(400).json({ error: "location is required" });

  let apiKey;
  try {
    apiKey = await resolveApiKey();
  } catch (err) {
    return res.status(500).json({ error: "Could not read RealtyAPI key from Firestore", detail: err.message });
  }
  if (!apiKey) return res.status(500).json({ error: "No RealtyAPI key configured — add one in the admin panel's Settings tab, or set REALTYAPI_KEY in Vercel." });

  const listingType = type === "rent" ? "rent" : "sale";
  const docId = cacheDocId(location, listingType, minPrice, maxPrice, beds, page);
  const cached = await getPersistentCache(docId);
  if (cached) {
    return res.status(200).json({ ...cached, cached: true });
  }

  const providers = PROVIDERS[listingType];

  // Confirmed live for realtor.realtyapi.io /search/bylocation: price and
  // beds filters are ONE combined param each, formatted "min:X,max:Y" (or
  // just "min:X" / "max:Y" alone) — not separate price_min/price_max
  // params like earlier code assumed. Not yet confirmed the same way for
  // Redfin/Apartments; if their filters don't apply, check their PARAMS
  // tab in the dashboard playground the same way.
  function buildRange(min, max) {
    const parts = [];
    if (min) parts.push(`min:${min}`);
    if (max) parts.push(`max:${max}`);
    return parts.length ? parts.join(",") : undefined;
  }

  const params = {
    location,
    page,
    priceRange: buildRange(minPrice, maxPrice),
    bedsRange: beds ? `min:${beds}` : undefined
  };

  const results = await Promise.allSettled(providers.map(p => fetchProvider(p, params, listingType, apiKey)));

  const listings = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") listings.push(...r.value);
    else errors.push({ provider: providers[i].name, message: r.reason.message });
  });

  const body = { listings, errors, fetchedAt: new Date().toISOString() };
  // Only save to the persistent cache if at least one provider actually
  // succeeded — an all-providers-failed response (e.g. a temporary outage)
  // shouldn't get permanently cached as "0 results" until someone resets it.
  if (listings.length > 0 || errors.length < providers.length) {
    await setPersistentCache(docId, body);
  }

  return res.status(200).json(body);
}
