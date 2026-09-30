# Fase 4 — conteúdo consolidado e piloto controlado

## Entregue no código

- O inventário estático atualizado tem 52 tópicos e 579 questões: 193 de diagnóstico, 193 de prática e 193 de revisão. Todos os tópicos têm pelo menos uma sessão completa e uma micro sessão. Treze têm cinco ou mais questões de prática distintas. O relatório é gerado por `npm run content:audit`.
- A curadoria editorial foi ampliada no piloto: `covalent-bonds` passou a ter cinco práticas e cinco revisões; `atomic-models` passou a ter cinco práticas e cinco revisões. IDs existentes foram preservados.
- O CMS ganhou `topic_sources` com URL HTTPS, publicador, base de direitos (`link_only` ou `licensed`), nota de licença, fallback, data de checagem e revisor. Só fontes revisadas e checadas nos últimos 180 dias chegam ao catálogo estudantil.
- A publicação agora exige cinco questões distintas de prática e cinco de revisão, proveniência e revisão editorial em cada questão, e corpus, método e fontes quando houver alegação ENEM revisada. Um tópico sem aula só pode publicar com fonte atual revisada.
- Sessões completas exibem fontes curadas como links externos; se o link não abrir, o fallback editorial permanece disponível. O app não copia conteúdo protegido.
- A migração v2 preserva tentativas, batalha ativa e IDs do estado v1, não transforma autorrelato em domínio e aceita snapshots v1 e v2 durante a transição. O RPC de sincronização continua idempotente.
- `pilotMetrics` calcula funil de entrada, primeira sessão, retorno em sete dias, duração ativa e desempenho independente por participante. O script `npm run pilot:metrics -- caminho/manifest.json` exige consentimento explícito e amostra mínima de cinco estados; sem isso não produz agregado.

## Critério de saída e limites

O banco local passou pela checagem de segurança e publicação, com RLS e RPC validados. A suíte do app passou com 21 suítes e 88 testes; typecheck, lint e auditoria de conteúdo também passaram.

O piloto ainda não está lançado para estudantes reais. A parte que depende de curadoria humana é revisar cada questão e fonte no CMS, obter consentimentos e executar entrevistas. Não há alegação quantitativa de incidência do ENEM: o catálogo continua tratando essa relação como escopo editorial, sem porcentagem ou ranking.

Para liberar o piloto, é preciso aplicar a migração em um ambiente Supabase de staging, preencher os metadados de proveniência e fontes, testar dois aparelhos com conflito de revisão e acompanhar as métricas por uma coorte consentida. Esses passos são operacionais e não devem ser simulados como evidência de lançamento.
