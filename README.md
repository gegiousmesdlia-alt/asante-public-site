# Asante & Grove — Real Estate Website

Vanilla HTML/CSS/JS, Firebase backend, Cloudinary for images, BTC payments
via a serverless function, deployed on Vercel. The admin panel is a fully
separate folder meant to be deployed to its own URL.

## Structure

```
/                    → public site (index, listings, listing, agents, contact, login, signup, dashboard)
/css, /js            → shared styles and modules for the public site
/api                 → Vercel serverless functions (BTC payment creation, status, webhook)
/admin               → SEPARATE deploy — the staff-only backstage panel
firestore.rules      → Firestore security rules
```

## 1. Firebase

1. Create a project at console.firebase.google.com.
2. Enable **Authentication → Email/Password**.
3. Enable **Firestore Database**.
4. Copy your web app config into `js/firebase-config.js` **and** `admin/js/firebase-config.js` (both need it — they're separate deployments).
5. Deploy `firestore.rules` (Firestore → Rules tab, or `firebase deploy --only firestore:rules`).
6. Firestore collections used: `listings`, `agents`, `users`, `enquiries`, `bookings`, `admins`.
7. To grant someone admin-panel access: create a user via Authentication, then add a document at `admins/{their-uid}` (any field, e.g. `{ name: "Victor" }`).

## 2. Cloudinary (property & agent photos)

1. Create a free account at cloudinary.com.
2. Settings → Upload → add an **unsigned** upload preset.
3. Put your cloud name and preset into `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_UPLOAD_PRESET` in `admin/js/firebase-config.js`.

## 3. BTC payments

Booking fees can be settled in BTC via [NOWPayments](https://nowpayments.io) (a
non-custodial crypto payment gateway — swap in BTCPay Server or Coinbase
Commerce with the same pattern if you prefer). The secret API key must never
sit in browser JS, so the flow goes through three Vercel serverless functions:

- `api/create-btc-payment.js` — creates the invoice, returns a BTC address + QR code
- `api/payment-status.js` — the browser polls this to show live status
- `api/btc-webhook.js` — receives NOWPayments' confirmation and should write the result into a `bookings` Firestore doc using the **Firebase Admin SDK** (not the client SDK) — wire that up before going live

Environment variables to set in the Vercel dashboard:

```
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...
PUBLIC_BASE_URL=https://yourdomain.com
```

## 4. Deploying

- **Public site**: push the repo root to Vercel as one project.
- **Admin panel**: deploy the `/admin` folder as a *separate* Vercel project (or any static host) so it lives on its own subdomain, e.g. `backstage.yourdomain.com`, and isn't linked from the public site's navigation.

## 5. Seeding data

Nothing renders on the public site until Firestore has real documents — add
a few listings and agents from the admin panel first.
