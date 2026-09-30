import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useIsFocused } from 'expo-router';
import { useApp } from '@/data/provider';
import { Button, Card, Eyebrow, Heading, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
import { DAY } from './engine';
import { recommend } from './recommendation';
import { useActions } from './actions';
import { AnimatedMonster } from '@/ui/animated-monster';

export default function HomeScreen() {
  const focused = useIsFocused();
  const { state, topics, topicById } = useApp(); const actions = useActions(); const task = useTask();
  const [showReason, setShowReason] = useState(false);
  const [notice, setNotice] = useState('');
  const [returning] = useState(() => {
    const last = state.completedSessions?.map(s => s.completedAt).sort().at(-1);
    return !!last && Date.now() - Date.parse(last) > 7 * DAY;
  });
  const minutes = 15;
  const hasStarted = !!state.student || !!state.activeBattle || state.attempts.some(a => a.source === 'entry') || state.completedBattles.length > 0;
  const decision = recommend({ availableMinutes: minutes, activeTopicId: state.activeBattle?.plan.topicId, activeMode: state.activeBattle?.plan.mode, lastTopicId: state.lastTopic }, topics,
    { masteries: state.masteries, attempts: state.attempts, completedSessions: state.completedSessions, externalQuestionLogs: state.externalQuestionLogs }, new Date().toISOString());
  const topic = decision ? topicById(decision.topicId) : null;
  const estimated = state.activeBattle?.plan.estimatedMinutes ?? (decision?.suggestedMode === 'exam' || decision?.review ? 10 : 15);
  useEffect(() => { void actions.recordReturn(); }, [state.firstBattleCompletedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => task.run(async () => {
    if (!decision) return;
    if (!state.activeBattle) await actions.startBattle(decision);
    router.push('/battle');
  });
  return <Page narrow>
    <View style={{ gap: 10 }}><Eyebrow>{returning ? 'BOM TER VOCÊ DE VOLTA' : 'UM PASSO DE CADA VEZ'}</Eyebrow><Heading>{returning ? 'Recomece no seu ritmo.' : 'Bem-vindo ao seu espaço de estudo.'}</Heading><Txt color={c.muted}>{returning ? 'Você pode retomar sem compensar os dias em que não estudou.' : 'Cada monstro representa um conteúdo. Aqui você encontra um caminho para aprender, manter o foco e guardar seu progresso.'}</Txt><Txt color={c.muted}>Comece pela teoria, com uma aula nossa ou seu próprio material. Deixe o app aberto enquanto estuda e pause quando precisar.</Txt></View>
    {decision && topic ? <Card style={{ backgroundColor: c.peach, gap: 18 }}>
      <Eyebrow>{state.activeBattle ? 'CONTINUAR DE ONDE PAROU' : decision.suggestedMode === 'exam' ? 'MONSTRO EVOLUÍDO · PRÁTICA ENEM' : decision.review ? 'REVISÃO POSSÍVEL AGORA' : 'MONSTRO DO DIA'}</Eyebrow>
      <View style={{ alignItems: 'center' }}><AnimatedMonster id={topic.id} size={180} active={focused} evolved={!!state.masteries[topic.id]?.evolvedAt} /></View>
      <Heading size={29}>{topic.name}</Heading><Txt color={c.muted}>{topic.description}</Txt>
      {!state.activeBattle && !decision.review && <View style={{ gap: 8 }}><Eyebrow>O QUE VOCÊ VAI APRENDER</Eyebrow><Txt>{topic.learningContext?.overview ?? topic.relevance}</Txt>{topic.lessons.filter(block => block.kind === 'concept').slice(0, 3).map(block => <Txt key={block.id} size={14} color={c.purple}>• {block.title}</Txt>)}<Txt size={13} color={c.muted}>Teoria → autoexplicação → mini revisão → questões de fixação.</Txt></View>}
      <Pill>{topic.discipline.toUpperCase()} · CERCA DE {estimated} MIN</Pill>
      <Button title={state.activeBattle ? 'Continuar estudo' : decision.suggestedMode === 'exam' ? 'Praticar com questões ENEM' : decision.review ? 'Começar revisão' : 'Conhecer meu monstro'} busy={task.busy} onPress={start} />
      <Button title="Por que esta ação?" variant="ghost" onPress={() => setShowReason(!showReason)} />
      {showReason && <Txt size={13} color={c.muted}>{decision.reasons.join('\n')}</Txt>}
      {!state.activeBattle && <Button title="Hoje preciso pausar" variant="ghost" onPress={() => setNotice('Tudo bem. Sua jornada fica aqui para quando você voltar.')} />}
    </Card> : <Card style={{ backgroundColor: c.peach }}><Heading size={25}>Por agora, você pode parar.</Heading><Txt color={c.muted}>Ainda não há outra ação disponível no catálogo para este momento. Volte quando quiser ou explore os tópicos no mapa.</Txt><Button title="Explorar o mapa" variant="secondary" onPress={() => router.push('/map')} /></Card>}
    {!!notice && <Txt color={c.purple} accessibilityLiveRegion="polite">{notice}</Txt>}
    {task.error && <Txt color={c.danger}>{task.error}</Txt>}
    {hasStarted && !state.diagnosticCompletedAt && <Button title="Contar o que já conheço · opcional" variant="ghost" onPress={() => router.push('/diagnostic')} />}
  </Page>;
}
