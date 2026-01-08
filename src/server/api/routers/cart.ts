import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  storefrontQuery,
  storefrontMutation,
  GET_CART,
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
  UPDATE_CART_DISCOUNT_CODES,
  UPDATE_CART_BUYER_IDENTITY,
  type CartResponse,
  type CartCreateResponse,
  type CartLinesAddResponse,
  type CartLinesUpdateResponse,
  type CartLinesRemoveResponse,
  type CartDiscountCodesUpdateResponse,
  type CartBuyerIdentityUpdateResponse,
  type LocaleContext,
  type Cart,
} from "~/server/shopify";

/**
 * Locale schema for API inputs
 */
const localeSchema = z.object({
  country: z.enum(["NL", "DE", "FR", "BE", "GB", "US", "AT", "IT", "ES", "PT", "IE", "LU"]).default("NL"),
  language: z.enum(["NL", "EN", "DE", "FR"]).default("NL"),
});

/**
 * Cart line attribute schema
 */
const attributeSchema = z.object({
  key: z.string(),
  value: z.string(),
});

/**
 * Cart line input schema
 */
const cartLineInputSchema = z.object({
  merchandiseId: z.string(),
  quantity: z.number().min(1),
  attributes: z.array(attributeSchema).optional(),
});

/**
 * Transform cart response for easier client consumption
 */
function transformCart(cart: Cart) {
  return {
    ...cart,
    lines: cart.lines.edges.map((e) => e.node),
  };
}

/**
 * Cart router - Shopping cart operations via Shopify Storefront API
 */
export const cartRouter = createTRPCRouter({
  /**
   * Get cart by ID
   */
  get: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const response = await storefrontQuery<CartResponse>(
        GET_CART,
        { cartId: input.cartId },
        locale
      );

      if (!response.cart) {
        return null;
      }

      return transformCart(response.cart);
    }),

  /**
   * Create a new cart
   */
  create: publicProcedure
    .input(
      z.object({
        lines: z.array(cartLineInputSchema).optional(),
        discountCodes: z.array(z.string()).optional(),
        attributes: z.array(attributeSchema).optional(),
        note: z.string().optional(),
        buyerIdentity: z
          .object({
            email: z.string().email().optional(),
            countryCode: z.string().optional(),
          })
          .optional(),
        locale: localeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const cartInput = {
        lines: input.lines,
        discountCodes: input.discountCodes,
        attributes: input.attributes,
        note: input.note,
        buyerIdentity: input.buyerIdentity,
      };

      const response = await storefrontMutation<CartCreateResponse>(
        CREATE_CART,
        { input: cartInput },
        locale
      );

      if (response.cartCreate.userErrors.length > 0) {
        throw new Error(response.cartCreate.userErrors[0]?.message ?? "Unknown error");
      }

      if (!response.cartCreate.cart) {
        throw new Error("Failed to create cart");
      }

      return transformCart(response.cartCreate.cart);
    }),

  /**
   * Add lines to cart
   */
  addLines: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        lines: z.array(cartLineInputSchema),
        locale: localeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const response = await storefrontMutation<CartLinesAddResponse>(
        ADD_CART_LINES,
        { cartId: input.cartId, lines: input.lines },
        locale
      );

      if (response.cartLinesAdd.userErrors.length > 0) {
        throw new Error(response.cartLinesAdd.userErrors[0]?.message ?? "Unknown error");
      }

      if (!response.cartLinesAdd.cart) {
        throw new Error("Failed to add lines to cart");
      }

      return transformCart(response.cartLinesAdd.cart);
    }),

  /**
   * Update cart lines (quantity, attributes)
   */
  updateLines: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        lines: z.array(
          z.object({
            id: z.string(),
            quantity: z.number().min(0).optional(),
            merchandiseId: z.string().optional(),
            attributes: z.array(attributeSchema).optional(),
          })
        ),
        locale: localeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const response = await storefrontMutation<CartLinesUpdateResponse>(
        UPDATE_CART_LINES,
        { cartId: input.cartId, lines: input.lines },
        locale
      );

      if (response.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(response.cartLinesUpdate.userErrors[0]?.message ?? "Unknown error");
      }

      if (!response.cartLinesUpdate.cart) {
        throw new Error("Failed to update cart lines");
      }

      return transformCart(response.cartLinesUpdate.cart);
    }),

  /**
   * Remove lines from cart
   */
  removeLines: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        lineIds: z.array(z.string()),
        locale: localeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const response = await storefrontMutation<CartLinesRemoveResponse>(
        REMOVE_CART_LINES,
        { cartId: input.cartId, lineIds: input.lineIds },
        locale
      );

      if (response.cartLinesRemove.userErrors.length > 0) {
        throw new Error(response.cartLinesRemove.userErrors[0]?.message ?? "Unknown error");
      }

      if (!response.cartLinesRemove.cart) {
        throw new Error("Failed to remove cart lines");
      }

      return transformCart(response.cartLinesRemove.cart);
    }),

  /**
   * Apply or update discount codes
   */
  updateDiscountCodes: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        discountCodes: z.array(z.string()),
        locale: localeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const response = await storefrontMutation<CartDiscountCodesUpdateResponse>(
        UPDATE_CART_DISCOUNT_CODES,
        { cartId: input.cartId, discountCodes: input.discountCodes },
        locale
      );

      if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
        throw new Error(response.cartDiscountCodesUpdate.userErrors[0]?.message ?? "Unknown error");
      }

      if (!response.cartDiscountCodesUpdate.cart) {
        throw new Error("Failed to update discount codes");
      }

      return transformCart(response.cartDiscountCodesUpdate.cart);
    }),

  /**
   * Update buyer identity (email, country)
   */
  updateBuyerIdentity: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        buyerIdentity: z.object({
          email: z.string().email().optional(),
          countryCode: z.string().optional(),
        }),
        locale: localeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? { country: "NL", language: "NL" };

      const response = await storefrontMutation<CartBuyerIdentityUpdateResponse>(
        UPDATE_CART_BUYER_IDENTITY,
        { cartId: input.cartId, buyerIdentity: input.buyerIdentity },
        locale
      );

      if (response.cartBuyerIdentityUpdate.userErrors.length > 0) {
        throw new Error(response.cartBuyerIdentityUpdate.userErrors[0]?.message ?? "Unknown error");
      }

      if (!response.cartBuyerIdentityUpdate.cart) {
        throw new Error("Failed to update buyer identity");
      }

      return transformCart(response.cartBuyerIdentityUpdate.cart);
    }),
});
