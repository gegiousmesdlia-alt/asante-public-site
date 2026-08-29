// ==========================================================================
// BTC payment flow. The BTC address and amount must be generated server-side
// (never expose a payment-provider secret key in browser JS), so this module
// just calls your own API route, which in turn calls the crypto payment
// gateway. See /api/create-btc-payment.js for the serverless function.
// ==========================================================================
import { showToast } from "./main.js";

const API_BASE = ""; // same-origin when deployed on Vercel, e.g. "" or "https://yourapp.vercel.app"

export async function createBtcPayment({ listingId, amountUsd, purpose, email }) {
  const res = await fetch(`${API_BASE}/api/create-btc-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, amountUsd, purpose, email })
  });
  if (!res.ok) {
    showToast("Could not start the BTC payment. Try again shortly.");
    throw new Error("payment_create_failed");
  }
  return res.json(); // { paymentId, btcAddress, btcAmount, qrCodeUrl, expiresAt }
}

export async function checkBtcPayment(paymentId) {
  const res = await fetch(`${API_BASE}/api/payment-status?paymentId=${encodeURIComponent(paymentId)}`);
  if (!res.ok) throw new Error("status_check_failed");
  return res.json(); // { status: "waiting" | "confirming" | "finished" | "expired" }
}

// Polls status every 8s and calls onUpdate(status) until finished/expired, or maxTries reached.
export function pollBtcPayment(paymentId, onUpdate, { intervalMs = 8000, maxTries = 90 } = {}) {
  let tries = 0;
  const timer = setInterval(async () => {
    tries++;
    try {
      const data = await checkBtcPayment(paymentId);
      onUpdate(data);
      if (["finished", "expired", "failed"].includes(data.status) || tries >= maxTries) {
        clearInterval(timer);
      }
    } catch {
      if (tries >= maxTries) clearInterval(timer);
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
