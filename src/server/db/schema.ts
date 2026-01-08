import { sql, relations } from "drizzle-orm";
import { index, sqliteTableCreator, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

/**
 * Multi-project schema prefix for Drizzle ORM
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `lavistique_${name}`);

// =============================================================================
// PHASE 1: Storefront Foundation
// =============================================================================

/**
 * User preferences for locale, currency, and country
 * Stored in cookie and synced to DB for returning visitors
 */
export const userPreferences = createTable(
  "user_preference",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    visitorId: d.text().notNull().unique(), // Cookie-based identifier
    country: d.text().default("NL"), // ISO country code
    language: d.text().default("nl"), // ISO language code
    currency: d.text().default("EUR"), // ISO currency code
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("visitor_idx").on(t.visitorId)]
);

// =============================================================================
// PHASE 2: Marketing Foundation (CRM)
// =============================================================================

/**
 * Contacts - email subscribers and customers
 */
export const contacts = createTable(
  "contact",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: d.text().notNull().unique(),
    firstName: d.text(),
    lastName: d.text(),
    phone: d.text(),
    shopifyCustomerId: d.text(), // Synced from Shopify webhook
    source: d.text().default("signup_form"), // signup_form, checkout, import, preview_generator
    status: d.text().default("subscribed"), // subscribed, unsubscribed, bounced, cleaned
    consentedAt: d.integer({ mode: "timestamp" }), // When they opted in
    metadata: d.text({ mode: "json" }), // Flexible extra data
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("contact_email_idx").on(t.email),
    index("contact_shopify_idx").on(t.shopifyCustomerId),
    index("contact_status_idx").on(t.status),
  ]
);

/**
 * Mailing lists for organizing contacts
 */
export const lists = createTable("list", (d) => ({
  id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: d.text().notNull(),
  description: d.text(),
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
}));

/**
 * Contact-List many-to-many relationship
 */
export const contactLists = createTable(
  "contact_list",
  (d) => ({
    contactId: d.text().notNull().references(() => contacts.id, { onDelete: "cascade" }),
    listId: d.text().notNull().references(() => lists.id, { onDelete: "cascade" }),
    subscribedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.contactId, t.listId] })]
);

/**
 * Tags for flexible contact categorization
 */
export const tags = createTable("tag", (d) => ({
  id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: d.text().notNull().unique(),
  color: d.text().default("#6366f1"), // For UI display
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
}));

/**
 * Contact-Tag many-to-many relationship
 */
export const contactTags = createTable(
  "contact_tag",
  (d) => ({
    contactId: d.text().notNull().references(() => contacts.id, { onDelete: "cascade" }),
    tagId: d.text().notNull().references(() => tags.id, { onDelete: "cascade" }),
    addedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.contactId, t.tagId] })]
);

/**
 * Email campaigns
 */
export const campaigns = createTable(
  "campaign",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: d.text().notNull(),
    subject: d.text().notNull(),
    previewText: d.text(),
    fromName: d.text().default("La Vistique"),
    fromEmail: d.text().default("hello@lavistique.nl"),
    htmlContent: d.text(), // Rendered React Email template
    status: d.text().default("draft"), // draft, scheduled, sending, sent, cancelled
    listId: d.text().references(() => lists.id), // Target list
    scheduledAt: d.integer({ mode: "timestamp" }),
    sentAt: d.integer({ mode: "timestamp" }),
    totalSent: d.integer().default(0),
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("campaign_status_idx").on(t.status)]
);

/**
 * Email events for tracking delivery, opens, clicks
 */
export const emailEvents = createTable(
  "email_event",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    contactId: d.text().references(() => contacts.id, { onDelete: "cascade" }),
    campaignId: d.text().references(() => campaigns.id, { onDelete: "cascade" }),
    resendEmailId: d.text(), // Resend's email ID for tracking
    type: d.text().notNull(), // sent, delivered, opened, clicked, bounced, complained
    metadata: d.text({ mode: "json" }), // Link URL for clicks, etc.
    timestamp: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  }),
  (t) => [
    index("email_event_contact_idx").on(t.contactId),
    index("email_event_campaign_idx").on(t.campaignId),
    index("email_event_type_idx").on(t.type),
  ]
);

// =============================================================================
// PHASE 3: Customer Support Chatbot
// =============================================================================

/**
 * Chat conversations - persistent across sessions
 */
