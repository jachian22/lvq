# La Vistique - Headless Shopify Storefront

Custom pet portrait storefront built with Next.js and Shopify Storefront API exploring the possibilities with agentic AI in ecommerce

## Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **API**: tRPC 11
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS v4
- **E-commerce**: Shopify Storefront API (GraphQL)
- **Chat AI**: OpenRouter (Kimi-K2)
- **Email**: Resend
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Shopify store with Storefront API access

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-token

# OpenRouter (for AI chat)
OPENROUTER_API_KEY=your-openrouter-key

# Resend (for emails)
RESEND_API_KEY=your-resend-key

# Admin
ADMIN_PASSWORD=your-admin-password

# Database
DATABASE_URL=file:./db.sqlite
```

## Project Structure

```
src/
├── components/
│   ├── cart/           # Cart drawer, line items, upsells
│   ├── chat/           # Chat widget
│   ├── layout/         # Header, Footer, PromoBanner
│   ├── product/        # ProductCard, PriceDisplay
│   └── wizard/         # 4-step product customization
├── contexts/           # React contexts (Cart, Locale, Promo, Wizard)
├── lib/                # i18n, Resend email helpers
├── pages/
│   ├── [locale]/       # Locale-prefixed pages
│   │   ├── admin/      # Admin support queue
│   │   ├── collections/
│   │   ├── products/
│   │   └── cart.tsx
│   └── api/
│       ├── chat/       # AI chat endpoint
│       └── trpc/       # tRPC handler
├── server/
│   ├── api/routers/    # tRPC routers
│   ├── db/             # Drizzle schema
│   └── shopify/        # Shopify GraphQL client
└── styles/
```

## Features

### Storefront
- Product browsing with collections
- 4-step product customization wizard
- Locale-based routing (NL, EN, DE, FR)
- Currency formatting per country
- Persistent cart with Shopify checkout

### Promotions
- URL-based promo codes (`?promo=CODE`)
- Site-wide strikethrough pricing
- Support for targeted discounts (collection/product-specific)
- 30-day cookie persistence

### Customer Support
- AI-powered chat widget (Kimi-K2 via OpenRouter)
- Human handoff with support tickets
- Admin queue for ticket management
- Email notifications via Resend

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm typecheck    # Run TypeScript checks
pnpm lint         # Run ESLint
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

## Localization

Supported locales:
- `nl` - Nederlands (default)
- `en` - English
- `de` - Deutsch
- `fr` - Français

URLs are prefixed with locale: `/nl/products/royal-portrait`

## License

Private - All rights reserved.
