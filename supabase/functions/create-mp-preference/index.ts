import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { planId, userId, planName, planPrice } = await req.json()

        // 1. Configurar Mercado Pago
        const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [
                    {
                        id: planId,
                        title: `Plano VIP - ${planName}`,
                        unit_price: planPrice,
                        quantity: 1,
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    id: userId,
                },
                back_urls: {
                    success: `${req.headers.get('origin')}/library?payment=success`,
                    failure: `${req.headers.get('origin')}/plans?payment=failure`,
                    pending: `${req.headers.get('origin')}/plans?payment=pending`,
                },
                auto_return: 'approved',
                notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
                external_reference: userId, // Importante para o Webhook saber quem pagou
            }),
        })

        const preference = await response.json()

        return new Response(
            JSON.stringify({ id: preference.id, init_point: preference.init_point }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
