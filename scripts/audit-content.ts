import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { STATIC_TOPICS } from '../src/content/catalog';

// Snapshot of the bundled catalog only. Remote CMS content needs a separate export.
const rows = STATIC_TOPICS.map(topic => {
  const count = (purpose: 'diagnostic' | 'practice' | 'review') =>
    topic.questions.filter(question => question.purpose === purpose).length;
  const distinct = new Set(topic.questions.map(question => question.id)).size;
  const repeatedPrompts = topic.questions.length - new Set(topic.questions.map(question => question.prompt.trim().toLocaleLowerCase('pt-BR'))).size;
  const diagnostic = count('diagnostic');
  const practice = count('practice');
  const review = count('review');
  return {
    id: topic.id,
    name: topic.name,
    discipline: topic.discipline,
    version: topic.version,
    lessons: topic.lessons.length,
    diagnostic,
    practice,
    review,
    total: topic.questions.length,
    distinctIds: distinct,
    repeatedPrompts,
    taggedAsEnem: topic.questions.filter(question => !!question.enemMetadata).length,
    guidanceStatus: topic.enemGuidance?.status ?? 'absent',
    currentFullSession: topic.lessons.length > 0 && practice > 0 && review > 0,
    currentMicroSession: practice > 0,
    targetFiveDistinctPractice: practice >= 5 && distinct === topic.questions.length,
  };
});

const totals = rows.reduce((all, row) => ({
  topics: all.topics + 1,
  questions: all.questions + row.total,
  diagnostic: all.diagnostic + row.diagnostic,
  practice: all.practice + row.practice,
  review: all.review + row.review,
  full: all.full + Number(row.currentFullSession),
  micro: all.micro + Number(row.currentMicroSession),
  five: all.five + Number(row.targetFiveDistinctPractice),
  repeatedPrompts: all.repeatedPrompts + row.repeatedPrompts,
  taggedAsEnem: all.taggedAsEnem + row.taggedAsEnem,
}), { topics: 0, questions: 0, diagnostic: 0, practice: 0, review: 0, full: 0, micro: 0, five: 0, repeatedPrompts: 0, taggedAsEnem: 0 });

const header = `# Inventário do catálogo estático — 28/09/2026

Gerado por \`npm run content:audit\` a partir de \`STATIC_TOPICS\`. Não inclui conteúdos remotos, qualidade pedagógica, licença, diversidade semântica nem validação de itens. “Sessão atual” significa apenas que há aula, prática e revisão no fluxo v1; “micro atual” significa que há pelo menos uma questão de prática. O protótipo da nova entrada não altera esses critérios.

**Linha de base estática:** ${totals.topics} tópicos; ${totals.questions} questões (${totals.diagnostic} diagnóstico, ${totals.practice} prática, ${totals.review} revisão); ${totals.full} com sessão atual; ${totals.micro} com micro sessão possível; ${totals.five} com pelo menos cinco IDs de prática e sem IDs duplicados. ${totals.repeatedPrompts} enunciados repetidos dentro do mesmo tópico. ${totals.taggedAsEnem} questões ainda carregam metadados ENEM exibíveis.

| Tópico | Área | Aulas | Diagnóstico | Prática | Revisão | Total | Enunciados repetidos | Sessão atual | Micro atual | 5 práticas distintas |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
`;
const body = rows.map(row => `| ${row.name} (\`${row.id}\`) | ${row.discipline} | ${row.lessons} | ${row.diagnostic} | ${row.practice} | ${row.review} | ${row.total} | ${row.repeatedPrompts} | ${row.currentFullSession ? 'sim' : 'não'} | ${row.currentMicroSession ? 'sim' : 'não'} | ${row.targetFiveDistinctPractice ? 'sim' : 'não'} |`).join('\n');
const footer = `

## Leitura editorial

- Os três propósitos são rótulos de uso, não certificações de qualidade. A contagem de IDs não garante independência entre itens; enunciados repetidos são um alerta adicional.
- Questões do catálogo são autorais/geradas localmente. Metadados que apontavam caderno, ano e número de questão do ENEM foram removidos da exibição; esses números não demonstravam proveniência. Itens remotos exigem revisão própria.
- A aptidão da nova sessão com fonte externa, recordação ativa e evidência suficiente permanece **não avaliada** até a fase 2. A tabela mede apenas a executabilidade do fluxo v1.
`;

writeFileSync(resolve('docs/content-inventory-2026-09-28.md'), header + body + footer);
writeFileSync(resolve('docs/content-inventory-2026-09-28.json'), JSON.stringify({ date: '2026-09-28', scope: 'STATIC_TOPICS', totals, topics: rows }, null, 2) + '\n');
console.log(totals);
