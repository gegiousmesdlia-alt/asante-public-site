// Vercel serverless function — GET /api/location-suggest?q=...&type=sale|rent
//
// Proxies to each provider's search-box typeahead (city/ZIP/neighborhood/
// address suggestions) so the RealtyAPI key stays server-side, same as
// api/external-listings.js. Queries whichever provider(s) apply to the
// given listing type and merges the results, deduping obvious repeats.
import { PROVIDERS, SUGGEST_ENDPOINTS, resolveApiKey } from "../lib/realty.js";

async function suggestFromProvider(provider, q, apiKey) {
  const endpoint = SUGGEST_ENDPOINTS[provider.name];
  if (!endpoint) return [];

  const url = new URL(provider.base + endpoint.path);
  url.searchParams.set(endpoint.param, q);

  const res = await fetch(url.toString(), { headers: { "x-realtyapi-key": apiKey } });
  if (!res.ok) throw new Error(`${provider.name} suggest responded ${res.status}`);
  const data = await res.json();

  // Confirmed live for realtor.realtyapi.io /autocomplete: the array is
  // under "searchResults", each item has "display_name" as the label,
  // "id" as a stable identifier, and "area_type" (city/zip/neighborhood/
  // address/etc). Other providers haven't been confirmed yet — the
  // fallback keys below are best-effort until verified the same way.
  const raw = data?.searchResults || data?.suggestions || data?.results || data?.autocomplete || (Array.isArray(data) ? data : []);
  return raw.map((s) => ({
    id: s.id || s.slug_id || s.geo_id || s.locationId || null,
    typeCode: s.area_type || s.typeCode || s.type || null,
    label: s.display_name || s.displayText || s.display_text || s.name || s.text || s.formattedAddress || String(s),
    city: s.city || null,
    stateCode: s.state_code || null,
    source: provider.name
  })).filter(s => s.label);
}

export default async function handler(req, res) {
  const { q, type = "sale" } = req.query;
  if (!q || q.trim().length < 2) return res.status(200).json({ suggestions: [] });

  let apiKey;
  try {
    apiKey = await resolveApiKey();
  } catch (err) {
    return res.status(500).json({ error: "Could not read RealtyAPI key from Firestore", detail: err.message });
  }
  if (!apiKey) return res.status(500).json({ error: "No RealtyAPI key configured — add one in the admin panel's Settings tab." });

  const listingType = type === "rent" ? "rent" : "sale";
  const providers = PROVIDERS[listingType];

  const results = await Promise.allSettled(providers.map(p => suggestFromProvider(p, q.trim(), apiKey)));

  const seen = new Set();
  const suggestions = [];
  results.forEach((r) => {
    if (r.status !== "fulfilled") return;
    r.value.forEach((s) => {
      const key = s.label.toLowerCase();
      if (!seen.has(key)) { seen.add(key); suggestions.push(s); }
    });
  });

  return res.status(200).json({ suggestions: suggestions.slice(0, 8) });
}
