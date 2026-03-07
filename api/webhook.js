
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    try {
        // IPN/Webhook from Mercado Pago
        const { type, data, id } = req.query;

        if (type !== 'payment' && !data?.id) {
            return res.status(200).json({ received: true });
        }

        const paymentId = data?.id || id;
        if (!paymentId) {
            return res.status(200).json({ received: true });
        }

        // Fetch payment details from MP API
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const payment = await mpRes.json();

        // Only upgrade on approved payments
        if (payment.status !== 'approved') {
            return res.status(200).json({ status: payment.status });
        }

        const userId = payment.external_reference;
        if (!userId || userId === 'unknown') {
            console.error('No userId in external_reference');
            return res.status(200).json({ error: 'No userId' });
        }

        // Calculate expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Update the user's plan and expiration in Supabase
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                plan: 'pro',
                plan_expires_at: expiresAt.toISOString()
            })
        });

        if (!updateRes.ok) {
            const errText = await updateRes.text();
            console.error('Supabase update error:', errText);
            return res.status(500).json({ error: 'Failed to update plan' });
        }

        console.log(`✅ User ${userId} upgraded to Pro!`);
        return res.status(200).json({ success: true, userId });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: error.message });
    }
}
