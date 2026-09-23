import type { Topic, TopicMastery } from '@/learning/types';

export type TerritoryId = 'biology' | 'physics' | 'chemistry';
export type Point = { x: number; y: number };
export interface SourceGroup {
  id: string;
  territory: TerritoryId;
  title: string;
  officialTitle: string;
  section: string;
  /** Paraphrased, exhaustive inventory of the source group's objects. */
  items: string[];
}
export interface MapNode {
  id: string;
  groupId: string;
  title: string;
  summary: string;
  /** Zero-based entries in SourceGroup.items. Multiple units may cover an entry. */
  sourceItems: number[];
  topicId?: string;
  aliases?: string[];
}
export interface MapEdge {
  from: string;
  to: string;
  kind: 'before' | 'related';
  reason: string;
}
export type NodeState = { topic?: Topic; mastery?: TopicMastery; label: string };
export type Unit = [id: string, title: string, summary: string, sourceItems: number[], topicId?: string, aliases?: string[]];
export function units(groupId: string, rows: Unit[]): MapNode[] {
  return rows.map(([id, title, summary, sourceItems, topicId, aliases]) => ({ id, groupId, title, summary, sourceItems, topicId, aliases }));
}
