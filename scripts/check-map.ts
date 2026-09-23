import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MAP_EDGES, MAP_NODES, NODES_BY_ID, relationsFor, SOURCE_GROUPS, TERRITORIES, validateMap } from '../src/map/catalog';
import { MAP_VERSION, SOURCES } from '../src/map/sources';

const errors = validateMap(MAP_NODES, MAP_EDGES, SOURCE_GROUPS);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Mapa v${MAP_VERSION}: ${MAP_NODES.length} conteúdos, ${SOURCE_GROUPS.length} grupos, ${MAP_EDGES.length} relações. Integridade e cobertura: OK.`);

if (process.argv.includes('--report')) {
  const lines = [
    '# Inventário do Mapa dos Monstros', '',
    `Versão ${MAP_VERSION}. Gerado com \`npx tsx scripts/check-map.ts --report\`.`, '',
    `Base: [matriz referenciada pelo edital de 2026](${SOURCES.matrix}). Consulte [metodologia e limites da verificação](nature-map.md).`, '',
    'As relações abaixo são curadoria pedagógica, com justificativa. Não são exigências do Inep nem bloqueios de batalha.', '',
  ];
  for (const territory of TERRITORIES) {
    lines.push(`## ${territory.name}`, '');
    for (const group of SOURCE_GROUPS.filter(g => g.territory === territory.id)) {
      lines.push(`### ${group.title}`, '', `Fonte: seção ${group.section}, **${group.officialTitle}**.`, '', 'Recortes de cobertura (paráfrases dos objetos da matriz):', '');
      group.items.forEach((item, index) => {
        const titles = MAP_NODES.filter(n => n.groupId === group.id && n.sourceItems.includes(index)).map(n => n.title);
        lines.push(`- **${index + 1}. ${item}** → ${titles.join('; ')}.`);
      });
      lines.push('');
      for (const node of MAP_NODES.filter(n => n.groupId === group.id)) {
        lines.push(`#### ${node.title}`, '', `ID: \`${node.id}\`${node.topicId ? ` · vínculo: \`${node.topicId}\`` : ''}. Recortes: ${node.sourceItems.map(i => i + 1).join(', ')}.`, '', node.summary, '');
        const links = relationsFor(node.id);
        for (const edge of links.before) lines.push(`- **Estude antes: ${NODES_BY_ID[edge.from].title}.** ${edge.reason}`);
        for (const edge of links.related) lines.push(`- **Também se conecta: ${NODES_BY_ID[edge.from === node.id ? edge.to : edge.from].title}.** ${edge.reason}`);
        if (!links.before.length) lines.push('- Nenhuma base anterior indicada.');
        lines.push('');
      }
    }
  }
  mkdirSync(resolve('docs'), { recursive: true });
  writeFileSync(resolve('docs/nature-map-inventory.md'), lines.join('\n'), 'utf8');
  console.log('Relatório: docs/nature-map-inventory.md');
}
