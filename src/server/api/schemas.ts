import { z } from "zod";

/**
 * Shared Zod schemas for API inputs
 */

/**
 * Supported countries for Shopify @inContext directive
 */
export const countrySchema = z.enum([
  "NL", "DE", "FR", "BE", "GB", "US", "AT", "IT", "ES", "PT", "IE", "LU",
]);

/**
 * Supported languages for Shopify @inContext directive
 */
export const languageSchema = z.enum(["NL", "EN", "DE", "FR"]);

/**
 * Locale schema for API inputs
 * Used by cart and storefront routers for Shopify context
 */
export const localeSchema = z.object({
  country: countrySchema.default("NL"),
  language: languageSchema.default("NL"),
});

/**
 * Default locale values
 */
export const DEFAULT_LOCALE = { country: "NL" as const, language: "NL" as const };

/**
 * Type exports
 */
export type Country = z.infer<typeof countrySchema>;
export type Language = z.infer<typeof languageSchema>;
export type LocaleInput = z.infer<typeof localeSchema>;
