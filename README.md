# SnowBank — Modern Digital Banking Platform

> A production-grade, portfolio-quality digital banking web application built to showcase advanced full-stack engineering for Nigerian and global fintech roles.

---

## Live Demo

**[Coming Soon — Deploy to Vercel]**

### Demo Credentials

| Role  | Email                   | Password   | PIN  |
|-------|-------------------------|------------|------|
| User  | demo@snowbank.io        | Demo@123   | 1234 |
| Admin | admin@snowbank.io       | Admin@123  | —    |

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=flat-square&logo=prisma)
![NextAuth](https://img.shields.io/badge/NextAuth_v5-black?style=flat-square)
![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=flat-square)

---

## Features

### User Features
- **Secure Authentication** — Registration with email verification, login, forgot/reset password
- **Dashboard Overview** — Balance card with blur toggle, quick actions, balance trend chart, spending breakdown donut chart
- **Transfer Money** — 3-step wizard with account lookup, PIN confirmation, confetti success animation
- **Buy Airtime** — MTN, Airtel, Glo, 9mobile with preset amounts
- **Pay Bills** — Electricity, Internet, Cable TV with provider selection
- **Transaction History** — Paginated with search, filter by type/direction/date, expandable rows
- **Beneficiaries** — Save, view, and delete saved recipients with optimistic UI
- **Virtual Card** — Premium animated card with 3D flip, freeze/unfreeze, CVV toggle
- **Profile Management** — Edit details, change password, set 4-digit PIN
- **Settings** — Theme toggle (dark/light/system), login activity, sign out all devices
- **Notifications** — Real-time bell with unread count, optimistic mark-as-read

### Admin Features
- **Overview Dashboard** — Stats cards, recent registrations
- **User Management** — Paginated table, search/filter, status badges
- **User Detail** — Edit all fields, restrict/suspend toggle, generate 10–500 realistic transactions
- **Transaction Monitor** — Global transaction log, mark failed/reversed
- **System Settings** — Transaction limits, fees, maintenance mode, bank CRUD, account CRUD

### Design & UX
- Dark navy + electric blue design aesthetic
- Framer Motion animations throughout
- Skeleton loaders on every async operation
- Optimistic updates for notifications and beneficiaries
- Custom OTP-style 4-digit PIN input
- Fully responsive — mobile sidebar collapses
- Dark/light/system theme switching
- Empty states with helpful messaging

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Resend account (for emails)

### Installation

```bash
git clone <repo-url>
cd snowbank
npm install
```

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/snowbank?retryWrites=true&w=majority"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_SECRET="same-as-above"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture Decisions

### Why MongoDB?
MongoDB's document model fits banking data well — transactions embed naturally, and Atlas offers a generous free tier perfect for demos. The flexible schema let me iterate fast on the transaction model without painful migrations.

### Why NextAuth v5?
Auth.js v5 is the modern standard for Next.js authentication. The JWT strategy with custom callbacks lets me attach `role`, `accountNumber`, `isRestricted`, and `isSuspended` to the session token, enabling O(1) authorization checks in middleware without DB round trips.

### Why TanStack Query?
Server Actions handle all mutations (transfers, profile updates, PIN changes). TanStack Query handles client-side data fetching with automatic caching, background refetch, and optimistic updates — the combination gives a native-app feel without a full REST or GraphQL layer.

---

> **Disclaimer:** This is a portfolio project simulating a digital banking platform. It does not process real financial transactions.
