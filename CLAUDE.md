# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**La Vistique** - A headless e-commerce storefront for custom pet portraits. Built with T3 Stack (Next.js, tRPC, Drizzle) connecting to Shopify Storefront API for products/checkout while maintaining a custom CRM and content experience.

See `docs/ARCHITECTURE_PLAN.md` for full technical architecture.

## Tech Stack

- **Framework**: Next.js 15 (Pages Router) with React 19
- **API Layer**: tRPC for internal APIs, Shopify Storefront API (GraphQL) for commerce
- **Database**: Turso (SQLite at edge) via Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Email**: Resend API (replaces Klaviyo)
- **i18n**: General Translation (gt-next)
- **Background Jobs**: Inngest
- **Image Upload**: UploadThing
- **Type Safety**: TypeScript, Zod

## Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Database commands
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## Architecture

### Directory Structure

```
src/
├── pages/           # Next.js pages (Pages Router)
│   ├── api/         # API routes
│   │   └── trpc/    # tRPC handler
│   └── ...
├── server/
│   ├── api/         # tRPC routers
│   │   ├── root.ts  # Root router combining all routers
│   │   ├── trpc.ts  # tRPC initialization
│   │   └── routers/ # Individual routers
│   └── db/
│       ├── index.ts # Drizzle client
│       └── schema.ts# Database schema
├── utils/
│   └── api.ts       # tRPC client utilities
├── styles/
│   └── globals.css  # Global styles with Tailwind
└── env.js           # Environment validation (Zod)
```

### Key Patterns

1. **tRPC for internal APIs** - All CRM, content, and background operations
2. **Shopify Storefront API for commerce** - Products, cart, checkout
3. **Server-side rendering** - Product pages fetched at request time
4. **Edge-compatible** - SQLite via Turso, no Node.js-specific code

### Shopify Integration

Products and checkout are managed through Shopify Storefront API. Use the `@inContext` directive for localization:

```graphql
query GetProducts @inContext(country: NL, language: NL) {
  products(first: 10) {
    # ...
  }
}
```

Cart customization data (pet photos, frame sizes) stored in line item attributes.

## Environment Variables

See `.env.example` for required variables. Key ones:
- `DATABASE_URL` - Turso database connection string
- `SHOPIFY_STOREFRONT_TOKEN` - Shopify Storefront API access token
- `SHOPIFY_STORE_DOMAIN` - Shopify store domain

## Code Style

- TypeScript strict mode
- Zod for runtime validation
- Prefer server components and SSR over client-side fetching
- Use tRPC procedures for all internal API calls

## Feature Documentation

Additional feature specs are in `docs/features/`:
- `PET_PREVIEW_GENERATOR.md` - AI pet portrait preview (backlogged)
