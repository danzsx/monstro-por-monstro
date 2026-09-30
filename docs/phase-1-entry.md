# Fase 1 — começar sem atrito

Implementação em 28/09/2026 conforme `negocio/proposta_redirecionamento_produto_2026-09-28.md`.

## Fluxo entregue

1. A página inicial oferece uma questão real de prática antes de cadastro. A resposta fica no estado local com `source: entry`, feedback e explicação, sem atribuir domínio a partir de uma resposta.
2. Após responder, a pessoa escolhe um passo de cerca de 5 ou 15 minutos e inicia a batalha sem passar pelo diagnóstico. O passo curto contém uma questão e sua explicação.
3. O check-in afetivo é opcional. A conversa de familiaridade também é opcional, tem no máximo uma pergunta por cada um dos quatro tópicos iniciais e registra `correct: null` e `signal: self_report`.
4. A página inicial mostra uma ação principal, escolha de tempo, motivo da sugestão e mensagem de retorno ou pausa sem cobrança. Lembretes dependem de ativação explícita no perfil.

## Progresso legado

Na primeira leitura do estado v1, se houver respostas do diagnóstico antigo, o app guarda a projeção antiga em `legacyDiagnosticProjection`, cria cópia local de segurança e recompõe o domínio dos quatro tópicos de entrada a partir de tentativas reais de prática e revisão. Um erro de escrita durante essa migração não substitui o progresso em memória por um estado vazio. A alteração será enviada pelo fluxo de sincronização existente. O autorrelato antigo não entra no cálculo de domínio.

## Verificação

- Testes unitários de migração e do motor cobrem a exclusão do autorrelato e a micro sessão de uma questão.
- Typecheck, lint, testes Jest e exportação Expo para Android, iOS e web passaram.
- No navegador local, foi percorrido o fluxo: questão inicial → feedback → passo de 5 minutos → questão → conclusão → próxima ação; a pausa mostrou mensagem de retorno sem culpa.

## Validação ainda necessária

- Testes de navegação e acessibilidade em aparelhos Android e iOS. A compilação dos pacotes e o navegador local não substituem esses testes; não havia dispositivo Android conectado nesta verificação.
- Sessões de usabilidade com 5–8 estudantes do perfil alvo, previstas na fase 0 e ainda sem dados coletados.
- Verificação editorial da qualidade e dos direitos de uso das questões identificadas no inventário da fase 0. Esta fase não amplia a cobertura declarada do catálogo.
