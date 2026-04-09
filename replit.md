# Innovatr Website

## Overview
Innovatr is a SaaS platform providing rapid market research and innovation testing, including 24-hour services and membership programs. The website aims to convert visitors into subscribers and users by showcasing services, managing pricing, facilitating checkout, and building trust. It features a comprehensive members portal with access to a trends library and research tools, prioritizing speed, clarity, and a tech-forward design. The project focuses on driving conversions and providing a premium user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) v5.
- **UI Components**: Shadcn/ui (Radix UI) with a "New York" aesthetic.
- **Styling**: Tailwind CSS v3 with custom design tokens, supporting light/dark themes, using Roboto and DM Serif Display fonts.
- **Design Principles**: Conversion-optimized with clear CTAs, minimal friction, premium aesthetic featuring neon accents, white backgrounds, charcoal text, strategic imagery, and embedded videos.
- **Public Website (6 Pages)**: Includes Home, Consult, Research, Tools, Case Studies (listing and detail), and Contact pages. Features a fixed glassmorphism navbar (auth-aware), dark footer with Innovatr logo and social links. Anchor sections are used for navigation.
- **Login Dialog**: `z-index` handled to appear above the fixed navbar.

### Backend
- **Server**: Express.js with Node.js and TypeScript.
- **Development**: Vite middleware for HMR.
- **Production**: Vite for client bundling, esbuild for server bundling.
- **Data Layer**: PostgreSQL-backed `DatabaseStorage` via Drizzle ORM.
- **Session Management**: Custom HTTP-only cookie sessions stored in PostgreSQL.
- **API**: RESTful API under `/api` with security middleware.

### Database
- **ORM**: Drizzle ORM with PostgreSQL via `@neondatabase/serverless`.
- **Schema**: Comprehensive data model for users, sessions, companies, orders, payments, reports, deals, briefs, studies, credit ledger, sandbox runs, and insight mailers.
- **Migrations**: Drizzle Kit (`npm run db:push`).
- **Seeding**: Automatic seeding of demo data on first run.

### Authentication & Authorization
- **Authentication**: Multi-tenant, session-based authentication with HTTP-only cookies and bcrypt. Includes password reset. Password reset token expiry is 7 days.
- **User Roles**: ADMIN, MEMBER, with predefined admin users.
- **Membership Tiers**: STARTER, GROWTH, SCALE, controlling feature access.
- **Access Control**: Middleware (`requireAuth`, `requireAdmin`) and ownership verification. Sensitive data is redacted.
- **Member Pricing**: Logged-in members receive discounted rates (e.g., Basic R5,000 vs R5,500). Pricing calculated server-side.

### Members Portal
- **Purpose**: Personalized dashboard for authenticated members, structured around a 3-Phase research journey (Explore → Test → Act).
- **Layout**: Custom `PortalLayout` with Shadcn Sidebar and a phase topbar. Global `⌘K / Ctrl+K` shortcut for quick navigation.
- **Dashboard**: Displays credits, journey phase cards, stats, and studies portfolio.
- **Phase Pages**:
    - **Explore**: Market Signals, Sandbox, Intelligence Library, Explore AI, Team Chat. Sandbox run results persisted.
    - **Test**: Launch a Brief wizard, Studies list, Research Assistant, Research AI, Team Chat.
    - **Act**: Gaps analysis, Next Steps, Planning Assistant, Insights Query AI, Team Chat.
- **Other Sections**: Trends & Insights Library, Launch New Brief, Credits & Billing, Past Research Dashboard, Member Deals, Settings.
- **Admin Section**: Dedicated `/portal/admin` for ADMIN users, with tabs for Overview, Companies, Users, Orders, Briefs, Reports, Deals. Includes a "View-as-Company Mode" for admin impersonation.
- **Design**: Dark violet sidebar/topbar, coral branding, cream background, distinct phase colors.

### Admin Portal B2B Client System
- **Overview Tab**: Test24 Tracker, Free Reports, Research Snapshot.
- **Companies Tab**: Manages company accounts with pooled credits. Includes "Create New Company" with welcome email.
- **Orders Tab**: Order management without revenue analytics.
- **Briefs Tab**: Pipeline view with drag-and-drop functionality across 5 columns.
- **Design Principles**: Clean, uncluttered interface focused on operational metrics, consistent data from shared database tables.
- **Trends & Insights Library**: View toggle (grid/list) and refresh functionality.

### Payment Gateway System
- **Architecture**: Multi-provider system with a unified `PaymentProvider` interface.
- **Flow**: Order creation, payment intent generation, checkout payload, user redirection, webhook processing.
- **Database Schema**: `orders`, `order_items`, `payment_intents`, `payment_events`.
- **Security**: Webhook validation with signatures and IP whitelisting.
- **Launch Brief Payment Options**: "Pay Online", "Invoice Me", "Use My Credits" with credit deduction.
- **Member Credit Checkout**: Requires Entry Plan membership for credit purchases.

### Forms and Validation
- **Form Handling**: React Hook Form with `@hookform/resolvers`.
- **Validation**: Zod schemas.

### Build and Deployment
- **Development**: `npm run dev` (Express + Vite).
- **Production**: Client built by Vite, server built by esbuild into `/dist`.

### Feature Specifications
- **Service Detail Pages**: Consistent design with embedded videos and CTAs.
- **Pricing Section**: Displays discounted member rates.
- **Coupon Claim System**: Unique coupon claiming via a dedicated page.
- **Consumer Reach Selector**: Tiered selector for Basic and Pro studies with dynamic pricing based on volume.
- **Admin Portal**: Comprehensive dashboard including per-company Activity Log.
- **User Activity Tracking**: Server-side and client-side logging of user actions (logins, report views, brief launches, portal navigation) into `activity_events` table. Admin analytics dashboard for engagement metrics.
- **Daily Admin Digest Email**: Automated email with user and activity statistics.
- **Mailer Subscription System**: Manages "Pulse Insights Newsletter" subscriptions.
- **Insight Mailers (INNOVATR INSIDE)**: Scheduling system for a newsletter series with admin view, content management, and status tracking.
- **Email Notifications**: Admin notifications for new orders via Resend.
- **Report Management System**: Admin control over reports with file uploads, cover images, thumbnails, external links, and access level gating. Supports multiple content types, categories, and tags.

## External Dependencies
- **Email Service**: Resend (for transactional emails).
- **Payment Processing**: PayFast, Zapper, Apple Pay (South Africa), Stripe (international).
- **UI Animations**: Intersection Observer API.
- **Video Embeds**: Vimeo.
- **Calendar Scheduling**: Calendly.