import { db } from "./firebase-config.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// No "approved" filter in the query itself on purpose — Firestore evaluates
// the security rules per-document for a list query, so an unapproved review
// is silently dropped from the results for non-admin readers without
// needing a composite index. (Admins reading from the panel see everything
// because isAdmin() passes the rule regardless of "approved".)
export async function fetchApprovedReviews() {
  try {
    const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Could not load reviews:", err);
    return [];
  }
}

export function ratingSummary(reviews) {
  if (!reviews.length) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  return { avg, count: reviews.length };
}

function stars(n) {
  return `<span class="stars" aria-label="${n} out of 5 stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
}

function initials(name) {
  return (name || "?").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export function reviewCardHTML(r) {
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${initials(r.displayName)}</div>
        <div>
          <div class="review-name">${r.displayName || "Verified buyer"} ${r.verified ? '<span class="badge">Verified buyer</span>' : ""}</div>
          ${stars(r.rating || 0)}
        </div>
      </div>
      <p class="review-text">${r.text || ""}</p>
      ${r.propertyLabel ? `<div class="review-meta">${r.propertyLabel}</div>` : ""}
      ${r.adminReply ? `
        <div class="admin-reply">
          <div class="admin-reply-label">Response from Asante &amp; Grove</div>
          <p>${r.adminReply}</p>
        </div>` : ""}
    </div>`;
}

export function renderReviews(el, reviews) {
  el.innerHTML = reviews.length
    ? reviews.map(reviewCardHTML).join("")
    : `<div class="empty-state">No reviews yet.</div>`;
}
