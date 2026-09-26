import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lightbulb, MapPinned, Sparkles } from 'lucide-react-native';
import { Button, Card, Eyebrow, Heading, Monster, Progress, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { MAP_NODES, NODES_BY_ID, relationsFor } from '@/map/catalog';
import type { InteractiveModule, ModuleBlock } from '../../shared/interactive-module';
import { ModuleFigure } from './figures';
import { useInteractiveModule } from './data';

function Checkpoint({ block, selected, onSelect }: { block: Extract<ModuleBlock, { kind: 'check' }>; selected?: number; onSelect: (answer: number) => void }) {
  const answered = selected !== undefined;
  const correct = selected === block.answer;
  return <Card style={{ backgroundColor: '#FFFCF9', gap: 13 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Sparkles size={17} color={c.purple} /><Eyebrow color={c.purple}>PARE E PREVEJA</Eyebrow></View>
    <Txt weight="bold" size={17} color={c.purple}>{block.prompt}</Txt>
    <View accessibilityRole="radiogroup" style={{ gap: 8 }}>{block.options.map((option, index) => <Pressable key={`${block.id}-${index}`} accessibilityRole="radio" accessibilityLabel={`${String.fromCharCode(65 + index)}. ${option}`} accessibilityState={{ checked: selected === index }} onPress={() => onSelect(index)} style={{ minHeight: 48, padding: 12, borderRadius: 13, flexDirection: 'row', gap: 9, alignItems: 'center', borderWidth: 1, borderColor: selected === index ? c.purple : c.line, backgroundColor: selected === index ? c.lavender : c.surface }}><Txt size={12} weight="bold" color={c.purple}>{String.fromCharCode(65 + index)}</Txt><Txt size={13} style={{ flex: 1 }}>{option}</Txt></Pressable>)}</View>
    {answered && <View accessibilityLiveRegion="polite" style={{ backgroundColor: correct ? c.softGreen : c.peach, padding: 14, borderRadius: 12, gap: 5 }}><Txt weight="bold" size={13} color={correct ? c.greenDark : c.purple}>{correct ? 'Boa leitura do problema.' : 'Vamos ajustar a ideia.'}</Txt><Txt size={13}>{block.explanation}</Txt></View>}
  </Card>;
}

function ModuleCard({ block, selected, onSelect }: { block: ModuleBlock; selected?: number; onSelect: (answer: number) => void }) {
  switch (block.kind) {
    case 'text': return <Card><Heading size={20}>{block.title}</Heading><Txt size={15} style={{ lineHeight: 24 }}>{block.body}</Txt></Card>;
    case 'analogy': return <Card style={{ backgroundColor: c.lavender }}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Lightbulb size={19} color={c.purple} /><Heading size={20}>{block.title}</Heading></View><Txt size={15} style={{ lineHeight: 24 }}>{block.body}</Txt><View style={{ borderTopWidth: 1, borderColor: '#D7CBE5', paddingTop: 10, gap: 3 }}><Txt size={11} weight="bold" color={c.purple}>ONDE A ANALOGIA PARA</Txt><Txt size={13}>{block.limit}</Txt></View></Card>;
    case 'list': return <Card><Heading size={20}>{block.title}</Heading><View style={{ gap: 11 }}>{block.items.map((item, index) => <View key={`${block.id}-${index}`} style={{ flexDirection: 'row', gap: 9 }}><CheckCircle2 size={16} color={c.greenDark} style={{ marginTop: 3 }} /><Txt size={14} style={{ flex: 1, lineHeight: 22 }}>{item}</Txt></View>)}</View></Card>;
    case 'figure': return <Card><Heading size={20}>{block.title}</Heading><ModuleFigure id={block.figureId} /><Txt size={12} color={c.muted}>{block.caption}</Txt></Card>;
    case 'check': return <Checkpoint block={block} selected={selected} onSelect={onSelect} />;
  }
}

export function ApostilaReader({ module, onBack }: { module: InteractiveModule; onBack: () => void }) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const scroll = useRef<ScrollView>(null);
  const section = module.sections[step];
  const currentMapNode = MAP_NODES.find(item => item.topicId === module.topicId || item.id === module.topicId)?.id ?? module.topicId;
  const related = useMemo(() => {
    if (module.topicId === 'cytology') return ['membrane-transport', 'cell-metabolism', 'dna-proteins'];
    const node = MAP_NODES.find(item => item.topicId === module.topicId || item.id === module.topicId);
    if (!node) return [];
    return relationsFor(node.id).after.map(edge => edge.to).slice(0, 3);
  }, [module.topicId]);
  const go = (index: number) => { setStep(index); scroll.current?.scrollTo({ y: 0, animated: false }); };
  return <ScrollView ref={scroll} contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: c.background }} contentContainerStyle={{ padding: width < 700 ? 19 : 38, paddingBottom: 45 }}>
    <View style={{ width: '100%', maxWidth: 920, alignSelf: 'center', gap: 23 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar da apostila" onPress={onBack} style={{ alignSelf: 'flex-start', minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center' }}><ArrowLeft size={17} color={c.purple} /><Txt size={13} weight="bold" color={c.purple}>Voltar</Txt></Pressable>
      <View style={{ padding: width < 700 ? 22 : 32, borderRadius: 26, backgroundColor: c.peach, flexDirection: width >= 740 ? 'row' : 'column', alignItems: 'center', gap: 15 }}>
        <View style={{ flex: 1, gap: 9 }}><Eyebrow color={c.purple}>APOSTILA INTERATIVA · UM PASSO DE CADA VEZ</Eyebrow><Heading size={width < 700 ? 30 : 38}>{module.title}</Heading><Txt size={14} style={{ lineHeight: 23 }}>{module.intro}</Txt></View>
        {module.topicId === 'cytology' && <Monster id="cytology" size={width < 700 ? 130 : 170} />}
      </View>
      <View style={{ gap: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt size={12} weight="bold" color={c.purple}>ETAPA {step + 1} DE {module.sections.length}</Txt><Txt size={12} color={c.muted}>{Math.round(((step + 1) / module.sections.length) * 100)}% explorado</Txt></View><Progress value={(step + 1) / module.sections.length} label="Etapas exploradas nesta visita" /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" contentContainerStyle={{ gap: 8, paddingVertical: 3 }}>
        {module.sections.map((item, index) => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={`Etapa ${index + 1}: ${item.title}`} accessibilityState={{ selected: step === index }} onPress={() => go(index)} style={{ minHeight: 48, justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: step === index ? c.purple : c.line, backgroundColor: step === index ? c.lavender : c.surface, paddingHorizontal: 14 }}><Txt size={13} weight="bold" color={c.purple}>{index + 1}. {item.title}</Txt></Pressable>)}
      </ScrollView>
      <View style={{ gap: 10 }}><Eyebrow color={c.greenDark}>SEU FOCO AGORA</Eyebrow><Heading size={29}>{section.title}</Heading><Txt size={15} color={c.muted}>{section.objective}</Txt></View>
      <View style={{ gap: 15 }}>{section.blocks.map(block => <ModuleCard key={block.id} block={block} selected={answers[block.id]} onSelect={answer => setAnswers(previous => ({ ...previous, [block.id]: answer }))} />)}</View>
      <View style={{ flexDirection: width >= 600 ? 'row' : 'column', gap: 10 }}>
        {step > 0 && <View style={{ flex: 1 }}><Button title="Etapa anterior" variant="secondary" onPress={() => go(step - 1)} /></View>}
        {step < module.sections.length - 1 && <View style={{ flex: 1 }}><Button title="Próxima etapa" onPress={() => go(step + 1)} /></View>}
      </View>
      {step === module.sections.length - 1 && <Card style={{ backgroundColor: c.softGreen }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><BookOpen size={20} color={c.greenDark} /><Heading size={22}>Você abriu novos caminhos.</Heading></View><Txt size={14}>Estas perguntas ajudam a pensar. O domínio do monstro é construído nas batalhas e revisões.</Txt><Button title="Voltar ao mapa" onPress={() => router.push({ pathname: '/map', params: { node: currentMapNode } })} variant="secondary" />{related.length > 0 && <View style={{ gap: 8 }}><Txt size={12} weight="bold" color={c.purple}>CONTINUE EXPLORANDO</Txt>{related.filter(id => NODES_BY_ID[id]).map(id => <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Abrir ${NODES_BY_ID[id].title} no mapa`} onPress={() => router.push({ pathname: '/map', params: { node: id } })} style={{ minHeight: 44, backgroundColor: c.surface, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}><MapPinned size={16} color={c.purple} /><Txt size={13} weight="bold" color={c.purple} style={{ flex: 1 }}>{NODES_BY_ID[id].title}</Txt><ArrowRight size={16} color={c.purple} /></Pressable>)}</View>}</Card>}
    </View>
  </ScrollView>;
}

export function ApostilaScreen({ topicId, from, mapNode }: { topicId: string; from?: string; mapNode?: string }) {
  const { module, loading, error } = useInteractiveModule(topicId);
  const back = () => {
    if (from === 'monster') {
      try {
        router.dismissTo({ pathname: '/monster', params: { topicId } });
      } catch {
        router.replace({ pathname: '/monster', params: { topicId } });
      }
    } else {
      try {
        router.dismissTo({ pathname: '/map', params: { node: mapNode || topicId } });
      } catch {
        router.replace({ pathname: '/map', params: { node: mapNode || topicId } });
      }
    }
  };
  if (module) return <ApostilaReader key={`${module.topicId}-${module.title}`} module={module} onBack={back} />;
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 17 }}><View style={{ maxWidth: 540, width: '100%', gap: 17 }}><Button title="Voltar" variant="ghost" onPress={back} />{loading ? <Card><ActivityIndicator color={c.purple} /><Txt>Carregando apostila…</Txt></Card> : <Card><Heading size={25}>Apostila em preparação</Heading><Txt>{error ? 'Não foi possível carregar esta apostila agora. Tente novamente com conexão.' : 'Ainda não há uma apostila publicada para este conteúdo.'}</Txt></Card>}</View></ScrollView>;
}
