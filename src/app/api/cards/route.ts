import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const Body = z.object({
  message: z.string().min(1).max(500),
  styles: z.object({
    backgroundColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
    textColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
    fontFamily: z.enum(['system', 'inter', 'poppins', 'montserrat', 'nunito', 'lora', 'playfair', 'merriweather', 'dmserif', 'caveat']),
    fontSize: z.number().int().min(10).max(96),
    textAlign: z.enum(['left', 'center', 'right']).optional()
  }),
  media: z.object({
    imageUrl: z.string().url().optional(),
    layout: z.enum(['square', 'portrait', 'landscape']).optional()
  }).optional(),
  meta: z.object({
    occasion: z.string().optional(),
    audience: z.string().optional(),
    tags: z.array(z.string()).max(10).optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  // Map the payload to database schema
  const cardData = {
    user_id: user.id,
    title: `Card - ${new Date().toLocaleDateString()}`,
    message: payload.message,
    template: 'simple', // Using simple template
    background_style: JSON.stringify({
      backgroundColor: payload.styles.backgroundColor,
      textColor: payload.styles.textColor,
    }),
    text_style: JSON.stringify({
      fontFamily: payload.styles.fontFamily,
      fontSize: payload.styles.fontSize,
      textAlign: payload.styles.textAlign,
    }),
    status: 'draft',
  };

  // Save to database
  const savedCard = await db.card.create({
    data: cardData,
  });

  return NextResponse.json({
    id: savedCard.id,
    slug: `card_${savedCard.id}`,
    createdAt: savedCard.created_at
  }, { status: 201 });
}
