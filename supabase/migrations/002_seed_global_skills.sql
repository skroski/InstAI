-- ============================================================================
-- Seed Idempotente das 18 Skills Globais (tenant_id = NULL)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_skills_global_slash
  ON ai_skills (slash_command)
  WHERE tenant_id IS NULL;

INSERT INTO ai_skills (tenant_id, slash_command, name, category, preferred_engine, system_prompt, input_schema)
VALUES
  (NULL, '/legenda-feed', 'Legenda Feed (3 variações)', 'Conteúdo & Copywriting', 'claude', 'Gere 3 variações de legenda para post único (AIDA, Storytelling e Direta), respeitando o brand_voice_guidelines da conta ativa, com quebras de linha otimizadas e CTA.', '{"args":["tema","objetivo"]}'::jsonb),
  (NULL, '/carrossel', 'Estrutura de Carrossel', 'Conteúdo & Copywriting', 'claude', 'Estruture um carrossel de alta retenção slide a slide (Slide 1: Gancho inevitável; Slides 2-N: Conteúdo denso; Penúltimo: Resumo salvável; Último: CTA + Legenda completa do post).', '{"args":["tema","num_slides"]}'::jsonb),
  (NULL, '/roteiro-reels', 'Roteiro de Reels', 'Conteúdo & Copywriting', 'claude', 'Crie tabela de roteiro com: Tempo (0-3s Hook visual/sonoro, 3-15s Retenção, 15-30s Entrega, Final Loop), Fala (Locução/Texto em tela) e Legenda da publicação.', '{"args":["ideia","duracao_segundos"]}'::jsonb),
  (NULL, '/sequencia-stories', 'Sequência de Stories', 'Conteúdo & Copywriting', 'claude', 'Gere sequência estratégica de 5 a 7 stories com gatilhos de enquete, reação rápida e link estratégico no último frame.', '{"args":["objetivo"]}'::jsonb),
  (NULL, '/calendario', 'Matriz Editorial', 'Conteúdo & Copywriting', 'claude', 'Gere matriz editorial completa (Feed, Reels, Carrossel e Stories) distribuída por funil de consciência (Topo, Meio e Fundo) pronta para salvar como rascunhos (DRAFT).', '{"args":["dias","pilares"]}'::jsonb),
  (NULL, '/hashtags', 'Hashtags + SEO Nativo', 'Conteúdo & Copywriting', 'claude', 'Gere blocos de 5 a 15 hashtags altamente qualificadas + palavras-chave de SEO para Instagram.', '{"args":["nicho","localizacao"]}'::jsonb),
  (NULL, '/prompt-foto', 'Prompt Fotográfico (MJ/Flux/Imagen)', 'Prompts de Imagem', 'gemini', 'Gere prompts fotográficos ultra-detalhados em inglês e português otimizados para Midjourney v6, Flux.1 e Google Imagen 3.', '{"args":["conceito","aspect_ratio"]}'::jsonb),
  (NULL, '/prompt-carrossel', 'Direção de Arte Carrossel', 'Prompts de Imagem', 'gemini', 'Leia o roteiro do carrossel e crie a direção de arte + prompts de imagem consistentes para cada página.', '{"args":["id_do_post"]}'::jsonb),
  (NULL, '/prompt-capa-reels', 'Capa de Reels 9:16 + Safe Zone 4:5', 'Prompts de Imagem', 'gemini', 'Crie prompt de imagem vertical (9:16) com área de respiro central (safe zone 4:5 do feed) para inserção de tipografia posterior.', '{"args":["titulo_gancho"]}'::jsonb),
  (NULL, '/prompt-estetico', 'Style Reference da Marca', 'Prompts de Imagem', 'gemini', 'Extraia os códigos visuais da conta selecionada e gere um sufixo de estilo padrão (Style Reference Prompt).', '{"args":["referencia_marca"]}'::jsonb),
  (NULL, '/responder-dm', 'Resposta Humanizada de DM', 'Atendimento & Moderação', 'gemini', 'Analise a conversa aberta no Inbox Unificado, consulte as regras da conta ativa e sugira resposta humanizada ou acione transbordo humano.', '{"args":["contexto_opcional"]}'::jsonb),
  (NULL, '/moderar-comentarios', 'Moderação de Comentários em Lote', 'Atendimento & Moderação', 'gemini', 'Varra comentários do post via Graph API, oculte spam/ofensas e gere lote de respostas públicas + envio de Private Reply.', '{"args":["post_id","filtro"]}'::jsonb),
  (NULL, '/automacao-gatilho', 'Gatilho Comentário -> Direct', 'Atendimento & Moderação', 'codex', 'Configure regra de webhook para responder automaticamente no Direct sempre que um seguidor comentar a palavra-chave.', '{"args":["palavra_chave","link_destino"]}'::jsonb),
  (NULL, '/conta-trocar', 'Trocar Conta Ativa', 'Operação & Multi-Contas', 'codex', 'Alterne instantaneamente o contexto ativo do chat e da UI para outra conta do Instagram cadastrada no sistema.', '{"args":["@username"]}'::jsonb),
  (NULL, '/conta-status', 'Diagnóstico de Tokens e Webhooks', 'Operação & Multi-Contas', 'codex', 'Verifique saúde dos tokens de todas as contas do Tenant (dias restantes do Long-Lived Token de 60 dias, permissões e Webhook).', '{"args":[]}'::jsonb),
  (NULL, '/auditoria-perfil', 'Auditoria Insights API (30d)', 'Operação & Multi-Contas', 'gemini', 'Analise métricas da Insights API (taxa de engajamento, melhor horário, formato campeão de retenção nos últimos 30 dias) e entregue plano de ação.', '{"args":["@username"]}'::jsonb),
  (NULL, '/publicar-agora', 'Publicar via Graph API (/media_publish)', 'Operação & Multi-Contas', 'codex', 'Execute o fluxo de 2 etapas da Graph API (/media -> /media_publish) para um post que já possua URL de mídia vinculada.', '{"args":["post_id"]}'::jsonb),
  (NULL, '/debug-webhook', 'Diagnóstico X-Hub-Signature-256', 'Operação & Multi-Contas', 'codex', 'Inspecione logs de falha da Graph API, valide assinatura X-Hub-Signature-256 e gere correção de payload ou query SQL.', '{"args":["payload_id"]}'::jsonb)
ON CONFLICT (slash_command) WHERE tenant_id IS NULL DO NOTHING;

