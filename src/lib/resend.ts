import { Resend } from "resend";

// Lazy-initialize Resend client to prevent crashes when API key is missing
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Default from address
export const FROM_EMAIL = "La Vistique <support@lavistique.nl>";

// Send support reply email
export async function sendSupportReplyEmail(
  to: string,
  subject: string,
  replyContent: string,
  conversationId: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Re: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #dc2626, #ec4899); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">La Vistique</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Our support team has responded to your inquiry:
          </p>

          <div style="background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0;">
            <p style="color: #111827; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0;">
              ${replyContent}
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            To continue this conversation, simply reply to this email.
          </p>
        </div>

        <div style="background: #111827; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            La Vistique - Custom Pet Portraits
          </p>
        </div>
      </div>
    `,
  });
}

// Send preview ready notification
export async function sendPreviewReadyEmail(
  to: string,
  customerName: string,
  previewUrl: string,
  orderId: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your Pet Portrait Preview is Ready!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #dc2626, #ec4899); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">La Vistique</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #111827; font-size: 22px; margin-top: 0;">
            Hi ${customerName}! 🎨
          </h2>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Great news! Your pet portrait preview is ready for review.
          </p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Our talented artists have been working hard to transform your beloved pet into a stunning work of art.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${previewUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Your Preview
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Order #${orderId}
          </p>

          <div style="background: #ecfdf5; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="color: #065f46; font-size: 14px; margin: 0;">
              <strong>Satisfaction Guaranteed:</strong> If you'd like any changes, just let us know! We offer unlimited revisions until you're completely happy with your portrait.
            </p>
          </div>
        </div>

        <div style="background: #111827; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            La Vistique - Custom Pet Portraits
          </p>
        </div>
      </div>
    `,
  });
}

// Send welcome email for newsletter signup
export async function sendWelcomeEmail(
  to: string,
  discountCode?: string
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to La Vistique! 🐾",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #dc2626, #ec4899); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">La Vistique</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #111827; font-size: 22px; margin-top: 0;">
            Welcome to the Family! 🎉
          </h2>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for joining the La Vistique community! We're excited to help you transform your beloved pets into stunning royal portraits.
          </p>

          ${discountCode ? `
          <div style="background: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #991b1b; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase;">
              Your Exclusive Welcome Discount
            </p>
            <p style="color: #111827; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
              ${discountCode}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
              Use at checkout for 10% off your first order!
            </p>
          </div>
          ` : ''}

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Here's what you can expect from us:
          </p>

          <ul style="color: #374151; font-size: 15px; line-height: 1.8;">
            <li>First access to new portrait styles</li>
            <li>Exclusive subscriber-only discounts</li>
            <li>Behind-the-scenes looks at our artists' work</li>
            <li>Pet care tips and inspiration</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://lavistique.nl" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Creating
            </a>
          </div>
        </div>

        <div style="background: #111827; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            La Vistique - Custom Pet Portraits
          </p>
          <p style="color: #6b7280; font-size: 11px; margin-top: 10px;">
            <a href="{{{unsubscribe_url}}}" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
  });
}
