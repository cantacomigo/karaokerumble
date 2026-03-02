import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MiniPlayer from './MiniPlayer';

export default function Layout() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <Header />
            <main className="flex-1 pb-24">
                {/* Adicionado padding bottom pb-24 para não esconder conteúdo atrás do MiniPlayer */}
                <Outlet />
            </main>
            <Footer />
            <MiniPlayer />
        </div>
    );
}
