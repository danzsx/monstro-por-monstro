import { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { BookOpen, CheckCircle2, LockKeyhole, RotateCcw } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { isDue, prerequisitesMet } from '@/learning/engine';
import { approvedExamQuestions } from '@/learning/evolution';
import { Button, Card, Eyebrow, Heading, Monster, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';

export default function BestiaryScreen() {
  const { state, topics, topicById } = useApp();
  const { width } = useWindowDimensions();
  const columns = width >= 1300 ? 4 : width >= 650 ? 2 : 1;
  const [filter, setFilter] = useState('Todos');
  const known = topics.filter(topic => state.masteries[topic.id]?.encountered).length;
  const disciplines = useMemo(() => ['Todos', ...Array.from(new Set(topics.map(topic => topic.discipline)))], [topics]);
  const now = new Date().toISOString();
  return <Page>
    <View style={{ gap: 10 }}><Eyebrow>SUAS PEQUENAS GRANDES CONQUISTAS</Eyebrow><Heading size={39}>Meu bestiário.</Heading><Txt color={c.muted}>Cada monstro conta uma parte do que você já enfrentou.</Txt></View>
    <Card style={{ backgroundColor: c.purple, borderColor: c.purple, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
      <BookOpen color={c.green} size={35} /><View style={{ flex: 1, gap: 5 }}><Txt weight="heading" size={23} color="#FFFFFF">{known} de {topics.length} monstros conhecidos</Txt><Txt size={13} color="#DED2EC">Conquistar é aprender. Revisitar é fazer ficar.</Txt></View>
      <Txt size={32} color={c.green} weight="heading">{Math.round(known / Math.max(1, topics.length) * 100)}%</Txt>
    </Card>
    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>{disciplines.map(discipline => <Button key={discipline} title={discipline} variant={filter === discipline ? 'primary' : 'secondary'} onPress={() => setFilter(discipline)} />)}</View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>{topics.filter(topic => filter === 'Todos' || topic.discipline === filter).map(topic => {
      const mastery = state.masteries[topic.id] ?? { topicId: topic.id, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
      const due = isDue(mastery, now);
      const locked = !prerequisitesMet(topic.id, state.masteries);
      const prerequisite = topic.prerequisiteIds.length ? topicById(topic.prerequisiteIds[0]) : null;
      const evolved = !!mastery.evolvedAt;
      const officialReady = approvedExamQuestions(topic.questions).length >= 2;
      const label = !mastery.encountered ? 'A descobrir' : evolved ? !officialReady ? 'Segunda forma · prática em preparação' : due ? 'Segunda forma · revisão disponível' : 'Segunda forma' : due || mastery.stage === 'review' ? 'Revisão disponível' : mastery.stage === 'consolidating' ? 'Consolidando' : 'Em aprendizagem';
      return <View key={topic.id} style={{ width: columns === 1 ? '100%' : columns === 2 ? '48%' : '23.5%' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Conheça o monstro ${topic.name}${evolved ? ', segunda forma' : ''}`}
          onPress={() => router.push({ pathname: '/monster', params: { topicId: topic.id } } as unknown as Parameters<typeof router.push>[0])}
          style={({ pressed }) => ({ flex: 1, opacity: pressed ? .82 : 1 })}>
          <Card style={{ flex: 1, padding: 20, gap: 15 }}>
            <View style={{ alignItems: 'center', backgroundColor: topic.discipline === 'Biologia' ? c.peach : c.lavender, borderRadius: 17, paddingVertical: 7, position: 'relative' }}>
              <Monster id={topic.id} size={columns === 4 ? 170 : 200} muted={!mastery.encountered} evolved={evolved} />
              <View style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: '#FFFCF9', padding: 8, borderRadius: 20 }}>{!mastery.encountered ? <LockKeyhole color={c.purple} size={17} /> : due ? <RotateCcw color={c.purple} size={17} /> : <CheckCircle2 color={c.greenDark} size={17} />}</View>
            </View>
            <Eyebrow>{topic.discipline.toUpperCase()}</Eyebrow><Heading size={22}>{topic.name}</Heading><Pill green={evolved}>{label}</Pill>
            <Txt size={12} color={c.muted}>{!mastery.encountered ? locked ? `Antes, fortaleça ${prerequisite?.name.toLowerCase() ?? 'o conteúdo anterior'}.` : 'Esse encontro vai acontecer no seu momento.' : evolved && !officialReady ? 'Questões oficiais aguardam autorização de reprodução.' : mastery.nextReviewAt ? `${due ? 'Hora de reencontrar.' : 'Prática sugerida a partir de'} ${new Date(mastery.nextReviewAt).toLocaleDateString('pt-BR')}` : 'Você está construindo a base, uma batalha de cada vez.'}</Txt>
            <Txt size={12} weight="bold" color={c.purple}>Conheça seu monstro →</Txt>
          </Card>
        </Pressable>
      </View>;
    })}</View>
    <Card style={{ backgroundColor: c.peach, flexDirection: 'row', gap: 16 }}><RotateCcw size={22} color={c.purple} /><View style={{ gap: 7, flex: 1 }}><Txt weight="bold" color={c.purple}>Um reencontro não apaga sua conquista.</Txt><Txt size={13} color={c.muted}>A segunda forma marca uma primeira vitória. Questões novas após um intervalo ajudam a verificar o que ficou.</Txt></View></Card>
    <Button title="Voltar ao próximo passo" onPress={() => router.replace('/')} variant="secondary" />
  </Page>;
}
