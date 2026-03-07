import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Video as VideoIcon,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Search,
  RefreshCw,
  Bell,
  PlusCircle,
  MoreVertical,
  Calendar,
  Eye,
  ThumbsUp,
  Share2,
  Plus,
  ChevronLeft,
  Play,
  Pause,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Maximize,
  Save,
  Check,
  Lock,
  User as UserIcon,
  Code,
  Music,
  FileText,
  Type,
  Clock,
  Sparkles,
  Info,
  TrendingUp,
  Users,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Video, User } from './types';
import { MOCK_VIDEOS } from './constants';
import { supabase } from './lib/supabase';
import { generateGrowthTips, optimizeMetadata } from './lib/gemini';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { createPreference } from './lib/mercadopago';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedVideos') || '[]'); } catch { return []; }
  });

  const [mp, setMp] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize Mercado Pago SDK
    if ((window as any).MercadoPago) {
      const mpInstance = new (window as any).MercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY, {
        locale: 'pt-BR'
      });
      setMp(mpInstance);
    }

    // Auth logic
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        updateUserState(session.user);
        setCurrentScreen('dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        updateUserState(session.user);
      } else {
        setUser(null);
        setCurrentScreen('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserState = async (supabaseUser: any) => {
    const email = supabaseUser.email || '';
    const isAdmin = email.toLowerCase() === 'joaquimcdacruz@gmail.com';

    // Fetch profile data - use maybeSingle to avoid 406 error if not found
    let { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    // If profile doesn't exist, create it (fail-safe for trigger)
    if (!profile && !fetchError) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.full_name || email.split('@')[0] || 'Usuário',
          email: email,
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          plan: 'free',
          view_count: 0
        })
        .select()
        .maybeSingle();

      if (!createError) {
        profile = newProfile;
      }
    }

    setUser({
      name: profile?.full_name || supabaseUser.user_metadata?.full_name || email.split('@')[0] || 'Usuário',
      email: email,
      avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || `https://picsum.photos/seed/${supabaseUser.id}/100/100`,
      plan: isAdmin ? 'Administrador' : (profile?.plan === 'pro' ? 'pro' : 'free'),
      viewCount: profile?.view_count || 0,
      memberSince: new Date(supabaseUser.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      isAdmin: isAdmin,
      planExpiresAt: profile?.plan_expires_at || null,
    });
  };

  const incrementViewCount = async () => {
    if (!user || user.plan === 'Administrador' || user.plan === 'pro') return;

    const newCount = (user.viewCount || 0) + 1;
    const { error } = await supabase
      .from('profiles')
      .update({ view_count: newCount })
      .eq('id', session?.user.id);

    if (!error) {
      setUser({ ...user, viewCount: newCount });
    }
  };

  const handleCheckout = async () => {
    try {
      const checkoutUrl = await createPreference(session?.user?.id || '');
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else {
        alert('Erro ao gerar o checkout. Tente novamente em instantes.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Ocorreu um erro ao processar seu pedido.');
    }
  };

  useEffect(() => {
    if (session) {
      fetchVideos();
    }
  }, [session]);

  const fetchVideos = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setDbError('Credenciais do Supabase não configuradas. Verifique as variáveis de ambiente.');
      setVideos([]);
      setIsLoadingVideos(false);
      return;
    }

    setIsLoadingVideos(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setVideos(data);
      } else {
        // Se o banco estiver vazio, mostramos uma lista vazia ou mocks apenas na primeira vez
        setVideos([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar vídeos:', err);
      setDbError(err.message || 'Erro ao conectar com o banco de dados.');
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const navigateTo = (screen: Screen, video: Video | null = null) => {
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
    if (video) setSelectedVideo(video);

    // Refresh data when returning to lists to show updated views/likes
    if (screen === 'dashboard' || screen === 'videos') {
      fetchVideos();
    }
  };

  if (currentScreen === 'home' && !session && !showAuth) {
    return <HomeScreen onStart={() => setShowAuth(true)} />;
  }

  if (!session || showAuth) {
    return <AuthScreen onAuthSuccess={() => { setShowAuth(false); setCurrentScreen('dashboard'); }} />;
  }



  if (!user) return null;

  return (
    <div
      className="flex min-h-screen bg-background-dark selection:bg-primary/30 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 border-r border-border-dark flex flex-col fixed h-full z-50 bg-surface-dark transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex flex-col items-center justify-center relative">
          <img src="/logo.png" className="w-40 h-auto object-contain" alt="Logo" />
          <button
            className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem
            icon={<LayoutGrid size={20} />}
            label="Dashboard"
            active={currentScreen === 'dashboard'}
            onClick={() => navigateTo('dashboard')}
          />
          <NavItem
            icon={<VideoIcon size={20} />}
            label="Meus Vídeos"
            active={currentScreen === 'videos'}
            onClick={() => navigateTo('videos')}
          />
          {user.isAdmin && (
            <NavItem
              icon={<BarChart3 size={20} />}
              label="Analíticas"
              active={currentScreen === 'analytics'}
              onClick={() => navigateTo('analytics')}
            />
          )}
          <NavItem
            icon={<SettingsIcon size={20} />}
            label="Configurações"
            active={currentScreen === 'settings'}
            onClick={() => navigateTo('settings')}
          />
        </nav>

        <div className="p-4 border-t border-border-dark">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setCurrentScreen('dashboard');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-4 md:px-8 bg-background-dark/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-8">
            <button
              className="md:hidden text-white hover:text-primary transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-base md:text-lg font-bold text-white truncate max-w-[150px] sm:max-w-none">
              {currentScreen === 'dashboard' && 'Biblioteca de Playbacks'}
              {currentScreen === 'videos' && 'Meus Playbacks'}
              {currentScreen === 'analytics' && 'Relatórios de Uso'}
              {currentScreen === 'settings' && 'Configurações de Perfil'}
              {currentScreen === 'upload' && 'Adicionar Playback'}
              {currentScreen === 'player' && 'Soltando a Voz'}
            </h1>

            {currentScreen === 'dashboard' && (
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Pesquisar playbacks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-surface-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2 justify-end">
                  {user.isAdmin && (
                    <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Admin</span>
                  )}
                  <p className="text-xs font-bold text-white">{user.name}</p>
                </div>
                <p className="text-[10px] text-primary/60">{user.isAdmin ? 'Controle Total' : (user.plan === 'pro' ? 'Usuário Pro' : 'Usuário Gratuito')}</p>
              </div>
              <img
                src={user.avatar}
                className={`size-8 rounded-full border ${user.isAdmin ? 'border-primary neon-glow' : 'border-primary/30'}`}
                alt="Avatar"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {currentScreen === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DashboardScreen
                  videos={videos}
                  onUpload={() => setCurrentScreen('upload')}
                  onVideoClick={(v) => navigateTo('player', v)}
                  isLoading={isLoadingVideos}
                  error={dbError}
                  onRefresh={fetchVideos}
                  user={user}
                  searchQuery={searchQuery}
                  onCheckout={handleCheckout}
                />
              </motion.div>
            )}

            {currentScreen === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <VideosScreen
                  videos={videos}
                  onVideoClick={(v) => navigateTo('player', v)}
                  isLoading={isLoadingVideos}
                  error={dbError}
                  onRefresh={fetchVideos}
                  user={user}
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {currentScreen === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AnalyticsScreen videos={videos} />
              </motion.div>
            )}

            {currentScreen === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettingsScreen user={user} onUpdate={setUser} onCheckout={handleCheckout} />
              </motion.div>
            )}

            {currentScreen === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <UploadScreen onSave={() => navigateTo('dashboard')} onCancel={() => navigateTo('dashboard')} />
              </motion.div>
            )}

            {currentScreen === 'player' && selectedVideo && (
              <motion.div
                key="player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PlayerScreen
                  video={selectedVideo}
                  videos={videos}
                  user={user}
                  onBack={() => {
                    setSelectedVideo(null);
                    setCurrentScreen('dashboard');
                  }}
                  onViewLimitReached={() => setShowPaywall(true)}
                  onIncrementView={incrementViewCount}
                  onNavigate={navigateTo}
                  savedVideoIds={savedVideoIds}
                  onToggleSaved={(id) => {
                    const newIds = savedVideoIds.includes(id)
                      ? savedVideoIds.filter(savedId => savedId !== id)
                      : [...savedVideoIds, id];
                    setSavedVideoIds(newIds);
                    localStorage.setItem('savedVideos', JSON.stringify(newIds));
                  }}
                />
              </motion.div>
            )}

            {/* Fallback to Dashboard if no screen matches and user is logged in */}
            {currentScreen === 'home' && user && session && (
              <motion.div
                key="dashboard-fallback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DashboardScreen
                  videos={videos}
                  onUpload={() => navigateTo('upload')}
                  onVideoClick={(v) => navigateTo('player', v)}
                  isLoading={isLoadingVideos}
                  error={dbError}
                  onRefresh={fetchVideos}
                  user={user}
                  searchQuery={searchQuery}
                  onCheckout={handleCheckout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {showPaywall && <PaywallModal onClose={() => { setShowPaywall(false); navigateTo('dashboard'); }} onCheckout={handleCheckout} />}


        <footer className="mt-auto p-8 text-center text-slate-500 text-xs border-t border-border-dark">
          <p>© 2024 Cante Comigo Video Management System. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all ${active
        ? 'bg-primary/10 text-primary neon-glow'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function DashboardScreen({ videos, onUpload, onVideoClick, isLoading, error, onRefresh, user, searchQuery, onCheckout }: { videos: Video[], onUpload: () => void, onVideoClick: (v: Video) => void, isLoading: boolean, error: string | null, onRefresh: () => void, user: User, searchQuery: string, onCheckout: () => void }) {

  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'drafts' | 'saved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedVideos') || '[]'); } catch { return []; }
  });

  const categories = ['Todos', 'Sertanejo', 'Pop', 'Rock', 'Gospel', 'MPB', 'Forró'];

  const filteredVideos = useMemo(() => {
    let base = videos;

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      base = base.filter(v =>
        (v.title || '').toLowerCase().includes(query) ||
        (v.description || '').toLowerCase().includes(query)
      );
    }

    // Category Filter
    if (selectedCategory !== 'Todos') {
      base = base.filter(v =>
        (v.category?.toLowerCase() === selectedCategory.toLowerCase()) ||
        (!v.category && selectedCategory === 'Sertanejo')
      );
    }

    // Tab Filter
    if (activeTab === 'recent') {
      // Sort by date (DD/MM/YYYY) descending
      return [...base].sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA).getTime();
        const dateB = new Date(yearB, monthB - 1, dayB).getTime();
        return dateB - dateA;
      }).slice(0, 6); // Top 6 recent
    }

    if (activeTab === 'drafts') {
      return base.filter(v => (v as any).status === 'draft');
    }
    if (activeTab === 'saved') {
      return base.filter(v => savedVideoIds.includes(v.id));
    }

    return base;
  }, [videos, activeTab, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-white">Painel de Vídeos</h2>
            {user.isAdmin && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-lg font-black uppercase tracking-widest neon-glow">Admin</span>
            )}
          </div>
          <p className="text-slate-400 mt-1">Sua biblioteca pessoal de playbacks e backing tracks profissionais</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <button
            onClick={onRefresh}
            className="bg-surface-dark text-slate-400 p-3 rounded-xl hover:text-white transition-all border border-border-dark"
            title="Atualizar Página"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {user.isAdmin && (
            <button
              onClick={onUpload}
              className="bg-primary text-background-dark font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all neon-glow"
            >
              <PlusCircle size={20} />
              Adicionar Novo Vídeo
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <Info size={18} />
          <span>Aviso: {error}</span>
        </div>
      )}

      {user.plan === 'free' && (
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold">Uso do Plano Gratuito</h4>
              <p className="text-slate-400 text-sm">Você assistiu {user.viewCount} de 50 vídeos disponíveis este mês.</p>
            </div>
          </div>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(user.viewCount / 50) * 100}%` }}
                className="h-full bg-primary neon-glow"
              />
            </div>
          </div>
          <button
            onClick={onCheckout}
            className="px-6 py-2 bg-primary text-background-dark font-black rounded-lg text-sm hover:opacity-90 transition-all font-sans uppercase tracking-tighter"
          >
            Fazer Upgrade Pro
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat
              ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20'
              : 'bg-surface-dark border-border-dark text-slate-400 hover:text-white hover:border-slate-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex overflow-x-auto whitespace-nowrap border-b border-border-dark no-scrollbar pb-1 gap-2 md:gap-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'all' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
        >
          <LayoutGrid size={16} /> Todos os Vídeos
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-6 py-3 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'recent' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
        >
          <Calendar size={16} /> Recentes
        </button>
        {user.isAdmin && (
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'drafts' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
            <FileText size={16} /> Rascunhos
          </button>
        )}
        {!user.isAdmin && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'saved' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
            <Save size={16} /> Salvos ({savedVideoIds.length})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-dark rounded-xl h-64 animate-pulse border border-border-dark" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-surface-dark p-16 rounded-3xl border border-border-dark text-center space-y-6">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            {activeTab === 'drafts' ? <FileText size={40} /> : <VideoIcon size={40} />}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              {activeTab === 'drafts' ? 'Nenhum Rascunho' : 'Nenhum Vídeo Encontrado'}
            </h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              {activeTab === 'drafts'
                ? 'Você ainda não possui vídeos salvos como rascunho.'
                : 'Sua biblioteca está vazia. Comece a carregar seu conteúdo agora mesmo.'}
            </p>
          </div>
          {activeTab !== 'drafts' && (
            <button
              onClick={onUpload}
              className="bg-primary text-background-dark font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all neon-glow"
            >
              Carregar Primeiro Vídeo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onVideoClick(video)}
              className="group bg-surface-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary transition-all cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-white">
                  {video.duration}
                </div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="text-white fill-current size-12" />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <h3 className="font-bold text-white line-clamp-1">{video.title}</h3>
                    {(video as any).status === 'draft' && (
                      <span className="text-[8px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded uppercase font-black flex-shrink-0">Rascunho</span>
                    )}
                  </div>
                  <button className="text-slate-500 hover:text-primary flex-shrink-0">
                    <MoreVertical size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-primary/60" /> {video.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye size={12} className="text-primary/60" /> {video.views} visualizações</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideosScreen({ videos, onVideoClick, isLoading, error, onRefresh, user, searchQuery }: { videos: Video[], onVideoClick: (v: Video) => void, isLoading: boolean, error: string | null, onRefresh: () => void, user: User, searchQuery: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const categories = ['Todos', 'Sertanejo', 'Pop', 'Rock', 'Gospel', 'MPB', 'Forró'];

  const filteredVideos = useMemo(() => {
    let base = videos;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      base = base.filter(v =>
        (v.title || '').toLowerCase().includes(query) ||
        (v.description || '').toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'Todos') {
      base = base.filter(v =>
        (v.category?.toLowerCase() === selectedCategory.toLowerCase()) ||
        (!v.category && selectedCategory === 'Sertanejo')
      );
    }

    return base;
  }, [videos, searchQuery, selectedCategory]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o vídeo "${title}"?`)) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      alert('Vídeo excluído com sucesso!');
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-white">Meus Vídeos</h2>
            {user.isAdmin && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-lg font-black uppercase tracking-widest neon-glow">Admin</span>
            )}
          </div>
          <p className="text-slate-400 mt-1">Gerencie e edite seus vídeos carregados</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-surface-dark text-slate-400 p-3 rounded-xl hover:text-white transition-all border border-border-dark"
          title="Atualizar Página"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat
              ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20'
              : 'bg-surface-dark border-border-dark text-slate-400 hover:text-white hover:border-slate-600'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <Info size={18} />
          <span>Aviso: {error}</span>
        </div>
      )}

      <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border-dark text-[10px] font-bold uppercase text-slate-500 tracking-widest bg-background-dark/30">
          <div className="col-span-9 md:col-span-5">Vídeo</div>
          <div className="hidden md:block col-span-2">Data</div>
          <div className="hidden md:block col-span-1">Duração</div>
          <div className="hidden md:flex col-span-2 items-center">Visualizações</div>
          <div className="col-span-3 md:col-span-2 text-right">Ações</div>
        </div>

        <div className="divide-y divide-border-dark">
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 animate-pulse bg-white/5" />
            ))
          ) : filteredVideos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum vídeo encontrado.</div>
          ) : (
            filteredVideos.map(video => (
              <div key={video.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                <div className="col-span-9 md:col-span-5 flex items-center gap-4">
                  <div className="hidden sm:block relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                    <img src={video.thumbnail} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => onVideoClick(video)}>{video.title}</h4>
                      {(video as any).status === 'draft' && (
                        <span className="text-[8px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter shrink-0">Rascunho</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate hidden sm:block">{video.description}</p>
                  </div>
                </div>
                <div className="hidden md:block col-span-2 text-xs text-slate-400 truncate">{video.date}</div>
                <div className="hidden md:block col-span-1 text-xs text-slate-400 font-mono">{video.duration}</div>
                <div className="hidden md:flex col-span-2 text-xs text-slate-400 items-center gap-1.5">
                  <Eye size={14} className="text-primary/60" /> {video.views}
                </div>
                <div className="col-span-3 md:col-span-2 flex justify-end gap-1 md:gap-2">
                  {user.isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          const code = video.embedCode || 'Código não disponível';
                          navigator.clipboard.writeText(code);
                          alert('Código copiado para a área de transferência!');
                        }}
                        className="p-2 text-slate-500 hover:text-primary transition-colors"
                        title="Ver Código"
                      >
                        <Code size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id, video.title)}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <LogOut size={18} className="rotate-180" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div >
  );
}

function AnalyticsScreen({ videos }: { videos: Video[] }) {
  const totalViews = useMemo(() =>
    videos.reduce((acc, v) => acc + (parseInt(v.views.replace(/[^0-9]/g, '')) || 0), 0),
    [videos]);

  const totalLikes = useMemo(() =>
    videos.reduce((acc, v) => acc + (parseInt(v.likes.replace(/[^0-9]/g, '')) || 0), 0),
    [videos]);

  const chartData = [
    { name: 'Seg', views: 400, likes: 240 },
    { name: 'Ter', views: 300, likes: 139 },
    { name: 'Qua', views: 200, likes: 980 },
    { name: 'Qui', views: 278, likes: 390 },
    { name: 'Sex', views: 189, likes: 480 },
    { name: 'Sáb', views: 239, likes: 380 },
    { name: 'Dom', views: 349, likes: 430 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Eye size={20} />} label="Total Views" value={totalViews.toLocaleString()} trend={videos.length > 0 ? "+100%" : "0%"} />
        <StatCard icon={<ThumbsUp size={20} />} label="Total Likes" value={totalLikes.toLocaleString()} trend={videos.length > 0 ? "+100%" : "0%"} />
        <StatCard icon={<Users size={20} />} label="Novos Inscritos" value={(totalViews * 0.05).toFixed(0)} trend="+5%" />
        <StatCard icon={<TrendingUp size={20} />} label="Taxa de Retenção" value="72%" trend="+1.2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-dark p-8 rounded-3xl border border-border-dark space-y-6">
          <h3 className="text-xl font-bold text-white">Crescimento de Visualizações</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#84cc16' }}
                />
                <Area type="monotone" dataKey="views" stroke="#84cc16" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-dark p-8 rounded-3xl border border-border-dark space-y-6">
          <h3 className="text-xl font-bold text-white">Engajamento Semanal</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="likes" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark space-y-4">
      <div className="flex items-center justify-between">
        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-slate-500 tracking-widest">{label}</p>
        <h4 className="text-2xl font-black text-white mt-1">{value}</h4>
      </div>
    </div>
  );
}
function SettingsScreen({ user, onUpdate, onCheckout }: { user: User, onUpdate: (u: User) => void, onCheckout: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: formData.name }
      });
      if (authError) throw authError;

      // 2. Update Public Profile Table
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.name,
            // Only update email if it was actually changed to avoid triggering auth emails unnecessarily
            ...(formData.email !== user.email ? { email: formData.email } : {})
          })
          .eq('id', session.session.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // We don't throw here because auth update succeeded, just log it
        }
      }

      onUpdate({ ...user, name: formData.name, email: formData.email });
      alert('Alterações salvas com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-surface-dark rounded-2xl p-4 md:p-8 border border-border-dark flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
        <div className="relative">
          <img
            src={user.avatar}
            className="size-20 md:size-24 rounded-full border-2 border-primary neon-glow object-cover"
            alt="Profile"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-0 right-0 bg-primary text-background-dark p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform">
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-white">{user.name}</h3>
            {user.isAdmin && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-lg font-black uppercase tracking-widest neon-glow">Administrador</span>
            )}
          </div>
          <p className="text-slate-400">{user.isAdmin ? 'Acesso Total ao Sistema' : user.plan} • Membro desde {user.memberSince}</p>
        </div>
        <button className="bg-primary text-background-dark font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all neon-glow">
          Alterar Foto
        </button>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <UserIcon size={20} />
            <h2 className="text-lg font-bold uppercase tracking-wider">Informações Pessoais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-surface-dark p-4 md:p-8 rounded-2xl border border-border-dark">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Lock size={20} />
            <h2 className="text-lg font-bold uppercase tracking-wider">Segurança</h2>
          </div>
          <div className="bg-surface-dark p-8 rounded-2xl border border-border-dark space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Senha Atual</label>
                <input type="password" placeholder="••••••••" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Nova Senha</label>
                <input type="password" placeholder="Mínimo 8 caracteres" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Confirmar Nova Senha</label>
                <input type="password" placeholder="Repita a nova senha" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => alert('Senha atualizada com sucesso!')}
                className="px-6 py-2.5 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all"
              >
                Atualizar Senha
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Bell size={20} />
            <h2 className="text-lg font-bold uppercase tracking-wider">Preferências de Notificação</h2>
          </div>
          <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark space-y-4">
            <ToggleItem title="Novos Comentários" description="Notificar quando alguém comentar em seus vídeos" defaultChecked />
            <ToggleItem title="Relatórios Semanais" description="Receba um resumo de performance por e-mail" defaultChecked />
          </div>
        </section>

        {!user.isAdmin && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={20} />
              <h2 className="text-lg font-bold uppercase tracking-wider">Meu Plano</h2>
            </div>
            <div className="bg-surface-dark p-8 rounded-2xl border border-border-dark">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${user.plan === 'pro' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-400 border border-border-dark'}`}>
                      {user.plan === 'pro' ? 'Usuário Pro ✨' : 'Usuário Gratuito'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {user.plan === 'pro'
                      ? user.planExpiresAt
                        ? `Válido até ${new Date(user.planExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                        : 'Acesso ilimitado a todos os playbacks e downloads de MP3.'
                      : `Você utilizou ${user.viewCount} de 50 visualizações disponíveis este mês.`}
                  </p>
                </div>
                {user.plan !== 'pro' && (
                  <button
                    onClick={onCheckout}
                    className="bg-primary text-background-dark font-black px-6 py-3 rounded-xl hover:opacity-90 transition-all neon-glow text-sm uppercase tracking-tight"
                  >
                    Fazer Upgrade Pro
                  </button>
                )}
              </div>
              {user.plan !== 'pro' && (
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min((user.viewCount / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{user.viewCount}/50 visualizações usadas</p>
                </div>
              )}
            </div>
          </section>
        )}
        <div className="flex items-center justify-between pt-6 border-t border-border-dark">
          <button
            onClick={() => confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')}
            className="text-slate-500 hover:text-red-500 font-medium transition-colors"
          >
            Excluir conta permanentemente
          </button>
          <div className="flex gap-4">
            <button className="px-8 py-2.5 border border-border-dark text-slate-400 font-bold rounded-xl hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-10 py-2.5 bg-primary text-background-dark font-bold rounded-xl hover:opacity-90 transition-all neon-glow disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ title, description, defaultChecked = false }: { title: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-background-dark/50 border border-transparent hover:border-primary/20 transition-all">
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-primary shadow-[0_0_10px_rgba(132,204,22,0.5)]' : 'bg-border-dark'}`}
      >
        <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}

function GrowthTipsToggle() {
  const [checked, setChecked] = useState(false);
  const [tips, setTips] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const newChecked = !checked;
    setChecked(newChecked);

    if (newChecked && !tips) {
      setIsLoading(true);
      const result = await generateGrowthTips({
        title: "Suas Estatísticas Gerais",
        description: "Análise baseada no seu canal e performance atual."
      });
      setTips(result);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-background-dark/50 border border-transparent hover:border-primary/20 transition-all">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-bold text-white">Dicas de Crescimento (IA)</p>
            <p className="text-sm text-slate-500">Sugestões baseadas em IA para melhorar seus vídeos</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-primary shadow-[0_0_10px_rgba(132,204,22,0.5)]' : 'bg-border-dark'}`}
        >
          <div className={`absolute top-1 size-4 rounded-full bg-white transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-slate-300 leading-relaxed">
              {isLoading ? (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Consultando Gemini AI...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{tips}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadScreen({ onCancel, onSave }: { onCancel: () => void, onSave: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    embed: '',
    thumbnail: '',
    duration: '05:00',
    category: 'Sertanejo',
    mp3_url: ''
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (!formData.title && !formData.description) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeMetadata(formData.title, formData.description);
      setFormData(prev => ({
        ...prev,
        title: optimized.title,
        description: optimized.description
      }));
    } catch (err) {
      console.error('Erro ao otimizar:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async (status: 'published' | 'draft' = 'published') => {
    if (!formData.embed || !formData.title || !formData.description) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    setIsSaving(true);

    try {
      console.log(`Tentando salvar vídeo (${status}) no Supabase:`, formData.title);
      const newVideo = {
        title: formData.title,
        description: formData.description,
        embedCode: formData.embed,
        thumbnail: formData.thumbnail || `https://picsum.photos/seed/${Math.random()}/800/450`,
        duration: formData.duration || '05:00',
        views: '0',
        date: new Date().toLocaleDateString('pt-BR'),
        author: 'Cante Comigo',
        authorAvatar: '/logo.png',
        subscribers: '6',
        likes: '0',
        category: formData.category,
        ...(formData.mp3_url ? { mp3_url: formData.mp3_url } : {}),
        status: status
      };

      const { data, error } = await supabase.from('videos').insert([newVideo]).select();
      if (error) throw error;

      console.log('Vídeo salvo com sucesso:', data);
      onSave();
    } catch (err: any) {
      console.error('Erro ao salvar no Supabase:', err);
      alert(`Erro ao salvar vídeo: ${err.message || 'Erro desconhecido'}. Verifique se a tabela 'videos' foi criada corretamente.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white">Cadastrar Novo Playback</h2>
        <p className="text-slate-400 mt-1">Adicione o link ou código de incorporação do áudio e preencha os detalhes para cantar.</p>
      </div>

      <div className="bg-surface-dark p-8 rounded-2xl border border-border-dark space-y-8">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-white">
            <Code size={16} className="text-primary" /> Código de Incorporação
          </label>
          <div className="relative">
            <textarea
              value={formData.embed}
              onChange={(e) => setFormData({ ...formData, embed: e.target.value })}
              placeholder="<script>(function(r,u,m,b,l,e){r._Rumble=b;...})</script>"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white h-32 focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
            />
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">JavaScript / HTML</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Formatos suportados: tags de script e embeds de iframe.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-white">
              <Type size={16} className="text-primary" /> Título do Vídeo
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: Meu Incrível Vlog de Viagem - Episódio 1"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock size={16} className="text-primary" /> Duração
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ex: 03:45"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText size={16} className="text-primary" /> URL do MP3 (Opcional)
            </label>
            <input
              type="text"
              value={formData.mp3_url}
              onChange={(e) => setFormData({ ...formData, mp3_url: e.target.value })}
              placeholder="ex: https://site.com/arquivo.mp3"
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Categoria / Gênero</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
          >
            <option value="Sertanejo">Sertanejo</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Gospel">Gospel</option>
            <option value="MPB">MPB</option>
            <option value="Forró">Forró</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing || (!formData.title && !formData.description)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isOptimizing ? 'Otimizando...' : 'Otimizar com IA'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-white">
            <Search size={16} className="text-primary" /> URL da Miniatura (Opcional)
          </label>
          <input
            type="text"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
          />
          <p className="text-[10px] text-slate-500">Se deixar em branco, uma imagem aleatória será gerada.</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText size={16} className="text-primary" /> Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Escreva uma breve descrição sobre o que é este vídeo..."
            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white h-32 focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border-dark">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] italic">
            <Info size={14} /> Todos os campos são obrigatórios para publicar.
          </div>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-2.5 border border-border-dark text-slate-400 font-bold rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-6 py-2.5 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FileText size={18} />
              Salvar Rascunho
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="px-8 py-2.5 bg-primary text-background-dark font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all neon-glow disabled:opacity-50"
            >
              {isSaving ? <div className="animate-spin size-4 border-2 border-background-dark border-t-transparent rounded-full" /> : <Save size={18} />}
              {isSaving ? 'Salvando...' : 'Publicar Vídeo'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark flex gap-4">
          <div className="text-primary"><Info size={24} /></div>
          <div>
            <h4 className="font-bold text-sm text-white mb-1">Onde encontrar o código?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Vá até o seu vídeo, clique em 'Embed' e prefira copiar o código de <b>Iframe</b> (Simple Iframe) para melhor compatibilidade.</p>
          </div>
        </div>
        <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark flex gap-4">
          <div className="text-primary"><Eye size={24} /></div>
          <div>
            <h4 className="font-bold text-sm text-white mb-1">Visualizando o Conteúdo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Após salvar, você poderá visualizar exatamente como o player aparecerá para seus visitantes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Container for cropping native controls - IMPORTANT: Define outside to prevent remounts
const CropContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative w-full h-full overflow-hidden bg-black aspect-video flex items-center justify-center select-none"
    onContextMenu={(e) => e.preventDefault()}
  >
    {/* On mobile (default), we crop heavily to remove both the top title and bottom controls of Rumble.
        On md screens, we use a more relaxed crop. */}
    <div className="absolute w-[180%] h-[220%] md:w-[120%] md:h-[140%] -top-[60%] -left-[40%] md:-top-[20%] md:-left-[10%]">
      {children}
    </div>
  </div>
);

function PlayerScreen({ video: initialVideo, videos, user, onBack, onViewLimitReached, onIncrementView, onNavigate, savedVideoIds, onToggleSaved }: { video: Video, videos: Video[], user: User | null, onBack: () => void, onViewLimitReached: () => void, onIncrementView: () => void, onNavigate: (screen: Screen, v: Video) => void, savedVideoIds: string[], onToggleSaved: (id: string) => void }) {
  const [video, setVideo] = useState(initialVideo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Block common "Download/Inspect" keyboard shortcuts - Must be at the top level
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    // Reset internal state when prop changes
    setVideo(initialVideo);
    setIsPlaying(false);
    setHasLiked(false);

    // Check limit before counting
    if (user && user.plan === 'free' && user.viewCount >= 50) {
      onViewLimitReached();
      return;
    }
    onIncrementView();
  }, [initialVideo.id]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Increment views when the player screen is opened
  useEffect(() => {
    const incrementViews = async () => {
      try {
        const { error } = await supabase
          .rpc('increment_video_views', { video_id: video.id });

        if (!error) {
          // Increment locally to avoid waiting for fetch
          const currentViewsNum = parseInt(video.views.replace(/[^0-9]/g, '')) || 0;
          const newViewsStr = (currentViewsNum + 1).toString();
          setVideo(prev => ({ ...prev, views: newViewsStr }));
        }
      } catch (err) {
        console.error('Erro ao incrementar visualizações:', err);
      }
    };

    incrementViews();
  }, [video.id]);

  const handleLike = async () => {
    if (hasLiked) return;

    try {
      const currentLikes = parseInt(video.likes.replace(/[^0-9]/g, '')) || 0;
      const newLikes = (currentLikes + 1).toString();

      const { error } = await supabase
        .from('videos')
        .update({ likes: newLikes })
        .eq('id', video.id);

      if (!error) {
        setVideo(prev => ({ ...prev, likes: newLikes }));
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Erro ao curtir vídeo:', err);
    }
  };

  // Script-based embeds need special handling because dangerouslySetInnerHTML doesn't execute scripts
  React.useEffect(() => {
    if (containerRef.current && video.embedCode) {
      const code = video.embedCode.trim();
      if (code.startsWith('<script') || code.includes('<script')) {
        containerRef.current.innerHTML = '';
        const range = document.createRange();
        try {
          const fragment = range.createContextualFragment(code);
          containerRef.current.appendChild(fragment);
        } catch (e) {
          console.error('Erro ao renderizar script do Player:', e);
          containerRef.current.innerHTML = '<div class="p-8 text-slate-400 text-center">Erro ao carregar o player. Tente usar o código de Iframe.</div>';
        }
      }
    }
  }, [video.embedCode]);

  const renderVideo = () => {
    if (!video.embedCode) return null;

    const code = video.embedCode.trim();

    // If it's a script, we handle it via the ref in useEffect
    if (code.startsWith('<script') || code.includes('<script')) {
      return (
        <CropContainer>
          <div ref={containerRef} className="w-full h-full flex items-center justify-center text-slate-500 font-medium bg-black" />
        </CropContainer>
      );
    }

    if (code.startsWith('<iframe')) {
      // Inject allow attribute and ensure 100% size
      const processedIframe = code
        .replace(/<iframe/, '<iframe style="width:100%; height:100%; border:none;"')
        .replace(/height="[^"]*"/, 'height="100%"')
        .replace(/width="[^"]*"/, 'width="100%"');

      return (
        <CropContainer>
          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: processedIframe }} />
        </CropContainer>
      );
    }

    // If it's just a URL, try to wrap it in an iframe
    if (code.startsWith('http')) {
      return (
        <CropContainer>
          <iframe
            src={code}
            className="w-full h-full border-none"
            allowFullScreen
            title={video.title}
          />
        </CropContainer>
      );
    }

    return <div className="p-8 text-slate-400 text-center">Código de incorporação inválido.</div>;
  };

  return (
    <div className="space-y-8">
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-primary/10 shadow-2xl isolate">
        <div className="w-full h-full relative z-0">
          {renderVideo()}
        </div>

        {/* Scrolling Marquee Bar (Overlay to hide Rumble controls) */}
        <div className="absolute inset-x-0 bottom-0 py-5 md:py-3 bg-primary/20 backdrop-blur-md border-t border-primary/30 overflow-hidden z-[9999] pointer-events-auto flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] text-white mx-8 flex items-center gap-2">
                <Music size={12} className="text-primary" /> baixe este audio em mp3 <Music size={12} className="text-primary" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="flex-1 space-y-4 md:space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary" /> Publicado em {video.date}</span>
            <span className="size-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5"><Eye size={16} className="text-primary" /> {video.views} visualizações</span>
            <span className="size-1 rounded-full bg-slate-700" />
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-primary' : 'hover:text-primary text-slate-400'}`}
            >
              <ThumbsUp size={16} className={hasLiked ? 'fill-current' : ''} /> {video.likes} curtidas
            </button>
          </div>
          <div className="pt-6 border-t border-border-dark">
            <p className="text-slate-300 text-lg leading-relaxed">{video.description}</p>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-4">
          <button
            onClick={onBack}
            className="w-full h-14 bg-primary text-background-dark font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all neon-glow"
          >
            <LayoutGrid size={20} /> Voltar ao Painel
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link do vídeo copiado!');
              }}
              className="h-12 bg-surface-dark border border-border-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 transition-all"
            >
              <Share2 size={18} /> Compartilhar
            </button>
            <button
              onClick={() => {
                onToggleSaved(video.id);
                const willBeSaved = !savedVideoIds.includes(video.id);
                alert(willBeSaved ? 'Vídeo salvo na aba Salvos! ✅' : 'Vídeo removido dos salvos.');
              }}
              className={`h-12 bg-surface-dark border font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${savedVideoIds.includes(video.id)
                ? 'border-primary text-primary'
                : 'border-border-dark text-white hover:border-primary/50'
                }`}
            >
              <Save size={18} /> {savedVideoIds.includes(video.id) ? 'Remover' : 'Salvar'}
            </button>
            {video.mp3_url && (
              <button
                onClick={() => {
                  if (user?.plan === 'pro') {
                    window.open(video.mp3_url, '_blank');
                  } else {
                    onViewLimitReached();
                  }
                }}
                className={
                  user?.plan === 'pro'
                    ? "h-12 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/20 transition-all col-span-2"
                    : "h-12 bg-gradient-to-r from-primary to-purple-500 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all col-span-2 neon-glow relative overflow-hidden group"
                }
              >
                {user?.plan === 'pro' ? (
                  <>
                    <Volume2 size={18} /> Baixar Arquivo MP3
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Baixar MP3
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full ml-1 tracking-wider uppercase">Seja Pro ✨</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-border-dark">
        <h3 className="text-xl font-bold text-white mb-6">Próximos Vídeos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {videos.filter(v => v.id !== video.id).slice(0, 3).map((v) => (
            <div key={v.id} className="group cursor-pointer space-y-3" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onNavigate('player', v);
            }}>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={v.title} referrerPolicy="no-referrer" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">{v.duration}</div>
              </div>
              <h4 className="font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">{v.title}</h4>
              <p className="text-xs text-slate-500">{v.author} • {v.views} visualizações</p>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}

function PaywallModal({ onClose, onCheckout }: { onClose: () => void, onCheckout: () => void }) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background-dark/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-surface-dark border border-primary/30 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />

        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-primary size-10" />
        </div>

        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Limite Atingido!</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Você assistiu aos 50 vídeos gratuitos ou tentou baixar um áudio. Atualize para o **Plano Pro** para ter acesso ilimitado e download de MP3.
        </p>

        <div className="bg-background-dark border border-border-dark rounded-2xl p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-dark">
            <span className="text-slate-200 font-bold">Plano Pro Mensal</span>
            <span className="text-primary font-black text-xl">R$ 34,90<span className="text-xs text-slate-500 font-normal">/mês</span></span>
          </div>
          <ul className="space-y-2">
            {[
              'Visualizações Ilimitadas',
              'Download de MP3 (Áudios)',
              'Suporte Prioritário'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <Check size={14} className="text-primary" /> {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-primary text-background-dark font-black py-4 rounded-xl hover:opacity-90 transition-all neon-glow shadow-lg shadow-primary/20 font-sans uppercase tracking-tight"
            onClick={onCheckout}
          >
            Assinar Agora
          </button>

          <button
            onClick={onClose}
            className="text-slate-500 text-sm font-bold hover:text-white transition-colors"
          >
            Voltar para o Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
