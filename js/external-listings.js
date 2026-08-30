// Talks only to OUR OWN /api/external-listings endpoint — never calls
// RealtyAPI or Realtor/Redfin/Apartments.com directly from the browser, and
// never renders an outbound <a href> to those sites. Every card's action
// stays inside this site (prefills the contact form) so a visitor is never
// redirected away.
import { rebateHTML } from "./pricing.js";

const REFRESH_MS = 3 * 60 * 1000; // 3 minutes

export async function fetchExternalListings({ location, type, minPrice, maxPrice, beds }) {
  const params = new URLSearchParams({ location, type });
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (beds) params.set("beds", beds);

  const res = await fetch(`/api/external-listings?${params.toString()}`);
  if (!res.ok) throw new Error("external_listings_failed");
  return res.json();
}

const SOURCE_LABEL = { realtor: "Realtor.com", redfin: "Redfin", apartments: "Apartments.com" };

// When a discount is active, this shows the REAL listed price alongside
// what the buyer actually pays through this agency (the difference is
// covered by the agency as an early-customer promotion) — never a silently
// altered number standing in for someone else's listing price.
export function externalCardHTML(l, discountPercent = null) {
  const img = l.image || "https://placehold.co/500x360/F1F3F6/1A1D22?text=No+Photo";
  const loc = [l.city, l.state].filter(Boolean).join(", ");
  const suffix = l.listingType === "rent" ? "/mo" : "";
  // Deliberately a <div>, not an <a> — no outbound navigation from this card.
  return `
    <div class="plot-card external-card" data-listing='${encodeURIComponent(JSON.stringify(l))}'>
      <div class="thumb">
        <span class="plot-tag ${l.listingType === "rent" ? "rent" : ""}">${l.listingType === "rent" ? "For Rent" : "For Sale"}</span>
        <span class="source-tag">${SOURCE_LABEL[l.source] || l.source}</span>
        <img src="${img}" alt="${l.title}" loading="lazy">
      </div>
      <div class="plot-body">
        <h3>${l.title}</h3>
        <span class="plot-loc">${loc}</span>
        <div class="plot-meta">
          <span>${l.beds ?? "–"} bd</span>
          <span>${l.baths ?? "–"} ba</span>
          <span>${l.sqft ? l.sqft + " sqft" : "–"}</span>
        </div>
        <div class="plot-price">
          ${rebateHTML(l.price || 0, discountPercent, suffix)}
        </div>
        <button class="btn outline block ask-btn" style="margin-top:12px;">Ask us about this property</button>
      </div>
    </div>`;
}

export function renderExternalListings(el, listings, discountPercent = null) {
  el.innerHTML = listings.length
    ? listings.map(l => externalCardHTML(l, discountPercent)).join("")
    : `<div class="empty-state">No results for this search yet — try a different city or widen your filters.</div>`;

  // Wire the on-site CTA — routes to our own contact page with the
  // property pre-filled, never off this domain.
  el.querySelectorAll(".ask-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".external-card");
      const l = JSON.parse(decodeURIComponent(card.dataset.listing));
      const params = new URLSearchParams({
        about: `${l.title}, ${[l.city, l.state].filter(Boolean).join(", ")} (via ${SOURCE_LABEL[l.source] || l.source})`
      });
      location.href = `contact.html?${params.toString()}`;
    });
  });
}

// Polls the same query every REFRESH_MS and calls onUpdate(data) — stop()
// clears the interval (e.g. when the user navigates away or changes filters).
export function startAutoRefresh(getFilters, onUpdate) {
  let stopped = false;
  async function tick() {
    if (stopped) return;
    try {
      const data = await fetchExternalListings(getFilters());
      onUpdate(data);
    } catch (e) {
      console.error("Auto-refresh failed:", e);
    }
  }
  const id = setInterval(tick, REFRESH_MS);
  return () => { stopped = true; clearInterval(id); };
}
