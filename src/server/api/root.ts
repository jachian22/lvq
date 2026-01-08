import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { storefrontRouter } from "~/server/api/routers/storefront";
import { cartRouter } from "~/server/api/routers/cart";
import { contactsRouter } from "~/server/api/routers/contacts";
import { discountsRouter } from "~/server/api/routers/discounts";
import { chatRouter } from "~/server/api/routers/chat";
import { supportRouter } from "~/server/api/routers/support";

/**
 * Primary router for the API
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Phase 1: Storefront
  storefront: storefrontRouter,
  cart: cartRouter,

  // Phase 2: CRM
  contacts: contactsRouter,

  // Phase 3: Chat & Support
  chat: chatRouter,
  support: supportRouter,

  // Phase 4: Discounts
  discounts: discountsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.storefront.getProducts();
 */
export const createCaller = createCallerFactory(appRouter);
