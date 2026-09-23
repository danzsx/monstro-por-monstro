import { GROUPS_BY_ID, MAP_EDGES, MAP_NODES, SOURCE_GROUPS } from './catalog';
import type { Point, TerritoryId } from './types';

export const ATLAS_SIZE = { width: 1600, height: 1050 };
export const TERRITORY_ORIGINS: Record<TerritoryId, Point> = {
  biology: { x: 45, y: 35 }, physics: { x: 850, y: 35 }, chemistry: { x: 440, y: 535 },
};
export const GROUP_POSITIONS = Object.fromEntries(SOURCE_GROUPS.map(group => {
  const index = SOURCE_GROUPS.filter(g => g.territory === group.territory).findIndex(g => g.id === group.id);
  const origin = TERRITORY_ORIGINS[group.territory];
  return [group.id, { x: origin.x + 55 + (index % 2) * 305, y: origin.y + 155 + Math.floor(index / 2) * 63 }];
}));

/** Stable content grid. Arrowheads indicate order; positions carry no ranking. */
export function groupScene(groupId: string, selectedId?: string) {
  const base = MAP_NODES.filter(node => node.groupId === groupId);
  const nearbyIds = new Set<string>();
  if (selectedId) MAP_EDGES.filter(e => e.from === selectedId || e.to === selectedId).forEach(e => {
    nearbyIds.add(e.from); nearbyIds.add(e.to);
  });
  const outside = MAP_NODES.filter(node => node.groupId !== groupId && nearbyIds.has(node.id));
  // External connections occupy a separate row and are always explained in the detail sheet.
  const nodes = [...base, ...outside];
  const positions: Record<string, Point> = {};
  const cols = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(base.length))));
  base.forEach((node, index) => { positions[node.id] = { x: 70 + (index % cols) * 280, y: 130 + Math.floor(index / cols) * 175 }; });
  const externalY = 185 + Math.ceil(base.length / cols) * 175;
  outside.forEach((node, index) => { positions[node.id] = { x: 70 + (index % cols) * 280, y: externalY + Math.floor(index / cols) * 175 }; });
  const ids = new Set(nodes.map(n => n.id));
  const edges = MAP_EDGES.filter(e => ids.has(e.from) && ids.has(e.to) && (!selectedId || e.from === selectedId || e.to === selectedId));
  return { nodes, positions, edges, externalY, width: cols * 280 + 100, height: (outside.length ? externalY + Math.ceil(outside.length / cols) * 175 : 180 + Math.ceil(base.length / cols) * 175), group: GROUPS_BY_ID[groupId] };
}

export interface Camera { x: number; y: number; scale: number }
export function fitCamera(viewport: { width: number; height: number }, scene: { width: number; height: number }): Camera {
  const scale = Math.max(0.05, Math.min((viewport.width - 28) / scene.width, (viewport.height - 28) / scene.height, 1));
  return { scale, x: (viewport.width - scene.width * scale) / 2, y: (viewport.height - scene.height * scale) / 2 };
}
export function zoomCamera(camera: Camera, factor: number, anchor: Point, min: number, max: number): Camera {
  const scale = Math.min(max, Math.max(min, camera.scale * factor));
  const ratio = scale / camera.scale;
  return { scale, x: anchor.x - (anchor.x - camera.x) * ratio, y: anchor.y - (anchor.y - camera.y) * ratio };
}
