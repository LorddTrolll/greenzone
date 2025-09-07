-- Script para configurar o Supabase Authentication e tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Criar a tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  plano TEXT CHECK (plano IN ('MONTHLY', 'ANNUAL')) DEFAULT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  data_expiracao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  stripe_customer_id TEXT UNIQUE DEFAULT NULL,
  stripe_subscription_id TEXT UNIQUE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permitir inserção de novos perfis (para novos usuários)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Criar função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Criar função para verificar se o usuário é VIP ativo
CREATE OR REPLACE FUNCTION public.is_user_vip_active(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
BEGIN
  SELECT is_vip, data_expiracao INTO profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN profile_record.is_vip AND 
         profile_record.data_expiracao IS NOT NULL AND 
         profile_record.data_expiracao > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_vip_status ON public.profiles(is_vip, data_expiracao);

-- 10. Configurar autenticação OAuth do Google (opcional - pode ser feito via dashboard)
-- Vá para Authentication > Providers no dashboard do Supabase
-- Habilite o Google OAuth e configure as credenciais

-- 11. Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO public.profiles (id, email, name, is_vip, plano, data_inicio, data_expiracao)
-- VALUES (
--   gen_random_uuid(),
--   'admin@greenzone.com',
--   'Administrador',
--   true,
--   'ANNUAL',
--   NOW(),
--   NOW() + INTERVAL '1 year'
-- );

COMMIT;