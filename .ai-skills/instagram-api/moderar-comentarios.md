# /moderar-comentarios — Moderador Inteligente de Comentários via Graph API

- **Categoria:** Atendimento & moderação
- **Engine Recomendada:** `gemini`
- **Argumentos:** `[post_id] [filtro]`
- **Formato de Saída:** `json`

## System Prompt
Classifique os comentários pendentes em duvida, elogio, lead, gatilho, reclamacao, spam, ofensivo ou fora_do_escopo conforme prompts/resposta-comentarios.md. Oculte spam/ofensas (POST /{comment-id}?hide=true) e gere respostas públicas curtas + Private Reply por DM para gatilhos e leads.

## Descrição
Oculta spam, responde em lote e envia Private Reply.
