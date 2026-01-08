import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { conversations, messages, supportTickets, contacts } from "~/server/db/schema";

/**
 * Chat router - Conversation management and AI chat
 */
export const chatRouter = createTRPCRouter({
  /**
   * Get or create a conversation for a visitor
   */
  getOrCreateConversation: publicProcedure
    .input(
      z.object({
        visitorId: z.string(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Look for existing active conversation
      const existing = await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.visitorId, input.visitorId),
          eq(conversations.status, "active")
        ),
        with: {
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 50,
          },
        },
      });

      if (existing) {
        // Update email if provided and not set
        if (input.email && !existing.email) {
          await ctx.db
            .update(conversations)
            .set({ email: input.email })
            .where(eq(conversations.id, existing.id));
        }

        return {
          ...existing,
          messages: existing.messages.reverse(), // Return oldest first
        };
      }

      // Create new conversation
      const [conversation] = await ctx.db
        .insert(conversations)
        .values({
          visitorId: input.visitorId,
          email: input.email,
          status: "active",
        })
        .returning();

      return {
        ...conversation,
        messages: [],
      };
    }),

  /**
   * Get conversation by ID with messages
   */
  getConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
        with: {
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 100,
          },
          tickets: true,
        },
      });

      if (!conversation) {
        return null;
      }

      return {
        ...conversation,
        messages: conversation.messages.reverse(),
      };
    }),

  /**
   * Add a message to a conversation
   * Used for both user messages and AI responses
   */
  addMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        role: z.enum(["user", "assistant", "system", "staff"]),
        content: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [message] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        })
        .returning();

      // Update conversation timestamp
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return message;
    }),

  /**
   * Update conversation email (when customer provides it)
   */
  updateEmail: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update conversation
      await ctx.db
        .update(conversations)
        .set({ email: input.email })
        .where(eq(conversations.id, input.conversationId));

      // Try to link to existing contact
      const contact = await ctx.db.query.contacts.findFirst({
        where: eq(contacts.email, input.email.toLowerCase()),
      });

      if (contact) {
        await ctx.db
          .update(conversations)
          .set({ contactId: contact.id })
          .where(eq(conversations.id, input.conversationId));
      }

      return { success: true };
    }),

  /**
   * Create a support ticket (human handoff)
   */
  createTicket: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        customerEmail: z.string().email(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if ticket already exists for this conversation
      const existing = await ctx.db.query.supportTickets.findFirst({
        where: and(
          eq(supportTickets.conversationId, input.conversationId),
          eq(supportTickets.status, "pending")
        ),
      });

      if (existing) {
        return existing;
      }

      // Create ticket
      const [ticket] = await ctx.db
        .insert(supportTickets)
        .values({
          conversationId: input.conversationId,
          customerEmail: input.customerEmail,
          reason: input.reason,
          status: "pending",
        })
        .returning();

      // Update conversation email if not set
      await ctx.db
        .update(conversations)
        .set({ email: input.customerEmail })
        .where(eq(conversations.id, input.conversationId));

      return ticket;
    }),

  /**
   * Get conversation history for a visitor (by visitor ID)
   */
  getVisitorConversations: publicProcedure
    .input(z.object({ visitorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const convos = await ctx.db.query.conversations.findMany({
        where: eq(conversations.visitorId, input.visitorId),
        orderBy: [desc(conversations.updatedAt)],
        with: {
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 1,
          },
          tickets: true,
        },
      });

      return convos.map((c) => ({
        ...c,
        lastMessage: c.messages[0] ?? null,
        hasOpenTicket: c.tickets.some((t) => t.status === "pending" || t.status === "in_progress"),
      }));
    }),

  /**
   * Close/archive a conversation
   */
  closeConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(conversations)
        .set({ status: "archived" })
        .where(eq(conversations.id, input.conversationId));

      return { success: true };
    }),
});
