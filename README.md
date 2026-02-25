# MSSN RAMS (Attendance Management System)

A modern, fast, and frictionless web application built for the Muslim Students' Society of Nigeria (MSSN), LASU Epe Chapter, to digitally manage attendance and Iftar ticket distribution during Ramadan.

![MSSN Logo](public/logo.png)

## Overview

MSSN RAMS (Ramadan Attendance Management System) eliminates the bottlenecks of paper-based attendance. It allows students to instantly check in to daily Iftar events using a robust dynamic QR code system and provides coordinators with real-time analytics, one-tap ticket tracking, and fraud prevention measures.

## ✨ Features

- **Google OAuth Authentication:** Secure seamless login for students (no custom passwords to remember).
- **Dynamic Anti-Fraud QR Check-ins:** Projector-displayed QR codes regenerate every 30 seconds with cryptographic timestamps to prevent students from sharing photos to remote check-in.
- **Native Camera Deep Linking:** Students can natively scan the projected QR code with their mobile device camera app—which seamlessly opens the browser, logs them in, marks attendance, and redirects them to their digital ticket in one smooth flow.
- **Digital Iftar Ticket:** A clean, live dashboard showing a ticking server clock and a distinct UI color change when a ticket is served.
- **Admin & Coordinator Dashboard:** 
  - Real-time live attendance feed filtering by "Served", "Marked", or "All Status".
  - Instant One-Tap "Serve" tracking for food distribution.
  - Undo functionality for accidental taps.
- **Manual "Offline" Registration Mode:** Allows coordinators to manually check-in or instantly register students without smartphones or Google accounts.
- **Role-Based Access Control (RBAC):** Strict permissions for `super_admin`, `admin`, `coordinator`, and `user`.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** NeonDB (Serverless Postgres)
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js (Auth.js) v4 (Google Provider)
- **Styling:** Vanilla CSS (Custom Glassmorphism Utility Design System)
- **QR Tech:** `html5-qrcode` (Generation) & `react-qr-code` (Scanning)

## 🚀 Getting Started

### Prerequisites

1. Node.js 18+
2. A Postgres database (NeonDB recommended)
3. Google Cloud Console account (for OAuth Credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mssn-rams.git
   cd mssn-rams
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_generate_random_secret_string"
   GOOGLE_CLIENT_ID="your_google_cloud_client_id"
   GOOGLE_CLIENT_SECRET="your_google_cloud_client_secret"
   ```

4. **Run Database Migrations** (If using Drizzle)
   *(Ensure your schema is pushed to NeonDB)*
   ```bash
   npx drizzle-kit push:pg
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, ensure all Environment Variables from your `.env.local` are copied over.
3. Update `NEXTAUTH_URL` to your production domain (e.g., `https://mssn-rams.vercel.app`).
4. **Important:** Add the production domain callback URL to your Google Cloud Console Authorized Redirect URIs (`https://mssn-rams.vercel.app/api/auth/callback/google`).
5. Deploy!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is tailored specifically for MSSN LASU Epe. All rights reserved.
