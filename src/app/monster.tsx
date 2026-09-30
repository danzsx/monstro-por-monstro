import { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, BookOpen, FlaskConical, Microscope, Target } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { MonsterStudyControls } from '@/learning/monster-study-controls';
import { approvedExamQuestions } from '@/learning/evolution';
import { Button, Card, Eyebrow, Heading, Monster, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import type { ConfidenceLevel } from '@/learning/types';
import { usePublishedModuleIds } from '@/apostila/data';

function BulletList({ items }: { items: string[] }) {
  return <View style={{ gap: 13 }}>{items.map((item, index) => <View key={`${index}-${item}`} style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start' }}><View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: c.greenDark, marginTop: 7 }} /><Txt style={{ flex: 1, lineHeight: 25 }}>{item}</Txt></View>)}</View>;
}

function EnemCard() {
  // The CMS has no reproducible method or rights gate for incidence claims yet.
  return <Card style={{ backgroundColor: c.lavender, gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Target color={c.purple} size={21} /><Eyebrow color={c.purple}>COMO ISSO APARECE NO ENEM</Eyebrow></View>
    <Heading size={21}>Curadoria em andamento.</Heading>
    <Txt color={c.muted}>Estamos analisando o edital e provas anteriores para orientar seu foco com cuidado. Esta visão ainda não traz afirmações sobre frequência ou incidência.</Txt>
  </Card>;
}

export default function MonsterKnowledgeScreen() {
  const { topicId, from, mapNode } = useLocalSearchParams<{ topicId: string; from?: string; mapNode?: string }>();
  const returnToContents = () => {
    if (from === 'map') {
      try {
        router.dismissTo({ pathname: '/map', params: { node: mapNode } });
      } catch {
        router.replace({ pathname: '/map', params: { node: mapNode } });
      }
    } else if (from === 'journey') {
      router.replace('/journey');
    } else {
      router.replace('/bestiary');
    }
  };
  const { topicById, state } = useApp();
  const actions = useActions();
  const hasModule = usePublishedModuleIds();
  const { width } = useWindowDimensions();
  const [openedAt] = useState(() => Date.now());
  const topic = useMemo(() => {
    try { return topicById(topicId); } catch { return null; }
  }, [topicById, topicId]);
  const mastery = topic ? state.masteries[topic.id] : undefined;
  const confidence = topic ? (state.confidenceRatings ?? []).filter(r => r.topicId === topic.id).at(-1) : undefined;

  if (!topic) return <Page narrow><Button title={from === 'map' ? 'Voltar ao mapa' : 'Voltar ao meu bestiário'} variant="secondary" onPress={returnToContents} /><Card><Heading>Não encontramos esse monstro.</Heading><Txt color={c.muted}>Ele pode ter sido removido do catálogo.</Txt></Card></Page>;

  const context = topic.learningContext;
  const horizontal = width >= 760;
  return <Page narrow>
    <Button title={from === 'map' ? 'Voltar ao mapa' : 'Meu bestiário'} variant="ghost" icon={<ArrowLeft size={17} color={c.purple} />} onPress={returnToContents} />
    <View style={{ backgroundColor: topic.discipline === 'Biologia' ? c.peach : c.lavender, borderRadius: 26, padding: horizontal ? 30 : 18, flexDirection: horizontal ? 'row' : 'column', alignItems: 'center', gap: 17, overflow: 'hidden' }}>
      <View style={{ flex: 1, gap: 12 }}><Eyebrow>{topic.discipline.toUpperCase()} · CONHEÇA SEU MONSTRO</Eyebrow><Heading size={horizontal ? 39 : 32}>{topic.name}</Heading>{topic.subtitle ? <Txt size={17} color={c.muted}>{topic.subtitle}</Txt> : null}<Txt style={{ lineHeight: 25 }}>{topic.description}</Txt></View>
      <View style={{ alignItems: 'center' }}><Monster id={topic.id} size={horizontal ? 210 : 180} evolved={!!mastery?.evolvedAt} /><Pill>{mastery?.evolvedAt ? 'SEGUNDA FORMA' : topic.discipline.toUpperCase()}</Pill></View>
    </View>

    {hasModule(topic.id) && <Button title="Abrir apostila interativa" onPress={() => router.push({ pathname: '/apostila', params: { topicId: topic.id, from: 'monster', mapNode } })} />}
    <View style={{ gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><BookOpen color={c.purple} size={21} /><Eyebrow color={c.purple}>ALÉM DA MATÉRIA</Eyebrow></View>
      {context?.overview ? <Card><Heading size={22}>O que é e para que serve?</Heading><Txt style={{ lineHeight: 26 }}>{context.overview}</Txt></Card> : <Card><Heading size={22}>O que é e para que serve?</Heading><Txt style={{ lineHeight: 26 }}>{topic.relevance || topic.description}</Txt></Card>}
    </View>

    {context?.applications?.length ? <Card style={{ gap: 17 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><FlaskConical color={c.purple} size={21} /><Heading size={22}>Onde esse conhecimento ganha vida</Heading></View><BulletList items={context.applications} /></Card> : null}
    {context?.limitations ? <Card style={{ backgroundColor: c.peach, gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Microscope color={c.purple} size={21} /><Heading size={22}>Até onde ele ajuda?</Heading></View><Txt style={{ lineHeight: 25 }}>{context.limitations}</Txt></Card> : null}
    <EnemCard />
    <MonsterStudyControls topic={topic} />
    {mastery?.encountered && <Card style={{ gap: 8 }}><Eyebrow color={c.purple}>PRÓXIMO ENCONTRO</Eyebrow><Heading size={21}>{mastery.evolvedAt && approvedExamQuestions(topic.questions).length < 2 ? 'Prática oficial em preparação' : mastery.nextReviewAt && Date.parse(mastery.nextReviewAt) <= openedAt ? 'Revisão disponível' : 'Prática sugerida'}</Heading><Txt size={13} color={c.muted}>{mastery.evolvedAt && approvedExamQuestions(topic.questions).length < 2 ? 'As duas questões oficiais deste encontro ainda aguardam autorização de reprodução.' : mastery.nextReviewAt ? `Uma nova prática pode ser útil a partir de ${new Date(mastery.nextReviewAt).toLocaleDateString('pt-BR')}. O intervalo é uma sugestão, não uma medida exata da sua memória.` : 'Mais questões distintas podem ajudar a verificar o que ficou.'}</Txt></Card>}
    {mastery?.encountered && <Card><Heading size={22}>Minha confiança neste monstro</Heading><Txt size={13} color={c.muted}>Sua percepção não altera seu desempenho nem o domínio calculado. {confidence ? `Última resposta: ${new Date(confidence.at).toLocaleDateString('pt-BR')}.` : 'Você ainda não informou sua confiança.'}</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level, index) => <Button key={level} title={['Baixa', 'Média', 'Alta'][index]} variant={confidence?.level === level ? 'primary' : 'secondary'} onPress={() => { void actions.rateConfidence(topic.id, level); }} />)}</View></Card>}
    <View style={{ flexDirection: horizontal ? 'row' : 'column', gap: 10 }}><View style={{ flex: 1 }}><Button title="Voltar para minha jornada" onPress={() => router.replace('/')} icon={<ArrowRight size={17} color={c.purple} />} /></View><View style={{ flex: 1 }}><Button title="Ver meu bestiário" variant="secondary" onPress={() => router.replace('/bestiary')} /></View></View>
  </Page>;
}
