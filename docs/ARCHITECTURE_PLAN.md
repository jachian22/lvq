# Lavistique Headless Shopify Migration Plan

This document outlines the architecture and implementation plan for migrating lavistique.nl from a Shopify theme-based store to a headless TypeScript monorepo hosted on Vercel.

## Table of Contents

- [Overview](#overview)
- [Architecture Decision](#architecture-decision)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Project Structure](#project-structure)
- [Implementation Phases](#implementation-phases)
- [API Integration](#api-integration)
- [Database Schema](#database-schema)

---

## Overview

### Current State
- Shopify theme (Dawn-based) at lavistique.nl
- Klaviyo for email marketing
- Standard Shopify checkout

### Target State
- Custom Next.js frontend on Vercel
- Shopify as headless commerce backend (products, cart, checkout, orders)
- Custom CRM/email system with Resend API
- Full control over discount visualization, promotions, and marketing flows

---

## Architecture Decision

**Chosen approach**: T3 Stack + Custom Shopify Storefront API Integration

### What We ARE Using

- **T3 Stack** as foundation (`create-t3-app` scaffold)
- **Custom Shopify GraphQL client** - Built from scratch to call Storefront API
- **Next.js App Router** - Standard Next.js, not a Shopify-specific framework

### What We Are NOT Using

| Option | Why Not |
|--------|---------|
| **Shopify Hydrogen** | Optimized for Shopify's Oxygen hosting, not Vercel. Adds Shopify-specific abstractions we don't need. |
| **Vercel Commerce Template** | No database, no tRPC - would require retrofitting our CRM/discount systems onto their patterns. |
| **Shopify Buy SDK** | Legacy approach, less flexible than direct GraphQL. |

### Why T3 + Custom Integration

| Aspect | T3 + Custom Shopify | Vercel Commerce | Hydrogen |
|--------|---------------------|-----------------|----------|
| Adding custom features | Clean, obvious patterns | Retrofit around existing code | Shopify-opinionated |
| CRM/Email system | Natural fit with tRPC | No infrastructure | Would need to add |
| Discount visualization | Built-in from start | Bolted on after | Some components exist |
| Database | Drizzle + Turso ready | None included | None included |
| Deployment | Vercel-native | Vercel-native | Oxygen-optimized |
| Long-term control | Full ownership | Template patterns | Shopify's roadmap |

### Key Benefits of T3 Approach

1. **Unified tRPC API layer** - All data flows through typed routers (Shopify + our DB)
2. **Type safety from DB to UI** - Drizzle schema types propagate everywhere
3. **Clear separation** - Shopify calls vs business logic vs presentation
4. **Scalable patterns** - Adding features (bundles, CRM, previews) has obvious placement
5. **No framework lock-in** - Standard Next.js patterns, easy to understand and modify

---

## Tech Stack

### Core Framework
- **Next.js 14+** (App Router)
- **TypeScript** (strict mode)
- **tRPC** - Internal API layer
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Database
- **Turso** - SQLite at the edge (fast, cheap)
- **Drizzle ORM** - Type-safe, lightweight, edge-compatible

### External Services
- **Shopify Storefront API** - Products, cart, checkout
- **Shopify Admin API** - Discount sync, order webhooks
- **Resend** - Transactional and marketing email
- **UploadThing** - File uploads for personalized products
- **General Translation** - i18n for UI content
- **Inngest** - Background jobs and automation flows

### Deployment
- **Vercel** - Hosting, edge functions, preview deployments

---

## Core Features

### Phase 1: Storefront Foundation

#### 1.1 Multilanguage Support
- **UI Content**: General Translation (gt-next) with `<T>` component
- **Product Content**: Shopify Markets with `@inContext(language: XX)` directive
- **Supported languages**: Dutch (nl), English (en), German (de), French (fr)
- **URL structure**: `/{locale}/products/...`

```tsx
// Example: Inline translation
import { T } from 'gt-next';

<T><button>Add to cart</button></T>
```

#### 1.2 Multicurrency + EU VAT
- **Currencies**: EUR, GBP, USD (expandable)
- **Countries**: NL, DE, FR, BE, GB, US (expandable)
- **VAT handling**: Shopify calculates at checkout automatically
- **Price display**: Show prices in local currency with VAT indicator

```tsx
// Query products with country context
query GetProduct($handle: String!) @inContext(country: DE) {
  product(handle: $handle) {
    priceRange {
      minVariantPrice {
        amount        // Returns EUR for DE
        currencyCode
      }
    }
  }
}
```

#### 1.3 Personalized Products (Image Upload)
- **Upload flow**: Customer uploads image → UploadThing storage → URL attached to cart line item
- **Cart attributes**: `_customization_image`, `_customization_text`
- **Fulfillment**: Image URL visible in Shopify admin order

```tsx
// Cart line item with personalization
{
  merchandiseId: variantId,
  quantity: 1,
  attributes: [
    { key: '_customization_image', value: 'https://cdn.lavistique.nl/uploads/abc123.jpg' },
    { key: 'Personalization', value: 'Yes' },
  ]
}
```

#### 1.4 Checkout Flow - Guided Wizard

> **Important**: Shopify controls the actual checkout. Our frontend handles everything *up to* checkout using a guided wizard approach.

**Why Wizard Over Single Page:**
- Reduces cognitive load (one decision at a time)
- Better mobile UX (fits screen, clear progress)
- Enables step-level abandonment tracking
- Full attention on photo upload with guidelines
- More engaging "build your portrait" experience

**Wizard Steps:**

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Choose Your Costume                                │
│  ━━━━━━━━━━●○○○                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Select the royal costume for your pet:                     │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ [img]   │  │ [img]   │  │ [img]   │  │ [img]   │       │
│  │  King   │  │ Admiral │  │ Duchess │  │  Duke   │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│                                        [NEXT →]             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Select Size & Frame                                │
│  ━━━━━━━━━━━━━━━━━━●○○                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SIZE                         FRAME                         │
│  ┌─────────────────────┐     ┌─────────────────────┐       │
│  │ ○ 20×30cm    €49    │     │ ○ Poster only       │       │
│  │ ● 30×40cm    €79    │     │ ● Black      +€25   │       │
│  │ ○ 40×50cm    €129   │     │ ○ White      +€25   │       │
│  │ ○ 50×70cm    €179   │     │ ○ Oak        +€35   │       │
│  └─────────────────────┘     └─────────────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Total: €104                          (live update) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                          [← BACK]          [NEXT →]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Upload Your Pet's Photo                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━●○                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │            📷 Drag & drop your photo               │   │
│  │               or click to browse                   │   │
│  │                                                     │   │
│  │     Accepts: JPG, PNG, HEIC (max 10MB)             │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Photo tips for best results:                               │
│  ✓ Well-lit, natural lighting                              │
│  ✓ Close-up showing head and neck                          │
│  ✓ Pet looking at camera                                   │
│  ✗ Avoid blurry, dark, or overhead shots                   │
│                                                             │
│                          [← BACK]          [NEXT →]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Review & Add to Cart                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    King Portrait                         │
│  │              │    30×40cm with Black Frame              │
│  │  [uploaded   │                                          │
│  │   pet photo] │    €104.00                               │
│  │              │                                          │
│  └──────────────┘                                          │
│                                                             │
│  ✨ Unlimited revisions until you're 100% happy            │
│  🚚 Free shipping & protection included                    │
│  🎨 Hand-crafted by our artists                            │
│                                                             │
│                          [← BACK]      [ADD TO CART]        │
└─────────────────────────────────────────────────────────────┘
```

**Cart Page:**

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR CART                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐  King Portrait                                 │
│  │[thumb] │  30×40cm, Black Frame           €104.00        │
│  └────────┘  [Edit] [Remove]                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚡ Skip the Line                                    │   │
│  │    Get your portrait faster with priority processing│   │
│  │                                        +€15 [Add]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Discount code: [__________] [Apply]                       │
│                                                             │
│  ─────────────────────────────────────────                 │
│  Subtotal:                                    €104.00      │
│  Shipping:                              Calculated at checkout│
│  ─────────────────────────────────────────                 │
│                                                             │
│                                    [CHECKOUT →]             │
│                                                             │
│  → Redirects to Shopify checkout                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What we control:**
- Guided wizard product customization
- Live price calculation as options change
- Image upload UI and storage (UploadThing)
- Cart display and modification
- Skip the Line upsell (mocked initially, printer API later)
- Discount code input (passed to Shopify cart)

**What Shopify controls:**
- Payment processing
- Shipping calculation
- Final order creation
- Order confirmation emails (customizable in Shopify admin)

**Key UX Elements:**
- Progress indicator (step dots)
- Live price updates on size/frame selection
- Photo guidelines prominently displayed at upload step
- Trust signals on review step (unlimited revisions, free shipping/protection)
- Skip the Line as cart-level upsell (not checkout)

**Cart Attributes Structure:**

```tsx
// When customer completes wizard and clicks "Add to Cart"
await shopify.cartLinesAdd({
  cartId,
  lines: [{
    merchandiseId: variantId,  // Encodes size + base product
    quantity: 1,
    attributes: [
      { key: '_customization_image', value: imageUrl },
      { key: '_costume_style', value: 'king' },
      { key: '_frame_option', value: 'black' },
      { key: 'Customization', value: 'Custom pet portrait' },  // Visible at checkout
    ],
  }],
});

// Skip the Line added separately if selected
await shopify.cartLinesAdd({
  cartId,
  lines: [{
    merchandiseId: skipTheLineVariantId,
    quantity: 1,
    attributes: [
      { key: '_priority_processing', value: 'true' },  // For future printer API
    ],
  }],
});
```

**Skip the Line Implementation:**

```tsx
// Phase 1: Mocked (just adds to cart as line item)
// The attribute is stored but not acted upon

// Phase 2: Printer API integration (future)
// When order is created, webhook checks for _priority_processing
// If true, calls printer API to prioritize in queue:
// POST https://printer-api.example.com/orders/{orderId}/prioritize
```

**Note**: If upgrading to Shopify Plus in future, Checkout Extensibility allows embedding custom UI directly within checkout.

### Phase 2: Marketing Foundation

#### 2.1 Contact Management

**Terminology:**
| Term | Definition |
|------|------------|
| **Contact** | Any email in your database (from any source) |
| **Subscriber** | Contact who has opted-in to marketing emails |
| **Customer** | Contact who has made a purchase (synced from Shopify) |

**Data sources:**
- Klaviyo export (migration with consent dates preserved)
- Signup forms (newsletter, footer, popups)
- Checkout opt-in (synced via Shopify webhook)
- Preview generator (pet portrait feature)

**Core functionality:**
- Contacts table with consent tracking
- Shopify customer sync via webhooks
- List and tag management
- Segment builder (dynamic filtering)

#### 2.2 Campaign Sending
- One-off email campaigns to segments
- React Email templates
- Resend API for delivery
- Basic analytics (opens, clicks)

### Phase 3: Customer Support Chatbot

> **Note**: This is an **async chat system** - human responses are not real-time. Staff respond when available, customers are notified via email when a human replies.

#### 3.1 AI-Powered Chatbot (Vercel AI SDK)
- Built with **Vercel AI SDK** for streaming responses
- LLM-powered FAQ handling (trained on store knowledge base)
- Widget embedded on all pages
- Conversation history stored in DB (persistent across sessions)
- Multilingual support (follows site locale)

**System prompt includes:**
- Store policies (shipping, returns, revisions)
- Product information (how portraits work, turnaround times)
- Common questions and accurate answers
- Tone and brand voice guidelines

#### 3.2 Tool: Request Human Agent

When customer explicitly asks for human help:

```tsx
const tools = {
  requestHumanAgent: {
    description: 'Create a support ticket for human follow-up when customer requests to speak with a person',
    parameters: z.object({
      reason: z.string().describe('Brief summary of the issue'),
      customerEmail: z.string().email(),
    }),
    execute: async ({ reason, customerEmail }) => {
      // Create ticket in queue
      await db.insert(supportTickets).values({
        conversationId,
        customerEmail,
        reason,
        status: 'pending',
      });

      // Notify staff (email digest or Slack)
      await notifyStaff(conversationId, reason);

      return {
        message: "I've created a support ticket for you. Our team will review your conversation and respond via email within 24 hours.",
        ticketCreated: true,
      };
    },
  },
};
```

#### 3.3 Async Human Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ASYNC CHAT FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CUSTOMER                          STAFF                    │
│  ────────                          ─────                    │
│                                                             │
│  1. Chats with AI bot              │                        │
│         │                          │                        │
│  2. "Get me a human"               │                        │
│         │                          │                        │
│  3. AI: "Ticket created,           │                        │
│      we'll email you within        │                        │
│      24 hours"                     │                        │
│         │                          │                        │
│  4. Customer can leave site ───────┼─▶ Ticket appears in   │
│     (conversation saved)           │   admin queue          │
│                                    │         │              │
│                                    │   5. Staff reviews     │
│                                    │      conversation      │
│                                    │         │              │
│  6. Email: "We've replied    ◀─────┼── 6. Staff responds   │
│     to your message"               │      (when available)  │
│         │                          │                        │
│  7. Customer returns to chat       │                        │
│     (or replies via email)         │                        │
│                                    │                        │
└─────────────────────────────────────────────────────────────┘
```

#### 3.4 Admin Panel

```
┌─────────────────────────────────────────────────────────────┐
│  SUPPORT QUEUE                                    [Inbox 3] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [All ▼] [Pending ▼]               Sort: [Newest ▼]│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔴 jan@email.com                           2 hours ago ││
│  │    "Question about order modification"                  ││
│  │    [View conversation] [Reply]                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔴 emma@email.com                          5 hours ago ││
│  │    "Photo quality concern"                              ││
│  │    [View conversation] [Reply]                          ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ✓ peter@email.com                          Yesterday   ││
│  │    "Shipping to UK" [RESOLVED]                          ││
│  │    [View conversation]                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Admin features:**
- Queue of pending tickets (sorted by age)
- Full conversation history (AI + customer messages)
- Reply form → sends email to customer + saves to conversation
- Mark as resolved / needs follow-up
- Internal notes (not visible to customer)
- Daily email digest of pending tickets

#### 3.5 Customer Email Notifications

When staff replies:
- Customer receives email with the response
- Email includes link to continue conversation on site
- Can also reply directly to email (parsed and added to conversation)

#### 3.6 Future Enhancements (Backlog)

Additional tool calls for customer self-service:
- **Order lookup**: "Where is my order?" → fetches from Shopify
- **Add to cart**: "Add the King portrait in 30x40" → adds to cart
- **Modify order**: Request changes before fulfillment

See: `docs/features/CHATBOT_ADVANCED.md` for detailed specs when ready

### Phase 4: Discount System

#### 4.1 Discount Sync
- Sync discount rules from Shopify Admin API
- Store in local DB for pre-cart display
- Show "Save X%" badges on product/collection pages
- Calculate discounted prices before add-to-cart

#### 4.2 Promotional Display
- Store-wide banners for active promotions
- Countdown timers for limited offers
- Collection-level discount indicators

### Phase 5: Automation Flows (Backlog)

#### 5.1 Basic Flows
- Welcome series
- Post-purchase follow-up

#### 5.2 Advanced Flows
- Abandoned cart recovery
- Browse abandonment
- Win-back campaigns

### Phase 6: Bundle Builder (Backlog)

- Custom bundle configuration UI
- Dynamic pricing calculation
- Cart integration
- See: `docs/features/` for detailed specs when ready

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/                    # Locale-prefixed routes
│   │   ├── layout.tsx              # LocaleProvider + GTProvider
│   │   ├── page.tsx                # Homepage
│   │   ├── products/[handle]/
│   │   │   └── page.tsx            # Product page with upload
│   │   ├── collections/[handle]/
│   │   │   └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   └── admin/                   # Admin panel (protected)
│   │       ├── layout.tsx          # Admin auth check
│   │       └── support/
│   │           └── page.tsx        # Support ticket queue
│   └── api/
│       ├── trpc/[trpc]/route.ts
│       ├── chat/route.ts           # Vercel AI SDK chat endpoint
│       ├── uploadthing/route.ts    # File upload endpoint
│       └── webhooks/
│           ├── shopify/route.ts    # Order webhooks
│           └── resend/route.ts     # Inbound email parsing
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── storefront.ts       # Products, collections
│   │   │   ├── cart.ts             # Cart with personalization
│   │   │   ├── uploads.ts          # File upload handling
│   │   │   ├── contacts.ts         # CRM
│   │   │   ├── campaigns.ts        # Email campaigns
│   │   │   ├── discounts.ts        # Discount rules
│   │   │   ├── chat.ts             # Conversation history, tickets
│   │   │   └── support.ts          # Admin support queue operations
│   │   ├── root.ts
│   │   └── trpc.ts
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema
│   │   └── index.ts                # DB client
│   └── shopify/
│       ├── client.ts               # GraphQL client
│       ├── queries.ts              # Product/collection queries
│       ├── mutations.ts            # Cart mutations
│       └── types.ts                # Generated types
├── lib/
│   ├── geo.ts                      # Country/currency/VAT maps
│   ├── uploadthing.ts              # Upload config
│   └── i18n.ts                     # Locale utilities
├── contexts/
│   ├── LocaleContext.tsx
│   ├── CartContext.tsx
│   └── WizardContext.tsx            # Wizard state (selections, uploaded image)
├── components/
│   ├── wizard/                      # Product customization wizard
│   │   ├── WizardContainer.tsx     # Main wizard state management
│   │   ├── WizardProgress.tsx      # Step indicator dots
│   │   ├── StepCostume.tsx         # Step 1: Costume selection
│   │   ├── StepSizeFrame.tsx       # Step 2: Size & frame with live pricing
│   │   ├── StepPhotoUpload.tsx     # Step 3: Photo upload with guidelines
│   │   ├── StepReview.tsx          # Step 4: Review & add to cart
│   │   └── PriceCalculator.tsx     # Live price calculation component
│   ├── cart/
│   │   ├── CartPage.tsx            # Full cart page
│   │   ├── CartDrawer.tsx          # Slide-out cart
│   │   ├── CartLineItem.tsx        # Individual cart item
│   │   └── SkipTheLineUpsell.tsx   # Priority processing upsell
│   ├── product/
│   │   ├── ProductCard.tsx         # Product listing card
│   │   └── PriceDisplay.tsx        # Formatted price with currency
│   ├── chat/
│   │   ├── ChatWidget.tsx          # Floating chat button + window
│   │   ├── ChatMessages.tsx        # Message thread display
│   │   ├── ChatInput.tsx           # Message input with send
│   │   └── QuickReplies.tsx        # Suggested question buttons
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── CurrencySelector.tsx
│       └── LanguageSelector.tsx
├── middleware.ts                    # Locale detection/redirect
└── env.ts                          # Environment validation
```

---

## Implementation Phases

### Phase 1: Storefront MVP
1. T3 scaffold with Drizzle + Turso
2. Shopify GraphQL client setup
3. Product and collection pages
4. Guided wizard for product customization
5. Cart functionality with image upload
6. Checkout redirect to Shopify
7. Locale system (middleware, context, @inContext)
8. General Translation setup
9. UploadThing for personalization

### Phase 2: CRM Foundation
1. Contact database schema (with Klaviyo migration path)
2. Signup forms (newsletter, footer, popups)
3. Shopify customer webhook sync
4. Basic campaign sending with Resend
5. Segment builder

### Phase 3: Customer Support Chatbot
1. Vercel AI SDK integration
2. Chat widget component
3. Conversation storage (DB schema)
4. System prompt with store knowledge
5. `requestHumanAgent` tool call
6. Admin support queue UI
7. Email notifications (Resend) for async replies

### Phase 4: Discount System
1. Discount rule sync from Shopify Admin API
2. Store rules in local DB
3. Pre-cart discount display (badges, strikethrough prices)
4. Promotional banners and countdown timers

### Phase 5: Automation Flows (Backlog)
1. Inngest/Trigger.dev setup
2. Welcome flow
3. Post-purchase flow
4. Abandoned cart flow

### Phase 6: Bundle Builder (Backlog)
1. Bundle configuration UI
2. Dynamic pricing calculation
3. Cart integration
4. See `docs/features/` for detailed specs

---

## API Integration

### Shopify Storefront API

**Endpoint**: `https://lavistique.myshopify.com/api/2024-10/graphql.json`

**Headers**:
```
X-Shopify-Storefront-Access-Token: <public-token>
```

**Key Operations**:
- `products` / `product` - Fetch catalog
- `collections` / `collection` - Fetch collections
- `cartCreate` / `cartLinesAdd` / `cartLinesUpdate` - Cart management
- `checkoutCreate` - Redirect to Shopify checkout

### Shopify Admin API (Server-side only)

**Endpoint**: `https://lavistique.myshopify.com/admin/api/2024-10/graphql.json`

**Headers**:
```
X-Shopify-Access-Token: <admin-token>
```

**Key Operations**:
- `discountNodes` - Fetch discount rules for sync
- Webhooks: `orders/create`, `customers/create`, `checkouts/update`

### Resend API

**Endpoint**: `https://api.resend.com`

**Key Operations**:
- `POST /emails` - Send email
- Webhooks: `delivered`, `opened`, `clicked`, `bounced`

---

## Database Schema

### Core Tables (Phase 1)

```sql
-- User locale preferences (for returning visitors)
userPreferences
├── id
├── visitorId (cookie-based)
├── country
├── language
├── currency
├── createdAt
├── updatedAt
```

### CRM Tables (Phase 2)

```sql
contacts
├── id
├── email (unique)
├── firstName
├── lastName
├── phone
├── shopifyCustomerId
├── source (signup_form, checkout, import)
├── status (subscribed, unsubscribed, bounced)
├── consentedAt
├── metadata (JSONB)
├── createdAt
├── updatedAt

lists
├── id
├── name
├── description

contactLists
├── contactId
├── listId
├── subscribedAt

tags
├── id
├── name

contactTags
├── contactId
├── tagId

campaigns
├── id
├── name
├── subject
├── previewText
├── templateId
├── status (draft, scheduled, sending, sent)
├── scheduledAt
├── sentAt

emailEvents
├── id
├── contactId
├── campaignId
├── type (sent, delivered, opened, clicked, bounced)
├── metadata
├── timestamp
```

### Automation Tables (Phase 3)

```sql
automationFlows
├── id
├── name
├── trigger
├── status (active, paused, draft)

flowSteps
├── id
├── flowId
├── type (email, delay, condition)
├── config (JSONB)
├── position

flowRuns
├── id
├── flowId
├── contactId
├── status
├── currentStep
├── context (JSONB)
├── startedAt
├── completedAt
```

### Discount Tables (Phase 4)

```sql
discountRules
├── id
├── shopifyDiscountId
├── title
├── type (percentage, fixed_amount)
├── value
├── appliesTo (all, collection, product)
├── targetIds (array)
├── startsAt
├── endsAt
├── syncedAt

bundles
├── id
├── name
├── discountPercentage

bundleProducts
├── bundleId
├── productId
├── required
```

---

## Environment Variables

```env
# App
NEXT_PUBLIC_SITE_URL=https://lavistique.nl

# Shopify
SHOPIFY_STORE_DOMAIN=lavistique.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxx
SHOPIFY_ADMIN_ACCESS_TOKEN=xxx
SHOPIFY_WEBHOOK_SECRET=xxx

# Database (Turso)
DATABASE_URL=libsql://xxx.turso.io
DATABASE_AUTH_TOKEN=xxx

# Email (Resend)
RESEND_API_KEY=xxx
RESEND_WEBHOOK_SECRET=xxx

# File Upload (UploadThing)
UPLOADTHING_SECRET=xxx
UPLOADTHING_APP_ID=xxx

# Background Jobs (Inngest)
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx

# Translation (General Translation)
GT_API_KEY=xxx
```

---

## Open Questions

- [ ] Shopify plan level - do we have access to all Storefront API features?
- [ ] Existing product translations in Shopify - are they set up via Markets?
- [ ] Image upload requirements - max file size, accepted formats?
- [ ] Email sending volume estimates for Resend pricing tier?

---

## Resources

- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Shopify International Pricing](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/international-pricing)
- [General Translation Docs](https://generaltranslation.com/en-US/docs/platform)
- [Resend Documentation](https://resend.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Turso Database](https://turso.tech/)
- [UploadThing](https://uploadthing.com/)
- [Inngest](https://inngest.com/)
