import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Resend } from "https://esm.sh/resend@0.16.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { cardId, email, message } = await req.json()

        if (!cardId || !email) {
            throw new Error('Missing required fields')
        }

        // 1. Get card details
        const { data: card, error: cardError } = await supabase
            .from('cards')
            .select('*')
            .eq('id', cardId)
            .single()

        if (cardError || !card) {
            throw new Error('Card not found')
        }

        const resendApiKey = Deno.env.get('RESEND_API_KEY')

        // Mock send if no API key (for dev/testing)
        if (!resendApiKey) {
            console.log('Mocking email send (RESEND_API_KEY not set)')
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay

            // Update card status
            await supabase
                .from('cards')
                .update({ status: 'sent', sent_at: new Date().toISOString() })
                .eq('id', cardId)

            return new Response(
                JSON.stringify({ success: true, id: 'mock-email-id', mock: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Send email via Resend
        const resend = new Resend(resendApiKey)

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'BirthdayGen <onboarding@resend.dev>', // Use verified domain in prod
            to: email,
            subject: `You received a card!`,
            html: `
        <h1>Someone sent you a card!</h1>
        <p>${message || "Hope you have a great day!"}</p>
        <p>Click below to view it:</p>
        <a href="${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/view/${card.id}">View Card</a>
      `,
        })

        if (emailError) {
            console.error('Resend error:', emailError)
            throw new Error('Failed to send email')
        }

        // 3. Update card status
        await supabase
            .from('cards')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', cardId)

        return new Response(
            JSON.stringify({ success: true, id: emailData?.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
