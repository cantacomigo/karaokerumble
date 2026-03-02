import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Library() {
    const { user, profile } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPurchases() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('purchases')
                    .select(`
            id,
            price_paid,
            format_purchased,
            purchased_at,
            tracks (
              id,
              title,
              artist,
              duration,
              cover_url,
              audio_url
            )
          `)
                    .eq('user_id', user.id)
                    .order('purchased_at', { ascending: false });

                if (error) throw error;
                setPurchases(data || []);
            } catch (error) {
                console.error('Erro ao buscar compras:', error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPurchases();
    }, [user]);

    return (
        <div className="flex w-full max-w-[1200px] mx-auto py-8 flex-col px-4 gap-8">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-primary/10">
                <div className="flex items-center gap-6">
                    <div className="size-24 rounded-full border-4 border-primary/20 bg-cover bg-center shrink-0 shadow-lg shadow-primary/10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAci6JF9EK6TniNTV3AgZgmxuSwZnETPr7TdeB0jqCrARHBeklDxRr76gZd041wq-49wdhrTZupPpNfaWY-18MlvwIA9PExgLtli_m4D7JnxhH7GnGfn1FdjPlxM3B6xAXr6kvBSeENU24v_iNBabKx2iaoJb8ecqsthI8a1mrKpI-WdYSh40yqaE4gakdqfKJ2B2ndYy03WfL1qqhGKxWccKsJnKuH5cJaD9t-F3VhNQJsgaD1HxLs2LBoM4aR9UbBl4eKc03a6cw")' }}></div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-1">
                            {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {profile?.created_at
                                ? `Membro desde ${new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                                : 'Conta em processamento...'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 bg-primary/10 w-fit px-3 py-1 rounded-full text-xs font-bold text-primary">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            {profile?.plan_type === 'admin' ? 'Acesso Total / Admin' : 'Plano VIP Ativo'}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Link to="/settings" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-lg">settings</span>
                        Configurações
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Sidebar Nav */}
                <nav className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-bold transition-colors">
                        <span className="material-symbols-outlined">library_music</span>
                        Minhas Músicas
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
                        <span className="material-symbols-outlined">receipt_long</span>
                        Histórico de Pedidos
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
                        <span className="material-symbols-outlined">favorite</span>
                        Lista de Desejos
                    </Link>
                    <Link to="/plans" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
                        <span className="material-symbols-outlined">credit_card</span>
                        Assinatura VIP
                    </Link>
                </nav>

                {/* Dynamic Content */}
                <div className="flex-1 flex flex-col gap-10 w-full min-w-0">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-primary/10 text-center flex flex-col items-center justify-center gap-1 backdrop-blur-sm shadow-sm ring-1 ring-primary/5">
                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{purchases.length}</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Músicas</span>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-primary/10 text-center flex flex-col items-center justify-center gap-1 backdrop-blur-sm shadow-sm ring-1 ring-primary/5">
                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">0</span>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kits Multipista</span>
                        </div>
                        <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-primary to-purple-600 p-4 rounded-xl text-left flex items-center justify-between gap-4 shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex flex-col z-10">
                                <span className="text-white/80 text-sm font-semibold mb-1">Limite Mensal VIP</span>
                                <span className="text-2xl font-black text-white">Ilimitado</span>
                            </div>
                            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md z-10 shrink-0">
                                <span className="material-symbols-outlined text-white text-2xl">all_inclusive</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Compras Recentes
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {loading ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined animate-spin text-3xl mb-4">sync</span>
                                    <p>Carregando sua biblioteca...</p>
                                </div>
                            ) : purchases.length === 0 ? (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <span className="material-symbols-outlined text-4xl mb-4 opacity-50">library_music</span>
                                    <p className="text-lg">Sua biblioteca está vazia.</p>
                                    <p className="text-sm mt-1">Explore o catálogo e adicione suas primeiras faixas!</p>
                                </div>
                            ) : (
                                purchases.map(purchase => (
                                    <div key={purchase.id} className="group relative flex flex-col gap-4 rounded-xl border border-primary/10 bg-white/50 dark:bg-slate-900/50 p-4 transition-all hover:border-primary/50 hover:shadow-lg shadow-sm backdrop-blur-sm">
                                        <div className="flex gap-4">
                                            <div className="size-20 rounded-lg overflow-hidden shrink-0 shadow bg-slate-200 dark:bg-slate-800">
                                                <img src={purchase.tracks.cover_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I"} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1 justify-center">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate" title={purchase.tracks.title}>{purchase.tracks.title}</h3>
                                                <p className="text-sm text-slate-500 truncate mb-2">{purchase.tracks.artist}</p>
                                                <div className="flex items-center gap-2 mt-auto">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                                        {purchase.format_purchased}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium ml-auto">
                                                        Comprado {new Date(purchase.purchased_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full pt-3 border-t border-primary/10">
                                            <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 h-9 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white">
                                                <span className="material-symbols-outlined text-base">cloud_download</span>
                                                Baixar {purchase.format_purchased}
                                            </button>
                                            <button className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
                                                <span className="material-symbols-outlined text-base">play_arrow</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-center mt-2">
                            <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                Ver todas as músicas
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
