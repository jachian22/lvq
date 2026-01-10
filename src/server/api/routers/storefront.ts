import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { localeSchema, DEFAULT_LOCALE } from "~/server/api/schemas";
import {
  storefrontQuery,
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  SEARCH_PRODUCTS,
  type ProductsResponse,
  type ProductResponse,
  type CollectionsResponse,
  type CollectionResponse,
  type LocaleContext,
} from "~/server/shopify";

/**
 * Storefront router - Products and Collections from Shopify
 */
export const storefrontRouter = createTRPCRouter({
  /**
   * Get a paginated list of products
   */
  getProducts: publicProcedure
    .input(
      z.object({
        first: z.number().min(1).max(100).default(20),
        after: z.string().optional(),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<ProductsResponse>(
        GET_PRODUCTS,
        { first: input.first, after: input.after },
        locale
      );

      return {
        products: response.products.edges.map((edge) => edge.node),
        pageInfo: response.products.pageInfo,
      };
    }),

  /**
   * Get a single product by handle
   */
  getProductByHandle: publicProcedure
    .input(
      z.object({
        handle: z.string(),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<ProductResponse>(
        GET_PRODUCT_BY_HANDLE,
        { handle: input.handle },
        locale
      );

      if (!response.product) {
        return null;
      }

      // Flatten edges for easier consumption
      return {
        ...response.product,
        images: response.product.images.edges.map((e) => e.node),
        variants: response.product.variants.edges.map((e) => e.node),
        collections: response.product.collections.edges.map((e) => e.node),
      };
    }),

  /**
   * Get all collections
   */
  getCollections: publicProcedure
    .input(
      z.object({
        first: z.number().min(1).max(100).default(20),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<CollectionsResponse>(
        GET_COLLECTIONS,
        { first: input.first },
        locale
      );

      return {
        collections: response.collections.edges.map((edge) => edge.node),
        pageInfo: response.collections.pageInfo,
      };
    }),

  /**
   * Get a single collection by handle with its products
   */
  getCollectionByHandle: publicProcedure
    .input(
      z.object({
        handle: z.string(),
        first: z.number().min(1).max(100).default(20),
        after: z.string().optional(),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<CollectionResponse>(
        GET_COLLECTION_BY_HANDLE,
        { handle: input.handle, first: input.first, after: input.after },
        locale
      );

      if (!response.collection) {
        return null;
      }

      return {
        ...response.collection,
        products: response.collection.products.edges.map((e) => e.node),
        pageInfo: response.collection.products.pageInfo,
      };
    }),

  /**
   * Alias for getProductByHandle (convenience)
   */
  getProduct: publicProcedure
    .input(
      z.object({
        handle: z.string(),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<ProductResponse>(
        GET_PRODUCT_BY_HANDLE,
        { handle: input.handle },
        locale
      );

      if (!response.product) {
        return null;
      }

      return {
        ...response.product,
        images: response.product.images,
        variants: response.product.variants,
        collections: response.product.collections,
      };
    }),

  /**
   * Alias for getCollectionByHandle (convenience)
   */
  getCollection: publicProcedure
    .input(
      z.object({
        handle: z.string(),
        productsFirst: z.number().min(1).max(100).default(24),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<CollectionResponse>(
        GET_COLLECTION_BY_HANDLE,
        { handle: input.handle, first: input.productsFirst },
        locale
      );

      if (!response.collection) {
        return null;
      }

      return response.collection;
    }),

  /**
   * Search products
   */
  searchProducts: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        first: z.number().min(1).max(100).default(20),
        after: z.string().optional(),
        locale: localeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const locale: LocaleContext = input.locale ?? DEFAULT_LOCALE;

      const response = await storefrontQuery<{ search: { edges: Array<{ node: unknown }>; pageInfo: unknown } }>(
        SEARCH_PRODUCTS,
        { query: input.query, first: input.first, after: input.after },
        locale
      );

      return {
        products: response.search.edges.map((edge) => edge.node),
        pageInfo: response.search.pageInfo,
      };
    }),
});
