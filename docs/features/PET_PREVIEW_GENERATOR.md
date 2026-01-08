# Feature: AI Pet Portrait Preview Generator

> **Status**: Research Complete - Backlogged
> **Priority**: Nice-to-have
> **Estimated API Cost**: $0.039-$0.134 per preview

## Overview

Allow customers to upload a photo of their pet and instantly see a preview of what their pet would look like in a royal costume portrait. This serves as both a conversion tool and lead capture mechanism (preview in exchange for email).

## Business Case

- **Problem**: Customers hesitate to purchase because they can't visualize the final product
- **Current solution**: Manual artist mockups (expensive, slow)
- **Proposed solution**: AI-generated preview using Google's Nano Banana Pro API
- **Lead capture**: Require email to receive preview

### ROI Estimate

If conversion rate improves from 2% → 4% with preview access:
- 100 daily visitors × 2% additional conversion × €80 avg order = €160/day revenue gain
- API cost at 100 previews/day: ~$4-13/day
- **Net gain**: ~€140-155/day

---

## Technical Approach

### Google Nano Banana Pro (Gemini Image API)

| Model | Resolution | Price/Image | Use Case |
|-------|------------|-------------|----------|
| Gemini 2.5 Flash | 1024x1024 | $0.039 | Fast previews |
| Gemini 3 Pro | 1K-2K | $0.134 | Higher quality |
| Gemini 3 Pro | 4K | $0.24 | Final production |
| Batch API | Any | 50% off | Bulk processing |

### Two Implementation Options

**Option A: Text-guided compositing (simpler)**
```typescript
const response = await gemini.generateImage({
  model: 'gemini-2.5-flash-preview',
  prompt: `Take the dog's head from the first image and seamlessly
           composite it onto the royal costume in the second image.
           Maintain the pet's exact features, fur color, and expression.
           Match lighting and style to create a regal pet portrait.`,
  referenceImages: [petPhoto, costumeTemplate],
});
```

**Option B: Inpainting with mask (more control)**
```typescript
const response = await gemini.editImage({
  model: 'gemini-3-pro-image',
  image: costumeTemplate,
  mask: costumeHeadMask,  // Pre-made mask of head region
  prompt: `Insert this pet's head naturally into the masked area,
           matching the royal portrait style`,
  referenceImage: petPhoto,
});
```

### Recommended: Option B with pre-made masks

Create masks for each costume template defining the head region. This gives more predictable, consistent results.

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Customer browses    2. Clicks "Preview    3. Uploads    │
│     costume options        Your Pet"             pet photo  │
│                                                             │
│  4. Enters email        5. AI generates       6. Receives   │
│     (required)             preview               watermarked│
│                                                 preview     │
│                                                             │
│  7. Follow-up email     8. Customer           9. Artist     │
│     with preview +         purchases             creates    │
│     purchase link                                final art  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Preview Protection (Anti-Screenshot)

To prevent customers from using the preview instead of purchasing:

1. **Low resolution**: Generate at 512px (final product is 4K)
2. **Watermark**: Tiled "PREVIEW - La Vistique" overlay at 30% opacity
3. **No download button**: Display in protected viewer

```typescript
const watermarkedPreview = await addWatermark(preview, {
  text: 'PREVIEW - La Vistique',
  opacity: 0.3,
  tiled: true,
  resolution: 512,
});
```

---

## API Integration

### tRPC Router

```typescript
// src/server/api/routers/previews.ts
export const previewsRouter = createTRPCRouter({
  generatePetPreview: publicProcedure
    .input(z.object({
      petImageUrl: z.string().url(),
      costumeTemplateId: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Save email to contacts (lead capture)
      const contact = await ctx.db.insert(contacts).values({
        email: input.email,
        source: 'preview_generator',
      }).onConflictDoNothing().returning();

      // 2. Get costume template + mask
      const template = await getTemplate(input.costumeTemplateId);

      // 3. Call Gemini API
      const preview = await generatePetPreview({
        petImage: input.petImageUrl,
        template: template.imageUrl,
        mask: template.maskUrl,
      });

      // 4. Add watermark + reduce resolution
      const watermarked = await watermarkPreview(preview);

      // 5. Store preview reference
      await ctx.db.insert(previewRequests).values({
        contactId: contact.id,
        templateId: input.costumeTemplateId,
        previewUrl: watermarked.url,
      });

      // 6. Trigger follow-up email flow
      await inngest.send({
        name: 'preview/generated',
        data: { contactId: contact.id, previewUrl: watermarked.url },
      });

      return { previewUrl: watermarked.url };
    }),
});
```

### Gemini API Client

