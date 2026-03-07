
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
        return res.status(500).json({ error: 'Mercado Pago Access Token is not configured on Vercel' });
    }

    try {
        const { origin } = req.body;

        const isHttps = origin && origin.startsWith('https://');
        const requestBody = {
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
            ...(isHttps ? {
                back_urls: {
                    success: origin,
                    failure: origin,
                    pending: origin
                },
                auto_return: 'approved'
            } : {})
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Error creating MP preference:', error);
        return res.status(500).json({ error: error.message });
    }
}
