-- ==============================================================================
-- STORAGE (BUCKETS) E POLÍTICAS DE ACESSO AOS ARQUIVOS (FASE 3 - UPLOADS)
-- Rode este script no SQL Editor do seu projeto Supabase.
-- ==============================================================================

-- Apenas admins (ou auth users nesse caso pra simplificar) podem inserir novas faixas
-- Atenção: Se essa política já existir, o Supabase ignorará o erro ou você pode pular esta linha.
CREATE POLICY "Usuários autenticados podem inserir faixas" ON public.tracks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Cria os buckets se não existirem (Pode dar erro se tentar criar pelo SQL Editor dependendo das permissões, 
-- caso dê erro, crie os buckets "covers" e "audio" manualmente pelo Dashboard do Supabase e marque-os como Public)
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true) ON CONFLICT DO NOTHING;

-- Acesso Público de Leitura para Capas e Áudios
CREATE POLICY "Public Access to Covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Public Access to Audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');

-- Usuários Autenticados podem fazer Upload de Capas e Áudios
CREATE POLICY "Auth Insert Covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Insert Audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');
