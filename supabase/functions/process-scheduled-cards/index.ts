import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { Resend } from "https://esm.sh/resend@0.16.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Process Scheduled Cards Edge Function
 *
 * This function finds all cards with status='scheduled' where scheduled_at <= now
 * and sends them via email.
 *
 * Can be triggered manually or via Supabase Cron extension.
 *
 * Cron setup (when ready):
 * ```sql
 * SELECT cron.schedule(
 *   'process-scheduled-cards',
 *   '* /5 * * * *',
 *   $$ SELECT net.http_post(
 *     url := 'https://<project-ref>.supabase.co/functions/v1/process-scheduled-cards',
 *     headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
 *   ) $$
 * );
 * ```
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role client for background processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find all scheduled cards that are due
    const now = new Date().toISOString()
    const { data: scheduledCards, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)

    if (fetchError) {
      throw new Error(`Failed to fetch scheduled cards: ${fetchError.message}`)
    }

    if (!scheduledCards || scheduledCards.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No scheduled cards to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'

    const results: { id: string; success: boolean; error?: string }[] = []

    for (const card of scheduledCards) {
      try {
        // Update status to sending
        await supabase
          .from('cards')
          .update({ status: 'sending' })
          .eq('id', card.id)

        // Check if we have recipient email
        if (!card.recipient_email) {
          throw new Error('No recipient email configured')
        }

        // Send email (mock if no API key)
        if (resendApiKey) {
          const resend = new Resend(resendApiKey)
          const { error: emailError } = await resend.emails.send({
            from: 'BirthdayGen <onboarding@resend.dev>',
            to: card.recipient_email,
            subject: `You received a birthday card!`,
            html: `
                            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                                <h1>🎂 Someone sent you a birthday card!</h1>
                                <p>${card.message || 'Hope you have a wonderful birthday!'}</p>
                                <a href="${siteUrl}/view/${card.id}"
                                   style="display: inline-block; background: linear-gradient(to right, #ec4899, #8b5cf6);
                                          color: white; padding: 12px 24px; text-decoration: none;
                                          border-radius: 8px; font-weight: bold; margin-top: 16px;">
                                    View Your Card
                                </a>
                            </div>
                        `,
          })
          if (emailError) {
            throw new Error(`Email send failed: ${emailError.message}`)
          }
        } else {
          // Mock delay for testing
          await new Promise(resolve => setTimeout(resolve, 500))
          console.log(`[MOCK] Would send email to ${card.recipient_email} for card ${card.id}`)
        }

        // Update status to sent
        await supabase
          .from('cards')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', card.id)

        results.push({ id: card.id, success: true })

      } catch (cardError) {
        console.error(`Failed to process card ${card.id}:`, cardError)

        // Mark as failed
        await supabase
          .from('cards')
          .update({ status: 'failed' })
          .eq('id', card.id)

        results.push({
          id: card.id,
          success: false,
          error: (cardError as Error).message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} cards`,
        processed: results.length,
        success: successCount,
        failed: failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('process-scheduled-cards error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
