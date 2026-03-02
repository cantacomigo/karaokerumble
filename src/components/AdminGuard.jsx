import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'joaquimcdacruz@gmail.com';

export default function AdminGuard() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
            </div>
        );
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
