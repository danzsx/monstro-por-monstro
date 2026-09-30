# Fase 0 — fontes, licenças e alegações

**Data:** 28/09/2026. **Escopo:** catálogo estático, materiais de referência presentes no repositório, metadados do CMS e textos exibidos no app. Não houve acesso ao catálogo remoto publicado nem revisão jurídica de contratos ou permissões privadas.

## Decisões aplicadas

| Material ou alegação | Evidência encontrada | Decisão |
| --- | --- | --- |
| Questões estáticas (570) | São construídas em `src/content/questions.ts`, com enunciados e alternativas locais. Um quinto valor de muitas entradas associava ano/caderno/número do ENEM sem comprovar correspondência com a questão gerada. | O gerador deixa de anexar `enemMetadata`; a batalha deixa de exibir selo de caderno. Preservam-se os itens e IDs para não alterar tentativas históricas. Revisão de conteúdo e origem item a item segue pendente. |
| Orientação “Como cai no ENEM” | Nove tópicos tinham `status: reviewed` e listas de provas ou itens, mas sem corpus completo, denominador, regra de codificação ou auditoria reproduzível para sustentar incidência. Dois registros apontam itens específicos, o que ainda não justifica tendência. | Todos passam a `pending`. A ficha mostra “Curadoria em andamento” inclusive para conteúdo remoto, até existir validação editorial reproduzível. Os textos ficam no código como pistas de curadoria. |
| “Ecologia representa historicamente mais de 30%” e “campeão absoluto” | Não há tabela de edições, classificação de itens nem cálculo verificável no repositório. | Removidos. A relevância passa a descrever os conceitos estudados. |
| “Alta frequência”, “frequentes” e “recorrentes” em relevância | Não há método de contagem para esses tópicos. | Trocados por descrições de aplicação conceitual, sem prometer incidência. |
| “Cerca de 90% da energia se dissipa em calor a cada nível trófico” | O número não tinha fonte e simplifica perdas com processos metabólicos e matéria não consumida. | Substituído por explicação qualitativa. |
| Matriz de Referência do ENEM | [Publicação institucional do Inep](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem) descreve competências e objetos de conhecimento. | Serve para mapear escopo curricular. Não autoriza porcentagens de incidência, identidade de itens ou conclusão de que 52 tópicos cobrem o edital. |
| Provas e gabaritos | [Arquivo oficial do Inep](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) oferece cadernos por edição. | Serve como corpus futuro. Publicação para consulta não foi tratada como licença geral de reprodução; antes de importar itens integrais, registrar permissão e atribuição aplicáveis. |
| PDFs em `apostila referencia/` | Há um PDF de Ricardo Feltre cujo nome contém referência a biblioteca não oficial e `Biologia A06.pdf`, sem licença documentada no projeto. | Manter apenas como referência interna até comprovar origem e direito de reprodução. Não incorporar texto, imagens ou arquivo ao app/CMS. |
| Imagens de marca e monstros | Arquivos em `brand/` e `app/assets/`, sem ficha de autoria/licença no repositório. | Registrar autor, origem, permissão de uso e escopo antes de redistribuição ampliada. O `app/LICENSE` licencia código; não documenta automaticamente os direitos desses ativos. |
| Fontes externas citadas nas orientações | URLs da matriz, Ministério da Saúde e exemplos de questões aparecem como referências bibliográficas; não há campo de licença ou data de checagem por fonte. | Referenciar por link sem copiar conteúdo. Para cada fonte curada: título, URL, órgão/autor, data de consulta, uso permitido, alternativa se indisponível e revisão editorial. |

## Critério para reabrir alegações de incidência

Registrar corpus de provas (edição, modalidade, área, caderno), total de itens elegíveis, regra para classificar tema principal e temas secundários, dupla revisão de divergências, contagem e incerteza. Publicar a planilha/código de cálculo junto da versão da alegação. Sem isso, usar apenas prioridade editorial identificada como hipótese. Um exemplo isolado demonstra que o tema apareceu naquela questão, não sua frequência relativa.

## Pendências de conteúdo e licença

1. Auditar as 570 questões autorais quanto a correção, ambiguidade, variações quase idênticas, nível, diversidade e eventual semelhança com itens oficiais. O [inventário](content-inventory-2026-09-28.md) verifica contagem e enunciados exatamente repetidos, não equivalência semântica.
2. Inventariar catálogo remoto com versão, proveniência, licença e status de revisão antes de considerá-lo apto a sessão. O CMS v1 tem versão e autor editor, mas não metadados de licença/fonte por questão ou mídia.
3. Obter comprovantes de direito de uso para PDFs, apostilas interativas derivadas e ativos visuais. Ausência de licença registrada significa **direito não verificado**, não conclusão de infração.
