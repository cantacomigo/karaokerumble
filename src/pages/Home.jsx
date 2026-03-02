import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10 md:py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0"></div>
                <div className="z-10 flex max-w-4xl flex-col items-center gap-6 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-slate-100">
                        Cante como um <span className="text-primary">Profissional</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                        Acesse o maior catálogo de playbacks de alta qualidade da América Latina.
                        Vozes de apoio, tons originais e arranjos perfeitos para o seu show.
                    </p>
                    <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row mt-4">
                        <Link to="/catalog" className="flex flex-1 items-center justify-center rounded-xl bg-primary px-6 h-12 text-base font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 cursor-pointer">
                            Explorar Catálogo
                        </Link>
                        <Link to="/plans" className="flex flex-1 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 px-6 h-12 text-base font-bold text-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer">
                            Ver Planos VIP
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <div className="mx-auto w-full max-w-[1200px] px-4 md:px-10 py-10">
                <div className="flex items-end justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Lançamentos da Semana</h2>
                    <Link to="/catalog" className="text-sm font-bold text-primary hover:underline">Ver todos</Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="group flex flex-col gap-3">
                            <div
                                className="relative aspect-square w-full rounded-xl bg-cover bg-center overflow-hidden shadow-md"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I")' }}
                            >
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                    <button className="flex size-12 items-center justify-center rounded-full bg-primary text-white hover:scale-110 active:scale-95 transition-transform shadow-lg">
                                        <span className="material-symbols-outlined text-2xl">play_arrow</span>
                                    </button>
                                    <button className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors backdrop-blur-md">
                                        <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p className="text-base text-slate-900 dark:text-slate-100 font-bold leading-tight truncate">Evidências (Playback)</p>
                                <p className="text-sm text-slate-500 truncate">Chitãozinho & Xororó</p>
                                <p className="text-sm font-bold text-primary mt-1">R$ 14,90</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
