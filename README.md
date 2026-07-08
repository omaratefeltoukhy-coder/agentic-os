# GulfPaws 🐾

A pet care booking marketplace for the Gulf — Dubai, Abu Dhabi, Riyadh, Jeddah,
Doha, Kuwait City, Manama and Muscat. Owners book dog walkers and cat sitters
in 30-minute increments; caregivers set their own rate and free time slots.

This README grows with each build step. **Step 1 (this step): auth, roles,
and the database schema.**

## Build status

- [x] **Step 1 — Auth + roles + database schema** (this step)
- [ ] Step 2 — Caregiver onboarding wizard + dashboard
- [ ] Step 3 — Marketplace browse/search + booking engine
- [ ] Step 4 — Stripe payments + commission + booking lifecycle + notifications
- [ ] Step 5 — Reviews, referrals, promo codes, subscriptions, featured listings
- [ ] Step 6 — Admin panel, i18n/RTL, SEO pages, PWA

## What's built in Step 1

- **Landing page** — "I'm a pet owner" / "I offer pet care" / "Log in" /
  "Browse as guest", dark petrol/gold theme, mobile-first (390px tested).
- **Auth** — email + password (bcrypt, 12 rounds) and Google OAuth via
  NextAuth (Auth.js) v5, JWT sessions (30-day "stay logged in"), rate-limited
  auth endpoints, email verification via a 6-digit OTP code, forgot/reset
  password flow.
- **Roles** — a user can hold both `OWNER` and `CAREGIVER` roles at once,
  with a role switcher in the header once they hold more than one. New
  Google sign-ups are routed to a one-time "how will you use GulfPaws?"
  screen; email/password sign-ups pick their role on the signup form itself.
- **Profile** — name, Gulf-country-code phone number, WhatsApp opt-in, city,
  language (English/Arabic — full RTL lands in Step 6).
- **Database schema** — the full Prisma schema for the marketplace is
  modeled now (users, caregiver profiles, availability, pets, bookings,
  reviews, chat, subscriptions, promo codes, referrals, featured listings,
  notifications) so later steps don't need destructive migrations. Only the
  auth/user pieces have working UI and API routes so far — the rest are
  scaffolded tables waiting on their build step.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom dark theme (petrol `#0E1B24` / gold
  `#E8A94B` / sand `#EDE8DF`), Bricolage Grotesque (display) + Instrument Sans
  (body) via `next/font/google`
- **Database**: PostgreSQL + Prisma ORM 6
- **Auth**: NextAuth.js (Auth.js) v5 — Credentials (bcrypt) + Google OAuth,
  `@auth/prisma-adapter`
- **Validation**: Zod
- **Payments** (later step): Stripe, architected so a regional gateway (Telr /
  PayTabs / Tap Payments) can be swapped in
- **Notifications** (later step): Resend for email, WhatsApp deep links

## Getting started

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

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Configure environment variables

See [Environment variables](#environment-variables) below. At minimum, set
`DATABASE_URL` and `AUTH_SECRET` to run the app. Google sign-in and outbound
email are optional in development — without them, "Continue with Google"
will error if clicked until credentials are set, and verification/reset
codes are logged to the server console instead of emailed.

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
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Without these, the Google button will error if clicked. |
| `RESEND_API_KEY` | No | Resend API key for transactional email. Without it, emails are logged to the server console instead of sent — useful for local dev. |
| `EMAIL_FROM` | No | From address for outbound email |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | No (yet) | Wired up in the payments build step |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No (yet) | Wired up when profile/pet photo upload ships |

## Project structure

```
prisma/
  schema.prisma        # Full data model (see below)
  migrations/
src/
  proxy.ts              # Route protection (Next 16's middleware convention)
  app/
    page.tsx            # Landing page
    (auth)/              # Signup, login, forgot/reset password (shared centered layout)
    onboarding/role/      # Post-Google-signup role picker
    onboarding/caregiver/  # Caregiver role opt-in (full wizard lands in Step 2)
    dashboard/            # Role-aware dashboard shell + owner/caregiver views
    settings/profile/      # Profile editing
    browse/               # Guest-accessible marketplace placeholder
    api/
      auth/               # NextAuth handler + register/verify/forgot/reset routes
      user/                # Role selection + profile update routes
  components/
    ui/                  # Button, Input, Select, Card, Label primitives
    auth/                 # Signup/login/forgot-password/role-select forms
    layout/                # Header, role switcher, user menu
  lib/
    auth.ts / auth.config.ts  # NextAuth config (Node vs edge-safe split)
    prisma.ts             # Prisma client singleton
    password.ts             # bcrypt hashing
    otp.ts                  # Email verification / password reset codes
    rate-limit.ts            # In-memory rate limiter for auth endpoints
    validations/auth.ts       # Zod schemas
    constants/gulf.ts          # Cities, currencies, phone codes, service types
    notifications/email.ts      # Email provider abstraction (Resend today)
```

## Database schema

The schema models the full marketplace so later steps build on stable
tables:

- **Auth**: `User`, `Account`, `Session`, `VerificationToken`, `OtpCode`
- **Caregivers**: `CaregiverProfile`, `AvailabilitySlot` (recurring weekly
  30-min slots), `AvailabilityOverride` (day-off / vacation dates)
- **Owners**: `Pet`
- **Bookings**: `Booking` (with a DB-level unique constraint on
  `caregiverProfileId + date + startMinute` to prevent double-booking),
  `BookingPhotoUpdate`
- **Trust**: `Review`, `Conversation`, `Message`
- **Monetization**: `Subscription`, `PromoCode`, `PromoRedemption`,
  `ReferralCredit`, `FeaturedListing`
- **Platform**: `PlatformSetting`, `Notification`

Gulf specifics baked into the schema: `GulfCity` enum (8 launch cities),
`Currency` enum (AED/SAR/QAR/KWD/BHD/OMR), `Language` enum, and Decimal money
fields (never floats) so KWD/BHD/OMR's 3-decimal precision is exact.

## Deploying on Replit

1. Create a new Replit from this repo (or import via Git).
2. Add a PostgreSQL database from Replit's Database pane, or connect Neon —
   either way, copy the connection string into `DATABASE_URL` in Replit's
   Secrets tab.
3. Add `AUTH_SECRET` (generate with `openssl rand -base64 32`) and
   `NEXTAUTH_URL` (your Replit app's public URL) as Secrets.
4. Optionally add `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` and
   `RESEND_API_KEY`/`EMAIL_FROM`.
5. Run `npx prisma migrate deploy` once to apply migrations against the
   Replit/Neon database.
6. Set the run command to `npm run build && npm run start`.

## Security notes

- Passwords are bcrypt-hashed (12 rounds); the app never stores plaintext.
- Auth endpoints (register, login via Credentials, OTP verify/resend,
  forgot/reset password) are rate-limited per IP.
- All API input is validated with Zod before touching the database.
- Route access is enforced in `src/proxy.ts` (Next's middleware convention)
  for `/dashboard`, `/onboarding`, `/settings`, `/admin`, `/bookings`, plus
  per-page role guards (e.g. `/dashboard/caregiver` checks the user actually
  holds the `CAREGIVER` role).
- No payment card data is ever stored — Stripe will handle that directly
  when the payments step ships.
