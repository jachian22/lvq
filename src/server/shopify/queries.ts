/**
 * Shopify Storefront API GraphQL queries
 * Note: @inContext directive is added dynamically by the client
 */

// =============================================================================
// FRAGMENTS
// =============================================================================

export const MONEY_FRAGMENT = `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

// Note: This fragment uses MoneyFragment and ImageFragment, which must be included by the parent query
// quantityAvailable removed - requires unauthenticated_read_product_inventory scope
export const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFragment on ProductVariant {
    id
    title
    availableForSale
    price {
      ...MoneyFragment
    }
    compareAtPrice {
      ...MoneyFragment
    }
    selectedOptions {
      name
      value
    }
    image {
      ...ImageFragment
    }
    sku
  }
`;

// =============================================================================
// PRODUCT QUERIES
// =============================================================================

/**
 * Get a list of products (for collection pages, homepage)
 */
export const GET_PRODUCTS = `
  query GetProducts($first: Int = 20, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          handle
          title
          availableForSale
          featuredImage {
            ...ImageFragment
          }
          priceRange {
            minVariantPrice {
              ...MoneyFragment
            }
            maxVariantPrice {
              ...MoneyFragment
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              ...MoneyFragment
            }
            maxVariantPrice {
              ...MoneyFragment
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

/**
 * Get a single product by handle (for product detail pages)
 */
export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      featuredImage {
        ...ImageFragment
      }
      images(first: 10) {
        edges {
          node {
            ...ImageFragment
          }
        }
      }
      options {
        id
        name
        values
      }
      priceRange {
        minVariantPrice {
          ...MoneyFragment
        }
        maxVariantPrice {
          ...MoneyFragment
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          ...MoneyFragment
        }
        maxVariantPrice {
          ...MoneyFragment
        }
      }
      variants(first: 100) {
        edges {
          node {
            ...ProductVariantFragment
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
      seo {
        title
        description
      }
      tags
      vendor
      productType
      createdAt
      updatedAt
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;

/**
 * Get a single product by ID
 */
export const GET_PRODUCT_BY_ID = `
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      featuredImage {
        ...ImageFragment
      }
      images(first: 10) {
        edges {
          node {
            ...ImageFragment
          }
        }
      }
      options {
        id
        name
        values
      }
      priceRange {
        minVariantPrice {
          ...MoneyFragment
        }
        maxVariantPrice {
          ...MoneyFragment
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          ...MoneyFragment
        }
        maxVariantPrice {
          ...MoneyFragment
        }
      }
      variants(first: 100) {
        edges {
          node {
            ...ProductVariantFragment
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
      seo {
        title
        description
      }
      tags
      vendor
      productType
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;

// =============================================================================
// COLLECTION QUERIES
// =============================================================================

/**
 * Get all collections (for navigation, sitemap)
 */
export const GET_COLLECTIONS = `
  query GetCollections($first: Int = 20) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          image {
            ...ImageFragment
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

/**
 * Get a single collection with its products
 */
export const GET_COLLECTION_BY_HANDLE = `
  query GetCollectionByHandle($handle: String!, $first: Int = 20, $after: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image {
        ...ImageFragment
      }
      products(first: $first, after: $after) {
        edges {
          node {
            id
            handle
            title
            availableForSale
            featuredImage {
              ...ImageFragment
            }
            priceRange {
              minVariantPrice {
                ...MoneyFragment
              }
              maxVariantPrice {
                ...MoneyFragment
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                ...MoneyFragment
              }
              maxVariantPrice {
                ...MoneyFragment
              }
            }
            collections(first: 10) {
              edges {
                node {
                  id
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
      seo {
        title
        description
      }
      updatedAt
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

// =============================================================================
// CART QUERIES
// =============================================================================

/**
 * Cart fragment for reuse
 */
export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                id
                handle
                title
                featuredImage {
                  ...ImageFragment
                }
              }
              price {
                ...MoneyFragment
              }
              compareAtPrice {
                ...MoneyFragment
              }
              selectedOptions {
                name
                value
              }
              image {
                ...ImageFragment
              }
            }
          }
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              ...MoneyFragment
            }
            compareAtAmountPerQuantity {
              ...MoneyFragment
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    discountCodes {
      code
      applicable
    }
    discountAllocations {
      discountedAmount {
        ...MoneyFragment
      }
      ... on CartAutomaticDiscountAllocation {
        title
      }
      ... on CartCodeDiscountAllocation {
        code
      }
    }
    buyerIdentity {
      email
      countryCode
    }
    attributes {
      key
      value
    }
    note
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

/**
 * Get cart by ID
 */
export const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
  ${CART_FRAGMENT}
`;

// =============================================================================
// SEARCH QUERIES
// =============================================================================

/**
 * Search products
 */
export const SEARCH_PRODUCTS = `
  query SearchProducts($query: String!, $first: Int = 20, $after: String) {
    search(query: $query, first: $first, after: $after, types: [PRODUCT]) {
      edges {
        node {
          ... on Product {
            id
            handle
            title
            availableForSale
            featuredImage {
              ...ImageFragment
            }
            priceRange {
              minVariantPrice {
                ...MoneyFragment
              }
              maxVariantPrice {
                ...MoneyFragment
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                ...MoneyFragment
              }
              maxVariantPrice {
                ...MoneyFragment
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;
