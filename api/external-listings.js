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

// Very light in-memory cache to avoid burning API credits on every single
// visitor's auto-refresh — shared only within a warm serverless instance,
// so it's a best-effort cost control, not a guarantee. For real production
// traffic, replace with Vercel KV / Upstash Redis keyed by the query string.
const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes — matches the client's auto-refresh interval

function normalize(raw, source, listingType) {
  const listings = raw?.listings || raw?.results || raw?.search_results?.listings || raw?.properties || [];
  return listings.map((item) => {
    const node = item.node || item;
    return {
      id: `${source}-${node.id || node.property_id || node.listingKey || node.listing_id || Math.random().toString(36).slice(2)}`,
      source,
      listingType,
      title: node.address?.line || node.address_line || node.streetAddress || node.title || "Property",
      city: node.address?.city || node.city || "",
      state: node.address?.state_code || node.address?.state || node.state || "",
      price: node.price || node.list_price || node.rent?.min || node.rentMin || null,
      priceMax: node.rent?.max || node.rentMax || null,
      beds: node.beds ?? node.bedrooms ?? node.details?.beds ?? null,
      baths: node.baths ?? node.bathrooms ?? node.details?.baths ?? null,
      sqft: node.sqft || node.building_size?.size || node.details?.sqft || null,
      image: node.photos?.[0]?.href || node.primary_photo?.href || node.photo || null
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
  const cacheKey = JSON.stringify({ location, listingType, minPrice, maxPrice, beds, page });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return res.status(200).json({ ...cached.body, cached: true });
  }

  const providers = PROVIDERS[listingType];
  const params = {
    location,
    price_min: minPrice,
    price_max: maxPrice,
    beds_min: beds,
    page
  };

  const results = await Promise.allSettled(providers.map(p => fetchProvider(p, params, listingType, apiKey)));

  const listings = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") listings.push(...r.value);
    else errors.push({ provider: providers[i].name, message: r.reason.message });
  });

  const body = { listings, errors, fetchedAt: new Date().toISOString() };
  cache.set(cacheKey, { at: Date.now(), body });

  return res.status(200).json(body);
}
