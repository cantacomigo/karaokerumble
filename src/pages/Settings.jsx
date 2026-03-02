import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Settings() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulando um salvamento
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="flex-1 w-full max-w-[800px] mx-auto py-12 px-4 flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Link to="/library" className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Configurações</h1>
                    <p className="text-slate-500">Gerencie sua conta e preferências.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Tab Estilo Mock */}
                <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-bold text-left">
                        <span className="material-symbols-outlined">person</span>
                        Perfil
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium text-left">
                        <span className="material-symbols-outlined">notifications</span>
                        Notificações
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium text-left">
                        <span className="material-symbols-outlined">security</span>
                        Segurança
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium text-left text-red-500">
                        <span className="material-symbols-outlined">delete_forever</span>
                        Excluir Conta
                    </button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 flex flex-col gap-8">
                    {/* Perfil Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-primary/5 ring-1 ring-slate-200 dark:ring-slate-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Informações Pessoais
                        </h2>

                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            <div className="flex items-center gap-6 mb-2">
                                <div className="size-20 rounded-full border-4 border-primary/20 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${profile?.avatar_url || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"})` }}></div>
                                <button type="button" className="text-sm font-bold text-primary hover:underline">Alterar Foto</button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                                <input
                                    type="text"
                                    defaultValue={profile?.full_name || ''}
                                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="flex flex-col gap-2 opacity-60">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email (Não alterável)</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="w-full h-12 px-4 bg-slate-100 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                ) : success ? (
                                    <>
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Salvo com sucesso!
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Subscription Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-primary/5 ring-1 ring-slate-200 dark:ring-slate-800 border-l-4 border-primary">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">verified</span>
                                Seu Plano
                            </h2>
                            <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded">Ativo</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Você está no plano <strong>{profile?.plan_type === 'admin' ? 'Administrador' : 'VIP Premium'}</strong>.</p>
                        <Link to="/plans" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                            Ver outros planos e detalhes
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
