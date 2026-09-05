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

**Staying under the free plan's 250-request limit.** A few things are
already tuned for this:

- Results auto-refresh every **20 minutes** per visitor (not 3) — plenty
  fresh for real estate, and a much lighter drain across many open tabs.
- The server cache (`api/external-listings.js`) also holds each search
  result for 20 minutes, shared across every visitor — the first person to
  search "Austin, TX" spends a real credit; the next 50 people searching
  the same thing in that window get the cached answer for free. It's
  best-effort only (an in-memory cache doesn't persist across cold starts
  or multiple server regions) — for real traffic, swap in Vercel KV or
  Upstash Redis keyed by the search query for a cache that actually holds.
- Clicking a result card opens a detail view built entirely from data the
  search already returned — it never spends a second credit per click.
- The homepage's fallback-city teaser tries at most 2 backup cities if
  your visitor's own area comes up empty (was 5) — worst case that's a
  handful of credits on a cold page load, not over a dozen.

**If 250/month is still too tight once real traffic hits**, the fastest
further cut is dropping to a single provider — `lib/realty.js`'s
`PROVIDERS` list currently queries 2 providers per search (e.g. Realtor +
Redfin for sale). Trimming that array to just `realtor` (the one with
confirmed-correct field mappings) halves credit use per search instantly,
at the cost of fewer results per query.

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

## 11. Function timeout note (Vercel free plan)

Vercel's free (Hobby) plan caps serverless function execution at **10
seconds total**, with no way to raise it without upgrading. The nationwide
search and autocomplete functions each call 1–2 external providers, plus a
Firestore lookup for your saved API key — on a slow or "cold" request this
can add up. `lib/realty.js` gives each individual provider call a 7-second
timeout, so one slow provider can't take the whole request down — whatever
answered in time gets used, and a slower one is just skipped for that
request rather than crashing everything.

If nationwide search still times out occasionally under real traffic,
upgrading to Vercel Pro raises this cap significantly (up to 60s by
default, more with Fluid compute) — worth knowing if this becomes a
recurring issue at scale.

## 12. Persistent nationwide-listings cache

Nationwide search results now stay saved **permanently** in Firestore
(collection `listingsCache`) once fetched — a repeat search for the same
location, filters, and page is served from that saved copy instead of
spending another RealtyAPI credit, with no time-based expiry.

**Tradeoff, on purpose:** since nothing expires automatically, results can
go stale (a property that's since sold will still show as available).
Admin panel → Settings → **"Reset saved nationwide listings"** wipes the
whole cache, so the very next search for that place fetches fresh again.

This is written and read only via the Firebase Admin SDK (server-side) —
`firestore.rules` locks `listingsCache` to `allow read, write: if false`,
since there's no reason for any client, admin included, to touch it
directly.

**One deployment detail:** the reset button lives in the admin panel, but
the endpoint it calls (`/api/admin/reset-external-cache`) only exists on
the **public site's** Vercel deployment — they're separate projects. Set
`PUBLIC_SITE_BASE_URL` in `admin/js/firebase-config.js` to your real public
site URL before this button will work.

## 13. Editable site info

Admin panel → Settings → **"Site info"** — business name, header tagline,
contact email/phone, office address, and the site owner's name/email.
Saved to `settings/site` (public read, admin-only write).

What's wired up to actually use it right now:
- **Business name + tagline**: applied to the header on every public page
  automatically (`js/main.js` → `js/site-info.js`), no per-page changes
  needed.
- **Contact email/phone/address + owner name/email**: shown on
  `contact.html`.

Not yet wired to every mention of the business name/email across the
site (e.g. footer copyright lines still say "Asante & Grove" as static
text) — extend `js/site-info.js`'s `applyBrandInfo` pattern to other pages
if you want full coverage later.

## 14. Messaging

Two kinds of conversation, both real-time (Firestore `onSnapshot`), both
stored in one `messages` collection, distinguished by a `kind` field:

- **General** — the floating chat bubble (bottom-right) on every public
  page. Visitor asks the business anything; admin replies from the
  Messages tab.
- **Per-listing** — a "Message the agent" box on each listing's detail
  page, scoped to that specific property (`kind: "listing"`, tagged with
  `listingId`/`listingLabel`).

**Guest vs. registered, and local persistence:** a signed-in user's
messages are tied to their Firebase uid. A guest (no account) gets a
random ID generated once and stored in `localStorage`
(`js/guest-id.js`) — durable across visits without requiring sign-up,
though it resets if they clear browser data. Admin panel tags every
thread **Guest** or **Registered** so you can tell them apart at a glance.

**"Extreme so they don't lose it" — what this does and doesn't cover:**
every thread is mirrored to `localStorage` on every update
(`js/messaging.js`), so a page refresh renders instantly from the local
copy while the live Firestore listener catches back up, and if Firestore
is briefly unreachable the visitor still sees their full history instead
of a blank panel. **What this is NOT**: an offline send-queue. Sending a
message still requires an active connection — if someone's offline when
they hit send, that message doesn't get silently queued and retried
later; it just fails. A true offline-first send queue is a meaningfully
bigger build (background sync, conflict resolution) and is a reasonable
next step if that's needed later, not something this v1 includes.

**Security tradeoff worth knowing about:** `firestore.rules` allows public
read/create on `messages`. Since guests aren't authenticated by Firebase
Auth at all, there's no real per-user access control to write for them —
`threadId` (which embeds a random guest ID or a signed-in uid) functions
as an unguessable capability token rather than true authorization. This is
an intentional MVP tradeoff, not an oversight. For stronger guarantees
later, look at Firebase Anonymous Auth for guests (gives them a real
`request.auth.uid` rules can check) or routing sends through a Cloud
Function that validates more strictly.

## 15. Chat bug fix (same root cause as the reviews bug)

The floating chat widget and per-listing chat were showing nothing after
sending a message — same underlying cause as the earlier reviews bug:
`js/messaging.js`'s `subscribeToThread` combined `where("threadId", "==", ...)`
with `orderBy("createdAt")`, which needs a Firestore composite index that
doesn't exist. Fixed the same way: dropped the `orderBy`, sort client-side
instead. No Firestore index needs creating.

## 16. Company History page + real agent teaser

- `about.html` — a founding story, timeline, and company address, written
  to read like the business has been around for two decades. This is
  fictional marketing copy for the business itself (like any company's
  "About Us" page) — different in kind from fabricated customer reviews,
  since visitors read a company's own history page as the company's own
  narrative, not third-party testimony.
- Homepage's agent teaser previously showed literal placeholder debug text
  ("Add your agents", "See agents.html", "Populate Firestore") as if those
  were real agent names — that was leftover scaffolding, now fixed to pull
  real agents from Firestore the same way `agents.html` does, or show a
  clean empty state if none exist yet.

## 17. Owner photo + details (homepage)

Admin → Settings → Site info now includes an owner photo upload and bio.
When set, a small circular avatar appears in the homepage header — click
it to see the owner's name, bio, and email.

**Deliberately not included: a home address field.** Publishing a real
person's home address publicly is a genuine safety risk — it's a common
first step in harassment or stalking, independent of whose site it is or
how the request is framed. The owner modal links to the Contact page's
office address instead, which is the appropriate public-facing location
for a business owner to be reachable at.
