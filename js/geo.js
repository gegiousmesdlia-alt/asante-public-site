// Fetches the visitor's approximate city from our own /api/geo endpoint
// (backed by Vercel's edge geolocation headers — see api/geo.js). Never
// calls a third-party geolocation service directly from the browser.
export async function fetchVisitorLocation() {
  try {
    const res = await fetch("/api/geo");
    if (!res.ok) return null;
    const data = await res.json();
    return data.available ? data : null;
  } catch {
    return null;
  }
}

export function locationLabel(geo) {
  if (!geo) return "";
  return [geo.city, geo.region].filter(Boolean).join(", ");
}
