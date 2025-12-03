# Innovatr Website

## Overview
Innovatr is a premium SaaS platform for rapid market research and innovation testing. This marketing website aims to drive conversions for 24-hour research testing services (Test24 Basic, Test24 Pro) and membership programs, supporting both one-time purchases and recurring memberships. It features service descriptions, pricing, checkout flows, and trust-building elements. The platform emphasizes speed, clarity, and a tech-forward aesthetic, offering a comprehensive members portal with access to a trends library and research tools.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query (React Query) v5 for server state; React hooks for local state.
- **UI Components**: Shadcn/ui (Radix UI) for accessible components in a "New York" style.
- **Styling**: Tailwind CSS v3 with custom design tokens, supporting light/dark themes, using Roboto and DM Serif Display fonts.
- **Design Principles**: Conversion-optimized with clear CTAs, minimal friction, and a premium aesthetic using neon accents, white backgrounds, and charcoal text. Features strategic background images and embedded videos for enhanced visuals.

### Backend
- **Server**: Express.js with Node.js and TypeScript for API routes and static asset serving.
- **Development**: Vite middleware for HMR.
- **Production**: Vite bundles client, esbuild bundles server.
- **Data Layer**: Designed with a swappable in-memory storage (`MemStorage`) for user management, with plans for PostgreSQL integration.
- **Session Management**: `express-session` configured for PostgreSQL-backed sessions.
- **API**: RESTful API under `/api` with request logging.

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL with `@neondatabase/serverless` driver.
- **Schema**: Basic user schema with Zod validation.
- **Migrations**: Drizzle Kit for database migrations.

### Form Handling
- **Library**: React Hook Form with `@hookform/resolvers`.
- **Validation**: Zod schemas integrated with React Hook Form and Drizzle ORM.

### Authentication & Authorization
- **Authentication**: `AuthContext` manages user state (persisted in `localStorage`) with login, signup, and logout.
- **Membership Tiers**: Three membership tiers for logged-in users:
  - **STARTER**: Free tier for new signups and basic members
  - **GROWTH**: Mid-tier membership with enhanced features
  - **SCALE**: Premium tier with full feature access
- **Admin Access**: Users with hannah@innovatr.co.za or richard@innovatr.co.za email addresses automatically get admin access to `/portal/admin`
- **Access Control**: Starter members access limited content; Growth and Scale members access full portal features. Admin users have unrestricted access to all functionality and admin tools.

### Members Portal
- **Purpose**: Personalized dashboard for authenticated members to manage research, view insights, and engage.
- **Layout**: Persistent sidebar navigation with collapsible menu.
- **Member Sections**: Dashboard, Trends & Insights Library, Launch New Brief, Credits & Billing, Past Research Dashboard, Member Deals, Settings.
- **Dashboard Recommendations**: "Recommended for You" widget shows real reports from Trends & Insights library filtered by:
  - Access level (PUBLIC/STARTER/GROWTH/SCALE) based on user's membership tier
  - Industry matching prioritizes reports matching user's company industry
  - NEW badge appears for reports published in last 30 days
  - Click navigation to report detail pages or direct PDF download
  - Loading skeletons and empty states for smooth UX
- **Admin Section** (admin users only): Admin Dashboard with tabs for:
  - **Overview**: System metrics (Total Users, Starter/Growth/Scale member counts, Active Deals)
  - **Users**: User management table with search, tier filtering, and membership/credits display
  - **Reports**: List of all research reports with access level control
  - **Deals**: Promotional deals management and member deal targeting
- **Trends & Insights Library**: Dynamic content from Innovatr Intelligence blog posts (`reports.json`) with search, filtering, and sorting. Features access level gating (PUBLIC, STARTER, GROWTH, SCALE) and upgrade prompts.

### Payment Gateway System
- **Architecture**: Multi-provider payment system supporting South African gateways (PayFast, Zapper, Apple Pay)
- **Provider Interface**: Unified `PaymentProvider` interface with implementations for each gateway
- **Payment Service**: `PaymentService` orchestrates provider selection, payment intent creation, checkout payload generation, and webhook handling
- **Database Schema**: 
  - `orders`: Store order details (amount, currency, customer info, status)
  - `order_items`: Line items for each order (type, quantity, amount, description)
  - `payment_intents`: Track payment attempts with provider-specific metadata
  - `payment_events`: Log webhook events for audit trail
- **Supported Providers**:
  - **PayFast**: Primary South African gateway supporting credit/debit cards, instant EFT, and more. Form-based redirect flow with MD5 signature verification
  - **Zapper**: Mobile-first South African payment platform with QR codes and card payments. REST API integration with webhook validation
  - **Apple Pay**: Delegates to PayFast for processing while providing Apple Pay UX. Requires merchant domain verification file
- **Checkout Flow**:
  1. Create order with items via `/api/orders`
  2. Create payment intent via `/api/payment-intents` with selected provider
  3. Retrieve checkout payload via `/api/payment-intents/:id/checkout`
  4. Redirect user to provider (PayFast form POST, Zapper QR/redirect, Apple Pay session)
  5. Provider processes payment and sends webhook to `/api/webhooks/{provider}`
  6. User returns to `/payment/return` with status
