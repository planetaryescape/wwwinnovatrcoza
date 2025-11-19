# Innovatr Website

## Overview
Innovatr is a premium SaaS platform offering rapid market research and innovation testing. This marketing website is designed to drive conversions for 24-hour research testing services (Test24 Basic and Test24 Pro) and membership programs. It features service descriptions, pricing, checkout flows, and trust-building elements like client logos and testimonials. The business model supports one-time purchases and recurring memberships. The platform emphasizes speed, clarity, and a tech-forward aesthetic inspired by premium SaaS products.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter for client-side routing, supporting various pages including home, service details, checkout, and a comprehensive members portal.
- **State Management**: TanStack Query (React Query) v5 for server state and API calls; React hooks for local state.
- **UI Component Library**: Shadcn/ui (built on Radix UI) for accessible, customizable components in a "New York" style.
- **Styling**: Tailwind CSS v3 with custom design tokens, supporting light/dark themes. Uses Roboto for sans-serif and DM Serif Display for headings.
- **Design Principles**: Conversion-optimized with clear CTAs, minimal friction in buying flows, and trust-building elements. Emphasizes premium aesthetics with neon accents, clean white backgrounds, and charcoal text.

### Backend
- **Server Framework**: Express.js with Node.js and TypeScript, handling API routes and serving static assets.
- **Development Mode**: Vite middleware integrated with Express for HMR.
- **Production Mode**: Vite bundles client assets, esbuild bundles server code.
- **Data Layer**: Currently uses an in-memory storage (`MemStorage`) for user management, designed to be swappable with a database.
- **Session Management**: `express-session` prepared for PostgreSQL-backed session storage (`connect-pg-simple`).
- **API Structure**: RESTful API with `/api` prefix, includes request logging middleware.

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL with `@neondatabase/serverless` driver.
- **Schema**: Basic user schema (id, username, password) with Zod validation.
- **Migrations**: Drizzle Kit for managing database migrations.
- **Current State**: Schema defined but in-memory storage is a placeholder until full database integration.

### Form Handling and Validation
- **Form Library**: React Hook Form with `@hookform/resolvers`.
- **Validation**: Zod schemas for runtime type checking and validation, integrated with Drizzle ORM and React Hook Form.

### Authentication System
- **Architecture**: `AuthContext` manages user state (persisted in `localStorage`) with login, signup, and logout functions. Supports `free`, `entry`, `gold`, and `platinum` user tiers based on mock email patterns.
- **LoginDialog**: Modal for authentication, toggles between login/signup, redirects to portal on success.
- **Access Control**: Two-tier model: Free users access `FreeTierPortal` (trends library with upgrade prompts); Paid members access the full 7-section portal (dashboard, research, credits, settings, etc.).
- **Data Persistence**: User state (id, email, name, company, tier) stored in `localStorage` as `innovatr_user`.
- **Mock Data**: Uses hardcoded mock data for demonstration purposes across all portal pages, including member profile, credits, past studies, trend reports, and deals.

### Members Portal
- **Purpose**: A comprehensive, personalized dashboard for authenticated members to manage research, view insights, and engage with the platform.
- **Layout**: Persistent sidebar navigation using Shadcn components, with a member profile capsule.
- **Sections**: Dashboard, Trends & Insights Library, Launch New Brief, Credits & Billing, Past Research Dashboard, Member Deals, and Settings.
- **Design**: Matches the main site's premium SaaS aesthetic with bright backgrounds, charcoal text, and neon accents. Uses consistent Tailwind and Shadcn components.
- **Responsive Behavior**: Sidebar collapses on mobile, grids stack, tables remain scrollable.

### Build and Deployment
- **Development**: `npm run dev` starts Express with Vite middleware.
- **Production Build**: Vite builds client, esbuild builds server into `/dist`.
- **Environment**: Requires `DATABASE_URL` and other environment variables for third-party integrations.
- **Replit Integration**: Includes Replit-specific development plugins.

## External Dependencies
- **Payment Processing**: Stripe integration prepared with `@stripe/react-stripe-js` and `@stripe/stripe-js`, but not yet implemented.
- **UI Animations**: Intersection Observer API for scroll-triggered animations; CSS transitions and Tailwind utilities for micro-interactions.
- **Image Assets**: Stored in `/attached_assets`, referenced via Vite's asset handling.
- **Email/Communication**: Contact form exists, but backend email sending is not implemented.

## Visual Design Updates (November 2025)

**Background Images:**
The website now features strategic background images for a modern, tech-forward aesthetic:

