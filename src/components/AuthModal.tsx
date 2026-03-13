import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Play, Mail, Lock, User as UserIcon, ArrowRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              avatar_url: `https://picsum.photos/seed/${Math.random()}/100/100`,
            }
          }
        });
        if (error) throw error;
        alert('Cadastro realizado com sucesso! Verifique seu e-mail (se configurado) ou faça login.');
        setIsLogin(true);
        setIsLoading(false);
        return;
      }
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-surface-dark border border-border-dark rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[80px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/5 blur-[80px] rounded-full" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-8 relative z-20">
              <img src="/logo.png" className="size-32 object-contain mb-4" alt="Logo" />
              <h2 className="text-xl font-bold text-white">
                {isLogin ? 'Entrar no Sistema' : 'Criar Sua Conta'}
              </h2>
              <p className="text-slate-400 text-xs mt-1 text-center">
                {isLogin 
                  ? 'Conecte-se para acessar playbacks e downloads ilimitados' 
                  : 'Junte-se a nós e comece sua jornada musical hoje'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-background-dark border border-border-dark rounded-xl pl-12 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-background-dark border border-border-dark rounded-xl pl-12 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background-dark border border-border-dark rounded-xl pl-12 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-background-dark font-black py-3 rounded-xl hover:opacity-90 transition-all neon-glow flex items-center justify-center gap-2 group text-sm"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Cadastrar'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center relative z-20">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 text-xs hover:text-primary transition-colors"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
