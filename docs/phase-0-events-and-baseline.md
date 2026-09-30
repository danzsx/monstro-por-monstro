# Fase 0 — eventos, migração e linha de base

**Data:** 28/09/2026. Escopo: estado local v1 e migrações versionadas do repositório. Números de estudantes, sessões reais e retenção não foram consultados em produção.

## Mapa atual de dados

| Sinal | Origem v1 | Destino/persistência | Limite de interpretação |
| --- | --- | --- | --- |
| Perfil (`student`) | `saveStudent` | Snapshot local; nuvem após sincronização | Objetivo, horas semanais e percepção são declarações; não medem tempo observado. |
| Familiaridade no diagnóstico | `answerDiagnostic`, `diagnosticAttempts` | Evento `attempt` e snapshot | O campo `correct` indica a primeira opção de autoconfiança, **não acerto**. `evaluateDiagnostic` usa isso em `score`; excluir de domínio v2. |
| Início de batalha | `startBattle` | Analytics `battle_started`, snapshot `activeBattle` | Não prova estudo concluído. Exige diagnóstico no fluxo atual. |
| Check-in | `setIntervention` | Evento `affective`, snapshot `checkIns` | Estado autorrelatado; é opcional na política futura. |
| Resposta a questão | `answerBattle` | Primeiro no `activeBattle`; ao finalizar, `attempts` no snapshot e eventos `attempt` | `correct`, `assisted`, `questionId`, `source` e `battleId` existem. O item não tem versão gravada na tentativa. |
| Reparação | `answerRepair` | `activeBattle`/tentativas de reparação conforme máquina | Separar resposta assistida de tentativa independente; verificar projeção no v2. |
| Conclusão | `finishBattle` | `battle_completed`, `completedSessions` e `completedBattles` | `activeMs` existe no snapshot, mas não em evento próprio. Nem tempo nem conclusão bastam para domínio. |
| Confiança | `rateConfidence` | Apenas `confidenceRatings` no snapshot | Não há evento individual no `study_events`. Não comparar com acerto sem ligação de item/versão. |
| Retorno | `recordReturn` | Analytics `returned_within_7_days`, no máximo uma vez, e `lastSeenAt` | Não mede taxa de retorno por coorte. É um marcador único após primeira batalha. |
| Recomendação/revisão | `selectNextMonster`, `masteries` | Decisão em memória; próxima revisão no snapshot | Não há evento de recomendação, política versionada, duração disponível nem razão persistida. `retention` é heurística de decaimento. |
| Sincronização | `StudyStore`, `newEvents`, `sync_progress` | Outbox local, `student_snapshots`, `study_events`, recibos por operação | IDs de evento e operação evitam duplicação em retry. Conflito entre aparelhos não é reconciliado automaticamente. |

O banco aceita `attempt`, `affective` e `analytics` em `study_events`; a restrição e o snapshot exigem versão `1`. RLS limita eventos/snapshot ao usuário, e a view `my_learning_metrics` é individual. Não há agregação entre estudantes disponível para recomendação.

## Mapa v1 → v2 proposto

| Dado v1 | Conversão segura | Campo v2 ainda desconhecido |
| --- | --- | --- |
| `Topic.id`, `Question.id`, `Topic.version` | Preservar IDs editoriais e versão de tópico. | Versão exata da questão tentada; não inferir retroativamente. |
| `diagnosticAttempts` de familiaridade | Guardar como `SelfReport` legado com opção marcada e data. | Desempenho, acerto, tentativa independente. |
| `attempts` de prática/revisão | Migrar tentativas com resposta, acerto, assistência e data observados. | Versão do item, se o catálogo mudou depois da resposta. |
| `activeBattle` | Preservar cópia v1 para retomada ou encerramento seguro antes de iniciar sessão v2. | Fonte externa e recordação ativa. |
| `completedSessions` | Preservar datas, modo e `activeMs` como participação observada pelo timer atual. | Tempo de aquisição externo, pausas completas e qualidade da recordação. |
| `masteries`, `retention`, `nextReviewAt` | Guardar como projeção legada para histórico visual; recalcular domínio v2 só com evidência válida. | Probabilidade calibrada de retenção. |
| `analytics` | Preservar os quatro nomes e IDs; acrescentar eventos v2 com versão de esquema. | Funil de questão demonstrativa e recomendação, inexistente no v1. |

Na fase de migração: exportar backup antes de alterar o envelope local, escrever conversão pura e idempotente, aceitar snapshots v1 e v2 temporariamente, ampliar a restrição SQL antes de enviar v2, testar RLS e conflitos de revisão em dois aparelhos. Esta fase 0 **não altera** esquema nem estado persistido.

## Indicadores de linha de base

| Indicador | Definição e denominador | Valor em 28/09/2026 | Fonte |
| --- | --- | --- | --- |
| Tópicos mapeados no catálogo estático | Contagem de `STATIC_TOPICS` | **52** | `content:audit` |
| Questões por finalidade | Contagem de `Question.purpose` | **193 diagnóstico / 190 prática / 187 revisão** | `content:audit` |
| Tópicos com fluxo v1 completo | Aula + ≥1 prática + ≥1 revisão | **51/52**; falta revisão em `covalent-bonds` | `content:audit` |
| Tópicos com prática curta possível | ≥1 questão de prática | **52/52** | `content:audit`; disponibilidade técnica apenas |
| Tópicos com lote de 5 IDs de prática | ≥5 questões de prática e IDs sem duplicação | **11/52** | `content:audit`; não certifica diversidade |
| Tempo até primeira questão | Mediana entre abrir a entrada e enviar primeira resposta; coorte de novos usuários | **indisponível** | Falta evento de abertura da entrada e de questão demonstrativa. |
| Conversão para primeira sessão útil | Novos usuários com ≥1 tentativa independente de prática / novos usuários que abriram a entrada | **indisponível** | Falta evento de entrada e distinção confiável do diagnóstico legado. |
| Conclusão de sessões | Sessões concluídas / iniciadas, por modo e tópico | **indisponível** | Eventos existem, mas não foi consultada base de usuários; eventos não carregam `battleId` no analytics. |
| Retorno em 7 dias | Usuários com sessão útil em até 7 dias após a primeira / usuários com primeira sessão e 7 dias completos de observação | **indisponível** | Marcador v1 registra só o primeiro retorno; não há coortes calculadas. |
| Duração ativa observada | Mediana e distribuição de `activeMs` por modo, só sessões concluídas | **indisponível** | No snapshot, sem dados de produção consultados; timer requer validação em background. |
| Desempenho independente | Acertos / tentativas independentes, com número de itens distintos por tópico | **indisponível** | Requer exportação de tentativas v1 e exclusão explícita de autorrelatos. |

## Teste inicial da prévia

Na entrega original da fase 0, a rota `/entry-prototype` oferecia questão sem cadastro, feedback, escolha de 5/15 minutos e uma sugestão ilustrativa, sem gravar respostas. Na fase 1, a entrada real passou para `/entry` e a rota antiga redireciona para ela. Para 5–8 estudantes do perfil alvo, observar se encontram a questão, explicam a diferença entre resposta isolada e domínio, escolhem tempo, entendem a próxima ação e identificam o passo de configuração. Registrar tempo, hesitações e frases do participante; não chamar isso de validação antes das sessões acontecerem.
