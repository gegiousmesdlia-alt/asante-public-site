# Asante & Grove — Real Estate Website

Vanilla HTML/CSS/JS, Firebase backend, Cloudinary for images, BTC payments
via a serverless function, deployed on Vercel. The admin panel is a fully
separate folder meant to be deployed to its own URL.

## Structure

```
/                    → public site (index, listings, listing, marketplace, agents, contact, login, signup, dashboard, reviews)
/css, /js            → shared styles and modules for the public site
/api                 → Vercel serverless functions (BTC payment creation/status/webhook, external-listings proxy)
/admin               → SEPARATE deploy — the staff-only backstage panel
firestore.rules      → Firestore security rules
```

## 1. Firebase

1. Create a project at console.firebase.google.com.
2. Enable **Authentication → Email/Password**.
3. Enable **Firestore Database**.
4. Copy your web app config into `js/firebase-config.js` **and** `admin/js/firebase-config.js` (both need it — they're separate deployments).
5. Deploy `firestore.rules` (Firestore → Rules tab, or `firebase deploy --only firestore:rules`).
6. Firestore collections used: `listings`, `agents`, `users`, `enquiries`, `bookings`, `admins`, `reviews`.
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

## 6. Nationwide live listings (RealtyAPI.io)

`listings.html` is the **single search page** — one search bar drives both
result sets. It always shows your own Firestore listings ("Our listings").
When the location field has an actual picked suggestion (not just typed
text), a second "Nationwide search" section appears below with live results
from
[RealtyAPI.io](https://realtyapi.io), separate from your own agency listings
in Firestore. It's clearly labeled as external data, and every result card
stays on this site — there's no outbound link to Realtor/Redfin/Apartments;
clicking "Ask us about this property" pre-fills your own contact form
instead of navigating away.

**Enter the RealtyAPI key through the admin panel — no code or Vercel dashboard needed for this one.** Log into `/admin` → **Settings** tab → paste the key → Save. It's stored in Firestore (`settings/integrations`, admin-only read/write) and the `/api/external-listings` function reads it server-side, so it's never sent to a visitor's browser.

**That said, one thing still requires a one-time Vercel setup** — the serverless function needs privileged access to read that Firestore document even for anonymous visitors (who obviously aren't logged in as admin). It does this with the **Firebase Admin SDK**, which needs a service account credential:

1. Firebase Console → ⚙️ Project Settings → **Service accounts** tab → **Generate new private key**. This downloads a JSON file.
2. Minify it to a single line (remove line breaks) and set it as a Vercel environment variable:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"asantereal-estates", ... }
   ```
3. Redeploy after adding it (env var changes don't apply to an already-running deployment).

This is the **only** secret you still set by hand in Vercel — it's a one-time thing that unlocks the admin-panel-managed settings pattern for RealtyAPI now, and any similar integration you add later, without ever touching Vercel again for those.

Keep that service account JSON somewhere safe outside the repo — it grants full server-side access to your Firestore database, so treat it like a master password, not a regular API key.

*(A `REALTYAPI_KEY` Vercel environment variable still works too, as a manual override, if you'd rather skip the admin-panel route for this specific key — the serverless function checks that first before falling back to Firestore.)*

**Before relying on this in production**, double-check the filter parameter
names (`price_min`, `beds_min`, etc.) against the current spec at
`https://<provider>.realtyapi.io/openapi.json` or the playground at
realtyapi.io/dashboard — provider APIs evolve, and the code was written
against documentation available at the time.

The results auto-refresh every 3 minutes per visitor. The serverless
function includes a short in-memory cache to reduce API credit usage, but
it's best-effort only (it doesn't persist across cold starts or multiple
server regions) — for real traffic, swap in Vercel KV or Upstash Redis
keyed by the search query, or you'll burn through your RealtyAPI plan's
credits faster than expected.

## 7. Site-wide discount & marketplace rebates

Set from admin panel → **Settings** → "Site-wide discount." One percentage
controls pricing everywhere:

- **Your own listings** (Firestore): the displayed price actually changes —
  original struck through, discounted price shown, "X% OFF" badge. This is
  your own inventory, so this is a normal price change.
- **Nationwide Search marketplace listings**: the real Realtor.com/Redfin/
  Apartments.com price is always shown too, struck through — the discounted
  number is explicitly labeled "your price with us" and the badge reads
  "Asante & Grove covers X%," framing it as the agency subsidizing part of
  the buyer's cost, not as the property's actual market price changing.
  This only works as an honest promotion if the business is genuinely
  prepared to cover that gap for whatever bookings come through it.

**Worth checking with a real estate attorney or your broker before this goes
live at scale**: commission rebates to buyers are legal in most U.S. states
but restricted or banned outright in a handful of them, and rules shifted
industry-wide after the 2024 NAR commission-lawsuit settlement. Since this
site pitches a rebate on properties listed by other brokerages, it's worth
confirming your state (and the buyer's state, if you're operating
nationally) permits this before advertising it publicly.

## 8. Location matching (no third-party geolocation API needed)

The homepage and the marketplace page both try to detect a visitor's
approximate city automatically and use it — pre-filling the search box, and
on the homepage, showing "Homes in [city]" instead of the generic featured
list when local listings exist.

This uses **Vercel's own edge network**, which already tags every request
with an approximate city/region for routing purposes — `api/geo.js` just
reads those headers (`x-vercel-ip-city`, etc.) and returns them. No
third-party geolocation service, no API key, nothing to configure.

**This only works once actually deployed on Vercel.** Locally (or on any
other host), those headers won't be present, so `api/geo.js` returns
`available: false` and both pages fall back to their normal behavior
(generic featured listings, an empty marketplace search box) — nothing
breaks, it just won't be location-aware until it's live on Vercel.

It's approximate (city-level, the same accuracy any CDN uses) and nothing
about it is logged or stored — it's read fresh per request and immediately
discarded.

## 9. Reviews

The public site reads from a `reviews` collection (star rating, review text,
an optional admin reply) shown on the homepage and on `/reviews.html`.
Real reviews should come from a "leave a review" flow tied to a signed-in
buyer's completed booking — that submission form isn't built yet, so for now
reviews are written manually from the admin panel's **Reviews** tab (useful
for transcribing feedback you collect by phone/WhatsApp/email).

