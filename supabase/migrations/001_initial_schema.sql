-- ============================================================================
-- Codemix Insta-AI Hub — Migration 001: Multi-Tenant Schema & RLS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizações / Tenants (Agência ou Clientes)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'pro' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.1 Membros do Tenant (vínculo com auth.users para RLS)
CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

-- 2. Múltiplas Contas do Instagram por Tenant
CREATE TABLE IF NOT EXISTS ig_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  fb_page_id TEXT,
  access_token_encrypted TEXT NOT NULL, -- Criptografado via Supabase Vault / pgcrypto
  token_expires_at TIMESTAMPTZ NOT NULL,
  permissions_granted INT DEFAULT 4,
  webhook_subscribed BOOLEAN DEFAULT true,
  brand_voice_guidelines JSONB DEFAULT '{}'::jsonb, -- Tom de voz, público e regras da conta
  style_reference TEXT DEFAULT '',                  -- Sufixo padrão de engenharia de prompts
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Conteúdos, Legendas, Prompts de Imagem e Agendamentos
CREATE TABLE IF NOT EXISTS ig_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES ig_accounts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'CAROUSEL', 'REELS', 'STORIES')),
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PROMPT_READY', 'SCHEDULED', 'PUBLISHED', 'FAILED')) DEFAULT 'DRAFT',
  topic TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  image_prompts JSONB DEFAULT '[]'::jsonb, -- Prompts gerados para Midjourney/Flux/Imagen
  media_urls TEXT[] DEFAULT '{}',          -- Preenchido apenas quando o usuário subir a arte final
  scheduled_for TIMESTAMPTZ,
  published_media_id TEXT,
  ai_model_used TEXT CHECK (ai_model_used IN ('claude', 'codex', 'gemini', 'manual')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Inbox Unificado (Direct Messages, Comentários e Menções de Story)
CREATE TABLE IF NOT EXISTS ig_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES ig_accounts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('DM', 'COMMENT', 'STORY_MENTION')),
  external_id TEXT UNIQUE NOT NULL,
  sender_ig_id TEXT NOT NULL,
  sender_username TEXT,
  content TEXT,
  media_id TEXT,
  media_title TEXT,
  intent_category TEXT CHECK (intent_category IN ('duvida', 'elogio', 'lead', 'gatilho', 'reclamacao', 'spam', 'ofensivo', 'fora_do_escopo')),
  sentiment TEXT CHECK (sentiment IN ('positivo', 'neutro', 'negativo')),
  ai_suggested_reply TEXT,
  status TEXT NOT NULL CHECK (status IN ('UNREAD', 'AI_REPLIED', 'HUMAN_ESCALATED', 'ARCHIVED')) DEFAULT 'UNREAD',
  is_hidden BOOLEAN DEFAULT false,
  private_reply_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Catálogo de Skills e Comandos "/"
CREATE TABLE IF NOT EXISTS ai_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL para skills globais do sistema
  slash_command TEXT NOT NULL,                             -- Ex: '/legenda-feed'
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  preferred_engine TEXT CHECK (preferred_engine IN ('claude', 'codex', 'gemini', 'auto')) DEFAULT 'auto',
  system_prompt TEXT NOT NULL,
  input_schema JSONB DEFAULT '{}'::jsonb,
  output_format TEXT DEFAULT 'markdown',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Regras de Automação por Palavra-Chave (Comentário -> Direct)
CREATE TABLE IF NOT EXISTS ig_keyword_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES ig_accounts(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  scope_label TEXT DEFAULT 'todos os posts',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Fluxos de Automação de DM (Estilo ManyChat)
CREATE TABLE IF NOT EXISTS ig_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES ig_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  stats JSONB DEFAULT '{"sent":0,"open":"—","clicks":0,"leads":0}'::jsonb,
  nodes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Audiência & Contatos Capturados
CREATE TABLE IF NOT EXISTS ig_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES ig_accounts(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source_label TEXT,
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Índices de Performance Multi-Tenant
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ig_accounts_tenant ON ig_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ig_posts_tenant_account ON ig_posts(tenant_id, ig_account_id, status);
CREATE INDEX IF NOT EXISTS idx_ig_interactions_tenant_account ON ig_interactions(tenant_id, ig_account_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_skills_tenant ON ai_skills(tenant_id, slash_command);

-- ============================================================================
-- Row Level Security (RLS) — Isolamento Estrito por Tenant via auth.uid()
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_keyword_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_contacts ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se o usuário autenticado pertence ao tenant
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(target_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = target_tenant_id
      AND tm.user_id = auth.uid()
  );
$$;

CREATE POLICY tenant_isolation_tenants ON tenants
  FOR ALL USING (public.user_has_tenant_access(id));

CREATE POLICY tenant_isolation_members ON tenant_members
  FOR ALL USING (user_id = auth.uid() OR public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ig_accounts ON ig_accounts
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ig_posts ON ig_posts
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ig_interactions ON ig_interactions
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ai_skills ON ai_skills
  FOR ALL USING (tenant_id IS NULL OR public.user_has_tenant_access(tenant_id))
  WITH CHECK (tenant_id IS NOT NULL AND public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ig_keyword_rules ON ig_keyword_rules
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ig_flows ON ig_flows
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_ig_contacts ON ig_contacts
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

