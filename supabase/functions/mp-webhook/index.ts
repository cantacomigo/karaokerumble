import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const payload = await req.json()
        console.log('Webhook MP recebido:', payload)

        // O Mercado Pago envia o ID do recurso e o tipo
        if (payload.type === 'payment') {
            const paymentId = payload.data.id
            const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')

            // Buscar detalhes do pagamento na API do Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${mpAccessToken}` }
            })
            const paymentData = await response.json()

            if (paymentData.status === 'approved') {
                const userId = paymentData.external_reference
                const amount = paymentData.transaction_amount

                // Identificar o plano pelo valor (simplificado para este exemplo)
                let planType = 'basic'
                if (amount >= 99) planType = 'premium'
                else if (amount >= 59) planType = 'pro'

                // 1. Atualizar Perfil do Usuário
                await supabaseClient
                    .from('profiles')
                    .update({
                        plan_type: planType,
                        active_plan: true
                    })
                    .eq('id', userId)

                // 2. Salvar log na tabela de assinaturas
                await supabaseClient
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        mp_payment_id: paymentId.toString(),
                        plan_type: planType,
                        amount: amount,
                        status: 'approved',
                        payment_method: paymentData.payment_method_id
                    })

                console.log(`Plano ${planType} ativado para usuário ${userId}`)
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (error) {
        console.error('Erro no Webhook:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
})
