import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const DEFAULTS = {
  businessName: "Asante & Grove",
  tagline: "Est. Registry No. 0119",
  contactEmail: "hello@asanteandgrove.example",
  contactPhone: "",
  officeAddress: "Denver, CO",
  ownerName: "",
  ownerEmail: "",
  ownerBio: "",
  ownerPhoto: ""
};

export async function fetchSiteInfo() {
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    return snap.exists() ? { ...DEFAULTS, ...snap.data() } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

// Applies business name + tagline to the header brand on every page — the
// markup is identical across pages (a text node followed by <small>), so
// this works without needing per-page IDs added anywhere.
export function applyBrandInfo(info) {
  const brand = document.querySelector(".brand");
  if (!brand) return;
  const small = brand.querySelector("small");
  const nameNode = brand.childNodes[0];
  if (nameNode && nameNode.nodeType === Node.TEXT_NODE) nameNode.textContent = info.businessName + " ";
  if (small) small.textContent = info.tagline;
}
