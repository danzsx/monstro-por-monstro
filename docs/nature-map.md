# Mapa dos Monstros — Ciências da Natureza

## Escopo e entrega

Versão 1: **102 unidades de estudo**, em **23 grupos**, e **156 relações** (121 “estude antes” e 35 “também se conecta”). A divisão é de 39 conteúdos de Biologia, 25 de Física e 38 de Química. O [inventário completo](nature-map-inventory.md) reúne cobertura, resumos e justificativas.

O atlas está em `/map`, como quarta opção da navegação. Inclui busca sem acentos, lista acessível de todos os conteúdos, filtros por território, arraste, pinça, roda do mouse, controles de zoom/enquadramento e fichas. Aproximar a visão geral abre o grupo mais próximo do foco; também é possível escolher grupos diretamente. Fichas usam painel lateral no desktop e diálogo com rolagem no celular.

As posições, cores e dimensões representam organização, disciplina e seleção. Não há ordenação por incidência. As relações são recomendações pedagógicas e não alteram o motor de aprendizagem, o catálogo de batalhas ou seus pré-requisitos existentes.

## Fontes e alcance da verificação

Consulta realizada em 23/09/2026 (UTC).

1. **Edital nº 64, de 21/05/2026**, publicado no DOU de 22/05/2026: [publicação original](https://www.in.gov.br/web/dou/-/edital-n-64-de-21-de-maio-de-2026-707325396). Foi lida a [cópia integral, de 21 páginas, hospedada pela Secretaria da Educação do Espírito Santo](https://sedu.es.gov.br/media/pdf%20e%20Arquivos/Curr%C3%ADculo/edital-no-64-de-21-de-maio-de-2026-dou-imprensa-nacional.pdf). O item 3.1 remete à matriz, e o item 3.3 define as disciplinas da área.
2. **[Matriz de Referência do Enem indicada pelo edital](https://download.inep.gov.br/download/enem/matriz_referencia.pdf)**: base dos objetos de conhecimento, seção 3 do anexo, em Física (3.1), Química (3.2) e Biologia (3.3). O inventário mantém os 23 títulos de grupos e desdobra seus objetos em recortes de cobertura, escritos como paráfrases. Os 101 recortes internos não devem ser apresentados como uma contagem oficial de objetos do Inep.
3. **[Página “Matrizes de referência — Enem”, publicada pelo Inep em 17/07/2026](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem)**: página conferida. O arquivo nela apontado, `enem_matriz_de_referencia_v1.pdf`, respondeu com erros de download durante a pesquisa. A base efetivamente utilizada é a matriz do link expresso no edital de 2026. Não foi possível fazer uma comparação integral entre os dois arquivos; este registro não afirma equivalência binária ou ausência de alterações na republicação.

A matriz é a fonte do escopo, **não das dependências**. Os testes verificam se todos os recortes registrados têm cobertura, mas não substituem a revisão semântica do inventário contra o documento original.

## Curadoria das relações

- **Estude antes**: uma base conceitual útil para a unidade de destino, sem obrigação de concluir aulas nem bloqueio de acesso. Grafo direcional sem ciclos.
- **Também se conecta**: aproximação conceitual ou aplicação compartilhada, sem ordem. Cada ligação é armazenada uma única vez e exibida em ambos os sentidos.
- Cada ligação contém uma explicação curta. Conexões entre disciplinas usam a mesma estrutura.
- As unidades não precisam formar uma sequência única. Métodos científicos, saúde e ambiente podem ser explorados por caminhos diversos.
- “Citologia” representa aqui uma introdução à estrutura celular. Água, sais e biomoléculas fundamentam o estudo de membranas e metabolismo; divisão celular e DNA fundamentam genética. Não se impõe que todo o campo da citologia deva ser concluído antes de qualquer estudo da herança.

Referências didáticas primárias consultadas para conferir as bases conceituais — as escolhas de arestas continuam sendo inferências pedagógicas para este produto:

- [OpenStax Biology 2e, membranas](https://openstax.org/books/biology-2e/pages/5-introduction): composição e transporte celular.
- [OpenStax Biology 2e, meiose](https://openstax.org/books/biology-2e/pages/11-introduction): divisão e reprodução sexuada.
- [OpenStax Chemistry 2e, estequiometria](https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry): relações de mol e equações balanceadas.
- [OpenStax College Physics 2e, dinâmica](https://openstax.org/books/college-physics-2e/pages/4-introduction-to-dynamics-newtons-laws-of-motion): relação entre descrição do movimento e suas causas.

## Dados e manutenção

| Arquivo | Responsabilidade |
| --- | --- |
| `src/map/sources.ts` | Versão, fontes, grupos e inventário de cobertura independente dos nós |
| `src/map/{biology,physics,chemistry}.ts` | Unidades, resumos, aliases de busca, referências e vínculos opcionais |
| `src/map/relations.ts` | Ligações e razões |
| `src/map/catalog.ts` | Busca, resolução do monstro, progresso e validação do grafo |
| `src/map/layout.ts` | Coordenadas estáveis e câmera |
| `src/map/map-screen.tsx` | Navegação, busca, filtros e fichas |
| `src/map/map-canvas.tsx` | Câmera com Reanimated e Gesture Handler |

`sourceItems` contém índices em `SourceGroup.items`. Os índices são internos e começam em zero; o relatório usa números a partir de um. Uma unidade pode cobrir vários recortes e um recorte pode aparecer em várias unidades. Ao mudar os recortes, atualizar as referências e incrementar `MAP_VERSION`.

`topicId` é resolvido contra o catálogo disponível em `useApp()`, com confirmação de disciplina. Sem correspondência, o nó apresenta “Monstro em preparação”, sem botão de navegação. Os oito vínculos do catálogo inicial foram verificados. O resolvedor também aceita um novo tópico cujo ID coincida exatamente com o ID estável do nó; títulos parecidos não são usados para inferir vínculos.

O estado exibido vem de `state.masteries`, incluindo revisão vencida. A consulta é somente leitura. Adicionar unidades ao mapa não cria tópicos, progresso ou pré-requisitos de batalha. O retorno do monstro restaura a ficha pelo parâmetro `node`.

### Atualizar e validar

```sh
npx tsx scripts/check-map.ts
npx tsx scripts/check-map.ts --report
npm run typecheck
npm run lint
npm test -- --watch=false
npm run build
```

Nunca remover um objeto da lista de fontes apenas para satisfazer um teste. Ao incluir outra área, ampliar os territórios, o inventário e o posicionamento, preservando IDs já publicados.

## Offline, acessibilidade e verificação

Inventário, resumos, relações e imagens existentes são incluídos no pacote. O mapa não faz requisições de conteúdo e continua utilizável sem conexão depois de carregado. No aplicativo nativo, esses dados estão no bundle instalado. A web não ganhou um service worker: a primeira abertura ou recarga totalmente offline depende do cache e da infraestrutura de hospedagem existente. Abrir documentos externos requer conexão.

A lista oferece uma alternativa ao gesto espacial. Controles, nós e relações têm nomes acessíveis; cores são acompanhadas por rótulos; as duas relações usam traços e setas distintos. Elementos decorativos do SVG ficam fora da árvore de acessibilidade. A câmera não aplica animações automáticas. Os diálogos podem ser fechados pelo botão ou pelo retorno do sistema.

Verificações executadas estão descritas no resumo da entrega. Testes unitários cobrem referências, cobertura do inventário, ciclos, duplicações, busca, vínculo seguro ao catálogo, progresso, câmera e fichas com um provedor sem conexão. A navegação foi exercitada no navegador em desktop e viewport de celular. Leitores de tela reais e pinça em hardware Android/iOS exigem uma verificação em aparelhos; testes de semântica e exportação dos bundles não equivalem a esses testes físicos.
