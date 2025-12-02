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
        const { recipient, occasion, budget } = await req.json()

        // Mock AI logic - in real app, call OpenAI here
        const mockRecommendations = [
            {
                name: `Personalized ${occasion} Box`,
                description: `A curated box of treats perfect for ${recipient.name}.`,
                imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop",
                price: 45.00,
                productUrl: "#",
                category: "Gift Sets"
            },
            {
                name: "Aura Reading Session",
                description: "A spiritual session to connect with their inner self.",
                imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
                price: 75.00,
                productUrl: "#",
                category: "Experiences"
            },
            {
                name: "Custom Star Map",
                description: "The night sky exactly as it was on their special day.",
                imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop",
                price: 60.00,
                productUrl: "#",
                category: "Decor"
            }
        ]

        return new Response(
            JSON.stringify({
                success: true,
                recommendations: [
                    {
                        products: mockRecommendations
                    }
                ]
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
