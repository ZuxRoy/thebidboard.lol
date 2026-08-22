# TheBidBoard

A newspaper/classifieds-styled leaderboard where products pay to claim (and defend) a featured spot. Monorepo managed with [Turborepo](https://turbo.build/).

```
thebidboard.lol/
├── app/   # React + TypeScript frontend (Vite, Tailwind CSS v4)
├── api/   # Fastify + TypeScript backend, incl. the payment reconciliation worker
├── turbo.json
└── package.json
```

## Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: Fastify, TypeScript, Mongoose (MongoDB)
- **Payments**: Pocketsflow (per-submission fixed-price checkouts + webhooks)

## Prerequisites

- Node.js 20+
- A MongoDB instance (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Pocketsflow account with:
  - An API key (`pk_live_...` / `pk_test_...`)
  - A webhook pointed at `POST /api/webhooks/pocketsflow` with the `order.completed` event enabled, and its signing secret

## Setup

```bash
npm install

cp api/.env.example api/.env       # fill in MongoDB + Pocketsflow values
cp app/.env.example app/.env       # points the frontend at the API
```

## Development

```bash
npm run dev          # runs both app (http://localhost:5173) and api (http://localhost:4000) via Turborepo
npm run dev:app       # frontend only
npm run dev:api       # backend only
```

## Build

```bash
npm run build
```

## How payments work

1. A visitor fills out the claim form and submits an amount.
2. The API creates (or reuses) a `Listing` and a `PaymentIntent`, then creates a **dedicated Pocketsflow product priced at exactly that amount** and opens a checkout session for it (Pocketsflow checkout sessions don't take a custom amount directly, so a fresh fixed-price product per submission is how we support arbitrary dollar amounts).
3. The visitor is redirected to Pocketsflow to pay.
4. On success, Pocketsflow calls the `/api/webhooks/pocketsflow` webhook (`order.completed`), which verifies the HMAC signature and activates the listing (adding the payment to the listing's running total — this is how "topping up" an existing spot works).
5. A background worker (`api/src/workers/reconcilePayments.ts`) periodically checks `GET /orders?productId=...` for that intent's dedicated product as a fallback in case a webhook is ever missed.

Listings only appear on the public board once a payment has been confirmed.
