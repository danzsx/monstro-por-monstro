import { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router, Link, useIsFocused } from 'expo-router';
import { ArrowRight, Clock3, ChevronDown, Sparkles, ShieldCheck, Footprints, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { Button, Card, Eyebrow, Heading, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
import { selectNextMonster, DAY } from './engine';
import { useActions } from './actions';
import { AnimatedMonster } from '@/ui/animated-monster';
export default function HomeScreen() {
  const focused = useIsFocused();
  const { state, topicById } = useApp(); const actions = useActions(); const { busy, error, run } = useTask();
  const { width } = useWindowDimensions(); const horizontal = width >= 1200 || (width >= 740 && width < 1000);
  const [why, setWhy] = useState(false); const [notice, setNotice] = useState('');
  const now = new Date().toISOString(); const diagnosticDone = !!state.diagnosticCompletedAt;
  const decision = selectNextMonster(state.masteries, now, state.activeBattle?.plan.topicId, state.lastTopic);
  const topic = decision?.topicId ? topicById(decision.topicId) : topicById('proportions');
  const encountered = Object.values(state.masteries).filter(m => m.encountered).length;
  const mastered = Object.values(state.masteries).filter(m => m.stage === 'mastered').length;
  useEffect(() => { void actions.recordReturn(); }, [state.firstBattleCompletedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => run(async () => {
    if (!diagnosticDone) { router.push(state.student ? '/diagnostic' : '/onboarding'); return; }
    if (decision) await actions.startBattle(decision);
    router.push('/battle');
  });
  const upcomingReviews = Object.values(state.masteries).map(m => m.nextReviewAt).filter((r): r is string => !!r && !isNaN(Date.parse(r))).sort();
  const nextReviewDate = upcomingReviews[0] ? new Date(upcomingReviews[0]).toLocaleDateString('pt-BR') : null;
  return <Page>
    <View style={{ gap: 9 }}><Eyebrow>{diagnosticDone ? `OI, ${state.student?.name.toUpperCase() || 'ESTUDANTE'} · ESSE MOMENTO É SEU` : 'MENOS ANSIEDADE. MAIS DESCOBERTAS.'}</Eyebrow><Heading size={width < 700 ? 32 : 40}>{diagnosticDone ? 'Um monstro por vez.' : 'Parece enorme. Comece pequeno.'}</Heading><Txt color={c.muted}>{diagnosticDone ? 'Você cuida do próximo passo. A gente cuida do caminho.' : 'O edital inteiro não precisa caber na sua cabeça. Só o próximo passo.'}</Txt></View>
    {diagnosticDone && !decision ? <Card style={{ backgroundColor: c.peach, alignItems: 'center', paddingVertical: 36 }}><CheckCircle2 size={36} color={c.greenDark} /><Heading>Por hoje, você pode respirar.</Heading><Txt color={c.muted}>Os conteúdos estão aguardando a próxima revisão. Dar tempo à memória também faz parte.</Txt><Txt weight="bold">{nextReviewDate ? `Próxima revisão: ${nextReviewDate}` : 'Seu cronograma de revisões será atualizado nas próximas batalhas.'}</Txt><Button title="Ver meu bestiário" onPress={() => router.push('/bestiary')} variant="secondary" /></Card> : <View style={{ backgroundColor: c.peach, borderRadius: 28, borderWidth: 1, borderColor: '#EADFD5', overflow: 'hidden', padding: horizontal ? 38 : 25, flexDirection: horizontal ? 'row' : 'column', alignItems: 'center', gap: horizontal ? 15 : 0 }}>
      <View style={{ flex: horizontal ? 1.1 : undefined, width: horizontal ? undefined : '100%', gap: 20, zIndex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 7, height: 7, backgroundColor: c.greenDark, borderRadius: 10 }} /><Eyebrow color={c.purple}>{diagnosticDone ? state.activeBattle ? 'SEU MONSTRO EM ANDAMENTO' : decision?.review ? 'UMA PEQUENA REVISÃO' : 'SEU PRÓXIMO MONSTRO' : 'SUA JORNADA COMEÇA AQUI'}</Eyebrow></View>
        <View style={{ gap: 12 }}><Heading size={horizontal ? 46 : 35}>{diagnosticDone ? topic.name : 'Grandes conquistas.\nPequenas batalhas.'}</Heading><Txt color={c.muted} style={{ maxWidth: 350 }}>{diagnosticDone ? topic.description : 'Descubra seu ponto de partida e encontre o primeiro monstro que faz sentido para você.'}</Txt></View>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}><Pill>{diagnosticDone ? topic.discipline.toUpperCase() : 'FEITO PARA VOCÊ'}</Pill><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Clock3 color={c.muted} size={14} /><Txt size={12} color={c.muted}>{diagnosticDone ? `${state.activeBattle?.plan.estimatedMinutes ?? (decision?.review ? 10 : 15)} min · no seu ritmo` : 'Uma conversa breve · sem pressão'}</Txt></View></View>
        {horizontal && <View style={{ alignSelf: 'flex-start', gap: 7 }}><Button title={diagnosticDone ? state.activeBattle ? 'Continuar batalha' : 'Enfrentar meu monstro' : 'Encontrar meu primeiro monstro'} onPress={start} busy={busy} /><Txt size={11} color={c.muted} style={{ textAlign: 'center' }}>{diagnosticDone ? 'Seu progresso é salvo a cada passo.' : 'Comece sem criar uma conta.'}</Txt></View>}
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: horizontal ? 1 : undefined, minHeight: horizontal ? 340 : 235 }}><View style={{ position: 'absolute', width: horizontal ? 300 : 220, height: horizontal ? 300 : 220, backgroundColor: '#E5DAEE', borderRadius: 160, transform: [{ rotate: '-12deg' }] }} /><AnimatedMonster id={diagnosticDone ? topic.id : 'proportions'} size={horizontal ? 340 : 250} active={focused} /><View style={{ position: 'absolute', bottom: 8, right: 0, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#FFFCF9', borderWidth: 1, borderColor: c.line, borderRadius: 14, flexDirection: 'row', gap: 6 }}><Sparkles size={14} color={c.purple} /><Txt size={11} color={c.purple} weight="medium">{diagnosticDone ? 'Um desafio possível.' : 'Prazer, seu próximo passo.'}</Txt></View></View>
      {!horizontal && <View style={{ width: '100%', marginTop: 15, gap: 7 }}><Button title={diagnosticDone ? state.activeBattle ? 'Continuar batalha' : 'Enfrentar meu monstro' : 'Encontrar meu primeiro monstro'} onPress={start} busy={busy} /><Txt size={11} color={c.muted} style={{ textAlign: 'center' }}>{diagnosticDone ? 'Seu progresso é salvo a cada passo.' : 'Comece sem criar uma conta.'}</Txt></View>}
    </View>}
    {error && <Txt color={c.danger}>{error}</Txt>}
    {!!notice && <Txt color={c.purple} accessibilityLiveRegion="polite">{notice}</Txt>}
    {diagnosticDone && decision && <View style={{ gap: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><Button title="Por que este monstro agora?" variant="ghost" icon={<ChevronDown size={16} color={c.purple} />} onPress={() => setWhy(!why)} /><Button title="Hoje está difícil" variant="ghost" onPress={() => run(async () => {
      if (state.activeBattle && state.activeBattle.phase !== 'check-in') { setNotice('Você já começou. Pode pausar agora e continuar daqui quando estiver pronto.'); return; }
      const micro = !!state.lastDeferredAt && Date.now() - Date.parse(state.lastDeferredAt) < DAY;
      await actions.defer(); setNotice(micro ? 'Vamos manter este monstro e reduzir a batalha para cinco minutos.' : 'Tudo bem. Reorganizamos o caminho; este conteúdo vai voltar.');
    })} /></View>{why && <Card><Txt size={14}>{decision.reasons.join('\n\n')}</Txt></Card>}</View>}
    {diagnosticDone ? <View style={{ flexDirection: horizontal ? 'row' : 'column', gap: 20 }}><Card style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 18 }}><View style={{ backgroundColor: c.lavender, padding: 14, borderRadius: 15 }}><BookOpen size={23} color={c.purple} /></View><View style={{ flex: 1, gap: 4 }}><Txt weight="bold" color={c.purple}>{encountered} {encountered === 1 ? 'monstro conhecido' : 'monstros conhecidos'}</Txt><Txt size={12} color={c.muted}>{mastered} dominados · cada encontro conta.</Txt></View><Link href="/bestiary" accessibilityLabel="Abrir meu bestiário"><ArrowRight size={20} color={c.purple} /></Link></Card><Card style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 18 }}><Footprints size={25} color={c.greenDark} /><View style={{ flex: 1, gap: 4 }}><Txt weight="bold" color={c.purple}>{state.completedBattles.length} {state.completedBattles.length === 1 ? 'batalha concluída' : 'batalhas concluídas'}</Txt><Txt size={12} color={c.muted}>Seu esforço está construindo uma base.</Txt></View></Card></View> : <View style={{ gap: 19 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Heading size={21}>Um caminho mais leve.</Heading><Txt size={11} color={c.muted}>PENSADO PARA VOCÊ</Txt></View><View style={{ flexDirection: horizontal ? 'row' : 'column', gap: 16 }}>{[
      { Icon: Footprints, title: 'Encontre seu ponto de partida', text: 'Uma conversa breve para contar o que você já lembra.' },
      { Icon: Sparkles, title: 'Receba um desafio possível', text: 'Um conteúdo por vez, ajustado às suas necessidades.' },
      { Icon: ShieldCheck, title: 'Transforme esforço em domínio', text: 'Pratique, relembre e veja seu bestiário crescer.' },
    ].map(({ Icon, title, text }, i) => <Card key={title} style={{ flex: 1, padding: 21, gap: 13 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Icon size={22} color={c.purple} /><Txt size={11} color={c.muted}>0{i + 1}</Txt></View><Txt weight="bold" color={c.purple} size={14}>{title}</Txt><Txt size={12} color={c.muted}>{text}</Txt></Card>)}</View></View>}
    <View style={{ alignItems: 'center', paddingTop: 4 }}><Txt size={11} color={c.muted}>Acolher. Orientar. Avançar.</Txt></View>
  </Page>;
}
