import { useState } from "react";
import Head from "next/head";
import { type GetServerSideProps } from "next";
import { api } from "~/utils/api";

interface SupportPageProps {
  locale: string;
}

/**
 * Admin support queue page
 *
 * Shows pending support tickets and allows staff to reply.
 */
export default function SupportPage({ locale }: SupportPageProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch pending tickets
  const ticketsQuery = api.support.getPendingTickets.useQuery({ limit: 50 });

  // Fetch conversation for selected ticket
  const conversationQuery = api.support.getTicketConversation.useQuery(
    { ticketId: selectedTicketId! },
    { enabled: !!selectedTicketId }
  );

  // Mutations
  const replyMutation = api.support.replyToTicket.useMutation();
  const resolveMutation = api.support.resolveTicket.useMutation();

  const handleReply = async () => {
    if (!selectedTicketId || !replyContent.trim()) return;

    setIsSending(true);
    try {
      await replyMutation.mutateAsync({
        ticketId: selectedTicketId,
        content: replyContent.trim(),
      });
      setReplyContent("");
      conversationQuery.refetch();
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicketId) return;

    await resolveMutation.mutateAsync({ ticketId: selectedTicketId });
    setSelectedTicketId(null);
    ticketsQuery.refetch();
  };

  const selectedTicket = ticketsQuery.data?.find((t) => t.id === selectedTicketId);

  return (
    <>
      <Head>
        <title>Support Queue - La Vistique Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Queue</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets list */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">
                  Pending Tickets ({ticketsQuery.data?.length ?? 0})
                </h2>
              </div>

              {ticketsQuery.isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : ticketsQuery.data?.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No pending tickets
                </div>
              ) : (
                <ul className="divide-y max-h-[600px] overflow-y-auto">
                  {ticketsQuery.data?.map((ticket) => (
                    <li key={ticket.id}>
                      <button
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedTicketId === ticket.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {ticket.customerEmail ?? "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {ticket.subject}
                            </p>
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            ticket.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : ticket.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Conversation view */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm flex flex-col min-h-[600px]">
              {!selectedTicketId ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a ticket to view the conversation
                </div>
              ) : (
                <>
                  {/* Ticket header */}
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedTicket?.subject}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedTicket?.customerEmail ?? "Anonymous visitor"}
                      </p>
                    </div>
                    <button
                      onClick={handleResolve}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationQuery.isLoading ? (
                      <div className="text-center text-gray-500">Loading conversation...</div>
                    ) : (
                      conversationQuery.data?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === "user" ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${
                              message.role === "user"
                                ? "bg-gray-100 text-gray-900"
                                : message.role === "assistant"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-green-100 text-green-900"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.role === "user"
                                ? "Customer"
                                : message.role === "assistant"
                                ? "AI Assistant"
                                : "Support Team"}
                            </p>
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                            <p className="text-xs opacity-50 mt-2">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                        className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleReply}
                        disabled={!replyContent.trim() || isSending}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<SupportPageProps> = async (context) => {
  const locale = context.params?.locale as string;

  // TODO: Add password protection
  // const authHeader = context.req.headers.authorization;
  // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
  //   return { redirect: { destination: "/", permanent: false } };
  // }

  return {
    props: {
      locale,
    },
  };
};
