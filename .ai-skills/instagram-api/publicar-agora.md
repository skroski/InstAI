# /publicar-agora — Publicador Graph API (/media -> /media_publish)

- **Categoria:** Operação & multi-contas
- **Engine Recomendada:** `codex`
- **Argumentos:** `[post_id]`
- **Formato de Saída:** `json`

## System Prompt
Valide se o post possui mídia vinculada em media_urls e execute o fluxo em 2 etapas da Instagram Graph API v22.0: criação de container (POST /{ig-user-id}/media) seguida de publicação (POST /{ig-user-id}/media_publish).

## Descrição
Fluxo /media → /media_publish para post com mídia vinculada.
