# SHATI website

Next.js App Router site with Payload CMS embedded in the app and PostgreSQL storage. Public pages read CMS content and stock; the admin is at `/admin`.

## Local setup

Requirements: Node.js 20.9 or newer, Docker Compose (or PostgreSQL 14+), and npm.

1. Copy `.env.example` to `.env` and set `PAYLOAD_SECRET` and `CRON_SECRET`.
2. Run `docker compose up -d` to start the local Postgres database.
3. Run `npm install`, then `npm run dev`. The first Payload development start pushes the schema into the local database.
4. In a second terminal, run `npm run db:seed` and `npm run admin:create -- admin@example.com 'a-long-password'`.
5. Visit `http://localhost:3000` and `http://localhost:3000/admin`.

The first development start creates/updates the Payload Postgres schema. After local development has pushed the initial schema, create and commit a production migration with `npm run db:migrate:create`. Run `npm run db:migrate` against the production database before serving a release.

## What's implemented

- CMS collections for products, media, issues, shows, episodes, articles, counties, delivery bands, members, stock, league snapshots, order events, and cached FPL responses
- Public home, shop, product, bag, Watch, and League routes
- WhatsApp order messages, client order-tap events, persisted bag and county choice
- A stock ledger and one-tap Payload admin counter with an undo action
- Public FPL entry validation and private self-service edit/leave links
- Protected Vercel cron routes for YouTube playlist sync and FPL scoring, county table persistence, and a generated 1080 × 1350 standings image

## Production configuration and content

Set `YOUTUBE_API_KEY` and put each playlist ID on its Show record. Add a Vercel Blob store and configure `BLOB_READ_WRITE_TOKEN` so uploaded media persists across serverless deployments. Configure Vercel with `CRON_SECRET`; `vercel.json` schedules the protected sync routes. The FPL and YouTube services remain optional until configured.

The handoff marks actual product prices, photography, size measurements, delivery fees, county delivery-band mapping, opening hours, member pricing, and playlist IDs as facts still to be supplied. The CMS fields are ready for these. The seed script intentionally does not fabricate these details, so add approved products, stock, and delivery values in `/admin` before treating the store as open for orders.

Payload can run on Vercel as part of the Next.js app and supports Postgres through its official adapter. See [Payload's Vercel deployment guidance](https://payloadcms.com/docs/production/deployment) and [Postgres adapter setup](https://payloadcms.com/docs/database/postgres).
