import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    // Preflight response must include CORS headers and a 204 status
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const input = await req.json()
    const {
      recipientName,
      relationship,
      tone,
      interests,
      sharedMemories,
      customInstructions,
      occasion
    } = input

    // Holiday-focused system prompt
    const systemContext = `You are a creative holiday and celebration content writer specializing in personalized messages.
Your specialty is crafting warm, memorable messages for birthdays, holidays, and special occasions that feel genuine and heartfelt.
Focus on seasonal themes, celebration moments, and creating emotional connections through words.`

    // Construct prompt for text generation
    const userPrompt = `
Write a ${tone || 'heartfelt'} ${occasion || 'birthday'} message for ${recipientName || 'someone special'}.

Context:
- Relationship: ${relationship || 'friend'}
- Occasion: ${occasion || 'Birthday'}
- Interests: ${interests?.join(', ') || 'None specified'}
- Shared Memories: ${sharedMemories?.join('; ') || 'None specified'}
- Special Instructions: ${customInstructions || 'None'}

Write a short, personalized message (2-4 sentences) that captures the spirit of the occasion.
Be warm, genuine, and celebration-focused. Just the message itself, no explanations.
        `.trim()

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    let content = ''

    if (GEMINI_API_KEY) {
      // Use Gemini API (cheaper/free tier)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemContext}\n\n${userPrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 150,
            }
          }),
        }
      )

      const data = await response.json()
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Wishing you a wonderful celebration filled with joy and happiness!'
    } else if (OPENAI_API_KEY) {
      // Fallback to OpenAI if Gemini not available
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      })

      const data = await response.json()
      content = data.choices?.[0]?.message?.content || 'Wishing you a wonderful celebration filled with joy and happiness!'
    } else {
      // Mock response for development/testing
      const mockMessages: Record<string, string> = {
        heartfelt: `Dear ${recipientName || 'Friend'}, on this special ${occasion || 'day'}, I want you to know how much you brighten every celebration. May your heart be filled with warmth, laughter, and unforgettable moments.`,
        funny: `Happy ${occasion || 'Day'} ${recipientName || 'you wonderful human'}! They say celebrations are best shared with amazing people. Lucky for you, you found one – ME! Now let's party!`,
        poetic: `${recipientName || 'Dear one'}, like fireworks painting the sky, your spirit brings light to every celebration. May this ${occasion || 'special day'} sparkle with magic and joy.`,
        witty: `${recipientName || 'Friend'}, another trip around the sun deserves confetti, cake, and questionable life choices. Here's to celebrating you in style!`,
      }
      content = mockMessages[tone as string] || mockMessages.heartfelt
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('generate-text error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
