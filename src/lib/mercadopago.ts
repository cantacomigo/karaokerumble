import { supabase } from './supabase';

export const createPreference = async () => {
    try {
        // Chamamos a Edge Function do Supabase em vez da API do Mercado Pago diretamente
        const { data, error } = await supabase.functions.invoke('create-preference', {
            body: { origin: window.location.origin }
        });

        if (error) {
            console.error('Erro ao chamar Edge Function:', error);
            return null;
        }

        return data.id; // Retorna o preference_id gerado pelo backend
    } catch (error) {
        console.error('Erro na criação da preferência:', error);
        return null;
    }
};