```typescript
// src/server/gemini/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function generatePetPreview({
  petImage,
  template,
  mask,
}: {
  petImage: string;
  template: string;
  mask: string;
}) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview' // or gemini-3-pro-image for higher quality
  });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: `Composite the pet's head from the first image onto the royal
                 costume portrait template. The masked area shows where the head
                 should be placed. Maintain the pet's exact features, fur texture,
                 and expression. Match the lighting and artistic style of the
                 costume portrait.` },
        { inlineData: { mimeType: 'image/jpeg', data: petImage } },
        { inlineData: { mimeType: 'image/png', data: template } },
        { inlineData: { mimeType: 'image/png', data: mask } },
      ],
    }],
    generationConfig: {
      responseModalities: ['image'],
    },
  });

  return result.response.candidates[0].content.parts[0].inlineData;
}
```

---

## Database Schema

```typescript
// Add to src/server/db/schema.ts

export const costumeTemplates = sqliteTable('costume_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  maskUrl: text('mask_url').notNull(),  // Head region mask
  category: text('category'),  // 'royal', 'military', 'renaissance', etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const previewRequests = sqliteTable('preview_requests', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id),
  templateId: text('template_id').references(() => costumeTemplates.id),
  petImageUrl: text('pet_image_url').notNull(),
  previewUrl: text('preview_url'),
  status: text('status').default('pending'),  // pending, completed, failed
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

---

## Cost Projections

| Daily Previews | Monthly Cost (2.5 Flash) | Monthly Cost (3 Pro) |
|----------------|-------------------------:|---------------------:|
| 50 | $58.50 | $201 |
| 100 | $117 | $402 |
| 250 | $292.50 | $1,005 |
| 500 | $585 | $2,010 |

---

## Reliability Considerations

### Potential Issues

1. **Pet detection accuracy** - May struggle with unusual angles or multiple pets
2. **Style consistency** - Results may vary between similar inputs
3. **Safety filters** - Google may occasionally flag edits (rare for pets)
4. **Processing time** - 2-10 seconds per image

### Mitigation Strategies

1. **Image validation**: Check pet photo quality before processing
2. **Retry logic**: Attempt up to 3 times with varied prompts
3. **Fallback queue**: If AI fails, queue for manual review
4. **Quality scoring**: Simple heuristic to detect bad outputs

```typescript
// Simple quality check
function isPreviewAcceptable(preview: ImageData): boolean {
  // Check for blank/mostly white images
  // Check for obvious artifacts
  // Could use a second AI call for quality assessment
  return true;
}
```

---

## Follow-up Email Flow

```typescript
// Inngest function for follow-up
export const previewFollowUp = inngest.createFunction(
  { id: 'preview-follow-up' },
  { event: 'preview/generated' },
  async ({ event, step }) => {
    const { contactId, previewUrl } = event.data;

    // Send immediate email with preview
    await step.run('send-preview-email', async () => {
      await resend.emails.send({
        from: 'La Vistique <hello@lavistique.nl>',
        to: contact.email,
        subject: 'Your Royal Pet Preview is Ready!',
        react: PreviewReadyEmail({ previewUrl }),
      });
    });

    // Wait 24 hours
    await step.sleep('wait-24h', '24h');

    // Check if purchased
    const purchased = await step.run('check-purchase', async () => {
      return checkIfPurchased(contactId);
    });

    if (!purchased) {
      // Send reminder with discount
      await step.run('send-reminder', async () => {
        await resend.emails.send({
          from: 'La Vistique <hello@lavistique.nl>',
          to: contact.email,
          subject: 'Your pet is waiting to become royalty...',
          react: PreviewReminderEmail({
            previewUrl,
            discountCode: 'ROYAL10'
          }),
        });
      });
    }
  }
);
```

---

## Implementation Checklist

- [ ] Create costume template masks for existing products
- [ ] Set up Google AI API credentials
- [ ] Build Gemini client wrapper
- [ ] Create preview generation endpoint
- [ ] Implement watermarking utility
- [ ] Build preview UI component
- [ ] Set up email capture form
- [ ] Create follow-up email templates
- [ ] Test with variety of pet photos (dogs, cats, other)
- [ ] Measure success rate and quality
- [ ] A/B test conversion impact

---

## Resources

- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Nano Banana Image Generation](https://ai.google.dev/gemini-api/docs/nanobanana)
- [Vertex AI Inpainting](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/edit-insert-objects)
- [Google AI Node.js SDK](https://github.com/google/generative-ai-js)

---

## Open Questions

- [ ] What's the acceptable quality threshold for auto-generated previews?
- [ ] Should we offer multiple costume options in one preview session?
- [ ] How to handle multi-pet photos?
- [ ] Should failed previews trigger artist notification for manual creation?
