import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // Database (Turso)
    TURSO_DATABASE_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().optional(),

    // Node environment
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Shopify Admin API (for webhooks and discount sync)
    SHOPIFY_ADMIN_API_TOKEN: z.string().optional(),
    SHOPIFY_WEBHOOK_SECRET: z.string().optional(),

    // OpenRouter (for Kimi-K2 chatbot)
    OPENROUTER_API_KEY: z.string().optional(),

    // Resend (email)
    RESEND_API_KEY: z.string().optional(),
    RESEND_WEBHOOK_SECRET: z.string().optional(),

    // UploadThing
    UPLOADTHING_TOKEN: z.string().optional(),

    // Inngest (background jobs)
    INNGEST_EVENT_KEY: z.string().optional(),
    INNGEST_SIGNING_KEY: z.string().optional(),

    // Admin authentication
    ADMIN_PASSWORD: z.string().optional(),

    // Site URL for absolute URLs in emails
    SITE_URL: z.string().url().optional(),
  },

  /**
   * Client-side environment variables schema
   * Prefix with NEXT_PUBLIC_ to expose to client
   */
  client: {
    // Shopify Storefront API (public)
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: z.string().min(1),

    // General Translation (i18n)
    NEXT_PUBLIC_GT_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_GT_DEV_API_KEY: z.string().optional(),

    // Site URL for client-side use
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  },

  /**
   * Runtime environment variables
   * Must be destructured manually for edge runtime compatibility
   */
  runtimeEnv: {
    // Server
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    SHOPIFY_ADMIN_API_TOKEN: process.env.SHOPIFY_ADMIN_API_TOKEN,
    SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SITE_URL: process.env.SITE_URL,

    // Client
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
    NEXT_PUBLIC_GT_PROJECT_ID: process.env.NEXT_PUBLIC_GT_PROJECT_ID,
    NEXT_PUBLIC_GT_DEV_API_KEY: process.env.NEXT_PUBLIC_GT_DEV_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  /**
   * Skip validation during Docker builds
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined
   */
  emptyStringAsUndefined: true,
});
