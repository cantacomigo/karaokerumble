import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'joaquimcdacruz@gmail.com';

export default function AdminUpload() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        // Redirecionamento de Segurança Básico
        if (user && user.email !== ADMIN_EMAIL) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    // Form States
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [price, setPrice] = useState('14.90');
    const [format, setFormat] = useState('MP3 320kbps');

    // File States
    const [coverFile, setCoverFile] = useState(null);
    const [rumbleUrl, setRumbleUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('[DEBUG] Formulário enviado:', { title, artist, price, format });

        if (!user || user.email !== ADMIN_EMAIL) {
            setErrorMsg('Acesso negado. Apenas o administrador pode gerenciar músicas.');
            return;
        }

        if (!coverFile || !rumbleUrl) {
            setErrorMsg('Por favor, preencha a Capa e a URL do Rumble.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            // 1. Upload Cover Image to 'covers' bucket
            console.log('[DEBUG] Iniciando upload da imagem de capa...');
            const coverExt = coverFile.name.split('.').pop();
            const coverPath = `${Date.now()}_${Math.random().toString(36).substring(7)}.${coverExt}`;

            const { data: coverData, error: coverError } = await supabase.storage
                .from('covers')
                .upload(coverPath, coverFile);

            if (coverError) {
                console.error('[DEBUG] Erro no storage (covers):', coverError);
                throw new Error(`Erro no upload da capa: ${coverError.message || 'Verifique se o bucket "covers" existe e é público.'}`);
            }

            console.log('[DEBUG] Upload da capa concluído:', coverData);

            // 2. Get Public URL for cover
            const coverUrl = supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl;
            console.log('[DEBUG] URL da capa gerada:', coverUrl);

            // 3. Process Rumble URL (Ensure it's the embed version)
            let finalVideoUrl = rumbleUrl.trim();
            // Se o usuário colou o link completo (ex: https://rumble.com/v76hqai-karaok-al)
            if (finalVideoUrl.includes('rumble.com/') && !finalVideoUrl.includes('/embed/')) {
                const match = finalVideoUrl.match(/\/v([a-z0-9]+)/i);
                if (match && match[1]) {
                    finalVideoUrl = `https://rumble.com/embed/v${match[1]}/`;
                }
            }
            // Se o usuário colou apenas o ID (ex: v76hqai ou 76hqai)
            else if (!finalVideoUrl.includes('http')) {
                const id = finalVideoUrl.startsWith('v') ? finalVideoUrl : `v${finalVideoUrl}`;
                finalVideoUrl = `https://rumble.com/embed/${id}/`;
            }
            console.log('[DEBUG] URL de vídeo final:', finalVideoUrl);

            // 4. Insert into 'tracks' database
            console.log('[DEBUG] Inserindo dados na tabela "tracks"...');
            const { error: dbError } = await supabase.from('tracks').insert([
                {
                    title,
                    artist,
                    format,
                    price: parseFloat(price),
                    cover_url: coverUrl,
                    video_url: finalVideoUrl,
                    is_featured: false,
                }
            ]);

            if (dbError) {
                console.error('[DEBUG] Erro no banco de dados:', dbError);
                throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
            }

            console.log('[DEBUG] Faixa salva com sucesso!');

            // Reset form
            setSuccessMsg('Música cadastrada com sucesso!');
            setTitle('');
            setArtist('');
            setPrice('14.90');
            setFormat('MP3 320kbps');
            setCoverFile(null);
            setRumbleUrl('');

        } catch (error) {
            console.error('[ERROR] Falha geral no submit:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
            console.log('[DEBUG] Processo de submit finalizado.');
        }
    };

    return (
        <div className="flex-1 w-full max-w-[800px] mx-auto py-12 px-4 flex flex-col gap-8">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Upload de Faixa</h1>
                <p className="text-slate-500 mt-2">Adicione novos playbacks ao catálogo da plataforma.</p>
                <p className="text-xs text-primary font-bold mt-2 uppercase tracking-widest hidden">Admin logado: {user?.email}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl shadow-primary/5 ring-1 ring-slate-200 dark:ring-slate-800">

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-3">
                        <span className="material-symbols-outlined shrink-0">error</span>
                        <p>{errorMsg}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-3">
                        <span className="material-symbols-outlined shrink-0">check_circle</span>
                        <p>{successMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300">Título da Música</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100"
                                placeholder="Ex: Evidências (Playback)"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="artist" className="text-sm font-bold text-slate-700 dark:text-slate-300">Artista / Banda</label>
                            <input
                                id="artist"
                                name="artist"
                                type="text"
                                required
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100"
                                placeholder="Ex: Chitãozinho & Xororó"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="format" className="text-sm font-bold text-slate-700 dark:text-slate-300">Formato</label>
                            <select
                                id="format"
                                name="format"
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100"
                            >
                                <option value="MP3 320kbps">MP3 320kbps</option>
                                <option value="WAV Studio">WAV Studio</option>
                                <option value="MP3 Padrão">MP3 Padrão</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="price" className="text-sm font-bold text-slate-700 dark:text-slate-300">Preço (R$)</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="cover" className="text-sm font-bold text-slate-700 dark:text-slate-300">Imagem de Capa (JPG/PNG)</label>
                            <input
                                id="cover"
                                name="cover"
                                type="file"
                                accept="image/*"
                                required
                                onChange={(e) => setCoverFile(e.target.files[0])}
                                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-bold
                  file:bg-primary/10 file:text-primary
                  hover:file:bg-primary/20
                  cursor-pointer
                "
                            />
                            {coverFile && <p className="text-xs text-primary font-medium mt-1">{coverFile.name}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="rumbleUrl" className="text-sm font-bold text-slate-700 dark:text-slate-300">URL do Vídeo (Rumble)</label>
                            <input
                                id="rumbleUrl"
                                name="rumbleUrl"
                                type="url"
                                autoComplete="off"
                                required
                                value={rumbleUrl}
                                onChange={(e) => setRumbleUrl(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                placeholder="https://rumble.com/embed/XXXXX/"
                            />
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Use o link de "Embed" do Rumble</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/catalog')}
                            className="flex-1 h-12 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                                    Fazendo Upload...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">publish</span>
                                    Salvar Faixa
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
