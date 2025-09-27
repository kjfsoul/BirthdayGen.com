import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const Body = z.object({
  message: z.string().min(1).max(500),
  styles: z.object({
    backgroundColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
    textColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
    fontFamily: z.enum(['system','inter','poppins','montserrat','nunito','lora','playfair','merriweather','dmserif','caveat']),
    fontSize: z.number().int().min(10).max(96),
    textAlign: z.enum(['left','center','right']).optional()
  }),
  media: z.object({
    imageUrl: z.string().url().optional(),
    layout: z.enum(['square','portrait','landscape']).optional()
  }).optional(),
  meta: z.object({
    occasion: z.string().optional(),
    audience: z.string().optional(),
    tags: z.array(z.string()).max(10).optional()
  }).optional()
});

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  // Persist (replace with real DB insert)
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  // Example Supabase insert:
  // await supabase.from('cards').insert({ id, user_id: user.id, ...payload });

  return NextResponse.json({ id, slug: `card_${id.slice(0,6)}`, createdAt }, { status: 201 });
}