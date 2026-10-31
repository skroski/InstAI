-- ============================================================================
-- Codemix Insta-AI Hub — Migration 003: Meta Marketing API, Lookalikes & Campanhas
-- ============================================================================

-- 1. Contas de Anúncios da Meta (Ad Accounts associadas à organização)
CREATE TABLE IF NOT EXISTS meta_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID REFERENCES ig_accounts(id) ON DELETE SET NULL,
  meta_ad_account_id TEXT NOT NULL UNIQUE, -- Ex: 'act_1029384756'
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'BRL',
  timezone_name TEXT DEFAULT 'America/Sao_Paulo',
  account_status INT DEFAULT 1, -- 1: ACTIVE, 2: DISABLED, 3: UNSETTLED, 7: PENDING_RISK_REVIEW
  balance_cents BIGINT DEFAULT 0,
  spend_cap_cents BIGINT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Públicos da Meta (Custom Audiences & Lookalike Audiences)
CREATE TABLE IF NOT EXISTS meta_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID REFERENCES ig_accounts(id) ON DELETE SET NULL,
  ad_account_id UUID REFERENCES meta_ad_accounts(id) ON DELETE CASCADE,
  meta_audience_id TEXT UNIQUE, -- ID na Meta Graph API (ex: '2384729182371')
  name TEXT NOT NULL,
  description TEXT,
  audience_type TEXT NOT NULL CHECK (audience_type IN ('CUSTOM_LIST', 'LOOKALIKE', 'IG_ENGAGEMENT', 'SAVED')),
  
  -- Para públicos Lookalike:
  origin_audience_id UUID REFERENCES meta_audiences(id) ON DELETE SET NULL,
  lookalike_ratio NUMERIC(4,2) DEFAULT 0.01, -- 0.01 = 1%, 0.02 = 2%, etc.
  lookalike_country TEXT DEFAULT 'BR',
  
  -- Retenção e contagem aproximada
  retention_days INT DEFAULT 90,
  approximate_count INT DEFAULT 0,
  
  -- Status de sincronização via Graph API
  sync_status TEXT NOT NULL CHECK (sync_status IN ('READY', 'SYNCING', 'ERROR', 'PENDING')) DEFAULT 'READY',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Mapeamento de Contatos Locais com Públicos da Meta (Hashing SHA-256)
CREATE TABLE IF NOT EXISTS audience_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id UUID NOT NULL REFERENCES meta_audiences(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES ig_contacts(id) ON DELETE CASCADE,
  email_sha256 TEXT,
  phone_sha256 TEXT,
  synced_to_meta BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (audience_id, contact_id)
);

-- 4. Campanhas de Anúncio da Meta (Meta Campaigns)
CREATE TABLE IF NOT EXISTS meta_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ig_account_id UUID REFERENCES ig_accounts(id) ON DELETE SET NULL,
  ad_account_id UUID REFERENCES meta_ad_accounts(id) ON DELETE CASCADE,
  meta_campaign_id TEXT UNIQUE, -- Ex: '12020491829381'
  name TEXT NOT NULL,
  objective TEXT NOT NULL CHECK (objective IN ('OUTCOME_LEADS', 'OUTCOME_ENGAGEMENT', 'OUTCOME_TRAFFIC', 'OUTCOME_SALES', 'OUTCOME_AWARENESS')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')) DEFAULT 'PAUSED',
  daily_budget_cents BIGINT DEFAULT 5000, -- R$ 50,00 padrão
  lifetime_budget_cents BIGINT,
  
  -- Métricas em tempo real extraídas da Meta Insights API
  spent_cents BIGINT DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  leads INT DEFAULT 0,
  cpa_cents BIGINT DEFAULT 0,
  roas NUMERIC(5,2) DEFAULT 0.00,
  
  -- Público principal vinculado (Geralmente um Lookalike ou Lista)
  target_audience_id UUID REFERENCES meta_audiences(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Conjuntos de Anúncios (Meta Ad Sets)
CREATE TABLE IF NOT EXISTS meta_adsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES meta_campaigns(id) ON DELETE CASCADE,
  meta_adset_id TEXT UNIQUE,
  name TEXT NOT NULL,
  target_audience_id UUID REFERENCES meta_audiences(id) ON DELETE SET NULL,
  optimization_goal TEXT DEFAULT 'LEAD_GENERATION',
  billing_event TEXT DEFAULT 'IMPRESSIONS',
  daily_budget_cents BIGINT DEFAULT 5000,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')) DEFAULT 'ACTIVE',
  placements JSONB DEFAULT '["instagram_feed", "instagram_stories", "instagram_reels"]'::jsonb,
  geo_locations JSONB DEFAULT '{"countries": ["BR"]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Anúncios Individuais e Criativos (Meta Ads)
CREATE TABLE IF NOT EXISTS meta_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adset_id UUID NOT NULL REFERENCES meta_adsets(id) ON DELETE CASCADE,
  meta_ad_id TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')) DEFAULT 'ACTIVE',
  source_post_id UUID REFERENCES ig_posts(id) ON DELETE SET NULL,
  headline TEXT,
  primary_text TEXT,
  call_to_action TEXT DEFAULT 'SEND_INSTAGRAM_MESSAGE',
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Índices para Performance e Multi-Tenant
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_tenant ON meta_ad_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_meta_audiences_tenant ON meta_audiences(tenant_id, audience_type);
CREATE INDEX IF NOT EXISTS idx_meta_campaigns_tenant ON meta_campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_meta_adsets_campaign ON meta_adsets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_meta_ads_adset ON meta_ads(adset_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE meta_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_meta_ad_accounts ON meta_ad_accounts
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_meta_audiences ON meta_audiences
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_audience_contacts ON audience_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meta_audiences ma
      WHERE ma.id = audience_contacts.audience_id
        AND public.user_has_tenant_access(ma.tenant_id)
    )
  );

CREATE POLICY tenant_isolation_meta_campaigns ON meta_campaigns
  FOR ALL USING (public.user_has_tenant_access(tenant_id))
  WITH CHECK (public.user_has_tenant_access(tenant_id));

CREATE POLICY tenant_isolation_meta_adsets ON meta_adsets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meta_campaigns mc
      WHERE mc.id = meta_adsets.campaign_id
        AND public.user_has_tenant_access(mc.tenant_id)
    )
  );

CREATE POLICY tenant_isolation_meta_ads ON meta_ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meta_adsets ma
      JOIN meta_campaigns mc ON mc.id = ma.campaign_id
      WHERE ma.id = meta_ads.adset_id
        AND public.user_has_tenant_access(mc.tenant_id)
    )
  );

