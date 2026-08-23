# ICSS Platform (International Center for Strategic Studies)

A modern full-stack web application designed for professional coaching, training programs, service requests, session bookings, and financial tracking for startups, entrepreneurs, and freelancers.

## 🚀 Key Features

- **Multilingual & RTL/LTR**: Full Arabic (RTL) and English (LTR) language support.
- **Client & Admin Dashboards**:
  - **Services Catalog**: Browse and request strategic coaching and training services.
  - **Service Requests Workflow**: Submit requests, admin approval, and progress tracking.
  - **Session Bookings**: Date & time scheduling for approved requests with admin confirmation.
  - **Payments & Invoicing**: Realistic checkout (Edahabia, CIB, Bank Transfer) and official printable receipts with ICSS branding.
  - **Commission & Financial Ledger**: Admin tracking of 10% platform fees and net sales.
  - **Instant Search & Filtering**: Client-side search, category/status pills, and real-time count badges across all tables and grids.
- **Authentication**: Secure JWT authentication with role-based access control (CLIENT / ADMIN).
- **Database**: SQLite with Prisma ORM.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS, Lucide Icons, Sonner Notifications
- **ORM & Database**: Prisma ORM with SQLite
- **Fonts**: Cairo (Arabic) & Inter (English)

## 📦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Default Credentials
- **Admin**: `admin@gmail.com` / `123456789`
- **Client**: `anis@gmail.com` / `123456789`
