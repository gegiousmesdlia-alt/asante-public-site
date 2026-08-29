import { db, auth } from "./firebase-config.js";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from "./main.js";

export async function getFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().favorites || []) : [];
}

export async function toggleFavorite(listingId) {
  const user = auth.currentUser;
  if (!user) { showToast("Sign in to save properties."); return null; }
  const ref = doc(db, "users", user.uid);
  const favs = await getFavorites(user.uid);
  const isFav = favs.includes(listingId);
  await setDoc(ref, {}, { merge: true });
  await updateDoc(ref, { [isFav ? "favorites" : "favorites"]: isFav ? arrayRemove(listingId) : arrayUnion(listingId) });
  showToast(isFav ? "Removed from saved." : "Saved to your favorites.");
  return !isFav;
}
