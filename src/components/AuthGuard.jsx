import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
                <p className="text-slate-500 font-medium">Autenticando...</p>
            </div>
        );
    }

    if (!user) {
        // Redireciona para o login se não estiver autenticado
        return <Navigate to="/login" replace />;
    }

    // Se passou children (como wrapper) renderiza, senão usa Outlet para rotas aninhadas
    return children ? children : <Outlet />;
}
