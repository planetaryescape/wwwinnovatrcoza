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
- **Editorial Brushstroke System**: Premium, modern SVG brushstroke accents inspired by editorial brands (Multiverse, Jenna Kutcher). Thick, confident strokes with soft edges and brush textures add personality without reducing clarity. Placement rules: bold brushstrokes ONLY in negative space (hero sections, large whitespace); subtle, faint strokes for section labels and stats; NEVER on pricing cards, feature lists, CTAs, or dense content. Primary color: Innovatr blue (#0033FF); accents: soft coral (#FF7A59), muted amber (#FCD87C). Opacity: 35-60% (80% in hero). Features gentle opacity hover animation and mobile responsiveness.

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
- **Authentication**: `AuthContext` manages user state (persisted in `localStorage`) with login, signup, and logout. Supports `free`, `entry`, `gold`, and `platinum` user tiers.
- **Access Control**: Free users access limited content (`FreeTierPortal`); Paid members access a full 7-section portal.

### Members Portal
- **Purpose**: Personalized dashboard for authenticated members to manage research, view insights, and engage.
- **Layout**: Persistent sidebar navigation.
- **Sections**: Dashboard, Trends & Insights Library, Launch New Brief, Credits & Billing, Past Research Dashboard, Member Deals, Settings.
- **Trends & Insights Library**: Dynamic content from Innovatr Intelligence blog posts (`reports.json`) with search, filtering, and sorting. Features free content gating and upgrade prompts.

### Build and Deployment
- **Development**: `npm run dev` starts Express with Vite.
- **Production**: Vite builds client, esbuild builds server into `/dist`.
- **Environment**: Requires `DATABASE_URL` and other environment variables.

### Feature Specifications
- **Service Detail Pages**: Consistent design across Test24 Basic, Test24 Pro, Innovatr Consult, and Innovatr Intelligence, including "Ideal For" sections and embedded Vimeo videos. Navigation buttons consistently link to relevant sections (pricing, membership, contact).
- **Pricing Section**: Defaults to "Members" tab, showing discounted rates for Test24 Basic (R5,000) and Test24 Pro (R45,000).
- **Member Credit Checkout**: Enforces Entry Plan membership requirement for credit purchases. Displays a notice card, automatically includes Entry Plan in the cart for new members, and allows existing members to opt out of the Entry Plan charge via a checkbox while retaining discounts. Entry Plan is a one-time annual fee.
- **Coupon Claim System**: Users can claim a R10,000 Test24 Basic coupon via a dedicated `/claim-coupon` page by providing name and email. The system generates unique coupon codes and prevents duplicate claims from the same email.

## External Dependencies
- **Payment Processing**: Stripe integration prepared with `@stripe/react-stripe-js` and `@stripe/stripe-js`.
- **UI Animations**: Intersection Observer API for scroll animations, CSS transitions, and Tailwind utilities.
- **Image Assets**: Stored in `/attached_assets` and referenced via Vite.
- **Video Embeds**: Vimeo for embedding demo and informational videos.