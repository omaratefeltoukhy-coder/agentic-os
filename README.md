# GulfPaws 🐾

A pet care booking marketplace for the Gulf — Dubai, Abu Dhabi, Riyadh, Jeddah,
Doha, Kuwait City, Manama and Muscat. Owners book dog walkers and cat sitters
in 30-minute increments; caregivers set their own rate and free time slots.

## Build status — all 6 steps shipped

- [x] Step 1 — Auth (email + Google) + roles + database schema
- [x] Step 2 — Caregiver onboarding wizard + dashboard
- [x] Step 3 — Marketplace browse/search + booking engine
- [x] Step 4 — Stripe payments + commission + booking lifecycle + notifications
- [x] Step 5 — Reviews, referrals, promo codes, subscriptions, featured listings
- [x] Step 6 — Admin panel, i18n/RTL, SEO pages, PWA

## Quick start — try it now

```bash
npm install
npx prisma migrate deploy   # applies all migrations
npx prisma db seed          # 11 demo caregivers across all 8 cities + admin + demo owner
npm run dev
```

Open `http://localhost:3000`. Demo accounts (password for all: `Demo1234`):

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@gulfpaws.app` | Verification queue, bookings, promos, reviews, commission settings |
| Owner | `sara.owner@demo.gulfpaws.app` | Has a pet ("Max") ready to book with |
| Caregiver | `maria.santos@demo.gulfpaws.app` | Verified, Pro badge, featured, 34 reviews |
| Caregiver | `carlos.mendoza@demo.gulfpaws.app` | Unverified, no reviews — see the "NEW" badge |

Promo code `FIRST20` (20% off, first booking only) is seeded and ready to use
at checkout.

## What's built

### Auth & roles (Step 1)
Email + password (bcrypt) and Google OAuth via NextAuth v5, OTP email
verification, forgot/reset password, 30-day sessions. A user can hold both
`OWNER` and `CAREGIVER` roles with a header switcher between them.

### Caregiver onboarding & dashboard (Step 2)
Two-step wizard (profile/rate/photo/languages/bio → weekly availability grid
with cool-hours/heat-aware highlighting). Dashboard covers rate & profile
editing, availability + date overrides + vacation mode, payout (IBAN)
settings, ID verification upload, profile completeness meter, and a
Caregiver Pro / featured-listing upsell.

### Marketplace & booking engine (Step 3)
Search/filter by city, service, language, price, rating, verified badge, and
availability on a specific date. Caregiver detail pages with a full booking
wizard: service → date (14-day picker, dimmed when unavailable) → duration →
start time (only truly free slots, computed against existing bookings) →
pet → note → cash or card. Double-booking is prevented with a serializable
DB transaction, not just a unique constraint (a 90-minute booking correctly
blocks all three 30-minute sub-slots it overlaps).

### Payments & lifecycle (Step 4)
Stripe Checkout with manual-capture (escrow-style — authorized on request,
captured on completion, released or partially captured on cancellation per
the 12-hour free-cancellation policy). **Cash-on-delivery is always
available** and is what makes the whole booking flow testable without live
Stripe keys — the card path is fully implemented and activates the moment
`STRIPE_SECRET_KEY` is set. Booking lifecycle (Requested → Accepted → In
Progress → Completed → Reviewed, plus Declined/Cancelled with 2-hour
auto-decline) drives in-app chat (phone numbers stay private), photo/video
updates during the visit, and email notifications at every step.

### Growth features (Step 5)
Two-way reviews update the caregiver's live rating. Referral program
(`?ref=code` signup tracking, credit awarded on the referred friend's first
completed booking, auto-applied at checkout). Admin-manageable promo codes.
GulfPaws Plus (owner: zero service fees, 5% off, free cancellation anytime)
and Caregiver Pro (10% commission instead of 18%, featured search placement,
Pro badge) subscriptions — both use the same Stripe-or-dev-fallback pattern
as bookings. One-time featured listing boosts (7 days at the top of search).

### Admin, i18n, SEO, PWA (Step 6)
Admin panel (`/admin`, `ADMIN` role required): live stats, ID verification
queue, booking management with refunds, promo code creator, review
moderation, and admin-configurable commission rates that take effect on the
next booking. Arabic/English locale switcher with genuine RTL mirroring
(`dir="rtl"`, not just translated strings — see [i18n coverage](#i18n--rtl-coverage)
below for scope). Auto-generated SEO landing pages at `/find/[service]/[city]`
(16 pages) plus `sitemap.xml`/`robots.txt`. Installable PWA: manifest, app
icons, offline-fallback service worker, install prompt.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, dark theme (petrol `#0E1B24` / gold `#E8A94B`
  / sand `#EDE8DF`), Bricolage Grotesque (display) + Instrument Sans (body)
