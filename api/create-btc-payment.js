// Vercel serverless function — POST /api/create-btc-payment
// Creates a BTC invoice using NOWPayments (nowpayments.io). Any similar
// non-custodial crypto gateway (BTCPay Server, Coinbase Commerce) works the
// same way: keep the API key here, never in client JS.
//
// Env var required (set in Vercel dashboard): NOWPAYMENTS_API_KEY

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { listingId, amountUsd, purpose, email } = req.body || {};
  if (!amountUsd || amountUsd <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const upstream = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price_amount: amountUsd,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: `${purpose || "booking"}-${listingId || "na"}-${Date.now()}`,
        order_description: `${purpose || "Booking fee"} — listing ${listingId || ""}`,
        ipn_callback_url: `${process.env.PUBLIC_BASE_URL}/api/btc-webhook`,
        is_fee_paid_by_user: true
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return res.status(502).json({ error: "Gateway error", detail: errText });
    }

    const data = await upstream.json();
    return res.status(200).json({
      paymentId: data.payment_id,
      btcAddress: data.pay_address,
      btcAmount: data.pay_amount,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=bitcoin:${data.pay_address}?amount=${data.pay_amount}`,
      expiresAt: data.expiration_estimate_date || null
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
