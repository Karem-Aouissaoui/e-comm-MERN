# MME — B2B E-commerce Platform (Middle-East)

This project is a MERN stack application connecting suppliers and buyers across the Middle East.

## Project Structure

- `api/`: NestJS backend API.
- `web/`: Vite + React + TypeScript frontend.

---

## 🛠️ Service Setup Guide

### 1. MongoDB
The application uses MongoDB for data persistence.
- **Local**: Ensure a MongoDB instance is running at `mongodb://127.0.0.1:27017/ecom_mern`.
- **Cloud**: You can use MongoDB Atlas and update the `MONGO_URI` in `apps/api/.env`.

### 2. Stripe (Payments)
Stripe is used for secure payment processing.
1.  **Stripe Account**: Create an account at [stripe.com](https://stripe.com).
2.  **API Keys**: Get your `STRIPE_SECRET_KEY` (sk_test_...) from the Stripe Dashboard (Developers > API Keys).
3.  **Webhook**: 
    - Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
    - Run `stripe listen --forward-to localhost:3001/payments/webhook`.
    - Copy the `whsec_...` signing secret to `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`.

### 3. Localization (i18n)
The frontend supports 6 languages: English, Arabic, German, French, Dutch, and Turkish.
- Translations are managed in `apps/web/src/locales/*.json`.

---

## 🚀 Getting Started

### Backend (API)
1.  `cd apps/api`
2.  `npm install`
3.  Configure `.env` (use `.env.example` as a template).
4.  `npm run start:dev`
5.  **Seed Data**: `npx ts-node -r tsconfig-paths/register src/seed.ts` (requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` for the admin account).

### Frontend (Web)
1.  `cd apps/web`
2.  `npm install`
3.  `npm run dev`

---

## 🔑 Admin Panel
Access the platform-wide admin panel at `/admin`.
- Requires an account with the `admin` role.
- Use the seed script above to create your initial webmaster account.