export const conversations = createTable(
  "conversation",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    visitorId: d.text().notNull(), // Cookie-based identifier
    contactId: d.text().references(() => contacts.id), // Linked if email provided
    email: d.text(), // Captured during chat
    status: d.text().default("active"), // active, resolved, archived
    needsHumanReview: d.integer({ mode: "boolean" }).default(false), // Flagged for human review
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("conversation_visitor_idx").on(t.visitorId),
    index("conversation_contact_idx").on(t.contactId),
    index("conversation_status_idx").on(t.status),
  ]
);

/**
 * Chat messages - from AI, customer, or staff
 */
export const messages = createTable(
  "message",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: d.text().notNull().references(() => conversations.id, { onDelete: "cascade" }),
    role: d.text().notNull(), // user, assistant, system, staff
    content: d.text().notNull(),
    metadata: d.text({ mode: "json" }), // Tool calls, attachments, etc.
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  }),
  (t) => [index("message_conversation_idx").on(t.conversationId)]
);

/**
 * Support tickets - created when customer requests human help
 */
export const supportTickets = createTable(
  "support_ticket",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: d.text().notNull().references(() => conversations.id, { onDelete: "cascade" }),
    customerEmail: d.text().notNull(),
    subject: d.text().notNull().default("Support Request"), // Ticket subject line
    reason: d.text(), // Brief summary from AI
    status: d.text().default("pending"), // pending, in_progress, resolved, closed
    priority: d.text().default("normal"), // low, normal, high, urgent
    assignedTo: d.text(), // Staff member name/email
    internalNotes: d.text(), // Staff-only notes
    resolvedAt: d.integer({ mode: "timestamp" }),
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("ticket_status_idx").on(t.status),
    index("ticket_conversation_idx").on(t.conversationId),
    index("ticket_email_idx").on(t.customerEmail),
  ]
);

// =============================================================================
// PHASE 4: Discount System (partial - for display)
// =============================================================================

/**
 * Discount rules synced from Shopify Admin API
 * Used for pre-cart price display
 */
export const discountRules = createTable(
  "discount_rule",
  (d) => ({
    id: d.text().primaryKey().$defaultFn(() => crypto.randomUUID()),
    shopifyDiscountId: d.text().unique(), // Shopify's discount ID
    code: d.text().notNull(), // The promo code (e.g., "SUMMER20")
    title: d.text().notNull(), // Display name
    type: d.text().notNull(), // percentage, fixed_amount
    value: d.integer().notNull(), // Discount value (percentage or cents)
    appliesTo: d.text().default("all"), // all, collection, product
    targetIds: d.text({ mode: "json" }), // Array of collection/product IDs
    targetName: d.text(), // Display name for targeted discounts (e.g., "Royal Portraits")
    minimumPurchase: d.integer(), // Minimum order value in cents
    usageLimit: d.integer(), // Total uses allowed
    usageCount: d.integer().default(0), // Current usage
    startsAt: d.integer({ mode: "timestamp" }),
    endsAt: d.integer({ mode: "timestamp" }),
    isActive: d.integer({ mode: "boolean" }).default(true),
    syncedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  }),
  (t) => [
    index("discount_code_idx").on(t.code),
    index("discount_active_idx").on(t.isActive),
    index("discount_shopify_idx").on(t.shopifyDiscountId),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const contactsRelations = relations(contacts, ({ many }) => ({
  lists: many(contactLists),
  tags: many(contactTags),
  conversations: many(conversations),
  emailEvents: many(emailEvents),
}));

export const listsRelations = relations(lists, ({ many }) => ({
  contacts: many(contactLists),
  campaigns: many(campaigns),
}));

export const contactListsRelations = relations(contactLists, ({ one }) => ({
  contact: one(contacts, { fields: [contactLists.contactId], references: [contacts.id] }),
  list: one(lists, { fields: [contactLists.listId], references: [lists.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  contacts: many(contactTags),
}));

export const contactTagsRelations = relations(contactTags, ({ one }) => ({
  contact: one(contacts, { fields: [contactTags.contactId], references: [contacts.id] }),
  tag: one(tags, { fields: [contactTags.tagId], references: [tags.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  list: one(lists, { fields: [campaigns.listId], references: [lists.id] }),
  emailEvents: many(emailEvents),
}));

export const emailEventsRelations = relations(emailEvents, ({ one }) => ({
  contact: one(contacts, { fields: [emailEvents.contactId], references: [contacts.id] }),
  campaign: one(campaigns, { fields: [emailEvents.campaignId], references: [campaigns.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  contact: one(contacts, { fields: [conversations.contactId], references: [contacts.id] }),
  messages: many(messages),
  tickets: many(supportTickets),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  conversation: one(conversations, { fields: [supportTickets.conversationId], references: [conversations.id] }),
}));
