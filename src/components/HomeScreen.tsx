import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Shield, ChevronRight, Check } from 'lucide-react';

export function HomeScreen({ onStart }: { onStart: () => void }) {
    return (
        <div className="min-h-screen bg-background-dark text-white overflow-hidden font-sans">
            {/* Navigation */}
            <nav className="h-20 border-b border-border-dark flex items-center justify-between px-8 md:px-20 bg-background-dark/50 backdrop-blur-xl fixed w-full z-[100]">
                <div className="flex items-center">
                    <img src="/logo.png" className="size-20 md:size-24 object-contain" alt="Logo" />
                </div>
                <div className="flex items-center gap-8">
                    <button
                        onClick={onStart}
                        className="text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        Entrar
                    </button>
                    <button
                        onClick={onStart}
                        className="bg-primary text-background-dark font-black px-6 py-2.5 rounded-xl hover:opacity-90 transition-all neon-glow text-sm cursor-pointer"
                    >
                        Começar Grátis
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-40 pb-20 px-8 text-center min-h-screen flex flex-col items-center justify-center">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto space-y-8 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-primary mb-4 tracking-wider uppercase">
                        <Sparkles size={14} /> Áudio de Alta Fidelidade & Estúdio Virtual
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase">
                        Sua Voz, <br /> <span className="text-primary italic">Nossa Orquestra</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mt-6">
                        A maior biblioteca de playbacks profissionais do Brasil. Solte a voz com a qualidade de um estúdio no conforto da sua casa.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                        <button
                            onClick={onStart}
                            className="group bg-primary text-background-dark font-black px-10 py-5 rounded-2xl flex items-center gap-3 hover:opacity-90 transition-all neon-glow text-lg uppercase tracking-tighter cursor-pointer"
                        >
                            Começar a Cantar Agora
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onStart}
                            className="bg-white/5 border border-white/10 text-white font-bold px-10 py-5 rounded-2xl hover:bg-white/10 transition-all text-lg cursor-pointer"
                        >
                            Ver Demonstração
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-16 max-w-4xl mx-auto rounded-3xl overflow-hidden relative z-10"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10" />
                    <img
                        src="/logo.png"
                        className="w-full h-auto max-h-[400px] object-contain p-8 md:p-12 drop-shadow-2xl"
                        alt="Logo Preview"
                    />
                </motion.div>
            </main>

            {/* Features */}
            <section className="py-20 px-8 max-w-7xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
                <FeatureCard
                    icon={<Sparkles className="text-primary" size={32} />}
                    title="Qualidade de Estúdio"
                    description="Áudios masterizados profissionalmente para amadores e profissionais brilharem."
                />
                <FeatureCard
                    icon={<TrendingUp className="text-primary" size={32} />}
                    title="Grande Repertório"
                    description="Milhares de playbacks em diversos gêneros com atualizações semanais."
                />
                <FeatureCard
                    icon={<Shield className="text-primary" size={32} />}
                    title="Acesso Offline"
                    description="Cante onde quiser. Baixe seus playbacks favoritos em alta fidelidade."
                />
            </section>

            {/* Pricing Teaser */}
            <section className="py-20 px-8 bg-surface-dark/50 border-y border-border-dark relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Planos para todo criador</h2>
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div className="bg-background-dark p-8 rounded-3xl border border-white/5 space-y-6">
                            <h3 className="text-xl font-bold">Plano Gratuito</h3>
                            <p className="text-slate-400 text-sm">Ideal para iniciantes no mundo do conteúdo.</p>
                            <div className="text-4xl font-black">Grátis</div>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> 50 playbacks por mês</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Qualidade Standard (192kbps)</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Reprodutor Web</li>
                            </ul>
                            <button
                                onClick={onStart}
                                className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                            >
                                Começar Grátis
                            </button>
                        </div>
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 space-y-6 relative overflow-hidden">
                            <div className="absolute top-6 right-6 bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Recomendado</div>
                            <h3 className="text-xl font-bold">Plano Pro</h3>
                            <p className="text-slate-400 text-sm">Voz perfeita com áudio sem perdas.</p>
                            <div className="text-4xl font-black">R$ 34,90<span className="text-sm font-normal text-slate-500">/mês</span></div>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Playbacks ilimitados</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Qualidade Master (MP3/320kbps)</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Download Offline</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-primary" /> Suporte prioritário</li>
                            </ul>
                            <button
                                onClick={onStart}
                                className="w-full bg-primary text-background-dark font-black py-3 rounded-xl hover:opacity-90 transition-all neon-glow cursor-pointer"
                            >
                                Assinar Agora
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 text-center border-t border-border-dark opacity-40 relative z-10">
                <div className="flex items-center justify-center gap-5 mb-8">
                    <img src="/logo.png" className="size-20 object-contain grayscale" alt="Logo" />
                </div>
                <p className="text-xs">© 2024 Cante Comigo Platform. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-surface-dark p-10 rounded-3xl border border-white/5 hover:border-primary/20 transition-all hover:translate-y-[-4px] group">
            <div className="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
