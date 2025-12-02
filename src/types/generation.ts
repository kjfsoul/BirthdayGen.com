export type Tone = 'funny' | 'heartfelt' | 'professional' | 'poetic' | 'witty';
export type ContentType = 'card' | 'social_post' | 'text_message' | 'email';
export type Relationship = 'friend' | 'family' | 'partner' | 'coworker' | 'acquaintance';

export interface GenerationInput {
    recipientName: string;
    recipientAge?: number;
    relationship: Relationship;
    tone: Tone;
    interests?: string[];
    sharedMemories?: string[];
    occasion?: string; // e.g., "Birthday", "Anniversary"
    customInstructions?: string;
}

export interface GeneratedContent {
    content: string;
    tone: Tone;
    metadata: {
        promptUsed?: string;
        model?: string;
        generatedAt: string;
    };
}
