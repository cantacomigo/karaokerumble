import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase';

export default function Plans() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);

    const handleSubscribe = async (planId, planName, planPrice) => {
        if (!user) {
            navigate('/login', { state: { from: '/plans' } });
            return;
        }

        try {
            setLoadingPlan(planId);

            // Chamar a Edge Function para criar a preferência
            const { data, error } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    planId,
                    planName,
                    planPrice,
                    userId: user.id
                }
            });

            if (error) throw error;

            // Redirecionar para o Checkout do Mercado Pago
            if (data?.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error('Não foi possível gerar o link de pagamento.');
            }
        } catch (error) {
            console.error('Erro no checkout:', error.message);
            alert('Erro ao iniciar pagamento. Tente novamente em instantes.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const plans = [
        {
            id: 'basic',
            name: 'Básico',
            price: 29.90,
            features: [
                'Acesso a 10 playbacks por mês',
                'Qualidade MP3 320kbps',
                'Suporte via E-mail'
            ],
            popular: false
        },
        {
            id: 'pro',
            name: 'Profissional',
            price: 59.90,
            features: [
                'Acesso a 50 playbacks por mês',
                'Qualidade WAV High-Fidelity',
                'Download ilimitado de lançamentos',
                'Suporte Prioritário 12h'
            ],
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 99.90,
            features: [
                'Playbacks ilimitados (Catálogo Full)',
                'Qualidade Master WAV 24-bit',
                'Acesso antecipado a lançamentos',
                'Suporte VIP WhatsApp 24h'
            ],
            popular: false
        }
    ];

    return (
        <div className="flex-1 flex flex-col items-center py-12 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto w-full">
            <div className="text-center mb-12 flex flex-col items-center gap-4">
                <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Torne-se uma Estrela</span>
                <h1 className="text-slate-900 dark:text-slate-100 text-4xl md:text-5xl font-black leading-tight tracking-tight">Planos de Assinatura VIP</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                    Escolha o plano ideal para soltar a voz com qualidade profissional de estúdio. Acesso imediato a milhares de faixas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-20">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`group flex flex-col gap-8 rounded-xl border ${plan.popular ? 'border-2 border-primary scale-105 shadow-2xl shadow-primary/10 bg-white dark:bg-slate-900' : 'border-primary/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm ring-1 ring-primary/5'} p-8 transition-all relative overflow-hidden`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-lg">
                                Mais Popular
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <h3 className={`${plan.popular ? 'text-primary' : 'text-slate-500'} text-sm font-bold uppercase tracking-wider`}>{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-slate-900 dark:text-slate-100 text-4xl font-black tracking-tight">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                                <span className="text-slate-500 text-sm font-medium">/mês</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => handleSubscribe(plan.id, plan.name, plan.price)}
                            disabled={loadingPlan === plan.id}
                            className={`mt-auto flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 transition-all ${plan.popular ? 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'} text-sm font-bold disabled:opacity-50 disabled:cursor-wait`}
                        >
                            {loadingPlan === plan.id ? (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    Iniciando...
                                </div>
                            ) : 'Assinar Agora'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Comparison Table & Footer remains the same */}
            <div className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight tracking-tight">Comparar Planos</h2>
                    <p className="text-slate-500 text-sm">Compare detalhadamente todos os recursos disponíveis em cada modalidade.</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-primary/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm ring-1 ring-primary/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10">
                                <th className="px-6 py-4 text-slate-500 text-sm font-bold uppercase tracking-widest">Recursos</th>
                                <th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">Básico</th>
                                <th className="px-6 py-4 text-primary text-sm font-bold">Profissional</th>
                                <th className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">Premium</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            <tr className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">Downloads Mensais</td>
                                <td className="px-6 py-4 text-slate-500 text-sm font-medium">10 Faixas</td>
                                <td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">50 Faixas</td>
                                <td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">Ilimitado</td>
                            </tr>
                            <tr className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">Qualidade Máxima</td>
                                <td className="px-6 py-4 text-slate-500 text-sm font-medium">MP3 320kbps</td>
                                <td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">WAV High-Fi</td>
                                <td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-sm font-bold">WAV Studio Master</td>
                            </tr>
                            <tr className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">Lançamentos da Semana</td>
                                <td className="px-6 py-4 text-slate-500 text-sm font-medium">Não incluso</td>
                                <td className="px-6 py-4"><span className="material-symbols-outlined text-primary">check</span></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">check</span>
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded uppercase font-bold">VIP</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">Offline App Sync</td>
                                <td className="px-6 py-4"><span className="material-symbols-outlined text-slate-300 dark:text-slate-700">close</span></td>
                                <td className="px-6 py-4"><span className="material-symbols-outlined text-primary">check</span></td>
                                <td className="px-6 py-4"><span className="material-symbols-outlined text-primary">check</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-20 w-full rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                <div className="flex flex-col gap-2">
                    <h4 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Dúvidas sobre o melhor plano?</h4>
                    <p className="text-slate-500">Nossa equipe de suporte está pronta para te ajudar a escolher a melhor opção para sua carreira ou hobby.</p>
                </div>
                <button className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-transparent border border-primary text-primary text-sm font-bold transition-all hover:bg-primary hover:text-white shadow-sm ring-1 ring-primary/5">
                    Falar com Especialista
                </button>
            </div>
        </div>
    );
}
