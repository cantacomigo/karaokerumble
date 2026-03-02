import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
    const { user, profile, signOut } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            console.log('Header: Iniciando logout...');
            await signOut();
            console.log('Header: Logout concluído, redirecionando...');
            // Forçamos o redirecionamento para a página inicial e recarregamento para limpar totalmente o estado
            window.location.href = '/';
        } catch (error) {
            console.error('Header: Erro no logout:', error);
            window.location.href = '/';
        }
    };
    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-10 py-3">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-3xl">mic_external_on</span>
                        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-slate-100">Karaoke Studio</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/">Início</Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/catalog">Catálogo</Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/plans">Pacotes</Link>
                        <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Suporte</a>
                    </nav>
                </div>

                {/* Auth & Cart Area */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/library" className="flex items-center gap-3 cursor-pointer group">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                        {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Joaquim'}
                                    </p>
                                    <p className="text-xs text-primary font-medium uppercase tracking-wider">
                                        {profile ? (
                                            profile.plan_type === 'admin' ? 'Acesso Total / Admin' :
                                                profile.plan_type === 'premium' ? 'Plano Premium' :
                                                    profile.plan_type === 'pro' ? 'Plano Pro' : 'Plano Básico'
                                        ) : (
                                            user?.email === 'joaquimcdacruz@gmail.com' ? 'Acesso Total / Admin' : 'Carregando...'
                                        )}
                                    </p>
                                </div>
                                <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden group-hover:border-primary transition-colors flex items-center justify-center">
                                    {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                                        <img
                                            src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-primary">
                                            {(profile?.full_name || user?.user_metadata?.full_name || 'J').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            {user?.email === 'joaquimcdacruz@gmail.com' && (
                                <Link to="/upload" className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-500 hover:text-white transition-all cursor-pointer text-sm hidden lg:flex">
                                    <span className="material-symbols-outlined text-[18px]">upload</span>
                                    Fazer Upload
                                </Link>
                            )}

                            <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center size-10 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ml-2"
                                title="Sair"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">login</span>
                            <span className="hidden sm:block">Entrar</span>
                        </Link>
                    )}

                    <Link to="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors text-slate-700 dark:text-slate-300 ml-2">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