The Reviews tab also has a **"Seed 24 preview reviews (demo only)"** button.
It's there purely so you can check spacing, star ratings, and the admin-reply
thread with realistic-length content before real reviews exist. Every entry
it creates is tagged `demo: true` and shown with a red **DEMO** badge in the
admin table.

**Before going live: delete every demo-tagged review from the Reviews tab.**
Publishing invented reviews as if they're from real customers isn't
something to launch with — the seeder exists for layout preview only.

## 10. Address / ZIP / town autocomplete

The marketplace page's location field now shows live suggestions as you
type — cities, ZIP codes, neighborhoods, addresses — pulled from each
provider's own search-box typeahead (`api/location-suggest.js`, using the
same admin-saved RealtyAPI key). **The search only runs once a suggestion
is actually clicked or selected with the keyboard** — typing "Austn" and
hitting Search without picking anything shows a prompt to pick a suggestion
instead of silently searching on the unmatched text.

The one auto-detected exception is the IP-based city prefill (section 8
above) — that comes from Vercel's own geolocation, not free-typed user
input, so it skips the pick-a-suggestion requirement and searches directly.

Endpoint paths per provider (`/parser/suggest` for Realtor, `/autocomplete`
for Apartments.com and Redfin) were confirmed from RealtyAPI's docs at the
time this was built — verify against `https://<provider>.realtyapi.io/openapi.json`
if suggestions ever come back empty, since provider endpoints do shift.
