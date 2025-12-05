import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

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

        // 1. Check Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        // 2. Check Credits
        const { data: creditData, error: creditError } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', user.id)
            .single()

        if (creditError || !creditData || creditData.credits < 1) {
            return new Response(
                JSON.stringify({ error: 'Insufficient credits', code: 'insufficient_credits' }),
                { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { image, mask, prompt } = await req.json()
        const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')

        if (!REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN not set')
        }

        // 3. Call Replicate (Flux Fill Dev)
        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "a7489803625902b662499114e58d92060bed281630e5b60378490e55c95cb368", // black-forest-labs/flux-fill-dev
                input: {
                    image: image,
                    mask: mask,
                    prompt: prompt,
                    guidance: 30,
                    steps: 20,
                    output_format: "jpg",
                    safety_tolerance: 2
                }
            }),
        });

        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(`Replicate API error: ${JSON.stringify(error)}`);
        }

        const prediction = await response.json();

        // Poll for result
        let result = prediction;
        while (result.status !== "succeeded" && result.status !== "failed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const pollResponse = await fetch(result.urls.get, {
                headers: {
                    "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            });
            result = await pollResponse.json();
        }

        if (result.status === "failed") {
            throw new Error(`Generation failed: ${result.error}`);
        }

        const outputImage = result.output;

        // 4. Deduct Credit
        await supabase.rpc('decrement_credit', { user_id_param: user.id })

        return new Response(
            JSON.stringify({ success: true, image: outputImage, creditsRemaining: creditData.credits - 1 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
