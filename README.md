# Friend Pay MVP

Mobile-first private payment and ledger MVP for a six-person house or friend group. Built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## What’s included

- Email/password auth with persistent Supabase sessions
- Onboarding flow for display name and hashed 4-digit PIN
- NFC tap route at `/tap/[cardCode]`
- Atomic fake-balance transfer flow backed by a Postgres RPC
- Dashboard, request-payment screen, and transaction history
- Demo seed script for 6 users with balances, PINs, and NFC card codes
- SQL schema with RLS policies and secure helper functions
- Light scaffold for a future group-ledger settlement mode

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth + Postgres + RLS
- Vercel-friendly deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In Supabase Auth settings, disable email confirmation for local/demo use.
   This app redirects straight to onboarding after signup, so auto-confirm is the smoothest setup for this MVP.

4. Copy [.env.example](/C:/Users/mikae/OneDrive/Documents/New%20project%202/.env.example) to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. In the Supabase SQL editor, run [supabase/schema.sql](/C:/Users/mikae/OneDrive/Documents/New%20project%202/supabase/schema.sql).

6. Seed the demo users:

```bash
npm run seed:demo
```

7. Start the app:

```bash
npm run dev
```

8. Open `http://localhost:3000`.

## Demo users

The seed script creates these six accounts:

- Alex: `alex@friendpay.local` / password `friendpay123` / PIN `1111` / card `CARD-ALEX-01`
- Sam: `sam@friendpay.local` / password `friendpay123` / PIN `2222` / card `CARD-SAM-02`
- Priya: `priya@friendpay.local` / password `friendpay123` / PIN `3333` / card `CARD-PRIYA-03`
- Ben: `ben@friendpay.local` / password `friendpay123` / PIN `4444` / card `CARD-BEN-04`
- Maya: `maya@friendpay.local` / password `friendpay123` / PIN `5555` / card `CARD-MAYA-05`
- Leo: `leo@friendpay.local` / password `friendpay123` / PIN `6666` / card `CARD-LEO-06`

## Example NFC URLs

Set `NEXT_PUBLIC_APP_URL` first. With `http://localhost:3000`, the demo card URLs are:

- `http://localhost:3000/tap/CARD-ALEX-01`
- `http://localhost:3000/tap/CARD-SAM-02`
- `http://localhost:3000/tap/CARD-PRIYA-03`
- `http://localhost:3000/tap/CARD-BEN-04`
- `http://localhost:3000/tap/CARD-MAYA-05`
- `http://localhost:3000/tap/CARD-LEO-06`

## How the tap flow works

1. The receiver is already logged in on their phone.
2. Someone taps an NFC tag that contains `https://your-app/tap/<cardCode>`.
3. The app resolves the tapped card owner as the payer.
4. The logged-in phone owner is the receiver.
5. The receiver can confirm or edit the amount.
6. The payer enters their 4-digit PIN.
7. A secure Postgres function verifies the PIN, checks balance, updates both balances, and writes a transaction in one atomic operation.

## Writing NFC tags

Each NFC tag should store only a URL, not balance or money.

1. Use any NFC writing app that can write an NDEF URL record.
2. Write the user’s `/tap/<cardCode>` URL to their tag.
3. Mark the tag physically with the owner’s name so cards do not get mixed up.
4. If you rotate a card later, update `nfc_cards.card_code` and rewrite the URL.

## Main app routes

- `/login`
- `/signup`
- `/onboarding`
- `/dashboard`
- `/request`
- `/history`
- `/tap/[cardCode]`
- `/ledger-lab`

## Important files

- App pages and UI: [app](/C:/Users/mikae/OneDrive/Documents/New%20project%202/app)
- Secure server actions: [lib/actions](/C:/Users/mikae/OneDrive/Documents/New%20project%202/lib/actions)
- Supabase helpers: [lib/supabase](/C:/Users/mikae/OneDrive/Documents/New%20project%202/lib/supabase)
- SQL schema and RPCs: [supabase/schema.sql](/C:/Users/mikae/OneDrive/Documents/New%20project%202/supabase/schema.sql)
- Demo seeding: [scripts/seed-demo.ts](/C:/Users/mikae/OneDrive/Documents/New%20project%202/scripts/seed-demo.ts)
- Group-ledger helpers: [lib/ledger.ts](/C:/Users/mikae/OneDrive/Documents/New%20project%202/lib/ledger.ts)

## Security notes

- PINs are hashed in Postgres with `crypt(..., gen_salt('bf'))`
- The client never supplies payer identity directly; it comes from the tapped card record
- The payment RPC locks both profiles and applies balance changes atomically
- RLS limits profile and transaction reads to relevant users
- Seed/admin functionality is separate and intended for development use only

## Deployment to Vercel

1. Push this repo to GitHub.
2. Create a new Vercel project and import the repo.
3. Add the same environment variables from `.env.local`.
4. Set `NEXT_PUBLIC_APP_URL` to your production domain, for example `https://friend-pay.vercel.app`.
5. Deploy.
6. Rewrite the NFC tags to the production `/tap/<cardCode>` URLs.

## Future extension: group ledger mode

This repo includes a small, intentionally light scaffold for a future shared-expense module:

- equal-share helper
- custom-share support shape
- net-position computation
- minimal settlement suggestions

A reasonable next step would be:

1. Add `group_memberships` and a real `groups` table.
2. Add expense creation UI and persistence for shares.
3. Add a settlement dashboard that can optionally convert settlements into Friend Pay transfers.

## Notes

- This MVP uses fake balances only.
- It is designed for a small trusted group, not a public payment network.
- I could not verify dependency installation or run `next build` in this offline sandbox, so the repo is prepared for local install and verification on your machine.
