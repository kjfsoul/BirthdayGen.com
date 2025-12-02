import { AIEngine } from '../src/lib/ai/engine';
import { GenerationInput } from '../src/types/generation';

const testInputs: GenerationInput[] = [
    {
        recipientName: 'Alice',
        recipientAge: 30,
        relationship: 'friend',
        tone: 'funny',
        interests: ['cats', 'wine', 'coding'],
    },
    {
        recipientName: 'Bob',
        relationship: 'coworker',
        tone: 'professional',
        customInstructions: 'Make it sound like it came from the whole team.',
    },
    {
        recipientName: 'Mom',
        relationship: 'family',
        tone: 'heartfelt',
        sharedMemories: ['that trip to Paris', 'baking cookies'],
    }
];

async function runTests() {
    console.log('🧪 Testing AI Prompt Engine...\n');

    for (const input of testInputs) {
        console.log(`--- Testing Tone: ${input.tone.toUpperCase()} ---`);
        console.log(`Input: ${JSON.stringify(input, null, 2)}`);

        const prompt = AIEngine.buildPrompt(input);
        console.log('\n📝 Generated Prompt:');
        console.log(prompt);
        console.log('\n-----------------------------------\n');
    }
}

runTests().catch(console.error);
