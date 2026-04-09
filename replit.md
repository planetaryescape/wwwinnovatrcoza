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
- **Purpose**: Personalized dashboard for authenticated members built around a 3-Phase research journey: Explore → Test → Act.
- **Layout**: Custom `PortalLayout` with Shadcn Sidebar (coral "I" logo, user avatar with tier badge, phase navigation 01/02/03, section headers). A phase topbar shows Explore/Test/Act tabs with chevron separators. **⌘K / Ctrl+K** global keyboard shortcut opens a Command dialog for quick navigation to all portal sections.
- **Dashboard** (`/portal/dashboard`): Credit strip (Basic/Pro credits + studies done), 3 journey phase cards, 4 stat cards, 3 phase preview cards, studies portfolio pulled from `/api/member/reports`. Amber warning banner appears when basicCredits ≤ 2.
- **Phase Pages** (full-screen, no sidebar):
  - **Explore** (`/portal/explore`): Market Signals, Sandbox, Intelligence Library tabs + Explore AI panel + Team Chat. Sandbox run results are persisted to the `sandbox_runs` table via POST `/api/member/sandbox-runs`; history loaded on page mount from GET `/api/member/sandbox-runs`.
  - **Test** (`/portal/test`): Launch a Brief wizard, Studies list, Research Assistant tabs + Research AI panel + Team Chat. Download PDF button opens `pdfUrl` if present or shows toast. Build Slide Deck button shows "coming soon" toast.
  - **Act** (`/portal/act`): Gaps analysis, Next Steps, Planning Assistant tabs + Insights Query AI panel + Team Chat. Connected Studies block populated from `/api/member/client-reports` (real data, not hardcoded). Planning greeting updates dynamically with actual user name + study count.
  - **Health/Company** (`/portal/health`): Company IIC score history, brand pillars, strategic gaps — all calculated dynamically from `/api/member/client-reports`.
