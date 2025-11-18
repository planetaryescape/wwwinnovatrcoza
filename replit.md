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

## Video Upload Feature (The Proof Section)

The Methodology Section (03 - The Proof) includes an Upsiide demo video upload feature:

**Functionality:**
- Drag-and-drop or click-to-browse file upload
- Supports video formats: MP4, WebM, MOV, etc.
- Maximum file size: 150MB
- Client-side validation for file type and size
- Video preview with HTML5 video player controls
- Remove video button to replace or delete uploaded content

**User Experience:**
- Upload area displays when no video is present
- Visual feedback during drag-over state
- Toast notifications for success/error states
- Full-width video player in 16:9 aspect ratio
- Video controls include play, pause, volume, fullscreen
- Video persists only during current page session (resets on page reload)

**Technical Implementation:**
- Uses `URL.createObjectURL()` for client-side video preview
- No server upload required for basic functionality
- Properly revokes object URLs to prevent memory leaks
- Video must be re-uploaded after page reload

**Limitations:**
- Video does NOT persist across page reloads (session-only)
- Does not persist across different devices/browsers
- Not suitable for production without backend storage
- User must re-upload video if they refresh the page

**Future Enhancements:**
- Server-side video upload to cloud storage (S3, Cloudflare R2)
- Video transcoding and optimization
- Multiple video uploads with gallery
- Admin panel for managing video content
- CDN integration for better performance