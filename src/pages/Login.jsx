import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
                navigate('/library'); // Vai para a biblioteca após logar
            } else {
                await signUp(email, password, fullName);
                // Após criar a conta, faz login automaticamente (o hook de auth já lida com a sessão)
                navigate('/library');
            }
        } catch (error) {
            if (error.message.includes('Invalid login credentials')) {
                setErrorMsg('Email ou senha incorretos.');
            } else if (error.message.includes('User already registered')) {
                setErrorMsg('Este email já está cadastrado.');
            } else {
                setErrorMsg(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-primary/5 ring-1 ring-primary/10 relative overflow-hidden">
                {/* Enfeite visual */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-fuchsia-500"></div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-12 bg-primary/10 text-primary rounded-xl mb-4">
                        <span className="material-symbols-outlined text-2xl">
                            {isLogin ? 'login' : 'person_add'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta VIP'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isLogin
                            ? 'Acesse sua biblioteca de faixas premium'
                            : 'Junte-se a milhares de cantores e solte a voz'}
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-3">
                        <span className="material-symbols-outlined shrink-0 text-lg">error</span>
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="fullName" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nomo Completo</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">person</span>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required={!isLogin}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                                    placeholder="Seu nome artístico"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">mail</span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">Senha</label>
                            {isLogin && (
                                <a href="#" className="text-xs text-primary font-medium hover:underline">Esqueceu?</a>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">lock</span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                        {!isLogin && <p className="text-xs text-slate-500 mt-1">Mínimo de 6 caracteres.</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 h-12 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">sync</span>
                        ) : isLogin ? (
                            'Entrar'
                        ) : (
                            'Criar Conta'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isLogin ? "Ainda não é VIP?" : "Já possui uma conta?"}{' '}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMsg('');
                            }}
                            className="text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Cadastre-se grátis' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