- **Database**: PostgreSQL + Prisma ORM 6
- **Auth**: NextAuth.js (Auth.js) v5 — Credentials (bcrypt) + Google OAuth
- **Payments**: Stripe (Checkout, manual capture); architected so a regional
  gateway (Telr / PayTabs / Tap Payments) can be swapped in by only touching
  `src/lib/payments/`
- **Validation**: Zod everywhere input crosses a trust boundary
- **File storage**: local disk under `public/uploads` (`src/lib/upload.ts`)
  as the zero-config default — swap in Cloudinary/S3 by replacing that one
  file
- **Email**: Resend, with a console-log fallback in dev
  (`src/lib/notifications/email.ts`)

## Getting started (from scratch)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

Any Postgres works — local, Replit's built-in Postgres, or Neon. Point
`DATABASE_URL` at it in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gulfpaws?schema=public"
```

### 3. Run migrations and seed demo data

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 4. Configure environment variables

See [Environment variables](#environment-variables) below. At minimum, set
`DATABASE_URL` and `AUTH_SECRET`. Everything else (Google sign-in, Stripe,
Resend) is optional in development — the app degrades gracefully:
Google sign-in errors if clicked without credentials, card payments fall
back to a clear "use Cash instead" message, and verification/booking emails
are logged to the server console instead of sent.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 6. (Optional) Explore the database

```bash
npx prisma studio
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `AUTH_SECRET` | Yes | Random 32+ byte secret for signing JWTs. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes (prod) | Public base URL of the app |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `RESEND_API_KEY` | No | Resend API key for transactional email. Without it, emails are logged to the server console |
| `EMAIL_FROM` | No | From address for outbound email |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | No | Enables real card payments, subscriptions, and featured-listing checkout. Without it, those flows fall back to Cash / a dev-mode direct activation |
| `STRIPE_WEBHOOK_SECRET` | No | Verifies `checkout.session.completed` / `payment_intent.payment_failed` webhooks at `/api/webhooks/stripe` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No | Not wired up — uploads use local disk storage by default (see `src/lib/upload.ts`) |

## Project structure

```
prisma/
  schema.prisma        # Full data model
  seed.ts               # 11 demo caregivers, admin, demo owner, promo code
  migrations/
src/
  proxy.ts              # Route protection (Next 16's middleware convention)
  app/
    page.tsx            # Landing page
    (auth)/               # Signup, login, forgot/reset password
    onboarding/            # Post-signup role picker + caregiver wizard
    dashboard/owner/         # Owner dashboard, pets, bookings, referrals, subscription
    dashboard/caregiver/      # Caregiver dashboard, profile, availability, payouts,
                                # verification, bookings, subscription, featured listing
    browse/, caregivers/[id]/  # Marketplace search + caregiver detail + booking wizard
    find/[service]/[city]/      # SEO landing pages (16 static combinations)
    admin/                       # Admin panel (ADMIN role required)
    api/                          # Route handlers mirroring the app/ tree above
  components/            # ui/, auth/, layout/, caregiver/, booking/, marketplace/,
                          # pets/, subscriptions/, admin/, referrals/, pwa/
  lib/
    auth.ts / auth.config.ts   # NextAuth config (Node vs edge-safe split)
    bookings.ts                  # Overlap-safe booking creation (serializable tx)
    availability.ts                # Free-slot computation for a caregiver/date/duration
    pricing.ts / platform-settings.ts  # Commission, fees, admin-configurable rates
    promo.ts / referrals.ts / subscriptions.ts  # Growth feature logic
    payments/                        # Stripe wrapper + checkout session builder
    notifications/                    # Email + WhatsApp-deep-link + in-app notify()
    upload.ts                          # Local-disk file storage
  i18n/dictionary.ts     # en/ar strings (see coverage note below)
```

