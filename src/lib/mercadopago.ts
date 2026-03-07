
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize the client with your Access Token
const client = new MercadoPagoConfig({
    accessToken: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN
});

const preference = new Preference(client);

export const createCheckoutLink = async () => {
    try {
        const body = {
            items: [
                {
                    id: 'pro-plan',
                    title: 'Plano Pro - Cante Comigo',
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
            auto_return: 'approved',
        };

        // Note: Creating preferences directly from the frontend is NOT recommended for production
        // due to CORS and security. Ideally, this should be done in a Supabase Edge Function.
        // We are using a simplified redirect for now as requested.

        // For now, since MP API requires a backend/secret, we will use the Client ID to generate 
        // a payment link if possible, or provide a direct link if the user has one.

        // If the user doesn't have a fixed link, we advise using the Official MP button/redirect.
        const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=YOUR_PREFERENCE_ID`;

        // Return the URL
        return checkoutUrl;
    } catch (error) {
        console.error('Error creating MP preference:', error);
        return null;
    }
};
