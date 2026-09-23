import type { Masteries, Topic } from '@/learning/types';
import { BIOLOGY_NODES } from './biology';
import { CHEMISTRY_NODES } from './chemistry';
import { PHYSICS_NODES } from './physics';
import { MAP_EDGES } from './relations';
import { SOURCE_GROUPS } from './sources';
import type { MapEdge, MapNode, NodeState, SourceGroup, TerritoryId } from './types';

export { MAP_EDGES, SOURCE_GROUPS };
export const MAP_NODES = [...BIOLOGY_NODES, ...PHYSICS_NODES, ...CHEMISTRY_NODES];
export const NODES_BY_ID = Object.fromEntries(MAP_NODES.map(node => [node.id, node]));
export const GROUPS_BY_ID = Object.fromEntries(SOURCE_GROUPS.map(group => [group.id, group]));
export const TERRITORIES = [
  { id: 'biology', name: 'Biologia', subtitle: 'A vida em todas as escalas', color: '#276348', fill: '#E1EFDE', number: '01', monster: 'cytology' },
  { id: 'physics', name: 'Física', subtitle: 'As forças que movem o mundo', color: '#59418D', fill: '#E9E0F3', number: '02', monster: 'kinematics' },
  { id: 'chemistry', name: 'Química', subtitle: 'A matéria em transformação', color: '#8A4D2A', fill: '#F6E3CF', number: '03', monster: 'solutions' },
] as const;

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}
export function searchNodes(query: string, territory?: TerritoryId): MapNode[] {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return MAP_NODES.filter(node => {
    const group = GROUPS_BY_ID[node.groupId];
    const text = normalizeSearch([node.title, node.summary, ...(node.aliases ?? []), group.title, ...node.sourceItems.map(index => group.items[index])].join(' '));
    return (!territory || group.territory === territory) && terms.every(term => text.includes(term));
  });
}
export function relationsFor(nodeId: string) {
  return {
    before: MAP_EDGES.filter(edge => edge.kind === 'before' && edge.to === nodeId),
    after: MAP_EDGES.filter(edge => edge.kind === 'before' && edge.from === nodeId),
    related: MAP_EDGES.filter(edge => edge.kind === 'related' && (edge.from === nodeId || edge.to === nodeId)),
  };
}
export function resolveNodeState(node: MapNode, topics: Topic[], masteries: Masteries): NodeState {
  const territory = TERRITORIES.find(t => t.id === GROUPS_BY_ID[node.groupId].territory)!;
  const topic = topics.find(t => t.id === (node.topicId ?? node.id) && t.discipline === territory.name);
  if (!topic) return { label: 'Monstro em preparação' };
  const mastery = masteries[topic.id];
  if (!mastery?.encountered) return { topic, mastery, label: 'A descobrir' };
  const labels = { unseen: 'A descobrir', learning: 'Em aprendizagem', consolidating: 'Consolidando', mastered: 'Dominado', review: 'Revisão' };
  const due = mastery.nextReviewAt && Date.parse(mastery.nextReviewAt) <= Date.now();
  return { topic, mastery, label: due ? 'Revisão' : labels[mastery.stage] };
}

/** Integrity checks intentionally accept external data, so tests can inject failures. */
export function validateMap(nodes: MapNode[], edges: MapEdge[], groups: SourceGroup[]): string[] {
  const issues: string[] = [];
  const byId = new Map(nodes.map(node => [node.id, node]));
  const byGroup = new Map(groups.map(group => [group.id, group]));
  if (byId.size !== nodes.length) issues.push('ID de conteúdo duplicado');
  if (byGroup.size !== groups.length) issues.push('ID de grupo duplicado');
  const coverage = new Set<string>();
  for (const node of nodes) {
    const group = byGroup.get(node.groupId);
    if (!group) issues.push(`Grupo inexistente: ${node.id}`);
    if (!node.title.trim() || !node.summary.trim() || !node.sourceItems.length) issues.push(`Ficha incompleta: ${node.id}`);
    for (const item of node.sourceItems) {
      if (!Number.isInteger(item) || !group?.items[item]) issues.push(`Referência inválida: ${node.id}:${item}`);
      coverage.add(`${node.groupId}:${item}`);
    }
  }
  for (const group of groups) group.items.forEach((_, index) => {
    if (!coverage.has(`${group.id}:${index}`)) issues.push(`Objeto sem cobertura: ${group.id}:${index}`);
  });
  const seen = new Set<string>();
  const adjacency = new Map(nodes.map(node => [node.id, [] as string[]]));
  for (const edge of edges) {
    if (!byId.has(edge.from) || !byId.has(edge.to)) issues.push(`Ligação inválida: ${edge.from}/${edge.to}`);
    if (edge.from === edge.to) issues.push(`Autorreferência: ${edge.from}`);
    if (!edge.reason.trim()) issues.push(`Ligação sem explicação: ${edge.from}/${edge.to}`);
    const pair = edge.kind === 'related' ? [edge.from, edge.to].sort() : [edge.from, edge.to];
    const key = `${edge.kind}:${pair.join('/')}`;
    if (seen.has(key)) issues.push(`Ligação duplicada: ${key}`);
    seen.add(key);
    if (edge.kind === 'before') adjacency.get(edge.from)?.push(edge.to);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) if (visit(next)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  if (nodes.some(node => visit(node.id))) issues.push('Ciclo em estude antes');
  return issues;
}
