
export const createPreference = async (): Promise<string | null> => {
    try {
        const response = await fetch('/api/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: window.location.origin })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na API:', errorData);
            return null;
        }

        const data = await response.json();
        // Retorna a URL de checkout direta (mais limpa que o modal do SDK)
        return data.init_point || null;
    } catch (error) {
        console.error('Erro na criação da preferência:', error);
        return null;
    }
};
