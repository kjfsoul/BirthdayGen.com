import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const Body = z.object({
    recipientEmail: z.string().email(),
    scheduledAt: z.string().optional(), // ISO date string
});

export const dynamic = 'force-dynamic';

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
        const { recipientEmail, scheduledAt } = parsed.data;

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

        // Update status to sending
        await db.card.update({
            where: { id: card.id },
            data: { status: 'sending' },
        });

        try {
            // Send email via Resend
            const { data, error } = await resend.emails.send({
                from: 'BirthdayGen <gifts@birthdaygen.com>', // Update with your verified domain
                to: [recipientEmail],
                subject: `You received a magical birthday card! 🎂`,
                html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h1>Someone sent you a birthday wish!</h1>
            <p>Click the link below to view your personalized card:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/view/${card.id}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View My Card
            </a>
            <p style="margin-top: 20px; color: #666;">
              (Or copy this link: ${process.env.NEXT_PUBLIC_APP_URL}/view/${card.id})
            </p>
          </div>
        `,
                scheduledAt: scheduledAt, // Resend supports scheduling
            });

            if (error) {
                console.error('Resend error:', error);
                throw new Error(error.message);
            }

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
                message: 'Card sent successfully',
                id: data?.id
            });

        } catch (sendError) {
            console.error('Failed to send email:', sendError);

            // Revert status or mark as failed
            await db.card.update({
                where: { id: card.id },
                data: { status: 'failed' }, // You might want a 'failed' status in your schema
            });

            return NextResponse.json(
                { error: 'Failed to send email via provider' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error sending card:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
