-- ==============================================================================
-- ATUALIZAÇÃO PARA PAGAMENTOS MERCADO PAGO
-- ==============================================================================

-- 1. Tabela de Transações/Assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mp_preference_id TEXT, -- ID da preferência no Mercado Pago
  mp_payment_id TEXT,    -- ID do pagamento após conclusão
  plan_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, authorized, in_process, rejected, cancelled
  payment_method TEXT, -- pix, credit_card, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas suas transações
DROP POLICY IF EXISTS "Usuários veem próprias transações" ON public.subscriptions;
CREATE POLICY "Usuários veem próprias transações" ON public.subscriptions 
FOR SELECT USING (auth.uid() = user_id);

-- Admin vê tudo
DROP POLICY IF EXISTS "Admin vê tudo nas transações" ON public.subscriptions;
CREATE POLICY "Admin vê tudo nas transações" ON public.subscriptions 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'joaquimcdacruz@gmail.com');
