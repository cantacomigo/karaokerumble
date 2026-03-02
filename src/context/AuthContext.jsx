import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Limite de tempo de segurança (5 segundos) para não travar a tela
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Supabase: Tempo limite de inicialização atingido (10s). Forçando carregamento.');
                setLoading(false);
            }
        }, 10000);

        // Busca a sessão atual quando o app carrega
        const fetchSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user && mounted) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('Erro ao inicializar sessão do Supabase:', error.message);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(timeoutId);
                }
            }
        };

        fetchSession();

        // Fica escutando mudanças de login/logout/etc (Auth State)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // Row not found
                    console.warn('AuthContext: Perfil não encontrado no banco de dados.');
                    // Aqui poderíamos tentar criar o perfil se soubermos que deveria existir
                }
                throw error;
            }
            setProfile(data);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error.message);
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);

        if (error) throw error;
        return data;
    };

    const signUp = async (email, password, fullName) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=cd2bee&color=fff`,
                }
            }
        });
        setLoading(false);

        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        console.log('AuthContext: Saindo...');

        // Limpamos o estado local IMEDIATAMENTE para dar feedback instantâneo ao usuário
        setUser(null);
        setProfile(null);
        localStorage.removeItem('supabase.auth.token'); // Limpeza extra preventiva

        try {
            // Tentamos o logout global no Supabase
            // Usamos um timeout curto para não travar a UI se a rede falhar
            await Promise.race([
                supabase.auth.signOut({ scope: 'global' }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            console.log('AuthContext: Logout global solicitado.');
        } catch (err) {
            console.error('AuthContext: Erro ou timeout no signOut do Supabase:', err);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signIn,
            signUp,
            signOut
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
