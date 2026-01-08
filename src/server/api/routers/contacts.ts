import { z } from "zod";
import { eq, like, and, desc, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { contacts, contactLists, contactTags, lists, tags } from "~/server/db/schema";

/**
 * Contacts router - CRM operations
 */
export const contactsRouter = createTRPCRouter({
  /**
   * Subscribe a new contact (newsletter signup)
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        source: z.string().default("signup_form"),
        listId: z.string().optional(), // Optional list to add to
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if contact already exists
      const existing = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.email, input.email.toLowerCase()),
      });

      if (existing) {
        // Update existing contact if unsubscribed
        if (existing.status === "unsubscribed") {
          await ctx.db
            .update(contacts)
            .set({
              status: "subscribed",
              consentedAt: new Date(),
              source: input.source,
            })
            .where(eq(contacts.id, existing.id));
        }

        // Add to list if provided
        if (input.listId) {
          await ctx.db
            .insert(contactLists)
            .values({
              contactId: existing.id,
              listId: input.listId,
            })
            .onConflictDoNothing();
        }

        return { success: true, contactId: existing.id, isNew: false };
      }

      // Create new contact
      const [newContact] = await ctx.db
        .insert(contacts)
        .values({
          email: input.email.toLowerCase(),
          firstName: input.firstName,
          lastName: input.lastName,
          source: input.source,
          status: "subscribed",
          consentedAt: new Date(),
        })
        .returning();

      // Add to list if provided
      if (input.listId && newContact) {
        await ctx.db.insert(contactLists).values({
          contactId: newContact.id,
          listId: input.listId,
        });
      }

      return { success: true, contactId: newContact?.id, isNew: true };
    }),

  /**
   * Unsubscribe a contact
   */
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(contacts)
        .set({ status: "unsubscribed" })
        .where(eq(contacts.email, input.email.toLowerCase()));

      return { success: true };
    }),

  /**
   * Get a contact by email
   */
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.email, input.email.toLowerCase()),
        with: {
          lists: {
            with: {
              list: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      return contact;
    }),

  /**
   * Get a contact by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.id, input.id),
        with: {
          lists: {
            with: {
              list: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      return contact;
    }),

  /**
   * List contacts with pagination and filtering
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["subscribed", "unsubscribed", "bounced", "cleaned"]).optional(),
        search: z.string().optional(),
        listId: z.string().optional(),
        tagId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build where conditions
      const conditions = [];

      if (input.status) {
        conditions.push(eq(contacts.status, input.status));
      }

      if (input.search) {
        conditions.push(
          sql`(${contacts.email} LIKE ${`%${input.search}%`} OR ${contacts.firstName} LIKE ${`%${input.search}%`} OR ${contacts.lastName} LIKE ${`%${input.search}%`})`
        );
      }

      // Get contacts
      const results = await ctx.db.query.contacts.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(contacts.createdAt)],
        with: {
          lists: {
            with: {
              list: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(contacts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        contacts: results,
        total: countResult?.count ?? 0,
        hasMore: input.offset + results.length < (countResult?.count ?? 0),
      };
    }),

  /**
   * Update a contact
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        status: z.enum(["subscribed", "unsubscribed", "bounced", "cleaned"]).optional(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      await ctx.db
        .update(contacts)
        .set({
          ...data,
          metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        })
        .where(eq(contacts.id, id));

      return { success: true };
    }),

  /**
   * Add contact to a list
   */
  addToList: publicProcedure
    .input(
      z.object({
        contactId: z.string(),
        listId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(contactLists)
        .values({
          contactId: input.contactId,
          listId: input.listId,
        })
        .onConflictDoNothing();

      return { success: true };
    }),

  /**
   * Remove contact from a list
   */
  removeFromList: publicProcedure
    .input(
      z.object({
        contactId: z.string(),
        listId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(contactLists)
        .where(
          and(
            eq(contactLists.contactId, input.contactId),
            eq(contactLists.listId, input.listId)
          )
        );

      return { success: true };
    }),

  /**
   * Add tag to contact
   */
  addTag: publicProcedure
    .input(
      z.object({
        contactId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(contactTags)
        .values({
          contactId: input.contactId,
          tagId: input.tagId,
        })
        .onConflictDoNothing();

      return { success: true };
    }),

  /**
   * Remove tag from contact
   */
  removeTag: publicProcedure
    .input(
      z.object({
        contactId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(contactTags)
        .where(
          and(
            eq(contactTags.contactId, input.contactId),
            eq(contactTags.tagId, input.tagId)
          )
        );

      return { success: true };
    }),

  // ==========================================================================
  // LIST MANAGEMENT
  // ==========================================================================

  /**
   * Create a new list
   */
  createList: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [list] = await ctx.db
        .insert(lists)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning();

      return list;
    }),

  /**
   * Get all lists
   */
  getLists: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.lists.findMany({
      orderBy: [desc(lists.createdAt)],
    });
  }),

  // ==========================================================================
  // TAG MANAGEMENT
  // ==========================================================================

  /**
   * Create a new tag
   */
  createTag: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [tag] = await ctx.db
        .insert(tags)
        .values({
          name: input.name,
          color: input.color,
        })
        .returning();

      return tag;
    }),

  /**
   * Get all tags
   */
  getTags: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.tags.findMany({
      orderBy: [desc(tags.createdAt)],
    });
  }),
});
