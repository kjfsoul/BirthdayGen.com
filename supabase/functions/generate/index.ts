import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const input = await req.json()
        const { recipientName, relationship, tone, interests, sharedMemories, customInstructions } = input

        // Construct prompt
        const prompt = `
You are a professional birthday content writer.
Your goal is to write a ${tone || 'heartfelt'} message for ${recipientName} (${relationship}).
Interests: ${interests?.join(', ') || 'None specified'}
Shared Memories: ${sharedMemories?.join(', ') || 'None specified'}
Custom Instructions: ${customInstructions || 'None'}

Write a short, personalized birthday message. Do not include explanations.
        `.trim()

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

        let content = ''

        if (OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that writes birthday cards.' },
                        { role: 'user', content: prompt }
                    ],
                }),
            })
            const data = await response.json()
            content = data.choices?.[0]?.message?.content || 'Failed to generate content.'
        } else {
            // Mock response if no key
            content = `[AI Preview] Happy Birthday ${recipientName}! Here is a ${tone} message based on your interests in ${interests?.join(', ')}.`
        }

        return new Response(
            JSON.stringify({ content }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        return new Response(
            JSON.stringify({ error: message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