- **Other Sections**: Trends & Insights Library, Launch New Brief, Credits & Billing, Past Research Dashboard, Member Deals, Settings.
- **Admin Section**: Dedicated `/portal/admin` for ADMIN users with tabs for Overview, Companies, Users, Orders, Briefs, Reports, Deals.
- **Design**: Dark violet sidebar/topbar (VDK #1E1B3A), coral branding (#E8503A), cream background (#FAF3E8), phase colors: Explore (violet #3A2FBF), Test (green #2A9E5C), Act (coral #E8503A), Health (cyan #4EC9E8).
- **Sandbox Runs DB Table**: `sandbox_runs` — stores companyId, userId, concept, personas[], interestScore, commitmentScore, ideaScore, createdAt. API: GET/POST `/api/member/sandbox-runs` (requires auth, scoped to authenticated company).

### Admin Portal B2B Client System
- **Overview Tab**: Clean, simplified design with Test24 Tracker (active/completed studies), Free Reports library, and Research Snapshot (brief status counts). Credit totals exclude Innovatr's fictional demo credits.
- **Companies Tab**: Company accounts with pooled credits. Credit display shows only remaining credits (not x/y format). Companies: Innovatr, Rugani Juice, Greenway Farms, Nando's South Africa, DGB, Revlon, Mitchum, Elizabeth Arden. Includes "Create New Company" feature to set up new B2B clients with an initial user who receives a welcome email with password setup link.
- **Orders Tab**: Order management without revenue analytics. Shows order counts only (total, this month, completed, pending). No revenue values, charts, or averages.
- **Briefs Tab**: Pipeline view with 5 columns (New, In Progress, Under Review, Completed, On Hold) with drag-and-drop functionality.
- **Design Principles**: Clean, uncluttered interface focused on operational metrics. Data consistency across all tabs from same database tables.
- **Trends & Insights Library**: View toggle feature (grid/list views) with refresh button for consistent display options.
- **View-as-Company Mode**: Admin impersonation feature allowing admins to view the portal as a specific company. Activated from Companies tab via "View Portal" button. Hides Admin tab, shows amber impersonation banner on all pages, uses company's data. Exit via "Back to Companies" button which restores admin access and returns to Companies tab. Impersonation state persists in AuthContext and localStorage until explicitly cleared. Route protection prevents accessing /portal/admin while impersonating.

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

### Public Website Redesign (6 Pages)
- **Brand tokens**: Violet `#3A2FBF`, Coral `#E8503A`, Cyan `#4EC9E8`, Amber `#F5C842`, off-white `#F8F7F4`, dark `#0D0B1F`. DM Serif Display headings, DM Sans body.
- **Navbar (all 6 pages)**: Fixed glassmorphism nav. Auth-aware: logged out shows Login + Sign Up buttons (trigger `LoginDialog`); logged in shows circular avatar (initials or User icon) → `/portal/dashboard`. No "Book Demo" button. Mobile hamburger menu with same auth logic.
- **Footer (all 6 pages)**: Dark background `#1E1B3A`, actual Innovatr logo image (`/Innovatr_logo-01.png` with `brightness(0)invert(1)` filter). Social links: Facebook (`facebook.com/innovatr1`), LinkedIn (`linkedin.com/company/innovatr/`), Instagram (`instagram.com/innovatr1/`). No Twitter.
- **Routes**:
  - `/` → `InnovatrHome` (hero with animated personas, stats, `id="pricing"` section, `id="membership"` section)
  - `/consult` → `ConsultPage` (consulting offering, `id="process"` section for anchor linking)
  - `/research` → `ResearchPage` (membership tiers and research products, auth-aware Subscribe/View Trends)
  - `/tools` → `ToolsPage` (tool library with video demos, `id="tools-section"` for anchor linking)
  - `/case-studies` → `CaseStudiesPage` (case study listing, CTAs wired to /contact and Calendly)
  - `/case-studies/:slug` → `CaseStudyDetail` (redesigned to match brand, breadcrumbs: Home > Case Studies > [Client], "Back to Case Studies" → /case-studies)
  - `/contact` → `ContactPage` (contact form POSTing to `/api/contact`, with WhatsApp/email CTAs)
- **Anchor sections**: `/#pricing` (Don't Guess. Test. section), `/#membership` (Join the Club & Save section), `/consult#process`, `/tools#tools-section`
- **Checkout back-links**: "Back to Pricing" → `/#pricing`; "Back to Membership Plans" → `/#membership`
- **Auth-aware buttons**: "Subscribe Now" → "View Trends" (logged in) on Home + Research pages. "Already a member?" → LoginDialog (logged out) or portal link (logged in).
- **Book a Consult/Demo**: Opens `https://calendly.com/richard-1220` in new tab.
- **LoginDialog z-index**: DialogOverlay `z-[1100]`, DialogContent `z-[1200]` (above fixed navbar at z-1000).

### Feature Specifications
- **Service Detail Pages**: Consistent design for Test24 services and consultation, with embedded videos and clear CTAs.
- **Pricing Section**: Displays discounted rates for members.
- **Member Credit Checkout**: Requires Entry Plan membership for credit purchases, with automatic inclusion in cart for new members.
- **Coupon Claim System**: Allows users to claim a unique coupon via a dedicated page.
- **Launch Brief Payment Options**: Offers "Pay Online", "Invoice Me", or "Use My Credits" with credit balance display and deduction functionality. Online payments use PayFast with dynamic pricing based on login status.
- **Member Pricing**: Logged-in users receive discounted rates: Basic R5,000 (vs R5,500), Pro R45,000 (vs R50,000). Pricing is calculated server-side by checking session validity.
- **Consumer Reach Selector**: Launch Brief form includes a tiered consumer reach selector. Basic studies: 100/200/500/1,000 consumers with per-consumer price drops at volume (R50→R40→R35→R30/consumer for members). Pro studies: 100/200/500 consumers. Price updates dynamically with reach selection. `num_consumers` stored in `brief_submissions` table and displayed in admin brief detail view.
- **Password Reset Token**: Setup/reset link expiry extended from 1 hour to 7 days, giving B2B client users time to click their account setup email. Login form has proper autocomplete attributes for browser password saving.
- **Admin Portal**: Comprehensive dashboard for managing users, reports, deals, and system metrics. Includes per-company Activity Log with weekly summaries, user breakdowns, and event timeline.
- **User Activity Tracking**: Server-side activity logging via `activity_events` table. Tracks logins, login failures (wrong password, disabled accounts), password reset requests/completions, report views, downloads, trends page views, brief launches, and portal navigation. Client-side `logActivity()` utility in `client/src/lib/activityLogger.ts` instruments key portal actions. Admin analytics dashboard includes "User Engagement" card showing monthly logins, active users, failed logins, password reset stats, never-logged-in users, and 30-day inactive users.
- **Daily Admin Digest Email**: Automated email sent to hannah@innovatr.co.za at 4pm weekdays (Monday includes weekend stats). Contains new user signups, login counts, report views/downloads, company activity breakdown, and recent event timeline. Scheduler in `server/index.ts`.
- **Mailer Subscription System**: Manages subscriptions for "Pulse Insights Newsletter" with admin view.
- **Insight Mailers (INNOVATR INSIDE)**: Scheduling system for the INNOVATR INSIDE newsletter series. 10 monthly mailers (March-December 2026) seeded with topics like Predictive Modelling, Data Storytelling, AI in Innovation, etc. Admin Reports tab shows collapsible schedule with auto-status (upcoming/overdue/sent/scheduled/draft based on date), expandable content view (subject line, preview text, body), and Mark Sent/Revert actions. API endpoints at `/api/admin/insight-mailers` with Zod validation. Schema: `insight_mailers` table.
- **Email Notifications**: Admin notifications for new orders via Resend.
- **API Security**: Strict access control with `requireAuth` and `requireAdmin` middleware, data redaction, and ownership verification.
- **Report Management System**: Full admin control over reports with PDF/PPTX upload (20MB limit), cover images, thumbnails, external dashboard links, and access level gating. Public reports endpoint excludes client-specific reports; authenticated member endpoint allows access to user's company client reports. Reports support multiple content types, categories, and tags.

## Infrastructure Notes
- **Dev preview port**: Main app runs on port 5000 (Express + Vite middleware). The `.replit` file maps `localPort = 5000 → externalPort = 80` as the sole active mapping.
- **Stale port entries**: `.replit` contains three extra port entries (19941→3001, 19942→3002, 19943→4200) left over from the canvas mockup system. These are inert — no process listens on those ports since `artifacts/innovatr-home-mockup/` was deleted. They should be removed when Replit allows `.replit` edits.
- **Canvas artifacts**: The `artifacts/innovatr-home-mockup/` directory was deleted (Task #24). It contained a Component Preview Server that competed with the main app for the external URL routing. Do not recreate it.

## External Dependencies
- **Email Service**: Resend (for transactional emails, specifically admin order notifications).
- **Payment Processing**: PayFast, Zapper, Apple Pay (South African gateways), and Stripe (prepared for international payments).
- **UI Animations**: Intersection Observer API for scroll animations.
- **Video Embeds**: Vimeo.