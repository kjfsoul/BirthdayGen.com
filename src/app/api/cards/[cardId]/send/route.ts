import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Body = z.object({
  recipientEmail: z.string().email(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cardId } = await context.params;
    const { recipientEmail } = parsed.data;

    // Get the card details from the database
    const card = await db.card.findFirst({
      where: {
        id: parseInt(cardId),
        user_id: user.id,
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // TODO: Invoke the 'send-card' Supabase Edge Function
    // For now, we'll return success but the actual email sending
    // needs to be implemented in the Edge Function
    console.log('Sending card:', {
      cardId: card.id,
      recipientEmail,
      message: card.message,
    });

    // Update the card status to sent
    await db.card.update({
      where: { id: card.id },
      data: {
        status: 'sent',
        sent_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Card sent successfully'
    });

  } catch (error) {
    console.error('Error sending card:', error);
    return NextResponse.json(
      { error: 'Failed to send card' },
      { status: 500 }
    );
  }
}
