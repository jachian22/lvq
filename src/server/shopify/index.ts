/**
 * Shopify Storefront API module exports
 */

// Client utilities
export {
  createStorefrontClient,
  storefrontQuery,
  storefrontMutation,
  defaultLocale,
  languageMap,
  countryCurrencyMap,
  withContext,
  parseShopifyId,
  createShopifyId,
  formatMoney,
  formatPriceForLocale,
} from "./client";

// GraphQL queries
export {
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCT_BY_ID,
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  GET_CART,
  SEARCH_PRODUCTS,
} from "./queries";

// GraphQL mutations
export {
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
  UPDATE_CART_DISCOUNT_CODES,
  UPDATE_CART_BUYER_IDENTITY,
  UPDATE_CART_NOTE,
  UPDATE_CART_ATTRIBUTES,
} from "./mutations";

// Types
export type {
  Money,
  Image,
  SEO,
  PageInfo,
  Connection,
  Product,
  ProductSummary,
  ProductVariant,
  ProductOption,
  Collection,
  CollectionSummary,
  Cart,
  CartLine,
  CartLineAttribute,
  CartDiscount,
  CartLineInput,
  CartLineUpdateInput,
  CartBuyerIdentityInput,
  CartInput,
  CountryCode,
  LanguageCode,
  CurrencyCode,
  LocaleContext,
  ShopifyUserError,
  ProductsResponse,
  ProductResponse,
  CollectionsResponse,
  CollectionResponse,
  CartResponse,
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
  CartDiscountCodesUpdateResponse,
  CartBuyerIdentityUpdateResponse,
} from "./types";
