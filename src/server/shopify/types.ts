/**
 * TypeScript types for Shopify Storefront API responses
 * Based on Shopify Storefront API 2024-10
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface SEO {
  title: string | null;
  description: string | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: PageInfo;
}

// =============================================================================
// PRODUCT TYPES
// =============================================================================

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image: Image | null;
  sku: string | null;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  images: Connection<Image>;
  options: ProductOption[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  collections: Connection<{ id: string; handle: string; title: string }>;
  seo: SEO;
  tags: string[];
  vendor: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  collections: Connection<{ id: string }>;
}

// =============================================================================
// COLLECTION TYPES
// =============================================================================

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  products: Connection<ProductSummary>;
  seo: SEO;
  updatedAt: string;
}

export interface CollectionSummary {
  id: string;
  handle: string;
  title: string;
  image: Image | null;
}

// =============================================================================
// CART TYPES
// =============================================================================

export interface CartLineAttribute {
  key: string;
  value: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Image | null;
    };
    price: Money;
    compareAtPrice: Money | null;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    image: Image | null;
  };
  attributes: CartLineAttribute[];
  cost: {
    totalAmount: Money;
    compareAtAmountPerQuantity: Money | null;
  };
}

export interface CartDiscount {
  discountedAmount: Money;
  title: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: Connection<CartLine>;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  discountCodes: Array<{
    code: string;
    applicable: boolean;
  }>;
  discountAllocations: CartDiscount[];
  buyerIdentity: {
    email: string | null;
    countryCode: string | null;
  };
  attributes: CartLineAttribute[];
  note: string | null;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: CartLineAttribute[];
}

export interface CartLineUpdateInput {
  id: string;
  quantity?: number;
  merchandiseId?: string;
  attributes?: CartLineAttribute[];
}

export interface CartBuyerIdentityInput {
  email?: string;
  countryCode?: string;
}

export interface CartInput {
  lines?: CartLineInput[];
  discountCodes?: string[];
  attributes?: CartLineAttribute[];
  note?: string;
  buyerIdentity?: CartBuyerIdentityInput;
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export type CountryCode =
  | "NL" | "DE" | "FR" | "BE" | "GB" | "US"
  | "AT" | "IT" | "ES" | "PT" | "IE" | "LU";

export type LanguageCode = "NL" | "EN" | "DE" | "FR";

export type CurrencyCode = "EUR" | "GBP" | "USD";

export interface LocaleContext {
  country: CountryCode;
  language: LanguageCode;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ShopifyUserError {
  field: string[];
  message: string;
  code?: string;
}

export interface ProductsResponse {
  products: Connection<ProductSummary>;
}

export interface ProductResponse {
  product: Product | null;
}

export interface CollectionsResponse {
  collections: Connection<CollectionSummary>;
}

export interface CollectionResponse {
  collection: Collection | null;
}

export interface CartResponse {
  cart: Cart | null;
}

export interface CartCreateResponse {
  cartCreate: {
    cart: Cart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: Cart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: Cart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: Cart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartDiscountCodesUpdateResponse {
  cartDiscountCodesUpdate: {
    cart: Cart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartBuyerIdentityUpdateResponse {
  cartBuyerIdentityUpdate: {
    cart: Cart | null;
    userErrors: ShopifyUserError[];
  };
}

// Type alias for backward compatibility
export type ShopifyProduct = Product;
