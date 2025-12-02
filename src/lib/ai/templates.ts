import { GenerationInput, Tone } from '@/types/generation';

export interface PromptTemplate {
    id: string;
    tone: Tone;
    template: string;
    description: string;
}

export const PROMPT_TEMPLATES: Record<Tone, PromptTemplate[]> = {
    funny: [
        {
            id: 'funny-aging',
            tone: 'funny',
            description: 'Lighthearted jokes about getting older',
            template: "Write a funny birthday message for {recipientName}. They are turning {recipientAge}. Joke about them getting older but keep it affectionate. Mention their love for {interests}. The relationship is {relationship}.",
        },
        {
            id: 'funny-witty',
            tone: 'funny',
            description: 'Clever and witty humor',
            template: "Write a witty birthday wish for {recipientName}. Use a clever pun related to {interests}. Keep it short and punchy suitable for a {relationship}.",
        }
    ],
    heartfelt: [
        {
            id: 'heartfelt-appreciation',
            tone: 'heartfelt',
            description: 'Expressing deep appreciation and love',
            template: "Write a touching birthday message for {recipientName}. Express how much they mean to you as a {relationship}. Mention this shared memory: {sharedMemories}. Wish them happiness and fulfillment.",
        },
        {
            id: 'heartfelt-simple',
            tone: 'heartfelt',
            description: 'Simple and warm wishes',
            template: "Write a warm and sincere birthday wish for {recipientName}. Focus on their positive qualities like {interests}. Keep it sweet and simple.",
        }
    ],
    professional: [
        {
            id: 'professional-coworker',
            tone: 'professional',
            description: 'Appropriate for workplace',
            template: "Write a professional yet warm birthday message for a coworker named {recipientName}. Wish them a great year ahead and success in their work. Keep it polite and office-appropriate.",
        }
    ],
    poetic: [
        {
            id: 'poetic-rhyme',
            tone: 'poetic',
            description: 'A short rhyming poem',
            template: "Write a short 4-line birthday poem for {recipientName}. The tone should be celebratory and mention {interests}.",
        }
    ],
    witty: [
        {
            id: 'witty-short',
            tone: 'witty',
            description: 'Short and clever',
            template: "Write a very short, clever birthday one-liner for {recipientName}.",
        }
    ]
};

export function getTemplateForTone(tone: Tone): PromptTemplate {
    const templates = PROMPT_TEMPLATES[tone];
    if (!templates || templates.length === 0) {
        // Fallback to heartfelt if tone not found
        return PROMPT_TEMPLATES['heartfelt'][0];
    }
    // Randomly select one to add variety
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
}

export function injectContext(template: string, input: GenerationInput): string {
    let result = template;

    // Replace standard placeholders
    result = result.replace(/{recipientName}/g, input.recipientName);
    result = result.replace(/{recipientAge}/g, input.recipientAge ? input.recipientAge.toString() : 'another year older');
    result = result.replace(/{relationship}/g, input.relationship);

    // Handle arrays (interests, memories) - join them naturally
    const interestsStr = input.interests && input.interests.length > 0
        ? input.interests.join(', ')
        : 'general fun things';
    result = result.replace(/{interests}/g, interestsStr);

    const memoriesStr = input.sharedMemories && input.sharedMemories.length > 0
        ? input.sharedMemories.join('. Also remember ')
        : 'our time together';
    result = result.replace(/{sharedMemories}/g, memoriesStr);

    // Append custom instructions if present
    if (input.customInstructions) {
        result += `\n\nAdditional Instructions: ${input.customInstructions}`;
    }

    return result;
}