1. **Hero Section:**
   - Futuristic road with neon light trails (blue, purple, pink) - Cover Image_1763495477591.jpg
   - No blur effect - image brightness fully visible
   - Lighter gradient overlay ensures white text legibility while maintaining image vibrancy
   - Premium, innovative visual impact

2. **Our Difference Section (01):**
   - Blue neon LED lights background
   - 15% opacity with gradient blend
   - Subtle tech aesthetic without overwhelming feature cards
   - Panel size updated to "25M panel size" (was "SA Insights")

3. **The Proof Section (03):**
   - Blue concentric circles background
   - 8% opacity with soft blur
   - Maintains focus on Vimeo video and content

**Design Principles:**
- Low opacity (8-15%) to maintain usability
- Gradient overlays for seamless blending
- Text legibility prioritized
- Modern, innovative look aligned with www.innovatr.co.za

## Dashboard Video (Entry Membership)

**Location:** Entry Membership checkout page (`/checkout/membership-entry`)
- Vimeo video ID: 1138121972
- Shows private research dashboard in action
- Positioned below "What's Included" list
- Responsive 16:9 aspect ratio
- Data-testid: "video-dashboard-entry"

## Upsiide Demo Video (The Proof Section)

The Methodology Section (03 - The Proof) includes an embedded Vimeo video showcasing the Upsiide demo:

**Implementation:**
- Embedded Vimeo player using iframe
- Video ID: 1138122776
- Full-width responsive player in 16:9 aspect ratio
- **Click-to-play:** Video does NOT autoplay (user must click to start)
- Professional Vimeo player interface with full controls
- Clean embed with title, byline, and portrait disabled

**User Experience:**
- Video requires user interaction to play (no autoplay)
- Professional Vimeo player interface with full controls
- Works seamlessly across all devices and browsers
- No login required - publicly accessible

**Technical Details:**
- Uses Vimeo's player.vimeo.com embed URL
- Parameters: `badge=0&autopause=0&player_id=0&app_id=58479`
- Fully accessible with proper iframe attributes
- Data-testid: "video-upsiide-vimeo"

## Service Detail Pages

All offering detail pages (Test24 Basic, Test24 Pro, Innovatr Consult, Innovatr Intelligence) include:

**Common Features:**
- Auto-scroll to top on page load via `useEffect`
- "Ideal For" section with black text (`text-foreground`) for improved readability
- Consistent card-based layout with key features
- Responsive design for all screen sizes

**Embedded Videos:**
- Test24 Basic: Respondent Experience (Vimeo ID: 1138122312)
- Test24 Pro: Dashboard Experience (Vimeo ID: 1138121972)

**Navigation Updates:**
- Test24 Basic/Pro "Get Started" buttons → Pricing section (/#pricing)
- Innovatr Intelligence "Get Started" button → Membership section (/#membership)
- Innovatr Consult "Get Started" button → Contact section (/#contact)

## Member Credit Checkout Pages

**Entry Plan Requirement:**
Both Test24 Basic Members and Test24 Pro Members checkout pages now enforce Entry Plan membership before allowing credit purchases:

- **Location**: Positioned above credit selection on both `/checkout/basic-members` and `/checkout/pro-members` pages
- **Visual Design**: Prominent card with primary border and background highlighting
- **Entry Plan Details**:
  - Annual: R60,000/year
  - Monthly: R5,000/month
- **Benefits Display**:
  - Test24 Basic: 50% discount on all credits
  - Test24 Pro: 10% discount on all studies
  - Access to Trends Reports & Priority Support
- **CTAs**:
  - "Get Entry Plan" button → Links to `/checkout/membership-entry`
  - "Learn More" button → Links to membership section (/#membership)
- **Data-testids**: `button-get-entry-plan`, `button-learn-more-entry`

## Coupon Claim System

**Overview:**
Users can claim a R10,000 Test24 Basic coupon by providing their name and email via a dedicated signup page.

**Database Schema:**
- Table: `coupon_claims`
- Fields: id, name, email, couponCode, claimedAt
- Validation: Zod schema ensures valid name (min 2 chars) and email format

**Backend Implementation:**
- API Route: POST `/api/coupon-claims`
- Storage: In-memory storage with methods: `createCouponClaim`, `getCouponClaimByEmail`
- Coupon Code Format: `TEST24-XXXXXXXX` (8 random uppercase characters)
- Duplicate Prevention: Existing email returns previously generated coupon

**Frontend:**
- Route: `/claim-coupon`
- Background: Futuristic road with neon light trails (blue, purple, pink) with blur and dark overlay (Picture 1_1763494967673.jpg)
- Form Fields: Name and Email with validation
- Success State: Displays generated coupon code with copy-to-clipboard functionality
- Call-to-Action: Accessible from "Limited Time Offer" banner on home page