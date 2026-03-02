import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

export default function Catalog() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentTrack, isPlaying, playTrack } = useAudio();
    const { addToCart, isInCart } = useCart();

    useEffect(() => {
        async function fetchTracks() {
            try {
                const { data, error } = await supabase
                    .from('tracks')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setTracks(data || []);
            } catch (error) {
                console.error('Erro ao buscar músicas:', error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTracks();
    }, []);

    const togglePlay = (track) => {
        playTrack(track);
    };

    return (
        <div className="flex w-full max-w-[1200px] mx-auto py-8 px-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:flex w-64 flex-col gap-8 shrink-0">
                <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        Filtros
                        <span className="text-xs font-normal text-primary cursor-pointer hover:underline">Limpar Filtros</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Gênero</h4>
                        <label htmlFor="genre-sertanejo" className="flex items-center gap-3 cursor-pointer">
                            <input id="genre-sertanejo" name="genres" type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" checked />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Sertanejo</span>
                        </label>
                        <label htmlFor="genre-rock" className="flex items-center gap-3 cursor-pointer">
                            <input id="genre-rock" name="genres" type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Rock Nacional</span>
                        </label>
                        <label htmlFor="genre-mpb" className="flex items-center gap-3 cursor-pointer">
                            <input id="genre-mpb" name="genres" type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">MPB</span>
                        </label>
                        <label htmlFor="genre-pagode" className="flex items-center gap-3 cursor-pointer">
                            <input id="genre-pagode" name="genres" type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Pagode</span>
                        </label>
                        <label htmlFor="genre-pop" className="flex items-center gap-3 cursor-pointer">
                            <input id="genre-pop" name="genres" type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" checked />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Pop Internacional</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Voz</h4>
                    <label htmlFor="voice-all" className="flex items-center gap-3 cursor-pointer">
                        <input id="voice-all" type="radio" name="voice" className="border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" checked />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Todas</span>
                    </label>
                    <label htmlFor="voice-masc" className="flex items-center gap-3 cursor-pointer">
                        <input id="voice-masc" type="radio" name="voice" className="border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Masculina</span>
                    </label>
                    <label htmlFor="voice-fem" className="flex items-center gap-3 cursor-pointer">
                        <input id="voice-fem" type="radio" name="voice" className="border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Feminina</span>
                    </label>
                    <label htmlFor="voice-duet" className="flex items-center gap-3 cursor-pointer">
                        <input id="voice-duet" type="radio" name="voice" className="border-slate-300 dark:border-slate-700 bg-transparent text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Dueto</span>
                    </label>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Mostrando {tracks.length} resultados</h1>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className="sr-only">Ordenar por</label>
                        <select
                            id="sort"
                            name="sort"
                            className="bg-transparent border border-primary/20 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                        >
                            <option className="bg-background-light dark:bg-background-dark">Mais Populares</option>
                            <option className="bg-background-light dark:bg-background-dark">Novidades</option>
                            <option className="bg-background-light dark:bg-background-dark">Menor Preço</option>
                            <option className="bg-background-light dark:bg-background-dark">Maior Preço</option>
                        </select>
                    </div>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-primary/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary/10 text-xs text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 font-bold">Faixa</th>
                                <th className="px-6 py-4 font-bold hidden md:table-cell">Duração</th>
                                <th className="px-6 py-4 font-bold hidden sm:table-cell">Tom</th>
                                <th className="px-6 py-4 font-bold text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        <span className="material-symbols-outlined animate-spin mb-2 text-2xl">sync</span>
                                        <p>Carregando catálogo...</p>
                                    </td>
                                </tr>
                            ) : tracks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        <p>Nenhuma música encontrada no catálogo.</p>
                                    </td>
                                </tr>
                            ) : (
                                tracks.map(track => {
                                    const isTrackPlaying = currentTrack?.id === track.id && isPlaying;
                                    const inCart = isInCart(track.id);

                                    return (
                                        <tr key={track.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => togglePlay(track)}
                                                        className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isTrackPlaying
                                                            ? 'bg-primary text-white shadow-md'
                                                            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            {isTrackPlaying ? 'pause' : 'play_arrow'}
                                                        </span>
                                                    </button>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <p className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">{track.title}</p>
                                                        <p className="text-sm text-slate-500 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">{track.artist}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{track.duration || '--'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                                                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-medium">{track.key || '--'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mr-2">
                                                        R$ {Number(track.price).toFixed(2).replace('.', ',')}
                                                    </span>
                                                    <button
                                                        onClick={() => !inCart && addToCart(track)}
                                                        disabled={inCart}
                                                        className={`flex items-center justify-center size-10 rounded-lg transition-colors shrink-0 ${inCart
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default cursor-not-allowed'
                                                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer group-hover:bg-primary group-hover:text-white'
                                                            }`}
                                                        title={inCart ? "No carrinho" : "Adicionar ao carrinho"}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            {inCart ? 'check_circle' : 'add_shopping_cart'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
