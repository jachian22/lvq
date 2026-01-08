import { z } from "zod";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { discountRules } from "~/server/db/schema";

/**
 * Discount rule type for client consumption
 */
export interface DiscountRule {
  id: string;
  code: string;
  title: string;
  type: "percentage" | "fixed_amount";
  value: number;
  appliesTo: "all" | "collection" | "product";
  targetIds: string[] | null;
  targetName: string | null;
  minimumPurchase: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
}

/**
 * Discount calculation result
 */
export interface DiscountResult {
  original: number;
  discounted: number;
  savings: number;
  percentage: number;
  qualifies: boolean;
}

/**
 * Discounts router - Discount rule management and price calculations
 */
export const discountsRouter = createTRPCRouter({
  /**
   * Get a discount rule by code
   * Used to validate and display discount information
   */
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const rule = await ctx.db.query.discountRules.findFirst({
        where: and(
          eq(discountRules.code, input.code.toUpperCase()),
          eq(discountRules.isActive, true)
        ),
      });

      if (!rule) {
        return null;
      }

      // Check date validity
      if (rule.startsAt && rule.startsAt > now) {
        return null; // Not started yet
      }
      if (rule.endsAt && rule.endsAt < now) {
        return null; // Expired
      }

      // Check usage limit
      if (rule.usageLimit && rule.usageCount && rule.usageCount >= rule.usageLimit) {
        return null; // Usage limit reached
      }

      return {
        id: rule.id,
        code: rule.code,
        title: rule.title,
        type: rule.type as "percentage" | "fixed_amount",
        value: rule.value,
        appliesTo: rule.appliesTo as "all" | "collection" | "product",
        targetIds: rule.targetIds as string[] | null,
        targetName: rule.targetName,
        minimumPurchase: rule.minimumPurchase,
        startsAt: rule.startsAt,
        endsAt: rule.endsAt,
        isActive: !!rule.isActive,
      } satisfies DiscountRule;
    }),

  /**
   * Calculate discount for a product
   * Client provides product context, we calculate if discount applies
   */
  calculateDiscount: publicProcedure
    .input(
      z.object({
        code: z.string(),
        price: z.number(), // Price in cents
        productId: z.string(),
        collectionIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }): Promise<DiscountResult> => {
      const now = new Date();

      // Default result (no discount)
      const noDiscount: DiscountResult = {
        original: input.price,
        discounted: input.price,
        savings: 0,
        percentage: 0,
        qualifies: false,
      };

      // Get the discount rule
      const rule = await ctx.db.query.discountRules.findFirst({
        where: and(
          eq(discountRules.code, input.code.toUpperCase()),
          eq(discountRules.isActive, true)
        ),
      });

      if (!rule) {
        return noDiscount;
      }

      // Check date validity
      if (rule.startsAt && rule.startsAt > now) {
        return noDiscount;
      }
      if (rule.endsAt && rule.endsAt < now) {
        return noDiscount;
      }

      // Check if this product qualifies
      const targetIds = rule.targetIds as string[] | null;
      let qualifies = false;

      switch (rule.appliesTo) {
        case "all":
          qualifies = true;
          break;
        case "collection":
          qualifies = targetIds
            ? input.collectionIds.some((id) => targetIds.includes(id))
            : false;
          break;
        case "product":
          qualifies = targetIds ? targetIds.includes(input.productId) : false;
          break;
        default:
          qualifies = false;
      }

      if (!qualifies) {
        return noDiscount;
      }

      // Calculate discount
      let discounted: number;
      let percentage: number;

      if (rule.type === "percentage") {
        percentage = rule.value;
        discounted = Math.round(input.price * (1 - rule.value / 100));
      } else {
        // Fixed amount discount
        discounted = Math.max(0, input.price - rule.value);
        percentage = Math.round(((input.price - discounted) / input.price) * 100);
      }

      return {
        original: input.price,
        discounted,
        savings: input.price - discounted,
        percentage,
        qualifies: true,
      };
    }),

  /**
   * Get all active discount rules (for admin)
   */
  listActive: publicProcedure.query(async ({ ctx }) => {
    const rules = await ctx.db.query.discountRules.findMany({
      where: eq(discountRules.isActive, true),
      orderBy: (rules, { desc }) => [desc(rules.createdAt)],
    });

    return rules.map((rule) => ({
      id: rule.id,
      code: rule.code,
      title: rule.title,
      type: rule.type as "percentage" | "fixed_amount",
      value: rule.value,
      appliesTo: rule.appliesTo as "all" | "collection" | "product",
      targetIds: rule.targetIds as string[] | null,
      targetName: rule.targetName,
      minimumPurchase: rule.minimumPurchase,
      startsAt: rule.startsAt,
      endsAt: rule.endsAt,
      isActive: !!rule.isActive,
      usageCount: rule.usageCount,
      usageLimit: rule.usageLimit,
    }));
  }),

  /**
   * Create a new discount rule (for admin/testing)
   */
  create: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).transform((s) => s.toUpperCase()),
        title: z.string().min(1),
        type: z.enum(["percentage", "fixed_amount"]),
        value: z.number().min(0),
        appliesTo: z.enum(["all", "collection", "product"]).default("all"),
        targetIds: z.array(z.string()).optional(),
        targetName: z.string().optional(),
        minimumPurchase: z.number().optional(),
        usageLimit: z.number().optional(),
        startsAt: z.date().optional(),
        endsAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [rule] = await ctx.db
        .insert(discountRules)
        .values({
          code: input.code,
          title: input.title,
          type: input.type,
          value: input.value,
          appliesTo: input.appliesTo,
          targetIds: input.targetIds ? JSON.stringify(input.targetIds) : null,
          targetName: input.targetName,
          minimumPurchase: input.minimumPurchase,
          usageLimit: input.usageLimit,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          isActive: true,
        })
        .returning();

      return rule;
    }),

  /**
   * Update a discount rule
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        value: z.number().optional(),
        appliesTo: z.enum(["all", "collection", "product"]).optional(),
        targetIds: z.array(z.string()).optional(),
        targetName: z.string().optional(),
        minimumPurchase: z.number().optional(),
        usageLimit: z.number().optional(),
        startsAt: z.date().optional(),
        endsAt: z.date().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, targetIds, ...data } = input;

      await ctx.db
        .update(discountRules)
        .set({
          ...data,
          targetIds: targetIds ? JSON.stringify(targetIds) : undefined,
        })
        .where(eq(discountRules.id, id));

      return { success: true };
    }),

  /**
   * Delete a discount rule
   */
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(discountRules).where(eq(discountRules.id, input.id));
      return { success: true };
    }),
});
