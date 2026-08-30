// Vercel serverless function — GET /api/geo
//
// Vercel's edge network already tags every incoming request with an
// approximate location (derived from the visitor's IP at the CDN edge)
// and passes it through as request headers — no separate geolocation API,
// key, or third-party service needed. This only works when actually
// deployed on Vercel; locally it returns nulls, which the client handles
// by just not pre-filtering anything.
//
// This is city/region-level only (the same accuracy any CDN uses for
// routing), not precise location — nothing is stored, logged, or persisted
// anywhere; it's read fresh on each request and simply returned.
export default function handler(req, res) {
  const decode = (v) => (v ? decodeURIComponent(v) : null);

  const city = decode(req.headers["x-vercel-ip-city"]);
  const region = decode(req.headers["x-vercel-ip-country-region"]);
  const country = decode(req.headers["x-vercel-ip-country"]);
  const latitude = req.headers["x-vercel-ip-latitude"] || null;
  const longitude = req.headers["x-vercel-ip-longitude"] || null;

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ city, region, country, latitude, longitude, available: !!city });
}
