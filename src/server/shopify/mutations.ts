/**
 * Shopify Storefront API GraphQL mutations
 * Note: @inContext directive is added dynamically by the client
 */

import { CART_FRAGMENT } from "./queries";

// =============================================================================
// CART MUTATIONS
// =============================================================================

/**
 * Create a new cart
 */
export const CREATE_CART = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Add lines to cart
 */
export const ADD_CART_LINES = `
  mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Update cart lines (quantity, attributes)
 */
export const UPDATE_CART_LINES = `
  mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Remove lines from cart
 */
export const REMOVE_CART_LINES = `
  mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Update discount codes on cart
 */
export const UPDATE_CART_DISCOUNT_CODES = `
  mutation UpdateCartDiscountCodes($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Update buyer identity (email, country)
 */
export const UPDATE_CART_BUYER_IDENTITY = `
  mutation UpdateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Update cart note
 */
export const UPDATE_CART_NOTE = `
  mutation UpdateCartNote($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

/**
 * Update cart attributes
 */
export const UPDATE_CART_ATTRIBUTES = `
  mutation UpdateCartAttributes($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;
