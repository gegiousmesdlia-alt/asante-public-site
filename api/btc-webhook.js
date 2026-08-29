// Vercel serverless function — POST /api/btc-webhook
// NOWPayments calls this when a payment's status changes. Verify the HMAC
// signature before trusting the payload, then update your own database
// (e.g. Firestore "bookings" collection) so the site reflects paid status
// without relying on the client to report success.
import crypto from "crypto";

function sortedStringify(obj) {
  if (Array.isArray(obj)) return "[" + obj.map(sortedStringify).join(",") + "]";
  if (obj && typeof obj === "object") {
    return "{" + Object.keys(obj).sort().map(k => JSON.stringify(k) + ":" + sortedStringify(obj[k])).join(",") + "}";
  }
  return JSON.stringify(obj);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const signature = req.headers["x-nowpayments-sig"];
  const expected = crypto
    .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET)
    .update(sortedStringify(req.body))
    .digest("hex");

  if (signature !== expected) return res.status(401).json({ error: "Invalid signature" });

  // TODO: write req.body.payment_status to your Firestore "bookings" doc
  // keyed by req.body.order_id, using the Firebase Admin SDK (not the
  // client SDK) since this runs server-side.

  return res.status(200).json({ received: true });
}
