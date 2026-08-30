import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Reads settings/promotions.discountPercent — a number like 70 means
// "show 70% of the original price" (i.e. 30% off). null/100/missing means
// no discount is active.
export async function fetchDiscountPercent() {
  try {
    const snap = await getDoc(doc(db, "settings", "promotions"));
    const pct = snap.exists() ? snap.data().discountPercent : null;
    return (typeof pct === "number" && pct > 0 && pct < 100) ? pct : null;
  } catch {
    return null;
  }
}

export function applyDiscount(price, percent) {
  if (!percent || !price) return price;
  return Math.round(price * (percent / 100));
}

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// For OWN listings only — the agency actually controls this price, so it's
// fine to show a real "was / now" comparison.
export function priceHTML(price, percent, suffix = "") {
  if (!percent) return `<span class="amount">${fmt(price || 0)}${suffix}</span>`;
  const discounted = applyDiscount(price, percent);
  return `
    <span class="price-group">
      <span class="amount">${fmt(discounted)}${suffix}</span>
      <span class="price-was">${fmt(price)}</span>
      <span class="discount-badge">${100 - percent}% OFF</span>
    </span>`;
}

// For EXTERNAL (marketplace) listings only — the property itself still
// costs what Redfin/Realtor/Apartments.com list it at; this is the agency
// covering part of that cost for the buyer, so it's labeled as a rebate
// rather than presented as the actual market price.
export function rebateHTML(price, percent, suffix = "") {
  if (!percent || !price) return `<span class="amount">${fmt(price || 0)}${suffix}</span>`;
  const yourPrice = applyDiscount(price, percent);
  return `
    <span class="price-group">
      <span class="listed-price-label">Listed at ${fmt(price)}${suffix}</span>
      <span class="amount">${fmt(yourPrice)}${suffix} <span class="rebate-tag">your price with us</span></span>
      <span class="discount-badge">Asante &amp; Grove covers ${100 - percent}%</span>
    </span>`;
}
