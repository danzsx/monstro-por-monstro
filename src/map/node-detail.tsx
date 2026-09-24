import { Linking, Pressable, ScrollView, View } from 'react-native';
import { ArrowRight, BookOpen, ExternalLink, Sprout, X } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { Button, Eyebrow, Heading, Monster, Pill, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { GROUPS_BY_ID, NODES_BY_ID, relationsFor, resolveNodeState, TERRITORIES } from './catalog';
import { SOURCES } from './sources';
import type { MapEdge, MapNode } from './types';
import { usePublishedModuleIds } from '@/apostila/data';

export function NodeDetail({ node, onSelect, onClose, onMonster, onApostila }: {
  node: MapNode; onSelect: (id: string) => void; onClose: () => void; onMonster: (topicId: string) => void; onApostila?: (topicId: string) => void;
}) {
  const { topics, state } = useApp();
  const hasModule = usePublishedModuleIds();
  const status = resolveNodeState(node, topics, state.masteries);
  const group = GROUPS_BY_ID[node.groupId];
  const territory = TERRITORIES.find(t => t.id === group.territory)!;
  const links = relationsFor(node.id);
  const section = (title: string, edges: MapEdge[], empty: string) => <View style={{ gap: 9 }}>
    <Txt accessibilityRole="header" weight="bold" size={15} color={c.purple}>{title}</Txt>
    {!edges.length && <Txt size={12} color={c.muted}>{empty}</Txt>}
    {edges.map(edge => {
      const other = NODES_BY_ID[edge.from === node.id ? edge.to : edge.from];
      return <Pressable key={other.id} accessibilityRole="button" accessibilityLabel={`${other.title}. ${edge.reason}`} onPress={() => onSelect(other.id)} style={({ hovered }) => ({ padding: 12, borderRadius: 13, gap: 5, borderWidth: 1, borderColor: hovered ? c.purple : c.line, backgroundColor: '#FFFCF9' })}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Txt weight="bold" size={13} color={c.purple} style={{ flex: 1 }}>{other.title}</Txt><ArrowRight size={14} color={c.purple} /></View><Txt size={12} color={c.muted}>{edge.reason}</Txt></Pressable>;
    })}
  </View>;
  return <View style={{ flex: 1, backgroundColor: c.surface }}>
    <View style={{ padding: 16, paddingBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Eyebrow color={territory.color}>FICHA DE EXPLORAÇÃO</Eyebrow><Pressable accessibilityRole="button" accessibilityLabel="Fechar ficha" onPress={onClose} hitSlop={4} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X size={20} color={c.purple} /></Pressable></View>
    <ScrollView key={node.id} contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 36, gap: 23 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><View style={{ flex: 1, gap: 9 }}><Txt size={11} weight="bold" color={territory.color}>{territory.name} · {group.title}</Txt><Heading size={27}>{node.title}</Heading></View>{status.topic ? <Monster id={status.topic.id} size={76} /> : <View style={{ backgroundColor: territory.fill, padding: 15, borderRadius: 28 }}><Sprout size={27} color={territory.color} /></View>}</View>
      <View style={{ gap: 13 }}><Pill green={status.mastery?.stage === 'mastered'}>{status.label}</Pill><Txt size={14} style={{ lineHeight: 23 }}>{node.summary}</Txt>{status.topic && hasModule(status.topic.id) && onApostila && <Button title="Abrir apostila interativa" onPress={() => onApostila(status.topic!.id)} />}{status.topic && <Button title="Conhecer este monstro" variant="secondary" onPress={() => onMonster(status.topic!.id)} />}</View>
      <View style={{ backgroundColor: c.lavender, borderRadius: 15, padding: 14, gap: 5 }}><Txt size={12} weight="bold" color={c.purple}>Você escolhe o caminho.</Txt><Txt size={12} color={c.purple}>Estas ligações são curadoria pedagógica. Sugerem uma sequência de estudo e não bloqueiam suas batalhas.</Txt></View>
      {section('Estude antes', links.before, 'Você pode começar por aqui. Nenhuma base anterior foi indicada neste mapa.')}
      {section('Ajuda a aprender', links.after, 'Novos caminhos podem surgir conforme você explora.')}
      {section('Também se conecta', links.related, 'Sem conexões adicionais nesta versão.')}
      <View style={{ gap: 9, borderTopWidth: 1, borderColor: c.line, paddingTop: 20 }}><View style={{ flexDirection: 'row', gap: 8 }}><BookOpen size={16} color={c.purple} /><Txt accessibilityRole="header" size={14} weight="bold" color={c.purple}>Origem na matriz do Inep</Txt></View><Txt size={12} color={c.muted}>{group.section} · {group.officialTitle}</Txt>{node.sourceItems.map(index => <Txt key={index} size={12} color={c.muted}>• {group.items[index]}</Txt>)}<Txt size={11} color={c.muted}>Descrição dos objetos em linguagem resumida. A matriz define os conteúdos; as relações de estudo foram propostas para este atlas.</Txt><Pressable accessibilityRole="link" accessibilityLabel="Abrir matriz oficial do ENEM no Inep, documento externo" onPress={() => void Linking.openURL(SOURCES.matrix)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Txt size={12} weight="bold" color={c.purple}>Consultar matriz oficial</Txt><ExternalLink size={14} color={c.purple} /></Pressable></View>
    </ScrollView>
  </View>;
}
