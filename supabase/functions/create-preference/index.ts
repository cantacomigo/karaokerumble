
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

        if (!accessToken) {
            throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not set');
        }

        const { origin } = await req.json();

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: [
                    {
                        id: 'pro-plan',
                        title: 'Plano Pro - Cante Comigo',
                        description: 'Acesso ilimitado e downloads de MP3',
                        quantity: 1,
                        unit_price: 34.90,
                        currency_id: 'BRL'
                    }
                ],
                back_urls: {
                    success: origin,
                    failure: origin,
                    pending: origin
                },
                auto_return: 'approved'
            })
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
