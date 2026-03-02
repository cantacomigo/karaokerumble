-- ==============================================================================
-- STORAGE (BUCKETS) E POLÍTICAS DE ACESSO AOS ARQUIVOS (FASE 3 - UPLOADS)
-- Rode este script no SQL Editor do seu projeto Supabase.
-- ==============================================================================

-- Apenas admins (ou auth users nesse caso pra simplificar) podem inserir novas faixas
DROP POLICY IF EXISTS "Usuários autenticados podem inserir faixas" ON public.tracks;
CREATE POLICY "Usuários autenticados podem inserir faixas" ON public.tracks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Cria os buckets se não existirem
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
