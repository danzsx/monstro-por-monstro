# Fase 2 — executar com qualquer fonte

Implementação da fase 2 de `negocio/proposta_redirecionamento_produto_2026-09-28.md`.

## Sessão v2

- Estudo completo: escolher material interno ou nomear uma fonte própria → concluir aquisição → tentar recordar sem consulta (3–5 minutos sugeridos) → responder até cinco questões distintas → receber explicação e opção de passo guiado → encerrar.
- Revisão: questões de revisão, sem exigir nova aquisição. Passo curto: uma questão de prática e encerramento legítimo. A seleção da fonte não aparece nesses formatos.
- Pausa salva a fase atual, a fonte e as tentativas. Ao retomar, a máquina volta à mesma fase. Sair para usar material externo ou deixar o app em segundo plano interrompe a contagem de tempo ativo. A etapa de recordação mostra o tempo ativo e permite até cinco minutos sem toque antes do limite de inatividade.
- Aquisição e recordação são sinais de participação. Só tentativas independentes de prática e revisão entram no cálculo de domínio. O encerramento e a jornada exibem esses sinais separadamente; a jornada mostra a sessão em andamento sem incluí-la no total de concluídas.

## Dados e sincronização

`BattlePlan.version = 2` fixa a política de sessão e `contentVersion` fixa a versão do tópico no início. O plano guarda cópias das questões selecionadas para que uma atualização remota do catálogo não mude enunciado, alternativas ou gabarito no meio da sessão. Tentativas novas carregam `itemVersion` quando disponível. `CompletedStudySession` guarda formato, duração planejada, tempo ativo, fonte, relato de recordação e número de pausas. Estados v1 e sessões legadas continuam legíveis; campos novos são opcionais na leitura.

Eventos de seleção e conclusão da fonte, recordação, pausa e retomada têm IDs persistidos em `sessionEvents`. São enviados como payloads JSON com `category: session` no transporte `analytics` já permitido pela tabela `study_events`. Essa escolha mantém a sincronização compatível com o banco atual; o ID do evento e o ID da operação permitem repetição de envio sem duplicar. Tentativas que passam da batalha ativa para o histórico mantêm o mesmo ID e não são reenviadas.

## Limites editoriais e de validação

O catálogo ainda não possui fontes externas curadas com licença e disponibilidade verificadas. Por isso, o app aceita uma fonte nomeada pela pessoa e não recomenda links específicos. A aquisição externa é declarada; o app não verifica a leitura fora dele nem soma esse tempo ao tempo ativo observado. A sugestão de 3–5 minutos para recordação não é um bloqueio.

Typecheck, lint, 76 testes automatizados e exportação Expo para Android, iOS e web passaram. Os testes cobrem transições, retomada de fase e idempotência de eventos. O fluxo externo foi percorrido no navegador até o histórico, incluindo pausa e recarga da página. Ainda são necessários testes manuais de background/retomada e acessibilidade em Android e iOS, além de sincronização entre dois dispositivos reais.
