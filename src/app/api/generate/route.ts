import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIEngine } from '@/lib/ai/engine';
import { GenerationInput } from '@/types/generation';

// Define Zod schema for validation
const generationSchema = z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    recipientAge: z.number().optional(),
    relationship: z.enum(['friend', 'family', 'partner', 'coworker', 'acquaintance']),
    tone: z.enum(['funny', 'heartfelt', 'professional', 'poetic', 'witty']),
    interests: z.array(z.string()).optional(),
    sharedMemories: z.array(z.string()).optional(),
    occasion: z.string().optional(),
    customInstructions: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validationResult = generationSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const input: GenerationInput = validationResult.data;

        // Generate content
        const content = await AIEngine.generateContent(input);

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error in /api/generate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
