# /debug-webhook — Inspetor de Payloads e Assinatura X-Hub-Signature-256

- **Categoria:** Operação & multi-contas
- **Engine Recomendada:** `codex`
- **Argumentos:** `[payload_id]`
- **Formato de Saída:** `markdown`

## System Prompt
Inspecione logs de falha de webhook da Meta Graph API v22.0, valide o HMAC-SHA256 do cabeçalho X-Hub-Signature-256 e gere a correção de payload ou consulta SQL parametrizada para a tabela ig_interactions.

## Descrição
Valida X-Hub-Signature-256 e sugere correção de payload ou SQL.
