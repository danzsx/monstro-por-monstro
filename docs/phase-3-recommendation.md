# Fase 3 — recomendação e revisão com evidência

Implementação em `src/learning/recommendation.ts`, versão `evidence-v1`. A função recebe contexto, catálogo, histórico e horário como entradas explícitas. Com as mesmas entradas, devolve a mesma ação e as mesmas razões. A interface mostra essas razões em “Por que esta ação?”.

## Critérios executáveis

- Só entra um tópico cujos pré-requisitos tenham evidência suficiente e cujo conjunto de questões da ação esteja íntegro: enunciado, explicação, alternativas distintas e gabarito válido. O plano de batalha usa o mesmo filtro e o catálogo efetivamente carregado. Sessões já iniciadas são preservadas.
- Evidência de consistência é o número de questões distintas respondidas sem ajuda em prática ou revisão e os acertos na última tentativa de cada questão. Diagnóstico, questão de entrada, autorrelato e reparação assistida ficam fora dessa conta. Menos de cinco questões distintas são descritas como evidência insuficiente.
- Revisão vencida tem prioridade. Um erro independente observado de 1 a 14 dias atrás também pode abrir revisão, quando há questões de revisão. Um relato recente de “ainda não lembrei” indica voltar à fonte antes de avaliar; ele não aumenta domínio.
- A escolha de 5 minutos produz uma micro sessão de uma questão. Após mais de sete dias sem sessão concluída, a entrada sugere esse tamanho e usa linguagem de retomada sem cobrança. Uma sessão em andamento prevalece sobre qualquer nova recomendação.
- A prioridade editorial só desempata após estar revisada e acompanhada de fonte. Não são usadas alegações de incidência do ENEM ou erros agregados de outros estudantes.

## Comparação com a regra anterior

Os casos estão fixados em `src/learning/recommendation.test.ts` com relógio explícito em 28/09/2026. A regra anterior continua disponível em `selectNextMonster` para comparação; a entrada usa `recommend`.

| Caso | Regra anterior | `evidence-v1` |
| --- | --- | --- |
| Sem histórico | Ordena por escore, prioridade editorial e desbloqueios | Ordena por classe de evidência e pré-requisito; explica que a evidência é insuficiente |
| Erro independente de ontem, sem revisão agendada | Não abre revisão | Abre revisão se houver item apto e informa a origem do sinal |
| Revisão vencida | Abre revisão | Abre revisão e mostra a data usada |
| Cinco minutos disponíveis | Micro sessão dependia do fluxo de adiamento/check-in | Micro sessão imediata, com uma questão |
| Tópico sem questão executável | Filtro parcial por finalidade | Excluído pelo filtro de integridade usado também no plano |

## Lembretes

O perfil inicia com lembretes desativados. Ativar exige permissão do sistema e registra uma preferência no estado da jornada; desativar cancela o agendamento no aparelho. A conclusão de uma sessão agenda a próxima revisão somente com a preferência ativa, usando o estado já salvo. Na web, a ativação fica indisponível nesta implementação. Os lembretes não alteram domínio nem a política de escolha.

## Limites de validação

Os testes reproduzem cenários simulados e registros no formato do histórico local. Falta ainda avaliação com histórico real consentido e pesquisa com estudantes antes do piloto. A política é heurística versionada, não um modelo calibrado de incidência, dificuldade ou aprendizagem.
