// Vercel serverless function — GET /api/payment-status?paymentId=...
export default async function handler(req, res) {
  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });

  try {
    const upstream = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: { "x-api-key": process.env.NOWPAYMENTS_API_KEY }
    });
    if (!upstream.ok) return res.status(502).json({ error: "Gateway error" });
    const data = await upstream.json();
    // NOWPayments statuses: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
    return res.status(200).json({ status: data.payment_status, raw: data });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
