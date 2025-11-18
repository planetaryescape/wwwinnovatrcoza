# Innovatr Website

## Overview

Innovatr is a premium SaaS platform offering rapid market research and innovation testing services. The application is a conversion-focused marketing website designed to drive customers toward purchasing 24-hour research testing services (Test24 Basic and Test24 Pro) or joining a membership program. The platform emphasizes speed, clarity, and a tech-forward aesthetic inspired by premium SaaS products like Stripe, Linear, and Notion.

The website features service descriptions, pricing comparisons (pay-as-you-go vs. membership), checkout flows, and trust-building elements including client logos, statistics counters, and testimonials. The primary business model offers two paths: one-time purchases and recurring memberships with discounted rates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter is used for client-side routing, providing a lightweight alternative to React Router. The application supports multiple routes including the home page, service detail pages (Test24 Basic, Test24 Pro, Innovatr Consult), and checkout flows for both pay-as-you-go and membership options.

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