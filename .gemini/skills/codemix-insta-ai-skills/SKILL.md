---
name: codemix-insta-ai-skills
description: >
  Catálogo unificado de 18 Skills e Slash Commands (/) do Codemix Insta-AI Hub
  para geração de conteúdo, engenharia de prompts de imagem, moderação de DMs/comentários
  e operação multi-contas na Instagram Graph API v22.0.
---

# Codemix Insta-AI Hub — Ecossistema de Skills (`/`)

Fonte única da verdade: `.ai-skills/registry.json`.
Prompt de moderação de comentários: `prompts/resposta-comentarios.md`.

## Grupo 1 — Geração de Conteúdo & Copywriting (Claude)
- `/legenda-feed [tema] [objetivo]` — 3 variações de legenda (AIDA, Storytelling, Direta) com `brand_voice_guidelines`.
- `/carrossel [tema] [num_slides]` — Estrutura slide a slide com gancho, conteúdo, resumo salvável e CTA.
- `/roteiro-reels [ideia] [duracao_segundos]` — Tabela de roteiro com hook (0-3s), retenção (3-15s), entrega (15-30s) e loop final.
- `/sequencia-stories [objetivo]` — 5 a 7 stories com enquete, reação rápida e link estratégico no último frame.
- `/calendario [dias] [pilares]` — Matriz editorial por funil de consciência pronta para salvar como `DRAFT`.
- `/hashtags [nicho] [localizacao]` — 5 a 15 hashtags qualificadas + palavras-chave de SEO nativo.

## Grupo 2 — Engenharia de Prompts de Imagem (Gemini / Claude)
- `/prompt-foto [conceito] [aspect_ratio]` — Prompts fotográficos EN/PT para Midjourney v6, Flux.1 e Imagen 3.
- `/prompt-carrossel [id_do_post]` — Direção de arte e prompts consistentes para cada lâmina do carrossel.
- `/prompt-capa-reels [titulo_gancho]` — Prompt vertical 9:16 com safe zone 4:5 central para tipografia.
- `/prompt-estetico [referencia_marca]` — Extrai códigos visuais da marca para o sufixo `Style Reference`.

## Grupo 3 — Atendimento, DMs & Moderação (Gemini Flash / Claude)
- `/responder-dm [contexto_opcional]` — Sugere resposta humanizada ou aciona transbordo para humano.
- `/moderar-comentarios [post_id] [filtro]` — Oculta spam (`hide=true`), responde em lote e dispara Private Reply.
- `/automacao-gatilho [palavra_chave] [link_destino]` — Regra de palavra-chave em comentários para envio de link na DM.

## Grupo 4 — Operação Multi-Contas, Analytics & Técnico (Codex / Gemini Pro)
- `/conta-trocar [@username]` — Alterna o contexto ativo (`activeAccountSignal`).
- `/conta-status` — Saúde dos tokens de 60 dias, escopos OAuth e status de webhook.
- `/auditoria-perfil [@username]` — Diagnóstico de 30 dias da Insights API + plano de ação.
- `/publicar-agora [post_id]` — Fluxo de 2 etapas (`/media` -> `/media_publish`) na Graph API v22.0.
- `/debug-webhook [payload_id]` — Validação de `X-Hub-Signature-256` e diagnóstico de payload/SQL.

