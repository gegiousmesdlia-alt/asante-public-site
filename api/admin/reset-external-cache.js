// Vercel serverless function — POST /api/admin/reset-external-cache
// Requires an "Authorization: Bearer <idToken>" header from a signed-in
// admin (verified server-side against the admins/{uid} whitelist via
// requireAdmin). Deletes every document in listingsCache, forcing every
// future nationwide search to fetch fresh from RealtyAPI again.
//
// CORS note: this endpoint lives on the PUBLIC SITE's deployment, but the
// admin panel is a separate Vercel project on a different domain — so
// calling this from the admin panel is a cross-origin request. The headers
// below allow that specific case (only this admin-only, token-verified
// endpoint — nothing else needs to allow cross-origin requests).
import { adminDb, requireAdmin } from "../../lib/firebase-admin.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await requireAdmin(req);
  } catch (err) {
    return res.status(401).json({ error: "Not authorized", detail: err.message });
  }

  try {
    const db = adminDb();
    const snap = await db.collection("listingsCache").get();
    // Firestore batches cap at 500 writes — chunk deletes just in case the
    // cache has grown large.
    const docs = snap.docs;
    let deleted = 0;
    for (let i = 0; i < docs.length; i += 450) {
      const batch = db.batch();
      docs.slice(i, i + 450).forEach(d => batch.delete(d.ref));
      await batch.commit();
      deleted += Math.min(450, docs.length - i);
    }
    return res.status(200).json({ deleted });
  } catch (err) {
    return res.status(500).json({ error: "Reset failed", detail: err.message });
  }
}
