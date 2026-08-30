import { db } from "./firebase-config.js";
import { collection, getDocs, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { plotCode } from "./main.js";
import { priceHTML } from "./pricing.js";

export async function fetchListings() {
  const snap = await getDocs(query(collection(db, "listings"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchListing(id) {
  const snap = await getDoc(doc(db, "listings", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function cardHTML(l, discountPercent = null) {
  const img = (l.images && l.images[0]) || "https://placehold.co/600x450/E2D8C3/14171C?text=No+Photo";
  const suffix = l.listingType === "rent" ? "/yr" : "";
  return `
    <a class="plot-card" href="listing.html?id=${l.id}">
      <div class="thumb">
        <span class="plot-tag ${l.listingType === "rent" ? "rent" : ""}">${l.listingType === "rent" ? "For Rent" : "For Sale"}</span>
        <img src="${img}" alt="${l.title || "Property photo"}" loading="lazy">
      </div>
      <div class="plot-body">
        <span class="plot-code">${plotCode(l.id)}</span>
        <h3>${l.title || "Untitled listing"}</h3>
        <span class="plot-loc">${l.location || ""}</span>
        <div class="plot-meta">
          <span>${l.beds ?? "–"} bd</span>
          <span>${l.baths ?? "–"} ba</span>
          <span>${l.sizeSqm ? l.sizeSqm + " m²" : "–"}</span>
        </div>
        <div class="plot-price">
          ${priceHTML(l.price || 0, discountPercent, suffix)}
          <span class="btc">₿ accepted</span>
        </div>
      </div>
    </a>`;
}

export function renderList(el, listings, discountPercent = null) {
  if (!listings.length) {
    el.innerHTML = `<div class="empty-state">No listings match this search yet — try a different filter.</div>`;
    return;
  }
  el.innerHTML = listings.map(l => cardHTML(l, discountPercent)).join("");
}

export function applyFilters(all, { type, location, q }) {
  return all.filter(l => {
    if (type && type !== "all" && l.listingType !== type) return false;
    if (location && location !== "all" && l.location !== location) return false;
    if (q && !(`${l.title} ${l.location}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
}
