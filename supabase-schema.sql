-- ==============================================================================
-- SCHEMA DO KARAOKÊ VIP STUDIO
-- Rode este script no SQL Editor do seu projeto Supabase.
-- ==============================================================================

-- 1. Tabela de Perfis (Vinculada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('free', 'basic', 'pro', 'premium')),
  active_plan BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para criar o perfil automaticamente quando um usuário se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabela de Playbacks / Músicas (Catálogo)
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT, -- Ex: '04:35'
  key TEXT,      -- Ex: 'G Maior'
  format TEXT DEFAULT 'MP3 320kbps',
  price NUMERIC(10,2) NOT NULL DEFAULT 14.90,
  audio_url TEXT, -- URL pública do bucket de storage do Supabase
  video_url TEXT, -- URL de embed do Rumble
  cover_url TEXT, -- Capa da música
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. Tabela de Compras (Biblioteca do Usuário)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
  price_paid NUMERIC(10,2) NOT NULL,
  format_purchased TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- INSERÇÃO DE DADOS DE TESTE (MOCKS)
-- ==============================================================================
INSERT INTO public.tracks (title, artist, duration, key, price, is_featured, cover_url, audio_url)
VALUES 
  ('Evidências (Playback)', 'Chitãozinho & Xororó', '04:35', 'G Maior', 14.90, true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
  ('Bohemian Rhapsody', 'Queen', '05:54', 'Bb Maior', 19.90, true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
  ('Como Nossos Pais', 'Elis Regina', '04:42', 'D Maior', 14.90, false, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
  ('Shallow (Ao Vivo)', 'Lady Gaga, Bradley Cooper', '03:36', 'G Maior', 19.90, true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
  ('Cheia de Manias', 'Raça Negra', '03:41', 'C Maior', 14.90, false, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB50_9vSQ7ZnCPwIJ_cPBkZbYi3gXsxtCfc7rrI50abc2AoilC0rsi03-UUboKxl075D5WdEfsMs1_DVMhegC2fQs87ueMkmvdLeEjw8Pf3_2WLcDyMp50A1ygQsh2AyG6u1eIFcDl58zBnfdt0L_-2tBBp42jht6e9bRvSwfonRgr8OY5fDrp3l6pU7RAHgg6a0VbVNnlZinpDujx9hRhNHVGlXPekDzQW6CeeUuzaUsiMjbF0UBS3eGF5wbP0RDvlHw--s3FWr8I', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3');


-- ==============================================================================
-- RLS (Row Level Security) - REGRAS DE ACESSO
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Regras para Tracks
DROP POLICY IF EXISTS "Public Read Access" ON public.tracks;
CREATE POLICY "Public Read Access" ON public.tracks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Access" ON public.tracks;
CREATE POLICY "Admin All Access" ON public.tracks 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'joaquimcdacruz@gmail.com');

-- Regras para Profiles
DROP POLICY IF EXISTS "Usuário lê próprio perfil" ON public.profiles;
CREATE POLICY "Usuário lê próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Regras para Purchases
DROP POLICY IF EXISTS "Usuários veem próprias compras" ON public.purchases;
CREATE POLICY "Usuários veem próprias compras" ON public.purchases FOR SELECT USING (auth.uid() = user_id);


-- ==============================================================================
-- STORAGE (BUCKETS) E POLÍTICAS DE ACESSO AOS ARQUIVOS
-- ==============================================================================

-- Cria os buckets se não existirem (Pode dar erro se tentar criar pelo SQL Editor dependendo das permissões, 
-- caso dê erro, crie os buckets "covers" e "audio" manualmente pelo Dashboard do Supabase e marque-os como Public)
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true) ON CONFLICT DO NOTHING;

-- Acesso Público de Leitura para Capas e Áudios
DROP POLICY IF EXISTS "Public Access to Covers" ON storage.objects;
CREATE POLICY "Public Access to Covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Public Access to Audio" ON storage.objects;
CREATE POLICY "Public Access to Audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');

-- Usuários Autenticados podem fazer Upload de Capas e Áudios
DROP POLICY IF EXISTS "Auth Insert Covers" ON storage.objects;
CREATE POLICY "Auth Insert Covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Insert Audio" ON storage.objects;
CREATE POLICY "Auth Insert Audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');
