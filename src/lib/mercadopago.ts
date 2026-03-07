
export const createPreference = async () => {
    try {
        // Chamamos a Vercel Serverless Function em vez da Edge Function (Solução sem Docker)
        const response = await fetch('/api/create-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ origin: window.location.origin })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na Vercel Function:', errorData);
            return null;
        }

        const data = await response.json();
        return data.id; // Retorna o preference_id gerado pelo backend
    } catch (error) {
        console.error('Erro na criação da preferência:', error);
        return null;
    }
};
