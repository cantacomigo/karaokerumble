import { useAudio } from '../context/AudioContext';

export default function MiniPlayer() {
    const { currentTrack, isPlaying, progress, currentTime, totalTime, playTrack, seekTrack, isVideo } = useAudio();

    // Oculta o player se não houver música selecionada
    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            {/* Rumble Video Embed (Aparece acima do player quando é vídeo) */}
            {isVideo && (
                <div className="absolute bottom-full right-4 mb-4 w-[320px] aspect-video rounded-xl bg-black border-2 border-primary shadow-2xl overflow-hidden group">
                    <iframe
                        src={currentTrack.video_url.startsWith('http')
                            ? `${currentTrack.video_url}${currentTrack.video_url.includes('?') ? '&' : '?'}pub=4ovzcy`
                            : `https://rumble.com/embed/${currentTrack.video_url.replace('/', '')}/?pub=4ovzcy`
                        }
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <div className="bg-slate-900/95 dark:bg-[#1f1022]/95 backdrop-blur-md border-t border-primary/20 p-2 md:p-3 shadow-2xl">
                <div className="mx-auto max-w-[1200px] flex items-center justify-between gap-4 px-2">

                    {/* Info da Música */}
                    <div className="flex items-center gap-3 md:gap-4 w-1/3 min-w-48">
                        <div className="size-10 md:size-12 rounded bg-slate-800 overflow-hidden shrink-0 hidden sm:block">
                            <img
                                src={currentTrack.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I"}
                                alt="Album Art"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-white font-bold text-xs md:text-sm truncate">{currentTrack.title}</p>
                            <p className="text-slate-400 text-xs truncate">{currentTrack.artist}</p>
                        </div>
                        <button className="text-slate-400 hover:text-primary transition-colors ml-auto shrink-0 hidden md:block">
                            <span className="material-symbols-outlined text-lg">favorite</span>
                        </button>
                    </div>

                    {/* Controles do Player */}
                    <div className="flex flex-col items-center gap-1 w-full max-w-xl">
                        <div className="flex items-center gap-4 md:gap-6">
                            <button className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                                <span className="material-symbols-outlined text-xl">shuffle</span>
                            </button>
                            <button className="text-slate-300 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">skip_previous</span>
                            </button>

                            <button
                                onClick={() => playTrack(currentTrack)}
                                className="size-10 md:size-12 rounded-full bg-primary flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-2xl md:text-3xl">
                                    {isPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </button>

                            <button className="text-slate-300 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">skip_next</span>
                            </button>
                            <button className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                                <span className="material-symbols-outlined text-xl">repeat</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full text-xs text-slate-400 font-medium font-mono">
                            <span>{currentTime}</span>
                            <div
                                className="flex-1 h-1.5 md:h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer relative group"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                                    seekTrack(percentage);
                                }}
                            >
                                {/* Barra de Progresso */}
                                <div
                                    className="h-full bg-primary relative group-hover:bg-primary/90"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
                                </div>
                            </div>
                            <span>{totalTime}</span>
                        </div>
                    </div>

                    {/* Controles Extras (Volume, etc) */}
                    <div className="flex items-center justify-end gap-3 w-1/3 min-w-24 shrink-0">
                        <button className="text-slate-400 hover:text-white transition-colors hidden lg:block">
                            <span className="material-symbols-outlined text-xl">mic</span>
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-xl">volume_up</span>
                        </button>
                        <div className="w-16 md:w-24 h-1 md:h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                            <div className="w-2/3 h-full bg-slate-300"></div>
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors hidden md:block ml-2">
                            <span className="material-symbols-outlined text-xl">queue_music</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
