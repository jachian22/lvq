import { GraphQLClient } from "graphql-request";
import type { LocaleContext, CountryCode, LanguageCode } from "./types";

/**
 * Shopify Storefront API client with locale context support
 */

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const API_VERSION = "2024-10";

const endpoint = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

/**
 * Create a GraphQL client for Shopify Storefront API
 */
export function createStorefrontClient() {
  return new GraphQLClient(endpoint, {
    headers: {
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Default locale context
 */
export const defaultLocale: LocaleContext = {
  country: "NL",
  language: "NL",
};

/**
 * Map language codes to Shopify language codes
 */
export const languageMap: Record<string, LanguageCode> = {
  nl: "NL",
  en: "EN",
  de: "DE",
  fr: "FR",
};

/**
 * Map country codes to default currencies
 */
export const countryCurrencyMap: Record<CountryCode, string> = {
  NL: "EUR",
  DE: "EUR",
  FR: "EUR",
  BE: "EUR",
  AT: "EUR",
  IT: "EUR",
  ES: "EUR",
  PT: "EUR",
  IE: "EUR",
  LU: "EUR",
  GB: "GBP",
  US: "USD",
};

/**
 * Wrap a query with @inContext directive for localization
 */
export function withContext(query: string, locale: LocaleContext): string {
  // Insert @inContext directive after the operation name
  const contextDirective = `@inContext(country: ${locale.country}, language: ${locale.language})`;

  // Handle both query and mutation
  return query.replace(
    /^(query|mutation)\s+(\w+)/,
    `$1 $2 ${contextDirective}`
  );
}

/**
 * Execute a GraphQL query against Shopify Storefront API
 */
export async function storefrontQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  locale: LocaleContext = defaultLocale
): Promise<T> {
  const client = createStorefrontClient();
  const contextualizedQuery = withContext(query, locale);

  try {
    const response = await client.request<T>(contextualizedQuery, variables);
    return response;
  } catch (error) {
    console.error("Shopify Storefront API error:", error);
    throw error;
  }
}

/**
 * Execute a GraphQL mutation against Shopify Storefront API
 */
export async function storefrontMutation<T>(
  mutation: string,
  variables?: Record<string, unknown>,
  locale: LocaleContext = defaultLocale
): Promise<T> {
  return storefrontQuery<T>(mutation, variables, locale);
}

/**
 * Parse Shopify GID to extract the numeric ID
 * e.g., "gid://shopify/Product/123456" -> "123456"
 */
export function parseShopifyId(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? gid;
}

/**
 * Create a Shopify GID from a numeric ID and resource type
 * e.g., ("Product", "123456") -> "gid://shopify/Product/123456"
 */
export function createShopifyId(resourceType: string, id: string): string {
  return `gid://shopify/${resourceType}/${id}`;
}

/**
 * Format a Shopify Money object to a display string
 */
export function formatMoney(money: { amount: string; currencyCode: string }): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(amount);
}

/**
 * Format price for a specific locale
 */
export function formatPriceForLocale(
  amount: number,
  currencyCode: string,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}
