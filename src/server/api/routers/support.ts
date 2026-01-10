import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supportTickets, conversations, messages } from "~/server/db/schema";
import { sendSupportReplyEmail } from "~/lib/resend";

/**
 * Support router - Admin support queue operations
 */
export const supportRouter = createTRPCRouter({
  /**
   * Get pending support tickets (for support queue page)
   */
  getPendingTickets: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const tickets = await ctx.db.query.supportTickets.findMany({
        where: eq(supportTickets.status, "pending"),
        orderBy: [desc(supportTickets.createdAt)],
        limit: input.limit,
      });

      return tickets;
    }),

  /**
   * Get conversation messages for a ticket
   */
  getTicketConversation: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.query.supportTickets.findFirst({
        where: eq(supportTickets.id, input.ticketId),
      });

      if (!ticket) {
        return [];
      }

      const conversationMessages = await ctx.db.query.messages.findMany({
        where: eq(messages.conversationId, ticket.conversationId),
        orderBy: [messages.createdAt],
      });

      return conversationMessages;
    }),

  /**
   * Reply to a ticket (alias for sendReply)
   */
  replyToTicket: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the ticket and conversation
      const ticket = await ctx.db.query.supportTickets.findFirst({
        where: eq(supportTickets.id, input.ticketId),
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Add message to conversation
      const [message] = await ctx.db
        .insert(messages)
        .values({
          conversationId: ticket.conversationId,
          role: "staff",
          content: input.content,
        })
        .returning();

      // Update ticket status
      if (ticket.status === "pending") {
        await ctx.db
          .update(supportTickets)
          .set({ status: "in_progress" })
          .where(eq(supportTickets.id, input.ticketId));
      }

      // Send email notification
      if (ticket.customerEmail) {
        try {
          await sendSupportReplyEmail(
            ticket.customerEmail,
            ticket.subject,
            input.content,
            ticket.conversationId
          );
        } catch (error) {
          console.error("Failed to send support reply email:", error);
        }
      }

      return { success: true, message };
    }),

  /**
   * Resolve a ticket
   */
  resolveTicket: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(supportTickets)
        .set({
          status: "resolved",
          resolvedAt: new Date(),
        })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Get all support tickets (admin)
   */
  listTickets: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "in_progress", "resolved", "closed"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.status) {
        conditions.push(eq(supportTickets.status, input.status));
      }

      const tickets = await ctx.db.query.supportTickets.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(supportTickets.createdAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          conversation: {
            with: {
              messages: {
                orderBy: [desc(messages.createdAt)],
                limit: 1,
              },
            },
          },
        },
      });

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(supportTickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        tickets: tickets.map((t) => ({
          ...t,
          lastMessage: t.conversation.messages[0] ?? null,
        })),
        total: countResult?.count ?? 0,
        hasMore: input.offset + tickets.length < (countResult?.count ?? 0),
      };
    }),

  /**
   * Get pending ticket count (for badge)
   */
  getPendingCount: publicProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(eq(supportTickets.status, "pending"));

    return result?.count ?? 0;
  }),

  /**
   * Get a single ticket with full conversation
   */
  getTicket: publicProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.query.supportTickets.findFirst({
        where: eq(supportTickets.id, input.ticketId),
        with: {
          conversation: {
            with: {
              messages: {
                orderBy: [messages.createdAt],
              },
            },
          },
        },
      });

      return ticket;
    }),

  /**
   * Update ticket status
   */
  updateStatus: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["pending", "in_progress", "resolved", "closed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === "resolved" || input.status === "closed") {
        updates.resolvedAt = new Date();
      }

      await ctx.db
        .update(supportTickets)
        .set(updates)
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Assign ticket to staff member
   */
  assignTicket: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        assignedTo: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(supportTickets)
        .set({
          assignedTo: input.assignedTo,
          status: "in_progress",
        })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Add internal note to ticket
   */
  addInternalNote: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        note: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get existing notes
      const ticket = await ctx.db.query.supportTickets.findFirst({
        where: eq(supportTickets.id, input.ticketId),
      });

      const existingNotes = ticket?.internalNotes ?? "";
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${input.note}`;
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;

      await ctx.db
        .update(supportTickets)
        .set({ internalNotes: updatedNotes })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Send staff reply to customer
   * Adds message to conversation and triggers email notification
   */
  sendReply: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        content: z.string().min(1),
        staffName: z.string().default("Support Team"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the ticket and conversation
      const ticket = await ctx.db.query.supportTickets.findFirst({
        where: eq(supportTickets.id, input.ticketId),
        with: {
          conversation: true,
        },
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Add message to conversation
      const [message] = await ctx.db
        .insert(messages)
        .values({
          conversationId: ticket.conversationId,
          role: "staff",
          content: input.content,
          metadata: JSON.stringify({
            staffName: input.staffName,
            ticketId: input.ticketId,
          }),
        })
        .returning();

      // Update ticket status to in_progress if pending
      if (ticket.status === "pending") {
        await ctx.db
          .update(supportTickets)
          .set({ status: "in_progress" })
          .where(eq(supportTickets.id, input.ticketId));
      }

      // Update conversation timestamp
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, ticket.conversationId));

      // Send email notification to customer
      if (ticket.customerEmail) {
        try {
          await sendSupportReplyEmail(
            ticket.customerEmail,
            ticket.subject,
            input.content,
            ticket.conversationId
          );
        } catch (error) {
          console.error("Failed to send support reply email:", error);
          // Don't fail the mutation if email fails
        }
      }

      return {
        message,
        customerEmail: ticket.customerEmail,
      };
    }),

  /**
   * Set ticket priority
   */
  setPriority: publicProcedure
    .input(
      z.object({
        ticketId: z.string(),
        priority: z.enum(["low", "normal", "high", "urgent"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(supportTickets)
        .set({ priority: input.priority })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Get ticket stats for dashboard
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    // Single query with GROUP BY instead of 4 separate COUNT queries
    const statusCounts = await ctx.db
      .select({
        status: supportTickets.status,
        count: sql<number>`count(*)`,
      })
      .from(supportTickets)
      .groupBy(supportTickets.status);

    // Build stats object from grouped results
    const stats = {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      total: 0,
    };

    for (const row of statusCounts) {
      const count = row.count ?? 0;
      stats.total += count;

      switch (row.status) {
        case "pending":
          stats.pending = count;
          break;
        case "in_progress":
          stats.inProgress = count;
          break;
        case "resolved":
          stats.resolved = count;
          break;
        case "closed":
          stats.closed = count;
          break;
      }
    }

    return stats;
  }),
});
