# Innovatr Website

## Overview

Innovatr is a premium SaaS platform offering rapid market research and innovation testing services. The application is a conversion-focused marketing website designed to drive customers toward purchasing 24-hour research testing services (Test24 Basic and Test24 Pro) or joining a membership program. The platform emphasizes speed, clarity, and a tech-forward aesthetic inspired by premium SaaS products like Stripe, Linear, and Notion.

The website features service descriptions, pricing comparisons (pay-as-you-go vs. membership), checkout flows, and trust-building elements including client logos, statistics counters, and testimonials. The primary business model offers two paths: one-time purchases and recurring memberships with discounted rates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter is used for client-side routing, providing a lightweight alternative to React Router. The application supports multiple routes including the home page, service detail pages (Test24 Basic, Test24 Pro, Innovatr Consult), checkout flows for both pay-as-you-go and membership options, and a comprehensive members portal with dashboard, trends library, research management, credits, and settings.

**State Management**: TanStack Query (React Query) v5 handles server state management, API calls, and caching. Local component state is managed with React hooks (useState, useEffect).

**UI Component Library**: Shadcn/ui components built on top of Radix UI primitives. This provides accessible, customizable components following a "New York" style variant. The component library includes extensive UI elements like buttons, cards, dialogs, forms, navigation menus, and data visualization components.

**Styling**: Tailwind CSS v3 with custom design tokens defined via CSS variables. The design system uses a neutral base color scheme with support for light/dark themes. Custom spacing follows Tailwind's standard units (4, 8, 12, 16, 20, 24) for consistent rhythm. Typography uses Roboto for sans-serif and DM Serif Display for headings.

**Design Principles**: The architecture prioritizes conversion optimization with clear call-to-action buttons, minimal friction in buying flows, and trust-building elements. The visual hierarchy emphasizes premium aesthetics with neon accent colors, clean white backgrounds, and charcoal text.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript. The server handles both API routes and serves the Vite-built static assets in production.

**Development Mode**: In development, Vite middleware is integrated directly into the Express server for hot module replacement (HMR) and fast refresh. The Vite dev server runs in middleware mode, allowing Express to handle API routes while Vite handles asset serving and transformation.

**Production Mode**: The build process uses Vite to bundle the client application and esbuild to bundle the Express server code. Static assets are served from the dist/public directory.

**Data Layer**: Currently implements an in-memory storage interface (`MemStorage`) for user management. The storage interface defines CRUD operations (getUser, getUserByUsername, createUser) but is designed to be swappable with a database implementation.

**Session Management**: The application uses express-session with connect-pg-simple for PostgreSQL-backed session storage (dependency present but not yet fully integrated).

**API Structure**: RESTful API design with routes prefixed with `/api`. Request logging middleware captures method, path, status code, duration, and response body for debugging.

### Database Layer

**ORM**: Drizzle ORM is configured for PostgreSQL database access using the `@neondatabase/serverless` driver for serverless PostgreSQL connections.

**Schema**: Basic user schema defined with id (UUID), username, and password fields. The schema uses Drizzle's schema builder with Zod validation schemas for type-safe inserts.

**Migrations**: Drizzle Kit is configured to generate and manage database migrations in the `/migrations` directory. The configuration points to PostgreSQL dialect with credentials from the DATABASE_URL environment variable.

**Current State**: Database schema is defined but not actively used in the application logic. The in-memory storage implementation serves as a placeholder until database integration is fully implemented.

### Form Handling and Validation

**Form Library**: React Hook Form with @hookform/resolvers for validation schema integration.

**Validation**: Zod schemas provide runtime type checking and validation, integrated with both Drizzle ORM for database inserts and React Hook Form for client-side form validation.

### External Dependencies

**Payment Processing**: Stripe integration prepared with @stripe/react-stripe-js and @stripe/stripe-js packages. The checkout pages are built but Stripe integration is not yet implemented.

**UI Animations**: Intersection Observer API used for scroll-triggered animations (stats counter, trust bar auto-scroll). CSS transitions and Tailwind utilities handle hover states and micro-interactions.

**Image Assets**: Background images and static assets stored in `/attached_assets` directory, referenced via Vite's asset handling with the `@assets` path alias.

**Email/Communication**: Contact form exists but backend integration for email sending is not implemented.

**Third-Party Services**: No active integrations with analytics, CRM, or email marketing platforms, though the application structure supports adding these services through the Express API layer.

### Build and Deployment

**Development**: `npm run dev` starts the Express server with Vite middleware in development mode. TypeScript compilation is checked separately via `npm run check`.

**Production Build**: Two-step build process - Vite bundles client assets and esbuild bundles the server code into the `/dist` directory.

**Environment Configuration**: Requires DATABASE_URL environment variable for database connections. Additional environment variables likely needed for Stripe keys and other third-party integrations.

**Replit Integration**: Includes Replit-specific development plugins for runtime error overlay, cartographer (code navigation), and dev banner when running in Replit environment.

