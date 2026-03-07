
export const createPreference = async (userId: string): Promise<string | null> => {
    try {
        const response = await fetch('/api/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: window.location.origin, userId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na API:', errorData);
            return null;
        }

        const data = await response.json();
        return data.init_point || null;
    } catch (error) {
        console.error('Erro na criação da preferência:', error);
        return null;
    }
};
