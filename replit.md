# Innovatr Website

## Overview
Innovatr is a premium SaaS platform for rapid market research and innovation testing, offering 24-hour research services (Test24 Basic, Test24 Pro) and membership programs. The website aims to drive conversions for these offerings through service descriptions, pricing, checkout flows, and trust-building elements. It features a comprehensive members portal with access to a trends library and research tools, emphasizing speed, clarity, and a tech-forward aesthetic.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query (React Query) v5 for server state.
- **UI Components**: Shadcn/ui (Radix UI) for accessible components in a "New York" style.
- **Styling**: Tailwind CSS v3 with custom design tokens, supporting light/dark themes, using Roboto and DM Serif Display fonts.
- **Design Principles**: Conversion-optimized with clear CTAs, minimal friction, premium aesthetic with neon accents, white backgrounds, charcoal text, strategic background images, and embedded videos.

### Backend
- **Server**: Express.js with Node.js and TypeScript.
- **Development**: Vite middleware for HMR.
- **Production**: Vite bundles client, esbuild bundles server.
- **Data Layer**: PostgreSQL-backed `DatabaseStorage` class implementing `IStorage` interface via Drizzle ORM. Data persists across server restarts.
- **Session Management**: Custom HTTP-only cookie sessions stored in PostgreSQL via the `sessions` table with SHA-256 hashed tokens.
- **API**: RESTful API under `/api` with request logging and comprehensive security middleware.

### Database
- **ORM**: Drizzle ORM with PostgreSQL via `@neondatabase/serverless` driver.
- **Schema**: Comprehensive data model including users, sessions, companies, orders, payments, reports, deals, briefs, studies, and credit ledger.
- **Migrations**: Drizzle Kit (`npm run db:push`) for schema synchronization.
- **Seeding**: Automatic seeding of demo data (companies, users, reports) on first run if database is empty.

### Authentication & Authorization
- **Authentication**: Multi-tenant, session-based authentication using HTTP-only secure cookies and bcrypt for password hashing. Includes password reset flow.
- **User Roles**: ADMIN, MEMBER, with predefined admin users.
- **Membership Tiers**: STARTER, GROWTH, SCALE, determining access to features and content.
- **Access Control**: Implemented via middleware (`requireAuth`, `requireAdmin`) and ownership verification for data access and destructive actions. Sensitive data is redacted.

### Members Portal
- **Purpose**: Personalized dashboard for authenticated members.
- **Sections**: Dashboard, Trends & Insights Library, Launch New Brief, Credits & Billing, Past Research Dashboard, Member Deals, Settings.
- **Admin Section**: Dedicated `/portal/admin` for ADMIN users with tabs for Overview, Companies, Users, Orders, Briefs, Reports, Deals.
- **Trends & Insights Library**: Dynamic content with search, filtering, sorting, and access level gating (PUBLIC, STARTER, GROWTH, SCALE).

### Admin Portal B2B Client System
- **Overview Tab**: Clean, simplified design with Test24 Tracker (active/completed studies), Free Reports library, and Research Pipeline summary (brief status counts).
- **Companies Tab**: Company accounts with pooled credits. Credit display shows only remaining credits (not x/y format). Companies: Innovatr, Rugani Juice, Greenway Farms, Nando's South Africa, DGB, Revlon, Mitchum, Elizabeth Arden.
- **Orders Tab**: Order management without revenue analytics. Shows order counts only (total, this month, completed, pending). No revenue values, charts, or averages.
- **Briefs Tab**: Pipeline view with 5 columns (New, In Progress, Under Review, Completed, On Hold) with drag-and-drop functionality.
- **Design Principles**: Clean, uncluttered interface focused on operational metrics. Data consistency across all tabs from same database tables.

### Payment Gateway System
- **Architecture**: Multi-provider system with a unified `PaymentProvider` interface.
- **Flow**: Order creation, payment intent generation, checkout payload retrieval, user redirection, webhook processing.
- **Database Schema**: `orders`, `order_items`, `payment_intents`, `payment_events`.
- **Security**: Webhook validation using signatures (MD5, HMAC) and IP whitelisting.

### Form Handling
- **Library**: React Hook Form with `@hookform/resolvers`.
- **Validation**: Zod schemas.

### Build and Deployment
- **Development**: `npm run dev`.
- **Production**: Vite builds client, esbuild builds server into `/dist`.

### Feature Specifications
- **Service Detail Pages**: Consistent design for Test24 services and consultation, with embedded videos and clear CTAs.
- **Pricing Section**: Displays discounted rates for members.
- **Member Credit Checkout**: Requires Entry Plan membership for credit purchases, with automatic inclusion in cart for new members.
- **Coupon Claim System**: Allows users to claim a unique coupon via a dedicated page.
- **Launch Brief Payment Options**: Offers "Pay Online", "Invoice Me", or "Use My Credits" with credit balance display and deduction functionality.
- **Admin Portal**: Comprehensive dashboard for managing users, reports, deals, and system metrics.
- **Mailer Subscription System**: Manages subscriptions for "Pulse Insights Newsletter" with admin view.
- **Email Notifications**: Admin notifications for new orders via Resend.
- **API Security**: Strict access control with `requireAuth` and `requireAdmin` middleware, data redaction, and ownership verification.

## External Dependencies
- **Email Service**: Resend (for transactional emails, specifically admin order notifications).
- **Payment Processing**: PayFast, Zapper, Apple Pay (South African gateways), and Stripe (prepared for international payments).
- **UI Animations**: Intersection Observer API for scroll animations.
- **Video Embeds**: Vimeo.