import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Compass, List, Search, X } from 'lucide-react-native';
import { Eyebrow, Heading, Txt } from '@/ui/primitives';
import { colors as c, fonts } from '@/ui/theme';
import { AtlasArt } from './atlas-art';
import { GroupArt } from './group-art';
import { MapCanvas } from './map-canvas';
import { NodeDetail } from './node-detail';
import { GROUPS_BY_ID, MAP_NODES, NODES_BY_ID, searchNodes, SOURCE_GROUPS, TERRITORIES } from './catalog';
import { ATLAS_SIZE, GROUP_POSITIONS, groupScene, TERRITORY_ORIGINS } from './layout';
import type { Point, TerritoryId } from './types';

export default function MapScreen() {
  const { node: routeNode } = useLocalSearchParams<{ node?: string }>();
  return <MapContent key={routeNode ?? 'atlas'} routeNode={routeNode} />;
}

function MapContent({ routeNode }: { routeNode?: string }) {
  const initial = routeNode ? NODES_BY_ID[routeNode] : undefined;
  const [groupId, setGroupId] = useState<string | undefined>(initial?.groupId);
  const [selectedId, setSelectedId] = useState<string | undefined>(initial?.id);
  const [filter, setFilter] = useState<TerritoryId>();
  const [sheet, setSheet] = useState<'search' | 'groups' | 'detail' | undefined>(initial ? 'detail' : undefined);
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const wide = width >= 1150;
  const insets = useSafeAreaInsets();
  const selected = selectedId ? NODES_BY_ID[selectedId] : undefined;
  const scene = useMemo(() => groupId ? groupScene(groupId, selectedId) : undefined, [groupId, selectedId]);
  const results = useMemo(() => searchNodes(query, filter), [query, filter]);
  const groups = SOURCE_GROUPS.filter(g => !filter || g.territory === filter);
  const openGroup = (id: string) => { setGroupId(id); setSelectedId(undefined); setSheet(undefined); };
  const select = (id: string) => {
    const node = NODES_BY_ID[id];
    if (!node) return;
    setGroupId(node.groupId); setSelectedId(id); setSheet('detail');
  };
  const atlas = () => { setGroupId(undefined); setSelectedId(undefined); setFilter(undefined); setSheet(undefined); router.setParams({ node: undefined }); };
  const closeDetail = () => { setSheet(undefined); if (wide) setSelectedId(undefined); };
  const focus: Point | undefined = selected && scene ? { x: scene.positions[selected.id].x + 117, y: scene.positions[selected.id].y + 55 } : !scene && filter ? { x: TERRITORY_ORIGINS[filter].x + 365, y: TERRITORY_ORIGINS[filter].y + 240 } : undefined;
  const exploreZoom = (point: Point) => {
    const nearest = groups.reduce((best, group) => {
      const pos = GROUP_POSITIONS[group.id]; const prev = GROUP_POSITIONS[best.id];
      return Math.hypot(pos.x + 140 - point.x, pos.y + 25 - point.y) < Math.hypot(prev.x + 140 - point.x, prev.y + 25 - point.y) ? group : best;
    }, groups[0]);
    openGroup(nearest.id);
  };
  const openMonster = (topicId: string) => {
    setSheet(undefined);
    router.push({ pathname: '/monster', params: { topicId, from: 'map', mapNode: selectedId } });
  };
  const openApostila = (topicId: string) => {
    setSheet(undefined);
    router.push({ pathname: '/apostila', params: { topicId, from: 'map', mapNode: selectedId } });
  };
  const groupList = <ScrollView contentContainerStyle={{ padding: 20, gap: 22 }}>
    <View style={{ gap: 9 }}><Compass size={27} color={c.purple} /><Heading size={24}>Seu próximo caminho.</Heading><Txt size={13} color={c.muted}>Explore um território e toque em um conteúdo para descobrir suas conexões.</Txt></View>
    {TERRITORIES.filter(t => !filter || t.id === filter).map(territory => <View key={territory.id} style={{ gap: 8 }}><Eyebrow color={territory.color}>{territory.name}</Eyebrow>{groups.filter(g => g.territory === territory.id).map(group => <Pressable key={group.id} accessibilityRole="button" accessibilityLabel={`Explorar ${group.title}`} onPress={() => openGroup(group.id)} style={({ hovered }) => ({ minHeight: 48, padding: 11, borderRadius: 12, backgroundColor: hovered ? territory.fill : '#FAF7F2', flexDirection: 'row', gap: 10, alignItems: 'center' })}><Txt size={13} weight="medium" color={c.purple} style={{ flex: 1 }}>{group.title}</Txt><Txt size={10} color={c.muted}>{MAP_NODES.filter(n => n.groupId === group.id).length}</Txt><ArrowRight size={14} color={territory.color} /></Pressable>)}</View>)}
    <Txt size={11} color={c.muted}>O mapa organiza relações de aprendizagem. Posição, cor e tamanho não representam frequência de cobrança no ENEM.</Txt>
  </ScrollView>;
  const detail = selected ? <NodeDetail node={selected} onSelect={select} onClose={closeDetail} onMonster={openMonster} onApostila={openApostila} /> : null;

  return <View style={{ flex: 1 }}>
    <View style={{ paddingHorizontal: wide ? 28 : 18, paddingTop: wide ? 25 : 16, paddingBottom: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1, gap: 6 }}><Eyebrow>CIÊNCIAS DA NATUREZA</Eyebrow><Heading size={wide ? 34 : 27}>Mapa dos monstros</Heading>{wide && <Txt size={13} color={c.muted}>Três territórios. {MAP_NODES.length} descobertas. Um caminho que é seu.</Txt>}</View><Pressable accessibilityRole="button" accessibilityLabel="Buscar conteúdos" onPress={() => setSheet('search')} style={{ minHeight: 46, paddingHorizontal: 14, borderRadius: 15, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, flexDirection: 'row', gap: 10, alignItems: 'center' }}><Search size={18} color={c.purple} />{wide && <Txt size={13} color={c.muted}>Buscar conteúdo</Txt>}</Pressable></View>
      <View style={{ flexDirection: 'row', gap: 7 }}>
        {TERRITORIES.map(t => <Pressable key={t.id} accessibilityRole="button" accessibilityLabel={`Território ${t.name}`} accessibilityState={{ selected: filter === t.id }} onPress={() => { setFilter(filter === t.id ? undefined : t.id); setGroupId(undefined); setSelectedId(undefined); if (!wide) setSheet('groups'); }} style={{ minHeight: 44, flex: wide ? undefined : 1, paddingHorizontal: wide ? 17 : 8, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, backgroundColor: t.fill, borderWidth: 1, borderColor: filter === t.id ? t.color : 'transparent' }}><View style={{ width: 7, height: 7, borderRadius: 5, backgroundColor: t.color }} /><Txt size={12} weight="bold" color={t.color}>{t.name}</Txt></Pressable>)}
        {wide && <View style={{ flex: 1 }} />}
        <Pressable accessibilityRole="button" accessibilityLabel="Todos os conteúdos em lista" onPress={() => { setQuery(''); setSheet('search'); }} style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.line }}><List size={18} color={c.purple} /></Pressable>
      </View>
    </View>
    <View style={{ flex: 1, flexDirection: 'row', borderTopWidth: 1, borderColor: c.line }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, minHeight: 48, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#FFFCF9', borderBottomWidth: 1, borderColor: c.line }}>
          {scene || filter ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao atlas completo" onPress={atlas} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }}><ArrowLeft size={16} color={c.purple} /><Txt size={12} weight="bold" color={c.purple}>Atlas</Txt></Pressable> : <Compass size={17} color={c.purple} />}
          <Txt size={12} color={c.muted} numberOfLines={1} style={{ flex: 1 }}>{scene ? scene.group.title : filter ? TERRITORIES.find(t => t.id === filter)!.name : 'Escolha um território para explorar'}</Txt>
          {!wide && <Pressable accessibilityRole="button" accessibilityLabel="Explorar grupos" onPress={() => setSheet('groups')} style={{ padding: 10 }}><List size={18} color={c.purple} /></Pressable>}
        </View>
        <MapCanvas sceneWidth={scene?.width ?? ATLAS_SIZE.width} sceneHeight={scene?.height ?? ATLAS_SIZE.height} sceneKey={groupId ?? 'atlas'} focus={focus} onExploreZoom={scene ? undefined : exploreZoom}>
          {scene ? <GroupArt scene={scene} selectedId={selectedId} onSelect={select} /> : <AtlasArt filter={filter} onGroup={openGroup} />}
        </MapCanvas>
        {selected && !wide && <Pressable accessibilityRole="button" accessibilityLabel={`Reabrir ficha de ${selected.title}`} onPress={() => setSheet('detail')} style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: c.lavender, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Txt size={12} weight="bold" color={c.purple} style={{ flex: 1 }}>{selected.title}</Txt><ArrowRight size={16} color={c.purple} /></Pressable>}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFCF9', gap: 3 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}><Txt size={10} color={c.purple}>→ Estude antes</Txt><Txt size={10} color="#276348">┄ Também se conecta</Txt></View><Txt size={10} color={c.muted}>Curadoria pedagógica · caminhos livres, sem bloqueios</Txt></View>
      </View>
      {wide && <View style={{ width: 325, borderLeftWidth: 1, borderColor: c.line, backgroundColor: c.surface }}>{detail ?? groupList}</View>}
    </View>
    <Modal visible={sheet === 'search' || sheet === 'groups' || (sheet === 'detail' && !wide)} transparent animationType="none" onRequestClose={() => setSheet(undefined)}>
      <View style={{ flex: 1, backgroundColor: '#1E0C5966', justifyContent: 'center', alignItems: 'center', paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16), paddingHorizontal: wide ? 28 : 12 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 620, flex: 1, maxHeight: wide ? 780 : undefined, backgroundColor: c.surface, borderRadius: 24, overflow: 'hidden' }}>
          {sheet === 'detail' ? detail : <>
            <View style={{ padding: 18, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Heading size={23}>{sheet === 'search' ? 'Encontre seu caminho' : 'Explore os grupos'}</Heading><View style={{ flex: 1 }} /><Pressable accessibilityRole="button" accessibilityLabel="Fechar lista" onPress={() => setSheet(undefined)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X size={21} color={c.purple} /></Pressable></View>
            {sheet === 'groups' ? groupList : <>
              <View style={{ marginHorizontal: 18, marginBottom: 10, gap: 10 }}><TextInput autoFocus accessibilityLabel="Buscar conteúdo por nome ou assunto" placeholder="Busque genética, osmose, energia…" placeholderTextColor={c.muted} value={query} onChangeText={setQuery} style={{ minHeight: 52, borderWidth: 1, borderColor: c.line, borderRadius: 14, paddingHorizontal: 15, fontFamily: fonts.body, color: c.purple, fontSize: 15 }} /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Txt size={12} color={c.muted} accessibilityLiveRegion="polite">{results.length} conteúdos{filter ? ` · ${TERRITORIES.find(t => t.id === filter)!.name}` : ' · todas as disciplinas'}</Txt>{filter && <Pressable accessibilityRole="button" accessibilityLabel="Buscar em todas as disciplinas" onPress={() => setFilter(undefined)} style={{ minHeight: 44, justifyContent: 'center' }}><Txt size={12} weight="bold" color={c.purple}>Ver todos</Txt></Pressable>}</View></View>
              <FlatList data={results} keyboardShouldPersistTaps="handled" keyExtractor={item => item.id} contentContainerStyle={{ padding: 18, paddingTop: 0, gap: 8 }} ListEmptyComponent={<Txt color={c.muted}>Nenhum conteúdo encontrado. Tente outro termo ou explore os grupos.</Txt>} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${item.title}`} onPress={() => select(item.id)} style={({ hovered }) => ({ padding: 14, borderRadius: 15, backgroundColor: hovered ? c.lavender : c.background, minHeight: 68, gap: 3 })}><Txt size={15} weight="bold" color={c.purple}>{item.title}</Txt><Txt size={11} color={c.muted}>{TERRITORIES.find(t => t.id === GROUPS_BY_ID[item.groupId].territory)!.name} · {GROUPS_BY_ID[item.groupId].title}</Txt></Pressable>} />
            </>}
          </>}
        </View>
      </View>
    </Modal>
  </View>;
}
