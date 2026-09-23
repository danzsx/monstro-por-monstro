import { Pressable, View } from 'react-native';
import Svg, { Defs, Marker, Path } from 'react-native-svg';
import { ArrowUpRight, CircleDot } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { Monster, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { GROUPS_BY_ID, resolveNodeState, TERRITORIES } from './catalog';
import { groupScene } from './layout';

export function GroupArt({ scene, selectedId, onSelect }: {
  scene: ReturnType<typeof groupScene>; selectedId?: string; onSelect: (id: string) => void;
}) {
  const { topics, state } = useApp();
  return <View style={{ width: scene.width, height: scene.height }}>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', pointerEvents: 'none' }}><Svg width={scene.width} height={scene.height}>
      <Defs><Marker id="prerequisite-arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto"><Path d="M0,0 L6,3 L0,6 Z" fill={c.purple} /></Marker></Defs>
      {scene.edges.map((edge, index) => {
        const a = scene.positions[edge.from]; const b = scene.positions[edge.to];
        const sameRow = a.y === b.y;
        const right = b.x > a.x;
        const sx = sameRow ? a.x + (right ? 234 : 0) : a.x + 117;
        const sy = sameRow ? a.y + 53 : a.y + (b.y > a.y ? 110 : 0);
        const ex = sameRow ? b.x + (right ? 0 : 234) : b.x + 117;
        const ey = sameRow ? b.y + 53 : b.y + (b.y > a.y ? 0 : 110);
        // Route through the gutters so an edge never passes behind an intervening card.
        const direction = b.y > a.y ? 1 : -1;
        const lane = 22 + (index % 3) * 5;
        const gutter = a.x - lane;
        const d = sameRow
          ? `M${sx},${sy} C${sx + (right ? 22 : -22)},${sy - 26} ${ex + (right ? -22 : 22)},${ey - 26} ${ex},${ey}`
          : `M${sx},${sy} L${sx},${sy + direction * lane} L${gutter},${sy + direction * lane} L${gutter},${ey - direction * lane} L${ex},${ey - direction * lane} L${ex},${ey}`;
        return <Path key={index} d={d} stroke={edge.kind === 'before' ? c.purple : '#478267'} strokeWidth={selectedId ? 2.6 : 1.6} strokeLinejoin="round" strokeDasharray={edge.kind === 'related' ? '6 6' : undefined} markerEnd={edge.kind === 'before' ? 'url(#prerequisite-arrow)' : undefined} fill="none" opacity={selectedId ? .8 : .3} />;
      })}
    </Svg></View>
    <View style={{ position: 'absolute', left: 70, top: 35, right: 50, gap: 4 }}><Txt size={11} weight="bold" color={c.muted}>EXPLORE OS CONTEÚDOS</Txt><Txt size={24} weight="heading" color={c.purple}>{scene.group.title}</Txt></View>
    {scene.nodes.some(n => n.groupId !== scene.group.id) && <Txt size={11} weight="bold" color={c.muted} style={{ position: 'absolute', left: 70, top: scene.externalY - 38 }}>PONTES PARA OUTROS GRUPOS</Txt>}
    {scene.nodes.map(node => {
      const point = scene.positions[node.id];
      const territory = TERRITORIES.find(t => t.id === GROUPS_BY_ID[node.groupId].territory)!;
      const status = resolveNodeState(node, topics, state.masteries);
      const selected = selectedId === node.id;
      return <Pressable key={node.id} accessibilityRole="button" accessibilityLabel={`${node.title}. ${status.label}. Abrir ficha`} accessibilityState={{ selected }} onPress={() => onSelect(node.id)} style={({ hovered }) => ({ position: 'absolute', left: point.x, top: point.y, width: 234, minHeight: 110, padding: 15, gap: 7, borderRadius: 23, borderWidth: selected ? 2.5 : 1.5, borderColor: selected || hovered ? c.purple : territory.color + '55', backgroundColor: selected ? '#F0E8FF' : '#FFFCF9', boxShadow: selected ? '0 0 0 7px #2812550D' : '0 4px 0 #28125507' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><CircleDot size={13} color={territory.color} /><Txt selectable={false} size={10} weight="bold" color={territory.color}>{territory.name.toUpperCase()}</Txt><View style={{ flex: 1 }} /><ArrowUpRight size={14} color={c.purple} /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Txt selectable={false} size={15} weight="bold" color={c.purple} style={{ flex: 1, lineHeight: 19 }}>{node.title}</Txt>{status.topic && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Monster id={status.topic.id} size={36} /></View>}</View>
        <Txt selectable={false} size={10} color={status.mastery?.stage === 'mastered' ? c.greenDark : c.muted}>{status.label}</Txt>
      </Pressable>;
    })}
  </View>;
}