## Members Portal

The application now includes a comprehensive, personalized members portal designed as a premium SaaS dashboard experience. The portal provides authenticated members with tools to manage research, view insights, and engage with the platform.

### Portal Architecture

**Layout Structure**: The portal uses a persistent sidebar navigation layout built with Shadcn's sidebar primitives. The layout includes a member profile capsule showing name, company, and membership tier (Entry/Gold/Platinum), plus navigation to all portal sections.

**Portal Routes**: All portal pages are mounted under `/portal/*` routes and share a common PortalLayout component that provides consistent navigation and branding.

**Mock Authentication**: Currently uses mock member data (hardcoded in component state) as full authentication integration is pending. In production, member data would come from session/auth context.

### Portal Sections

1. **Dashboard** (`/portal`):
   - Personalized welcome with member tier badge
   - Quick action cards for launching studies, accessing trends, buying credits, and viewing past research
   - Credit summary widget with progress bars for Test24 Basic and Pro credits
   - Personalized recommendations feed curated by industry
   - Member deals box with exclusive offers and expiry countdown
   - Activity stats showing studies completed, reports downloaded, and value unlocked

2. **Trends & Insights Library** (`/portal/trends`):
   - Searchable, filterable library of industry trend reports
   - Category and sorting filters (newest, most downloaded)
   - Personalized recommendations based on member industry
   - Bookmark system for saving favorite reports
   - Download buttons for PDF reports
   - "NEW" badges for recently published content

3. **Launch New Brief** (`/portal/launch`):
   - Guided briefing form for Test24 Basic and Pro studies
   - Two-step flow: Select study type → Complete brief form
   - Form fields: product name, category, description, target audience, research questions (Pro only)
   - File upload for supporting assets (images, videos, documents)
   - Real-time credit cost calculator showing member pricing
   - Auto-save drafts functionality (stubbed)

4. **Credits & Billing** (`/portal/credits`):
   - Visual credit balance display with progress bars
   - Test24 Basic and Pro credit tracking separately
   - Credit purchase cards showing member discounts (up to 55% off)
   - Billing history table with downloadable invoices
   - Payment method management
   - Expiry warnings for unused credits

5. **Past Research Dashboard** (`/portal/research`):
   - Toggle between grid and list view modes
   - Filters: search, category, study type (Basic vs Pro)
   - Study cards showing score, category, date, and top findings
   - Color-coded performance scores (green 80+, accent 70-79, orange <70)
   - Actions: View detailed results, Download/Export report
   - AI qual video previews for Pro studies (stubbed)

6. **Member Deals** (`/portal/deals`):
   - Exclusive member-only promotional offers
   - Limited-time deal cards with savings amounts and expiry countdown
   - Monthly perks section (free reports, beta access, consultation credits)
   - "Coming Soon" preview of future benefits
   - CTA to upgrade membership tier or purchase credits

7. **Settings** (`/portal/settings`):
   - Profile information editor (name, email, company, job title)
   - Industry selection (affects trend recommendations)
   - Notification preferences with toggles for reports, credits, studies, deals
   - Team access management (invite/remove users)
   - Security settings (password change)

### Portal Design System

**Visual Style**: Matches the main site's premium SaaS aesthetic with bright white backgrounds, charcoal text, and neon accent highlights. Uses the same Tailwind color tokens and Shadcn components.

**Navigation Pattern**: Sticky sidebar with icon-based menu items. Each item highlights when active (using wouter's current location). Profile capsule at top shows tier badge with color coding (Platinum=primary, Gold=accent, Entry=muted).

**Interaction Design**: Hover-elevate and active-elevate-2 utility classes for interactive cards. Progress bars for credit usage. Badge system for status indicators (NEW, LIMITED TIME, etc).

**Data Visualization**: Progress components for credit consumption, color-coded scores for research performance, and visual stat counters for engagement metrics.

**Responsive Behavior**: Sidebar collapses on mobile. All grids stack to single column. Tables remain scrollable. Toggle controls adapt to touch.

### Mock Data Structure

All portal pages currently use hardcoded mock data for demonstration:
- Member profile: Richard @ Innovatr, Gold tier
- Credits: 7/10 Basic, 1/2 Pro remaining
- Past studies: 6 completed research projects with scores 68-85
- Trend reports: 5 industry reports across categories
- Billing history: 3 past invoices
- Deals: 3 exclusive offers + 3 monthly perks

In production, all data would come from API endpoints backed by the database.

### Future Enhancements

- Real authentication/session management integration
- API endpoints for all portal data (credits, studies, reports, billing)
- WebSocket or polling for real-time study status updates
- Enhanced analytics dashboard with charts (using Recharts)
- Team collaboration features (shared studies, comments)
- Integration with external services (export to PowerPoint, email delivery)
- Gamification elements (achievement badges, value meter)

**Current State**: All portal pages are fully designed and functional with mock data. Ready for backend API integration once authentication system is implemented.