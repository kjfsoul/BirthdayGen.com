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
        const { query, page = 1, per_page = 20 } = await req.json()
        const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY')

        if (!PEXELS_API_KEY) {
            throw new Error('PEXELS_API_KEY is not set')
        }

        if (!query) {
            throw new Error('Query parameter is required')
        }

        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY,
                },
            }
        )

        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
