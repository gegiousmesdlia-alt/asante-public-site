// Server-side ONLY. Uses the Firebase Admin SDK, which authenticates with a
// service account and bypasses Firestore security rules entirely — this is
// how a serverless function can read admin-only settings (like a saved
// third-party API key) on behalf of an anonymous site visitor, without ever
// exposing that key to the browser.
//
// One-time setup (see README section "Admin-managed API keys"):
//   1. Firebase Console → Project Settings → Service accounts → Generate new private key
//   2. That downloads a JSON file. Minify it to one line and set it as the
//      Vercel environment variable FIREBASE_SERVICE_ACCOUNT_KEY.
//
// This is the ONLY secret you still set in Vercel by hand — every other
// third-party key (RealtyAPI, etc.) can then be entered through the admin
// panel UI and is read from Firestore at request time.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set on the server");

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

// Reads settings/integrations and returns a single key's value, or null.
export async function getIntegrationSetting(key) {
  const snap = await adminDb().collection("settings").doc("integrations").get();
  if (!snap.exists) return null;
  return snap.data()[key] || null;
}

// Verifies an "Authorization: Bearer <idToken>" header sent from the admin
// panel actually belongs to a signed-in admin. Used by server endpoints
// that perform admin-only actions (like resetting the listings cache) so
// they can't be called by just anyone who finds the URL.
export async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) throw new Error("Missing Authorization header");

  const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
  const adminSnap = await adminDb().collection("admins").doc(decoded.uid).get();
  if (!adminSnap.exists) throw new Error("Not an admin account");
  return decoded;
}
