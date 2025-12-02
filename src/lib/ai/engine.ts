import { GenerationInput } from '@/types/generation';
import { getTemplateForTone, injectContext } from './templates';

export class AIEngine {
    /**
     * Constructs the final prompt to be sent to the LLM.
     * This combines the user input with a selected template.
     */
    static buildPrompt(input: GenerationInput): string {
        // 1. Select a template based on tone
        const templateObj = getTemplateForTone(input.tone);

        // 2. Inject context into the template
        const filledPrompt = injectContext(templateObj.template, input);

        // 3. Wrap in a system instruction wrapper for better adherence
        const systemWrapper = `
You are a professional birthday content writer.
Your goal is to write a ${input.tone} message.
Do not include any explanations, just the message content.

Task:
${filledPrompt}
    `.trim();

        return systemWrapper;
    }

    /**
     * Mock generation function for MVP (until LLM API is connected).
     * In the future, this will call OpenAI/Anthropic.
     */
    static async generateContent(input: GenerationInput): Promise<string> {
        const prompt = this.buildPrompt(input);

        // SIMULATION: For now, we just return the prompt as a "preview" of what would be sent
        // or a dummy response.
        // In a real implementation, this would be:
        // return await callLLM(prompt);

        return `[AI GENERATED CONTENT PREVIEW]\n\nBased on prompt:\n${prompt}\n\n(This is a placeholder until the LLM API key is configured)`;
    }
}
