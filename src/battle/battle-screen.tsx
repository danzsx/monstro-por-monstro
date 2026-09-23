import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { CheckCircle2, Heart, Leaf, RotateCcw, Sparkles } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { buildRepairChallenge, intervention, updateMastery } from '@/learning/engine';
import { formatEnemTag } from '@/content/catalog';
import { Feeling, Barrier, AffectiveCheckIn } from '@/learning/types';
import { Button, Card, Choice, Eyebrow, Heading, Page, Pill, Progress, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
import { BattleMonster } from './battle-monster';
import { battleHealth } from './battle-health';
export default function BattleScreen() {
  const { state, topicById, questionById } = useApp(); const actions = useActions(); const task = useTask();
  const [choice, setChoice] = useState<number | null>(null);
  const [repairChoice, setRepairChoice] = useState<number | null>(null);
  const battle = state.activeBattle;
  if (!battle) return <Redirect href="/" />;
  const topic = topicById(battle.plan.topicId);
  const mastery = state.masteries[topic.id] ?? { topicId: topic.id, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
  const question = questionById(battle.plan.questionIds[battle.questionIndex]);
  const block = battle.plan.blocks[battle.blockIndex];
  const steps = battle.plan.blocks.length + battle.plan.questionIds.length;
  const current = battle.phase === 'lesson' ? battle.blockIndex : ['question', 'feedback', 'repair'].includes(battle.phase) ? battle.plan.blocks.length + battle.questionIndex : battle.phase === 'complete' ? steps : 0;
  const health = battleHealth(battle);

  const next = () => task.run(async () => { await actions.battleAction({ type: 'NEXT' }); setChoice(null); setRepairChoice(null); });
  const selectFeeling = (feeling: Feeling) => task.run(async () => {
    const checkIn: AffectiveCheckIn = { topicId: topic.id, feeling, at: new Date().toISOString() };
    await actions.battleAction({ type: 'CHECK_IN', checkIn });
    if (feeling === 'confident') await actions.setIntervention(checkIn);
  });
  const selectBarrier = (barrier: Barrier) => task.run(() => actions.setIntervention({ ...battle.checkIn!, barrier }));
  const result = battle.phase === 'complete' ? updateMastery(mastery, battle.attempts, new Date().toISOString()) : null;
  return <Page narrow><View style={{ gap: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><Eyebrow>{topic.discipline.toUpperCase()} · {battle.plan.estimatedMinutes} MIN</Eyebrow><Pill>{battle.decision.review ? 'REVISÃO' : 'EM APRENDIZAGEM'}</Pill></View><Heading size={29}>{topic.name}</Heading><Progress value={current / steps} label="Progresso da batalha" /></View>
    <View style={{ alignItems: 'center', gap: 4 }}><BattleMonster battle={battle} /><View style={{ width: '100%', maxWidth: 340, gap: 7 }} accessibilityLiveRegion="polite"><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Eyebrow>VIDA DO MONSTRO</Eyebrow><Txt size={12} weight="bold" color={c.purple} style={{ fontVariant: ['tabular-nums'] }}>{Math.round(health * 100)}%</Txt></View><Progress value={health} label="Vida do monstro" /></View></View>
    {battle.phase === 'check-in' && <Card style={{ alignItems: 'center', gap: 20 }}><Heading>Como você está chegando?</Heading><Txt color={c.muted}>A gente ajusta o primeiro passo.</Txt><View style={{ alignSelf: 'stretch', gap: 10 }}>{([{ id: 'confident', label: 'Confiante' }, { id: 'insecure', label: 'Inseguro' }, { id: 'anxious', label: 'Ansioso' }, { id: 'avoid', label: 'Quero evitar' }] as { id: Feeling; label: string }[]).map(f => <Button key={f.id} title={f.label} variant="secondary" disabled={task.busy} onPress={() => selectFeeling(f.id)} />)}</View></Card>}
    {battle.phase === 'barrier' && <Card style={{ gap: 20 }}><Heart size={26} color={c.purple} /><Heading size={28}>O que está pesando mais?</Heading><Txt color={c.muted}>Pode escolher o que mais se aproxima. Essa resposta não muda sua nota.</Txt>{([{ id: 'difficulty', label: 'Parece difícil demais' }, { id: 'tired', label: 'Estou sem energia' }, { id: 'relevance', label: 'Não vejo por que aprender isso' }, { id: 'history', label: 'Já tentei e não consegui' }] as { id: Barrier; label: string }[]).map(b => <Button key={b.id} title={b.label} variant="secondary" disabled={task.busy} onPress={() => selectBarrier(b.id)} />)}</Card>}
    {battle.phase === 'intervention' && <Card style={{ backgroundColor: c.peach, gap: 22 }}><Leaf size={28} color={c.greenDark} /><Heading>{battle.plan.mode === 'micro' ? 'Tudo bem. Vamos por partes.' : 'Um passo possível para hoje.'}</Heading><Txt size={18}>{intervention(battle.checkIn!, mastery)}</Txt><Pill green>{battle.plan.estimatedMinutes} MINUTOS · NO SEU RITMO</Pill><Txt color={c.muted}>{battle.plan.criteria}</Txt><Button title="Dar o primeiro passo" busy={task.busy} onPress={() => task.run(() => actions.battleAction({ type: 'BEGIN' }))} /></Card>}
    {battle.phase === 'lesson' && <Card style={{ gap: 24 }}><Eyebrow>{block.kind === 'recall' ? 'RECUPERAÇÃO ATIVA' : block.kind === 'example' ? 'VAMOS VER NA PRÁTICA' : 'UMA IDEIA DE CADA VEZ'} · {battle.blockIndex + 1}/{battle.plan.blocks.length}</Eyebrow><Heading size={30}>{block.title}</Heading><Txt size={19} style={{ lineHeight: 31 }}>{block.text}</Txt>{block.formula && <View style={{ backgroundColor: c.lavender, padding: 24, borderRadius: 18 }}><Txt weight="bold" size={22} color={c.purple} style={{ textAlign: 'center' }}>{block.formula}</Txt></View>}{block.kind === 'recall' && <><Txt size={13} color={c.muted}>Tente responder em voz alta ou em um papel antes de revelar.</Txt>{battle.revealed ? <View style={{ padding: 20, backgroundColor: c.softGreen, borderRadius: 16 }}><Txt>{block.reveal}</Txt></View> : <Button title="Já tentei. Ver explicação" variant="secondary" onPress={() => task.run(() => actions.battleAction({ type: 'REVEAL' }))} />}</>}<Button title={battle.blockIndex + 1 === battle.plan.blocks.length ? 'Colocar em prática' : 'Próximo passo'} disabled={block.kind === 'recall' && !battle.revealed} busy={task.busy} onPress={next} /></Card>}
    {['question', 'feedback'].includes(battle.phase) && <Card style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <Eyebrow>QUESTÃO {battle.questionIndex + 1} DE {battle.plan.questionIds.length} · SEM CONSULTA</Eyebrow>
        {question.enemMetadata && <Pill green>{formatEnemTag(question.enemMetadata)}</Pill>}
      </View>
      <Heading size={25}>{question.prompt}</Heading><View style={{ gap: 10 }}>{question.options.map((option, i) => <Choice key={`${question.id}-${i}`} text={option} index={i} selected={battle.phase === 'feedback' ? battle.attempts.at(-1)?.answer === i : choice === i} disabled={battle.phase === 'feedback' || task.busy} onPress={() => setChoice(i)} />)}</View>{battle.phase === 'question' ? <><Button title="Confirmar resposta" disabled={choice === null} busy={task.busy} onPress={() => task.run(() => actions.answerBattle(question.id, choice!))} /><Button title="Ainda não sei" variant="ghost" onPress={() => task.run(() => actions.answerBattle(question.id, -1))} /></> : <><View accessibilityLiveRegion="polite" style={{ padding: 20, gap: 8, borderRadius: 16, backgroundColor: battle.attempts.at(-1)?.correct ? c.softGreen : c.peach }}><Txt weight="bold" color={c.purple}>{battle.attempts.at(-1)?.correct ? 'Isso! Você encontrou a relação.' : 'Vamos entender esse passo.'}</Txt><Txt weight="bold">Resposta: {question.options[question.answer]}</Txt><Txt>{question.explanation}</Txt></View>{battle.attempts.at(-1)?.correct ? <Button title={battle.questionIndex + 1 === battle.plan.questionIds.length ? 'Ver minha conquista' : 'Próxima questão'} busy={task.busy} onPress={next} /> : <View style={{ gap: 10 }}><Button title="Reparar este conceito agora (1 min)" icon={<Sparkles size={17} color={c.purple} />} busy={task.busy} onPress={() => task.run(() => actions.startRepair())} /><Button title={battle.questionIndex + 1 === battle.plan.questionIds.length ? 'Pular e ver conquista' : 'Pular para próxima questão'} variant="ghost" busy={task.busy} onPress={next} /></View>}</>}</Card>}
    {battle.phase === 'repair' && (() => {
      const challenge = buildRepairChallenge(question);
      return <Card style={{ backgroundColor: '#FFFDF9', borderColor: c.purple, borderWidth: 1.5, gap: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow color={c.purple}>REPARAÇÃO IMEDIATA · FIXAR O CONCEITO</Eyebrow>
          <Pill green={battle.repaired}>{battle.repaired ? 'CONCEITO REPARADO' : 'PASSO GUIADO'}</Pill>
        </View>
        <Heading size={24}>{challenge.prompt}</Heading>
        <View style={{ padding: 16, backgroundColor: c.lavender, borderRadius: 14, gap: 6 }}>
          <Txt size={12} weight="bold" color={c.purple}>Ponto de atenção:</Txt>
          <Txt size={14} color={c.ink}>{challenge.insight}</Txt>
        </View>
        <View style={{ gap: 10 }}>
          {challenge.options.map((option, i) => (
            <Choice
              key={`repair-${i}`}
              text={option}
              index={i}
              selected={repairChoice === i}
              disabled={battle.repaired || task.busy}
              onPress={() => setRepairChoice(i)}
            />
          ))}
        </View>
        {battle.repaired ? (
          <View style={{ gap: 12 }}>
            <View style={{ padding: 16, backgroundColor: c.softGreen, borderRadius: 14, gap: 4 }}>
              <Txt weight="bold" color={c.greenDark}>✦ Ponto reparado com sucesso!</Txt>
              <Txt size={13}>Você reforçou a base com a explicação e não sai com dúvida desta questão.</Txt>
            </View>
            <Button
              title={battle.questionIndex + 1 === battle.plan.questionIds.length ? 'Ver minha conquista' : 'Continuar batalha'}
              busy={task.busy}
              onPress={next}
            />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Button
              title="Confirmar compreensão"
              disabled={repairChoice === null}
              busy={task.busy}
              onPress={() => task.run(() => actions.answerRepair(repairChoice === challenge.answer, repairChoice!))}
            />
            <Button title="Pular reparação" variant="ghost" onPress={next} />
          </View>
        )}
      </Card>;
    })()}
    {battle.phase === 'complete' && <Card style={{ alignItems: 'center', gap: 20 }}><Pill green>{result?.stage === 'mastered' ? 'MONSTRO DOMINADO' : 'MAIS UM PASSO CONQUISTADO'}</Pill><Heading>{result?.stage === 'mastered' ? 'Esse conhecimento ficou.' : battle.plan.mode === 'micro' ? 'Você começou. Isso conta.' : 'Seu esforço ganhou forma.'}</Heading><Txt size={20} weight="bold" color={c.purple}>{battle.attempts.filter(a => a.correct).length} de {battle.attempts.length} respostas corretas</Txt>{battle.attempts.some(a => a.repaired) && <Pill green>{battle.attempts.filter(a => a.repaired).length} {battle.attempts.filter(a => a.repaired).length === 1 ? 'conceito reparado na hora' : 'conceitos reparados na hora'}</Pill>}<Txt color={c.muted}>{result?.stage === 'mastered' ? 'Você demonstrou aprendizagem novamente depois de um intervalo. Seu monstro segue no bestiário e volta para pequenas revisões.' : result?.stage === 'consolidating' ? 'A prática de hoje foi bem. Vamos reencontrar este monstro a partir de amanhã para conferir o que ficou na memória.' : 'Este monstro já faz parte da sua jornada. Vamos fortalecer a base em uma próxima batalha.'}</Txt><View style={{ width: '100%', gap: 10 }}><Button title="Guardar no meu bestiário" icon={<CheckCircle2 size={18} color={c.purple} />} busy={task.busy} onPress={() => task.run(async () => { await actions.finishBattle(); router.replace('/bestiary'); })} /><Button title="Concluir e voltar ao início" variant="ghost" onPress={() => task.run(async () => { await actions.finishBattle(); router.replace('/'); })} /></View></Card>}
    {task.error && <Txt color={c.danger}>{task.error}</Txt>}{battle.phase !== 'complete' && <Button title="Pausar e continuar depois" variant="ghost" icon={<RotateCcw size={15} color={c.purple} />} onPress={() => router.replace('/')} />}<Txt size={11} color={c.muted} style={{ textAlign: 'center' }}>Aprender no seu ritmo também é progresso.</Txt>
  </Page>;
}
