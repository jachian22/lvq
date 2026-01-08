import { type NextApiRequest, type NextApiResponse } from "next";
import { db } from "~/server/db";
import { supportTickets, messages as messagesTable, conversations } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  conversationId: string;
}

interface ChatResponse {
  content: string;
  humanRequested?: boolean;
  ticketId?: string;
}

// Fallback handler when OpenRouter API is not configured
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
    return "We offer a 100% satisfaction guarantee! If you're not happy with your portrait, we'll work with you on unlimited revisions until you love it. If you're still not satisfied, we'll provide a full refund. Is there something specific about your order you'd like help with?";
  }

  if (lowerMessage.includes("shipping") || lowerMessage.includes("delivery")) {
    return "We offer free shipping on all orders! Standard delivery takes 2-3 weeks as each portrait is hand-crafted by our artists. Need it sooner? You can add our 'Skip the Line' option at checkout for priority processing.";
  }

  if (
    lowerMessage.includes("human") ||
    lowerMessage.includes("person") ||
    lowerMessage.includes("agent") ||
    lowerMessage.includes("speak")
  ) {
    return "I'd be happy to connect you with our support team! Please provide your email address and a brief description of your question, and someone will get back to you within 24 hours.";
  }

  if (lowerMessage.includes("how") && lowerMessage.includes("work")) {
    return "Our process is simple! 1) Choose a portrait style (Royal, Military, Renaissance, etc.) 2) Select your size and optional frame 3) Upload a clear photo of your pet 4) Our artists create your portrait 5) You'll receive a preview for approval 6) We ship it to you with free worldwide shipping!";
  }

  if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
    return 'Our portraits start at $59.99 for a Small (8"x10") canvas. Medium (12"x16") is $79.99, Large (18"x24") is $109.99, and Extra Large (24"x36") is $149.99. Optional frames range from $24.99 to $39.99. Free shipping included!';
  }

  return "Thanks for your message! I'm here to help with questions about our pet portraits. You can ask me about:\n\n• Shipping and delivery times\n• Returns and refunds\n• How our process works\n• Pricing and sizes\n\nHow can I help you today?";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, conversationId } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content ?? "";

    // Check if OpenRouter API key is configured
    if (process.env.OPENROUTER_API_KEY) {
      try {
        // Call OpenRouter API directly
        const openRouterResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavistique.nl",
              "X-Title": "La Vistique Chat",
            },
            body: JSON.stringify({
              model: "moonshotai/kimi-k2",
              messages: [
                {
                  role: "system",
                  content: `You are a friendly customer support assistant for La Vistique, a company that creates custom hand-painted pet portraits.

Key information:
- 100% satisfaction guarantee with unlimited revisions
- Full refund if not satisfied
- Free worldwide shipping
- 2-3 weeks delivery (hand-crafted)
- "Skip the Line" for priority processing
- Sizes: Small ($59.99), Medium ($79.99), Large ($109.99), Extra Large ($149.99)
- Optional frames: $24.99-$39.99

Be helpful, friendly, and concise (under 150 words).`,
                },
                ...messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              ],
              max_tokens: 300,
            }),
          }
        );

        if (openRouterResponse.ok) {
          const data = (await openRouterResponse.json()) as {
            choices: Array<{ message: { content: string } }>;
          };
          const content = data.choices[0]?.message?.content ?? getFallbackResponse(userMessage);
          return res.status(200).json({ content });
        }
      } catch (error) {
        console.error("OpenRouter API error:", error);
        // Fall through to fallback response
      }
    }

    // Fallback response
    const response = getFallbackResponse(userMessage);
    return res.status(200).json({ content: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Failed to process chat request" });
  }
}
