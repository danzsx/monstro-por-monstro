import { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, BookOpen, FlaskConical, Microscope, Target } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { calculateRetention } from '@/learning/engine';
import { Button, Card, Eyebrow, Heading, Monster, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import type { EnemGuidance } from '@/learning/types';

function BulletList({ items }: { items: string[] }) {
  return <View style={{ gap: 13 }}>{items.map((item, index) => <View key={`${index}-${item}`} style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start' }}><View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: c.greenDark, marginTop: 7 }} /><Txt style={{ flex: 1, lineHeight: 25 }}>{item}</Txt></View>)}</View>;
}

function EnemCard({ guidance }: { guidance?: EnemGuidance }) {
  if (guidance?.status !== 'reviewed') return <Card style={{ backgroundColor: c.lavender, gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Target color={c.purple} size={21} /><Eyebrow color={c.purple}>COMO ISSO APARECE NO ENEM</Eyebrow></View>
    <Heading size={21}>Curadoria em andamento.</Heading>
    <Txt color={c.muted}>Estamos analisando o edital e provas anteriores para orientar seu foco com cuidado. Esta visão ainda não traz afirmações sobre frequência ou incidência.</Txt>
  </Card>;

  const priorities = guidance.priorities ?? [];
  const commonPatterns = guidance.commonPatterns ?? [];
  const lowerIncidence = guidance.lowerIncidence ?? [];
  const sources = guidance.sources ?? [];
  const hasContent = priorities.length + commonPatterns.length + lowerIncidence.length > 0;
  return <Card style={{ gap: 17 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Target color={c.purple} size={21} /><Eyebrow color={c.purple}>COMO ISSO APARECE NO ENEM</Eyebrow></View>
    {priorities.length > 0 && <View style={{ gap: 10 }}><Txt weight="bold" color={c.purple}>Onde colocar atenção</Txt><BulletList items={priorities} /></View>}
    {commonPatterns.length > 0 && <View style={{ gap: 10 }}><Txt weight="bold" color={c.purple}>Relações que aparecem nas questões</Txt><BulletList items={commonPatterns} /></View>}
    {lowerIncidence.length > 0 && <View style={{ gap: 10 }}><Txt weight="bold" color={c.purple}>O que tende a ser menos central</Txt><BulletList items={lowerIncidence} /></View>}
    {guidance.examsAnalyzed && <Txt size={12} color={c.muted}>Base: {guidance.examsAnalyzed}</Txt>}
    {sources.length > 0 && <View style={{ gap: 5 }}><Txt size={12} weight="bold" color={c.purple}>Fontes consultadas</Txt>{sources.map((source, index) => <Txt key={`${index}-${source}`} size={12} color={c.muted}>{source}</Txt>)}</View>}
    {!hasContent && <Txt color={c.muted}>A análise foi revisada, mas ainda não há orientações adicionadas.</Txt>}
  </Card>;
}

export default function MonsterKnowledgeScreen() {
  const { topicId, from, mapNode } = useLocalSearchParams<{ topicId: string; from?: string; mapNode?: string }>();
  const returnToContents = () => {
    if (from === 'map') router.dismissTo({ pathname: '/map', params: { node: mapNode } });
    else router.replace('/bestiary');
  };
  const { topicById, state } = useApp();
  const { width } = useWindowDimensions();
  const topic = useMemo(() => {
    try { return topicById(topicId); } catch { return null; }
  }, [topicById, topicId]);
  const mastery = topic ? state.masteries[topic.id] : undefined;
  const retention = mastery ? calculateRetention(mastery, new Date().toISOString()) : 0;

  if (!topic) return <Page narrow><Button title={from === 'map' ? 'Voltar ao mapa' : 'Voltar ao meu bestiário'} variant="secondary" onPress={returnToContents} /><Card><Heading>Não encontramos esse monstro.</Heading><Txt color={c.muted}>Ele pode ter sido removido do catálogo.</Txt></Card></Page>;

  const context = topic.learningContext;
  const horizontal = width >= 760;
  return <Page narrow>
    <Button title={from === 'map' ? 'Voltar ao mapa' : 'Meu bestiário'} variant="ghost" icon={<ArrowLeft size={17} color={c.purple} />} onPress={returnToContents} />
    <View style={{ backgroundColor: topic.discipline === 'Biologia' ? c.peach : c.lavender, borderRadius: 26, padding: horizontal ? 30 : 18, flexDirection: horizontal ? 'row' : 'column', alignItems: 'center', gap: 17, overflow: 'hidden' }}>
      <View style={{ flex: 1, gap: 12 }}><Eyebrow>{topic.discipline.toUpperCase()} · CONHEÇA SEU MONSTRO</Eyebrow><Heading size={horizontal ? 39 : 32}>{topic.name}</Heading>{topic.subtitle ? <Txt size={17} color={c.muted}>{topic.subtitle}</Txt> : null}<Txt style={{ lineHeight: 25 }}>{topic.description}</Txt></View>
      <View style={{ alignItems: 'center' }}><Monster id={topic.id} size={horizontal ? 210 : 180} /><Pill>{topic.discipline.toUpperCase()}</Pill></View>
    </View>

    <View style={{ gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><BookOpen color={c.purple} size={21} /><Eyebrow color={c.purple}>ALÉM DA MATÉRIA</Eyebrow></View>
      {context?.overview ? <Card><Heading size={22}>O que é e para que serve?</Heading><Txt style={{ lineHeight: 26 }}>{context.overview}</Txt></Card> : <Card><Heading size={22}>O que é e para que serve?</Heading><Txt style={{ lineHeight: 26 }}>{topic.relevance || topic.description}</Txt></Card>}
    </View>

    {context?.applications?.length ? <Card style={{ gap: 17 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><FlaskConical color={c.purple} size={21} /><Heading size={22}>Onde esse conhecimento ganha vida</Heading></View><BulletList items={context.applications} /></Card> : null}
    {context?.limitations ? <Card style={{ backgroundColor: c.peach, gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Microscope color={c.purple} size={21} /><Heading size={22}>Até onde ele ajuda?</Heading></View><Txt style={{ lineHeight: 25 }}>{context.limitations}</Txt></Card> : null}
    <EnemCard guidance={topic.enemGuidance} />
    {mastery?.encountered && <Card style={{ backgroundColor: '#FFFCF9', gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow color={c.purple}>SAÚDE DA SUA MEMÓRIA</Eyebrow>
        <Pill green={retention >= 0.75}>{retention >= 0.75 ? 'MEMÓRIA VIVA' : 'PRECISA DE REVISÃO'}</Pill>
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={c.muted}>Retenção estimada contínua</Txt>
          <Txt size={14} weight="bold" color={retention >= 0.75 ? c.greenDark : c.purple}>{Math.round(retention * 100)}%</Txt>
        </View>
        <View style={{ height: 7, backgroundColor: c.lavender, borderRadius: 20, overflow: 'hidden' }}>
          <View style={{ height: 7, width: `${Math.round(retention * 100)}%`, backgroundColor: retention >= 0.75 ? c.green : c.purple, borderRadius: 20 }} />
        </View>
      </View>
      <Txt size={12} color={c.muted}>
        {mastery.nextReviewAt
          ? `Próxima revisão agendada para ${new Date(mastery.nextReviewAt).toLocaleDateString('pt-BR')}. A curva de esquecimento ajuda você a revisar no momento exato antes da perda de retenção.`
          : 'Continue praticando para consolidar essa criatura no seu Bestiário.'}
      </Txt>
    </Card>}
    <View style={{ flexDirection: horizontal ? 'row' : 'column', gap: 10 }}><View style={{ flex: 1 }}><Button title="Voltar para minha jornada" onPress={() => router.replace('/')} icon={<ArrowRight size={17} color={c.purple} />} /></View><View style={{ flex: 1 }}><Button title="Ver meu bestiário" variant="secondary" onPress={() => router.replace('/bestiary')} /></View></View>
  </Page>;
}