## Database schema

- **Auth**: `User`, `Account`, `Session`, `VerificationToken`, `OtpCode`
- **Caregivers**: `CaregiverProfile`, `AvailabilitySlot` (recurring weekly
  30-min slots), `AvailabilityOverride` (day-off / vacation dates)
- **Owners**: `Pet`
- **Bookings**: `Booking` (DB-level unique constraint on
  `caregiverProfileId + date + startMinute`, plus application-level overlap
  checking for multi-slot durations), `BookingPhotoUpdate`
- **Trust**: `Review` (two-way — unique per `bookingId + authorId`),
  `Conversation`, `Message`
- **Monetization**: `Subscription`, `PromoCode`, `PromoRedemption`,
  `ReferralCredit`, `FeaturedListing`
- **Platform**: `PlatformSetting` (admin-configurable commission rates),
  `Notification`

Gulf specifics baked into the schema: `GulfCity` enum (8 launch cities),
`Currency` enum (AED/SAR/QAR/KWD/BHD/OMR), `Language` enum, and Decimal money
fields (never floats) so KWD/BHD/OMR's 3-decimal precision is exact.

## i18n / RTL coverage

The RTL mechanism is real, not cosmetic: switching to Arabic sets
`dir="rtl"` on `<html>`, and the flexbox-based layout mirrors natively (logo
moves to the right, nav flips, text right-aligns) — verified visually, not
just wired up. The landing page and header are fully translated via
`src/i18n/dictionary.ts`. Deeper pages (dashboards, booking wizard, admin)
are not yet translated string-by-string — extending coverage is a matter of
adding entries to that dictionary and swapping literals for `t.xxx` the same
way `src/app/page.tsx` does, not new infrastructure.

## Deploying on Replit

1. Create a new Replit from this repo (or import via Git).
2. Add a PostgreSQL database from Replit's Database pane, or connect Neon —
   copy the connection string into `DATABASE_URL` in Replit's Secrets tab.
3. Add `AUTH_SECRET` (generate with `openssl rand -base64 32`) and
   `NEXTAUTH_URL` (your Replit app's public URL) as Secrets.
4. Optionally add `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`,
   `RESEND_API_KEY`/`EMAIL_FROM`, and Stripe keys.
5. Run `npx prisma migrate deploy && npx prisma db seed` once against the
   Replit/Neon database.
6. Set the run command to `npm run build && npm run start`.

## Security notes

- Passwords are bcrypt-hashed (12 rounds); the app never stores plaintext.
- Auth and upload endpoints are rate-limited per IP.
- All API input is validated with Zod before touching the database.
- Route access is enforced in `src/proxy.ts` for `/dashboard`,
  `/onboarding`, `/settings`, `/admin`, `/bookings`, plus per-page and
  per-API-route role/ownership checks (e.g. a caregiver can only accept
  bookings on their own profile; `/admin/*` requires `activeRole === "ADMIN"`
  at both the middleware and API layer).
- Booking creation runs in a `Serializable` transaction to prevent
  double-booking races, not just a unique index.
- No payment card data is ever stored or touches this server — Stripe
  Checkout handles it directly.