- **Webhook Security**: Each provider validates webhooks using signatures (PayFast MD5, Zapper HMAC) and/or IP whitelisting
- **Environment Variables**: See `.env.example` for required PayFast, Zapper, and Apple Pay credentials
- **Storage Interface**: Extended with payment CRUD methods (createOrder, createPaymentIntent, updateOrder, etc.)
- **Checkout UI**: `/checkout` page with payment method selection, order summary, and secure payment processing

### Build and Deployment
- **Development**: `npm run dev` starts Express with Vite.
- **Production**: Vite builds client, esbuild builds server into `/dist`.
- **Environment**: Requires `DATABASE_URL` and other environment variables.

### Feature Specifications
- **Service Detail Pages**: Consistent design across Test24 Basic, Test24 Pro, Innovatr Consult, and Innovatr Intelligence, including "Ideal For" sections and embedded Vimeo videos. Navigation buttons consistently link to relevant sections (pricing, membership, contact).
- **Pricing Section**: Defaults to "Members" tab, showing discounted rates for Test24 Basic (R5,000) and Test24 Pro (R45,000).
- **Member Credit Checkout**: Enforces Entry Plan membership requirement for credit purchases. Displays a notice card, automatically includes Entry Plan in the cart for new members, and allows existing members to opt out of the Entry Plan charge via a checkbox while retaining discounts. Entry Plan is a one-time annual fee.
- **Coupon Claim System**: Users can claim a R10,000 Test24 Basic coupon via a dedicated `/claim-coupon` page by providing name and email. The system generates unique coupon codes and prevents duplicate claims from the same email.
- **Admin Portal**: Full administrative dashboard allowing admins to:
  - View system-wide metrics and user distribution
  - Manage user accounts and membership tiers
  - Control report access levels (PUBLIC, STARTER, GROWTH, SCALE)
  - Create and manage promotional deals with tier/user targeting
  - Monitor system health and user engagement

## Admin System

### Admin Detection
Users with these emails automatically become admins:
- hannah@innovatr.co.za
- richard@innovatr.co.za

Admins can access `/portal/admin` and all admin API endpoints.

### Admin API Endpoints
- `GET /api/admin/overview` - System metrics (total users, member counts by tier, active deals)
- `GET /api/admin/users` - List all users with full details
- `PATCH /api/admin/users/:id` - Update user membership tier, status, or credits
- `GET /api/admin/reports` - List all reports
- `POST /api/admin/reports` - Create new report
- `PATCH /api/admin/reports/:id` - Update report (including access level)
- `GET /api/admin/deals` - List all deals
- `POST /api/admin/deals` - Create new deal
- `PATCH /api/admin/deals/:id` - Update deal
- `GET /api/member/deals` - List applicable deals for logged-in user (filtered by tier and validity)
- `GET /api/admin/mailer-subscriptions` - List all Pulse Insights newsletter subscribers

### Admin Portal Tabs (8 tabs)
- Overview, Companies, Orders, Subscriptions, Subscribers, Reports, Client Reports, Deals

### Data Models
- **Users**: id, username, email, password, name, company, membershipTier, status, creditsBasic, creditsPro, createdAt, lastLoginAt
- **Reports**: id, title, category, industry, date, teaser, accessLevel (PUBLIC|STARTER|GROWTH|SCALE), isArchived, createdAt, updatedAt
- **Deals**: id, title, description, originalPrice, discountedPrice, creditsIncluded, targetTiers (array), validFrom, validTo, isActive, createdAt, updatedAt
- **MailerSubscriptions**: id, name, email, company, industry, subscribedAt

### Mailer Subscription System
- **Pulse Insights Newsletter**: Bi-weekly insights delivered to subscribers
- **Subscription Form**: Collects name, email, company, and industry
- **Industries Available**: Food & Beverage, Retail, Financial Services, Technology, Healthcare, Manufacturing, Media & Entertainment, Other
- **Admin View**: Subscribers tab in admin portal shows all subscribers with search, stats (total, unique companies, industries, last 30 days)
- **API**: `POST /api/mailer-subscriptions` creates subscription, prevents duplicates by email

### Email Notifications
- **Service**: Resend for email delivery (via Replit's integration system)
- **Functionality**: Admin notifications when orders are placed
- **Configuration**: Set `ADMIN_EMAILS` environment variable with comma-separated admin email addresses (e.g., "admin1@example.com,admin2@example.com")
- **Implementation**: `server/emails/email-service.ts` handles HTML email formatting and delivery

### Order Checkout Flow
- **OrderFormDialog**: Reusable dialog component capturing customer name and email before order submission
- **Manual Processing**: Orders are stored in the database and trigger admin email notifications for manual payment processing
- **Integrated Pages**: All checkout pages (Test24 Basic/Pro PAYG, Test24 Basic/Pro Members, Entry/Gold/Platinum Memberships) use the OrderFormDialog

## External Dependencies
- **Email Service**: Resend for transactional emails (admin order notifications)
- **Payment Processing**: South African payment gateways (PayFast, Zapper, Apple Pay) with multi-provider architecture. Stripe integration also prepared with `@stripe/react-stripe-js` and `@stripe/stripe-js` for international payments.
- **UI Animations**: Intersection Observer API for scroll animations, CSS transitions, and Tailwind utilities.
- **Image Assets**: Stored in `/attached_assets` and referenced via Vite.
- **Video Embeds**: Vimeo for embedding demo and informational videos.