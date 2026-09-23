import { View, Pressable } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';
import { ArrowUpRight } from 'lucide-react-native';
import { Monster, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { SOURCE_GROUPS, MAP_NODES, TERRITORIES } from './catalog';
import { ATLAS_SIZE, GROUP_POSITIONS, TERRITORY_ORIGINS } from './layout';
import type { TerritoryId } from './types';

const island = 'M50 62 C95 0 217 30 280 12 C378 -8 429 23 513 19 C619 12 731 74 713 151 C747 231 701 331 626 365 C554 408 438 383 347 399 C245 432 132 385 66 340 C4 298 -4 214 19 150 C-3 110 13 83 50 62Z';
export function AtlasArt({ onGroup, filter }: { onGroup: (id: string) => void; filter?: TerritoryId }) {
  return <>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', pointerEvents: 'none' }}><Svg width={ATLAS_SIZE.width} height={ATLAS_SIZE.height}>
      <Defs><Pattern id="atlas-dots" x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse"><Circle cx={1} cy={1} r={1} fill="#D8D0C7" /></Pattern></Defs>
      <Rect width="100%" height="100%" fill="url(#atlas-dots)" />
      {TERRITORIES.map(territory => {
        const origin = TERRITORY_ORIGINS[territory.id];
        return <G key={territory.id} transform={`translate(${origin.x} ${origin.y})`} opacity={filter && filter !== territory.id ? .22 : 1}>
          <Path d={island} transform={territory.id === 'chemistry' ? 'scale(1 1.18)' : undefined} fill={territory.fill} stroke={territory.color} strokeOpacity={.16} strokeWidth={2} />
          <Path d={island} transform="translate(20 18) scale(.94 .92)" fill="none" stroke={territory.color} strokeOpacity={.14} strokeWidth={2} strokeDasharray="4 8" />
          {[0, 1, 2, 3].map(index => <Path key={index} d={`M${80 + index * 125} 112 q20 -12 40 0 t40 0`} fill="none" stroke={territory.color} strokeOpacity={.16} strokeWidth={2} />)}
        </G>;
      })}
      <G transform="translate(160 830)" stroke={c.purple} opacity={.35}>
        <Circle r={55} fill="none" strokeDasharray="2 7" />
        <Path d="M0 -65 L13 -13 L65 0 L13 13 L0 65 L-13 13 L-65 0 L-13 -13Z" fill="#DDD4E6" />
        <Path d="M0 -65 L0 0 L13 -13Z" fill={c.purple} />
        <Circle r={5} fill={c.purple} />
      </G>
      <Line x1={1205} x2={1395} y1={875} y2={875} stroke="#B5A5C3" strokeWidth={2} />
      <Path d="M1205 869 v12 M1300 869 v12 M1395 869 v12" stroke="#B5A5C3" strokeWidth={2} />
    </Svg></View>
    {TERRITORIES.map(territory => {
      const origin = TERRITORY_ORIGINS[territory.id];
      return <View key={territory.id} style={{ pointerEvents: 'none', position: 'absolute', left: origin.x + 55, top: origin.y + 27, opacity: filter && filter !== territory.id ? .25 : 1 }}>
        <Txt color={territory.color} size={12} weight="bold" style={{ letterSpacing: 3 }}>TERRITÓRIO {territory.number}</Txt>
        <Txt color={territory.color} size={54} weight="heading" style={{ letterSpacing: -1 }}>{territory.name}</Txt>
        <View style={{ position: 'absolute', left: 480, top: -53, transform: [{ rotate: territory.id === 'biology' ? '-8deg' : '7deg' }] }}><Monster id={territory.monster} size={150} /></View>
      </View>;
    })}
    {SOURCE_GROUPS.map(group => {
      const position = GROUP_POSITIONS[group.id];
      const territory = TERRITORIES.find(t => t.id === group.territory)!;
      const count = MAP_NODES.filter(node => node.groupId === group.id).length;
      return <Pressable key={group.id} accessibilityRole="button" accessibilityLabel={`Explorar ${group.title}, ${count} conteúdos de ${territory.name}`} onPress={() => onGroup(group.id)} style={({ pressed, hovered }) => ({ position: 'absolute', left: position.x, top: position.y, width: 283, height: 51, flexDirection: 'row', gap: 10, paddingHorizontal: 13, alignItems: 'center', borderRadius: 15, backgroundColor: hovered ? '#FFFFFF' : '#FFFFFFC9', borderWidth: 1, borderColor: hovered ? territory.color : '#FFFFFF', opacity: filter && filter !== group.territory ? .32 : pressed ? .65 : 1 })}>
        <View style={{ width: 23, height: 23, borderRadius: 12, borderColor: territory.color, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: territory.color }} /></View>
        <Txt selectable={false} size={18} color={territory.color} weight="bold" style={{ flex: 1, lineHeight: 21 }}>{group.title}</Txt><ArrowUpRight size={15} color={territory.color} />
      </Pressable>;
    })}
    <View style={{ pointerEvents: 'none', position: 'absolute', left: 74, top: 922 }}><Txt size={12} color={c.muted} style={{ letterSpacing: 2 }}>CADA DESCOBERTA</Txt><Txt size={19} color={c.purple} weight="heading">abre novos caminhos.</Txt></View>
    <View style={{ pointerEvents: 'none', position: 'absolute', left: 1190, top: 900 }}><Txt size={12} color={c.muted}>UM MONSTRO POR VEZ</Txt><Txt size={11} color={c.muted}>Atlas de Ciências da Natureza</Txt></View>
  </>;
}
