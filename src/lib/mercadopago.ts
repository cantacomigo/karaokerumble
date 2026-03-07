
export const createPreference = async () => {
    const accessToken = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('Mercado Pago Access Token missing');
        return null;
    }

    try {
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
                    success: window.location.origin,
                    failure: window.location.origin,
                    pending: window.location.origin
                },
                auto_return: 'approved'
            })
        });

        const data = await response.json();
        return data.id; // Returns the preference_id
    } catch (error) {
        console.error('Error creating MP preference:', error);
        return null;
    }
};
