// Talks only to OUR OWN /api/external-listings endpoint — never calls
// RealtyAPI or Realtor/Redfin/Apartments.com directly from the browser, and
// never renders an outbound <a href> to those sites. Every card's action
// stays inside this site (prefills the contact form) so a visitor is never
// redirected away.
import { rebateHTML } from "./pricing.js";

// Refresh interval kept fairly long on purpose — RealtyAPI's free tier
// caps out at 250 requests total, and a short interval multiplied across
// every open tab adds up fast. See the server-side cache in
// api/external-listings.js (same TTL) for the other half of this.
const REFRESH_MS = 20 * 60 * 1000; // 20 minutes

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

function formatDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return null; }
}

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
    <div class="plot-card external-card" data-listing='${encodeURIComponent(JSON.stringify(l))}' role="button" tabindex="0">
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

function askAboutProperty(l) {
  const params = new URLSearchParams({
    about: `${l.title}, ${[l.city, l.state].filter(Boolean).join(", ")} (via ${SOURCE_LABEL[l.source] || l.source})`
  });
  location.href = `contact.html?${params.toString()}`;
}

// Full detail view, built entirely from data the search response already
// gave us — no second API call, so opening a card never spends another
// RealtyAPI credit.
function openDetailModal(l, discountPercent) {
  const loc = [l.city, l.county ? `${l.county} County` : null, l.state].filter(Boolean).join(", ");
  const suffix = l.listingType === "rent" ? "/mo" : "";
  const gallery = l.images?.length ? l.images : (l.image ? [l.image] : []);

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal external-detail-modal">
      <div class="detail-gallery">
        ${gallery.length
          ? gallery.slice(0, 6).map(src => `<img src="${src}" alt="${l.title}" loading="lazy">`).join("")
          : `<img src="https://placehold.co/600x400/F1F3F6/1A1D22?text=No+Photo" alt="No photo">`}
      </div>
      <div style="padding:24px;">
        <span class="badge">${l.listingType === "rent" ? "For Rent" : "For Sale"}</span>
        <span class="source-tag" style="position:static; margin-left:8px;">${SOURCE_LABEL[l.source] || l.source}</span>
        <h2 style="font-size:1.5rem; margin-top:12px; text-transform:none; font-family:var(--font-body); font-weight:600;">${l.title}</h2>
        <p style="color:var(--ink-soft); margin-top:4px;">${loc}</p>

        <div class="plot-price" style="border:none; padding:16px 0;">
          ${rebateHTML(l.price || 0, discountPercent, suffix)}
        </div>

        <div class="ledger-card">
          <div class="row"><span>Bedrooms</span><span>${l.beds ?? "–"}</span></div>
          <div class="row"><span>Bathrooms</span><span>${l.baths ?? "–"}</span></div>
          <div class="row"><span>Size</span><span>${l.sqft ? l.sqft + " sqft" : "–"}</span></div>
          ${l.lotSqft ? `<div class="row"><span>Lot size</span><span>${l.lotSqft} sqft</span></div>` : ""}
          ${l.propertyType ? `<div class="row"><span>Property type</span><span>${l.propertyType.replace(/_/g, " ")}</span></div>` : ""}
          ${l.status ? `<div class="row"><span>Status</span><span>${l.status.replace(/_/g, " ")}</span></div>` : ""}
          ${formatDate(l.listDate) ? `<div class="row"><span>Listed</span><span>${formatDate(l.listDate)}</span></div>` : ""}
        </div>

        <p style="font-size:0.82rem; color:var(--ink-soft); margin-top:16px;">
          This is a live result from ${SOURCE_LABEL[l.source] || l.source}, not our own inventory — nothing here books or pays through this site.
        </p>

        <button class="btn block" id="modal-ask-btn" style="margin-top:16px;">Ask us about this property</button>
        <button class="btn outline block" id="modal-close-btn" style="margin-top:10px;">Close</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.querySelector("#modal-close-btn").addEventListener("click", () => backdrop.remove());
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.querySelector("#modal-ask-btn").addEventListener("click", () => askAboutProperty(l));
}

export function renderExternalListings(el, listings, discountPercent = null) {
  el.innerHTML = listings.length
    ? listings.map(l => externalCardHTML(l, discountPercent)).join("")
    : `<div class="empty-state">No results for this search yet — try a different city or widen your filters.</div>`;

  el.querySelectorAll(".external-card").forEach(card => {
    const l = JSON.parse(decodeURIComponent(card.dataset.listing));

    // Clicking anywhere on the card (except the button) opens the detail view.
    card.addEventListener("click", (e) => {
      if (e.target.closest(".ask-btn")) return;
      openDetailModal(l, discountPercent);
    });
    card.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".ask-btn")) {
        e.preventDefault();
        openDetailModal(l, discountPercent);
      }
    });

    // The CTA button stays a direct shortcut to the contact form, same as
    // before — it just needs its own listener since the card above no
    // longer uses one big delegated handler.
    card.querySelector(".ask-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      askAboutProperty(l);
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
