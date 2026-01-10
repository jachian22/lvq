import { useState, useRef, useEffect } from "react";
import { api } from "~/utils/api";

/**
 * Chat message type
 */
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "staff";
  content: string;
  createdAt: Date;
}

/**
 * ChatWidget component
 *
 * Floating chat button and window for customer support.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC mutations
  const getOrCreateConversation = api.chat.getOrCreateConversation.useMutation();
  const addMessage = api.chat.addMessage.useMutation();

  // Get or create visitor ID
  const getVisitorId = () => {
    if (typeof window === "undefined") return "";
    let visitorId = localStorage.getItem("lvq_visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("lvq_visitor_id", visitorId);
    }
    return visitorId;
  };

  // Initialize conversation when widget opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      const initConversation = async () => {
        try {
          const visitorId = getVisitorId();
          const result = await getOrCreateConversation.mutateAsync({ visitorId });
          if (result.id) {
            setConversationId(result.id);
          }
          if (result.messages) {
            setMessages(
              result.messages.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant" | "staff",
                content: m.content,
                createdAt: new Date(m.createdAt ?? Date.now()),
              }))
            );
          }
        } catch (error) {
          console.error("Failed to initialize chat:", error);
          // Show a friendly message to the user
          setMessages([{
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, we're having trouble connecting. Please refresh the page or try again later.",
            createdAt: new Date(),
          }]);
        }
      };
      initConversation();
    }
  }, [isOpen, conversationId, getOrCreateConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Save user message to DB
      await addMessage.mutateAsync({
        conversationId,
        role: "user",
        content: userMessage,
      });

      // Build message history for context
      const messageHistory = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      messageHistory.push({ role: "user", content: userMessage });

      // Get AI response from chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = (await response.json()) as { content: string; humanRequested?: boolean };
      const aiResponse = data.content;

      // Save and display AI response
      const savedAi = await addMessage.mutateAsync({
        conversationId,
        role: "assistant",
        content: aiResponse,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: savedAi?.id ?? crypto.randomUUID(),
          role: "assistant",
          content: aiResponse,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      // Show error message to user
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-delft-600 text-white rounded-full shadow-lg hover:bg-delft-700 transition-all duration-200 z-50 flex items-center justify-center hover:scale-105"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[500px] bg-cream-50 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-cream-200">
          {/* Header */}
          <div className="bg-delft-600 text-white p-5">
            <h3 className="font-display font-semibold text-lg">Chat with us</h3>
            <p className="text-sm text-delft-100">We typically reply within minutes</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px]">
            {messages.length === 0 && (
              <div className="text-center text-stone-500 py-8">
                <p className="text-2xl">👋</p>
                <p className="font-display font-semibold text-charcoal mt-2">Hi there!</p>
                <p className="text-sm mt-1">How can we help you today?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-delft-600 text-white"
                      : msg.role === "staff"
                      ? "bg-success-100 text-success-900 border border-success-200"
                      : "bg-white text-charcoal border border-cream-200"
                  }`}
                >
                  {msg.role === "staff" && (
                    <p className="text-xs font-medium text-success-700 mb-1">Support Team</p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-3 border border-cream-200">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-cream-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-delft-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-delft-600 text-white px-4 py-2.5 rounded-lg hover:bg-delft-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
