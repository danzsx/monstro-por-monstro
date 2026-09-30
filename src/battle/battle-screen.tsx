import { useRef, useState } from 'react';
import { Redirect, router, useIsFocused } from 'expo-router';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';
import { CheckCircle2, Heart, Leaf, RotateCcw, Sparkles } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { buildRepairChallenge, intervention, questionForPlan, updateMastery } from '@/learning/engine';
import { Feeling, Barrier, AffectiveCheckIn, AcquisitionRecord, ConfidenceLevel, RecallRecord } from '@/learning/types';
import { useStudyTimer } from '@/journey/use-study-timer';
import { Button, Card, Choice, Eyebrow, Heading, Page, Pill, Progress, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
import { haptic } from '@/ui/haptics';
import { scheduleSpacedReviewNotifications } from '@/learning/notifications';
import { ApostilaReader } from '@/apostila/reader';
import { useInteractiveModule } from '@/apostila/data';
import { BattleMonster } from './battle-monster';
import { battleHealth } from './battle-health';
import { earnsFirstClear, isEvolutionPilot } from '@/learning/evolution';
export default function BattleScreen() {
  const { state, store, topics, topicById, questionById } = useApp(); const actions = useActions(); const task = useTask();
  const [choice, setChoice] = useState<number | null>(null);
  const [repairChoice, setRepairChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [materialText, setMaterialText] = useState('');
  const scroll = useRef<ScrollView>(null);
  const theoryY = useRef(0);
  const focused = useIsFocused();
  const battle = state.activeBattle;
  const studying = !!battle && ['lesson', 'acquisition-external', 'acquisition-interactive', 'recall', 'mini-review'].includes(battle.phase);
  const timing = studying || !!battle && ['question', 'feedback', 'repair'].includes(battle.phase);
  const timer = useStudyTimer(battle?.plan.id, battle ? `${battle.phase}:${battle.blockIndex}:${battle.questionIndex}:${battle.revealed}` : undefined, focused && timing, studying ? Infinity : 120_000);
  const interactive = useInteractiveModule(battle?.plan.topicId ?? '');
  if (!battle) return <Redirect href="/" />;
  const topic = topicById(battle.plan.topicId);
  const mastery = state.masteries[topic.id] ?? { topicId: topic.id, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
  const question = questionForPlan(battle.plan, battle.plan.questionIds[battle.questionIndex], questionById);
  const block = battle.plan.blocks[battle.blockIndex];
  const hasTheory = battle.plan.version === 2 && !battle.decision.review && battle.plan.mode !== 'exam';
  const acquisitionSteps = hasTheory ? 3 : battle.plan.blocks.length;
  const steps = acquisitionSteps + battle.plan.questionIds.length;
  const visiblePhase = battle.phase === 'paused' ? battle.resumePhase : battle.phase;
  const current = visiblePhase === 'lesson' ? (battle.blockIndex + 1) / Math.max(1, battle.plan.blocks.length) : visiblePhase === 'acquisition-interactive' ? ((battle.acquisition?.sectionIndex ?? 0) + 1) / Math.max(1, interactive.module?.sections.length ?? 1) : visiblePhase === 'recall' ? 1 : visiblePhase === 'mini-review' ? 2 : ['question', 'feedback', 'repair'].includes(visiblePhase ?? '') ? acquisitionSteps + battle.questionIndex : visiblePhase === 'complete' ? steps : 0;
  const timeLabel = `${String(Math.floor(timer.elapsedMs / 60_000)).padStart(2, '0')}:${String(Math.floor(timer.elapsedMs / 1000) % 60).padStart(2, '0')}`;
  const health = battleHealth(battle);

  const next = () => task.run(async () => {
    await timer.flush();
    if (battle.phase === 'lesson' && battle.plan.version === 2 && battle.blockIndex === battle.plan.blocks.length - 1) await actions.completeAcquisition();
    else await actions.battleAction({ type: 'NEXT' });
    setChoice(null); setRepairChoice(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  });
  const chooseSource = (source: AcquisitionRecord['source'], label: string, material?: { url?: string; materialText?: string }) => task.run(async () => { await timer.flush(); await actions.chooseSource(source, label, material); });
  const finishTheory = () => task.run(async () => { await timer.flush(); await actions.completeAcquisition(); scroll.current?.scrollTo({ y: 0, animated: false }); });
  const reportRecall = (report: RecallRecord['report']) => task.run(async () => { await timer.flush(); await actions.reportRecall(report); scroll.current?.scrollTo({ y: 0, animated: false }); });
  const pause = () => task.run(async () => { await timer.flush(); await actions.pauseBattle(); router.replace('/'); });
  const selectFeeling = (feeling: Feeling) => task.run(async () => {
    const checkIn: AffectiveCheckIn = { topicId: topic.id, feeling, at: new Date().toISOString() };
    await actions.battleAction({ type: 'CHECK_IN', checkIn });
  });
  const selectBarrier = (barrier: Barrier) => task.run(() => actions.setIntervention({ ...battle.checkIn!, barrier }));
  const theoryUnderstood = !!state.topicChecklists?.[topic.id]?.theoryUnderstood;
  const firstClearReady = battle.phase === 'complete' && !mastery.firstClearedAt && battle.plan.mode === 'learn' && earnsFirstClear(topic.id, battle.attempts, state.topicChecklists?.[topic.id]);
  const result = battle.phase === 'complete' ? updateMastery(mastery, battle.attempts, new Date().toISOString()) : null;
  const complete = (destination: '/bestiary' | '/') => task.run(async () => {
    haptic.success();
    await timer.flush();
    if (confidence) await actions.rateConfidence(topic.id, confidence, battle.plan.id);
    await actions.finishBattle();
    const saved = store.get().state;
    void scheduleSpacedReviewNotifications(saved.masteries, topics, saved.remindersEnabled);
    router.replace(destination);
  });
  return <Page narrow onActivity={timer.markActivity} scrollRef={scroll}><View style={{ gap: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><Eyebrow>{topic.discipline.toUpperCase()} · CERCA DE {battle.plan.estimatedMinutes} MIN</Eyebrow><Pill>{battle.plan.mode === 'exam' ? 'PRÁTICA ENEM' : battle.decision.review ? 'REVISÃO' : 'EM APRENDIZAGEM'}</Pill></View><Heading size={29}>{topic.name}</Heading><Progress value={steps ? current / steps : 0} label="Progresso do estudo" /></View>
    <View style={{ alignItems: 'center', gap: 4 }}><BattleMonster battle={battle} evolved={!!mastery.evolvedAt || firstClearReady} studyRunning={studying && timer.isRunning} />{['question', 'feedback', 'repair', 'complete'].includes(battle.phase) && <View style={{ width: '100%', maxWidth: 340, gap: 7 }} accessibilityLiveRegion="polite"><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Eyebrow>VIDA DO MONSTRO</Eyebrow><Txt size={12} weight="bold" color={c.purple} style={{ fontVariant: ['tabular-nums'] }}>{Math.round(health * 100)}%</Txt></View><Progress value={health} label="Vida do monstro" /></View>}</View>
    {studying && <Card style={{ backgroundColor: c.softGreen, alignItems: 'center', gap: 8 }}><Eyebrow>SEU TEMPO DE ESTUDO</Eyebrow><Heading size={35}>{timeLabel}</Heading><Txt size={13} color={c.muted} style={{ textAlign: 'center' }}>Seu monstro acompanha seu foco. Deixe esta tela aberta enquanto estuda, mesmo usando um livro ou uma aula em outra janela.</Txt><Txt size={12} color={c.muted}>O tempo pausa ao sair desta tela, ocultar o app ou pausar a sessão. A estimativa de tempo não interrompe seu estudo.</Txt></Card>}
    {battle.phase === 'check-in' && <Card style={{ alignItems: 'center', gap: 20 }}><Heading>Como você está chegando?</Heading><Txt color={c.muted}>Opcional. Você também pode começar sem responder.</Txt><View style={{ alignSelf: 'stretch', gap: 10 }}>{([{ id: 'confident', label: 'Confiante' }, { id: 'insecure', label: 'Inseguro' }, { id: 'anxious', label: 'Ansioso' }, { id: 'avoid', label: 'Quero evitar' }] as { id: Feeling; label: string }[]).map(f => <Button key={f.id} title={f.label} variant="secondary" disabled={task.busy} onPress={() => selectFeeling(f.id)} />)}</View><Button title="Seguir sem informar" variant="ghost" onPress={() => task.run(() => actions.battleAction({ type: 'SKIP_CHECK_IN' }))} /></Card>}
    {battle.phase === 'time-choice' && <Card style={{ backgroundColor: c.peach, gap: 18 }}><Leaf size={28} color={c.greenDark} /><Heading size={27}>Quanto tempo cabe agora?</Heading><Txt color={c.muted}>Você escolhe o ritmo. {battle.decision.review ? 'Este encontro retoma o que você já estudou.' : 'Vamos começar pela teoria, com uma aula ou seu próprio material.'}</Txt><Button title="Tenho cerca de 5 minutos" busy={task.busy} onPress={() => task.run(async () => { await timer.flush(); await actions.selectStudyTime(5); })} /><Button title="Tenho 15 minutos ou mais" variant="secondary" busy={task.busy} onPress={() => task.run(async () => { await timer.flush(); await actions.selectStudyTime(15); })} /><Txt size={12} color={c.muted}>Se precisar sair, seu progresso fica salvo para continuar depois.</Txt></Card>}
    {battle.phase === 'barrier' && <Card style={{ gap: 20 }}><Heart size={26} color={c.purple} /><Heading size={28}>O que está pesando mais?</Heading><Txt color={c.muted}>Pode escolher o que mais se aproxima. Essa resposta não muda sua nota.</Txt>{([{ id: 'difficulty', label: 'Parece difícil demais' }, { id: 'tired', label: 'Estou sem energia' }, { id: 'relevance', label: 'Não vejo por que aprender isso' }, { id: 'history', label: 'Já tentei e não consegui' }] as { id: Barrier; label: string }[]).map(b => <Button key={b.id} title={b.label} variant="secondary" disabled={task.busy} onPress={() => selectBarrier(b.id)} />)}</Card>}
    {battle.phase === 'intervention' && <Card style={{ backgroundColor: c.peach, gap: 22 }}><Leaf size={28} color={c.greenDark} /><Heading>{battle.plan.mode === 'micro' ? 'Um passo curto para agora.' : 'Um passo possível para hoje.'}</Heading><Txt size={18}>{battle.checkIn ? intervention(battle.checkIn, mastery, state.masteries) : 'Você pode começar no seu ritmo. Primeiro, conheça a teoria.'}</Txt><Pill green>CERCA DE {battle.plan.estimatedMinutes} MINUTOS</Pill><Txt color={c.muted}>{battle.plan.criteria}</Txt><Button title="Dar o primeiro passo" busy={task.busy} onPress={() => task.run(() => actions.battleAction({ type: 'BEGIN' }))} /><Button title="Quero contar como estou" variant="ghost" onPress={() => task.run(() => actions.battleAction({ type: 'OPEN_CHECK_IN' }))} /></Card>}
    {battle.phase === 'paused' && <Card style={{ gap: 16 }}><Heading>Seu estudo está guardado.</Heading><Txt color={c.muted}>Você vai voltar à mesma etapa, sem contar o tempo da pausa.</Txt><Button title="Retomar de onde parei" busy={task.busy} onPress={() => task.run(() => actions.resumeBattle())} /><Button title="Voltar ao início" variant="ghost" onPress={() => router.replace('/')} /></Card>}
    {battle.phase === 'source-choice' && <Card style={{ gap: 18 }}><Eyebrow>ESTUDO DE TEORIA</Eyebrow><Heading size={27}>Escolha como quer aprender.</Heading><Txt>{topic.description}</Txt><Txt color={c.muted}>Agora é hora de conhecer {topic.name}. As questões ficam para depois do estudo, da autoexplicação e de uma mini revisão.</Txt>
      {battle.checkIn && <Txt size={14} color={c.purple}>{intervention(battle.checkIn, mastery, state.masteries)}</Txt>}
      {!!topic.curatedSources?.length && <View style={{ gap: 12 }}><Eyebrow>AULA SUGERIDA</Eyebrow>{topic.curatedSources.map(source => <Card key={source.url} style={{ backgroundColor: c.lavender }}><Heading size={20}>{source.title}</Heading><Txt size={13} color={c.muted}>{source.publisher}</Txt><Button title={`Estudar com ${source.title}`} variant="secondary" busy={task.busy} onPress={() => chooseSource('external', `${source.publisher} · ${source.title}`, { url: source.url })} /><Txt size={12} color={c.muted}>{source.fallbackInstructions}</Txt></Card>)}</View>}
      <View style={{ gap: 8 }}><Eyebrow>APRENDA COM A GENTE</Eyebrow>{interactive.module ? <><Button title="Começar aula interativa" busy={task.busy} onPress={() => chooseSource('interactive', `Aula interativa · ${topic.name}`)} /><Txt size={13} color={c.muted}>Explicações e figuras que você pode explorar no seu ritmo.</Txt></> : <Txt size={13} color={c.muted}>{interactive.loading ? 'Buscando aula interativa…' : 'A aula interativa deste monstro está em preparação.'}</Txt>}{battle.plan.blocks.length > 0 && <Button title="Ler a teoria do app" variant="secondary" busy={task.busy} onPress={() => chooseSource('internal', `Teoria do app · ${topic.name}`)} />}</View>
      <View style={{ gap: 10 }}><Eyebrow>SEU PRÓPRIO MATERIAL</Eyebrow><Txt size={14} color={c.muted}>Use seu livro ou aula, salve um link ou cole um texto para estudar aqui.</Txt><TextInput accessibilityLabel="Nome do material externo" placeholder="Ex.: meu livro, vídeo ou aula" value={sourceLabel} onChangeText={setSourceLabel} maxLength={120} style={{ borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, color: c.ink, backgroundColor: c.surface }} /><TextInput accessibilityLabel="Link do meu material" placeholder="Link da aula ou do material (opcional)" value={sourceUrl} onChangeText={setSourceUrl} autoCapitalize="none" keyboardType="url" maxLength={2000} style={{ borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, color: c.ink, backgroundColor: c.surface }} /><TextInput accessibilityLabel="Texto do meu material" placeholder="Cole seu texto de estudo aqui (opcional)" value={materialText} onChangeText={setMaterialText} multiline maxLength={20000} style={{ borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, minHeight: 110, textAlignVertical: 'top', color: c.ink, backgroundColor: c.surface }} /><Button title="Estudar com meu material" variant="secondary" disabled={!sourceLabel.trim() && !materialText.trim() && !sourceUrl.trim()} busy={task.busy} onPress={() => chooseSource('external', sourceLabel.trim() || `Meu material · ${topic.name}`, { url: sourceUrl, materialText })} /></View>
    </Card>}
    {battle.phase === 'acquisition-external' && <Card style={{ gap: 16 }}><Eyebrow>ESTUDO DE TEORIA · SEU MATERIAL</Eyebrow><Heading size={25}>Seu momento de aprender.</Heading><Txt weight="bold">{battle.acquisition?.label}</Txt>{battle.acquisition?.url && <Button title="Abrir aula ou material" variant="secondary" busy={task.busy} onPress={() => task.run(() => Linking.openURL(battle.acquisition!.url!))} />}{battle.acquisition?.materialText && <Txt size={18} style={{ lineHeight: 29 }}>{battle.acquisition.materialText}</Txt>}<Txt color={c.muted}>Estude uma ideia central de {topic.name}. Mantenha o app visível como companhia de foco e avance quando estiver pronto.</Txt><Button title="Concluir teoria e autoexplicar" busy={task.busy} onPress={finishTheory} /></Card>}
    {battle.phase === 'acquisition-interactive' && (interactive.module ? <View onLayout={event => { theoryY.current = event.nativeEvent.layout.y; }}><ApostilaReader key={battle.plan.id} module={interactive.module} onBack={pause} study={{ initialStep: battle.acquisition?.sectionIndex, onStepChange: index => task.run(async () => { await actions.saveInteractiveStep(index); scroll.current?.scrollTo({ y: theoryY.current, animated: false }); }), onComplete: finishTheory, busy: task.busy }} /></View> : <Card><Heading size={25}>{interactive.loading ? 'Carregando sua aula…' : 'Esta aula não está disponível agora.'}</Heading><Txt color={c.muted}>Sua etapa está salva. Você pode pausar e tentar novamente, ou continuar com a teoria em texto.</Txt>{battle.plan.blocks.length > 0 && <Button title="Continuar com a teoria do app" busy={task.busy} onPress={() => task.run(() => actions.useTextTheory())} />}</Card>)}
    {battle.phase === 'lesson' && <Card style={{ gap: 24 }}><Eyebrow>{block.kind === 'example' ? 'VAMOS VER NA PRÁTICA' : 'UMA IDEIA DE CADA VEZ'} · {battle.blockIndex + 1}/{battle.plan.blocks.length}</Eyebrow><Heading size={30}>{block.title}</Heading><Txt size={19} style={{ lineHeight: 31 }}>{block.text}</Txt>{block.formula && <View style={{ backgroundColor: c.lavender, padding: 24, borderRadius: 18 }}><Txt weight="bold" size={22} color={c.purple} style={{ textAlign: 'center' }}>{block.formula}</Txt></View>}{block.kind === 'recall' && <><Txt size={13} color={c.muted}>Tente responder antes de revelar.</Txt>{battle.revealed ? <Txt>{block.reveal}</Txt> : <Button title="Já tentei. Ver explicação" variant="secondary" onPress={() => task.run(() => actions.battleAction({ type: 'REVEAL' }))} />}</>}<Button title={battle.blockIndex + 1 === battle.plan.blocks.length ? battle.plan.version === 2 ? 'Concluir teoria e autoexplicar' : 'Colocar em prática' : 'Próximo passo'} disabled={block.kind === 'recall' && !battle.revealed} busy={task.busy} onPress={next} /></Card>}
    {battle.phase === 'recall' && <Card style={{ gap: 16 }}><Eyebrow>AUTOEXPLICAÇÃO · NO SEU RITMO</Eyebrow><Heading size={25}>{battle.plan.recallPrompt?.title ?? 'Lembre com suas palavras'}</Heading><Txt>{battle.plan.recallPrompt?.text ?? `Explique uma ideia central de ${topic.name} sem consultar o material.`}</Txt><Txt color={c.muted}>Afaste o material e conte o que entendeu. Pode ser em voz alta, no papel ou neste espaço.</Txt><TextInput accessibilityLabel="Minha autoexplicação" placeholder="O que eu aprendi? Como explicaria para alguém? (opcional)" value={battle.recallDraft ?? ''} onChangeText={text => { void actions.saveRecallDraft(text); }} multiline maxLength={5000} style={{ minHeight: 130, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, textAlignVertical: 'top', backgroundColor: c.surface, color: c.ink }} /><Txt size={13} color={c.muted}>Tempo ativo nesta etapa: {Math.floor((battle.recallActiveMs ?? 0) / 60_000)} min {Math.floor(((battle.recallActiveMs ?? 0) % 60_000) / 1000)} s.</Txt>{battle.plan.recallPrompt?.reveal && (battle.revealed ? <Card style={{ backgroundColor: c.softGreen }}><Txt>{battle.plan.recallPrompt.reveal}</Txt></Card> : <Button title="Ver resposta de referência depois de tentar" variant="secondary" onPress={() => task.run(() => actions.battleAction({ type: 'REVEAL' }))} />)}<Txt size={13} color={c.muted}>Como foi lembrar? Seu relato orienta a próxima conversa, mas não altera o domínio.</Txt><Button title="Lembrei bem" busy={task.busy} onPress={() => reportRecall('clear')} /><Button title="Lembrei em parte" variant="secondary" busy={task.busy} onPress={() => reportRecall('partial')} /><Button title="Ainda não lembrei" variant="ghost" busy={task.busy} onPress={() => reportRecall('not_yet')} /></Card>}
    {battle.phase === 'mini-review' && <Card style={{ gap: 18 }}><Eyebrow>MINI REVISÃO</Eyebrow><Heading size={26}>Organize as ideias antes de praticar.</Heading><Txt color={c.muted}>Confira os pontos principais e compare com sua explicação.</Txt>{battle.recall?.text && <View style={{ backgroundColor: c.lavender, padding: 16, borderRadius: 14, gap: 6 }}><Txt weight="bold">Sua autoexplicação</Txt><Txt>{battle.recall.text}</Txt></View>}{battle.plan.miniReview?.length ? battle.plan.miniReview.map(item => <View key={item.id} style={{ gap: 8 }}><Heading size={21}>{item.title}</Heading><Txt>{item.text}</Txt>{item.formula && <Txt weight="bold" color={c.purple}>{item.formula}</Txt>}</View>) : <Txt>{battle.plan.recallPrompt?.reveal ?? topic.description}</Txt>}<Button title="Começar questões de fixação" busy={task.busy} onPress={next} /></Card>}
    {['question', 'feedback'].includes(battle.phase) && <Card style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <Eyebrow>QUESTÃO {battle.questionIndex + 1} DE {battle.plan.questionIds.length} · SEM CONSULTA</Eyebrow>
      </View>
      {battle.plan.mode === 'exam' && question.enemMetadata && <Txt size={13} color={c.muted}>ENEM {question.enemMetadata.year} · {question.enemMetadata.color ? `Caderno ${question.enemMetadata.color} · ` : ''}questão {question.enemMetadata.questionNumber}. Reprodução autorizada e revisão editorial registrada.</Txt>}
      <Heading size={25}>{question.prompt}</Heading><View style={{ gap: 10 }}>{question.options.map((option, i) => <Choice key={`${question.id}-${i}`} text={option} index={i} selected={battle.phase === 'feedback' ? battle.attempts.at(-1)?.answer === i : choice === i} disabled={battle.phase === 'feedback' || task.busy} onPress={() => setChoice(i)} />)}</View>{battle.phase === 'question' ? <><Button title="Confirmar resposta" disabled={choice === null} busy={task.busy} onPress={() => task.run(async () => {
        const isCorrect = choice === question.answer;
        if (isCorrect) haptic.success(); else haptic.warning();
        await actions.answerBattle(question.id, choice!);
      })} /><Button title="Ainda não sei" variant="ghost" onPress={() => task.run(() => actions.answerBattle(question.id, -1))} /></> : <><View accessibilityLiveRegion="polite" style={{ padding: 20, gap: 8, borderRadius: 16, backgroundColor: battle.attempts.at(-1)?.correct ? c.softGreen : c.peach }}><Txt weight="bold" color={c.purple}>{battle.attempts.at(-1)?.correct ? 'Isso! Você encontrou a relação.' : 'Vamos entender esse passo.'}</Txt><Txt weight="bold">Resposta: {question.options[question.answer]}</Txt><Txt>{question.explanation}</Txt></View>{battle.attempts.at(-1)?.correct ? <Button title={battle.questionIndex + 1 === battle.plan.questionIds.length ? 'Ver minha conquista' : 'Próxima questão'} busy={task.busy} onPress={next} /> : <View style={{ gap: 10 }}><Button title="Reparar este conceito agora (1 min)" icon={<Sparkles size={17} color={c.purple} />} busy={task.busy} onPress={() => task.run(() => actions.startRepair())} /><Button title={battle.questionIndex + 1 === battle.plan.questionIds.length ? 'Pular e ver conquista' : 'Pular para próxima questão'} variant="ghost" busy={task.busy} onPress={next} /></View>}</>}</Card>}
    {battle.phase === 'repair' && (() => {
      const challenge = buildRepairChallenge(question);
      return <Card style={{ backgroundColor: '#FFFDF9', borderColor: c.purple, borderWidth: 1.5, gap: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow color={c.purple}>REPARAÇÃO IMEDIATA · FIXAR O CONCEITO</Eyebrow>
          <Pill green={battle.repaired}>{battle.repaired ? 'PASSO GUIADO FEITO' : 'PASSO GUIADO'}</Pill>
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
              <Txt weight="bold" color={c.greenDark}>✦ Você praticou essa ideia com apoio.</Txt>
              <Txt size={13}>A tentativa inicial continua registrada; outra questão sem ajuda mostrará o que ficou.</Txt>
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
              onPress={() => task.run(async () => {
                const isCorrect = repairChoice === challenge.answer;
                if (isCorrect) haptic.success();
                await actions.answerRepair(isCorrect, repairChoice!);
              })}
            />
            <Button title="Pular reparação" variant="ghost" onPress={next} />
          </View>
        )}
      </Card>;
    })()}
    {battle.phase === 'complete' && <Card style={{ alignItems: 'center', gap: 18 }}>
      <Pill green>{firstClearReady ? 'SEGUNDA FORMA CONQUISTADA' : result?.stage === 'mastered' ? 'DOMÍNIO EM REVISÕES' : 'MAIS UM PASSO CONQUISTADO'}</Pill>
      <Heading>{firstClearReady ? 'Seu monstro evoluiu!' : battle.plan.mode === 'exam' ? 'Você praticou com o ENEM.' : battle.plan.mode === 'micro' ? 'Você começou. Isso conta.' : 'Seu estudo inicial está concluído.'}</Heading>
      {battle.acquisition && <Txt color={c.muted}>Teoria estudada: {battle.acquisition.label}. Seu tempo e progresso estão guardados.</Txt>}
      {battle.recall && <Txt color={c.muted}>Recordação declarada: {battle.recall.report === 'clear' ? 'lembrei bem' : battle.recall.report === 'partial' ? 'lembrei em parte' : 'ainda não lembrei'}. Isso não conta como acerto.</Txt>}
      <Txt size={20} weight="bold" color={c.purple}>{battle.attempts.filter(a => a.correct).length} de {battle.attempts.length} respostas corretas</Txt>
      {battle.attempts.some(a => a.repaired) && <Pill green>{battle.attempts.filter(a => a.repaired).length} passo guiado concluído</Pill>}
      {isEvolutionPilot(topic.id) && !mastery.firstClearedAt && battle.plan.mode === 'learn' && <View style={{ width: '100%', gap: 8 }}>
        <Pressable accessibilityRole="checkbox" accessibilityLabel="Compreendi a teoria" accessibilityState={{ checked: theoryUnderstood }} aria-checked={theoryUnderstood}
          onPress={() => task.run(() => actions.setTheoryUnderstood(topic.id, !theoryUnderstood))}
          style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 10 }}>
          <Txt color={c.purple} size={22}>{theoryUnderstood ? '☑' : '☐'}</Txt><Txt weight="bold">Compreendi a teoria</Txt>
        </Pressable>
        <Txt size={13} color={c.muted}>Para a primeira evolução: esta declaração e três respostas distintas, corretas e sem ajuda nesta sessão. A checklist continua opcional.</Txt>
      </View>}
      <Txt color={c.muted}>{firstClearReady ? 'Esta é uma primeira conquista visual. Depois de um intervalo, questões novas ajudam a conferir o que ficou.' : mastery.evolvedAt ? 'Sua segunda forma permanece. Um erro mostra o que vale revisar; não apaga a conquista.' : 'Você concluiu este encontro. Se houve erro, a próxima prática ajuda a fortalecer o que ficou; a evolução do monstro segue seus critérios de fixação.'}</Txt>
      <View style={{ width: '100%', gap: 8 }}><Txt weight="bold" color={c.purple}>Como está sua confiança neste monstro?</Txt>
        <Txt size={12} color={c.muted}>Opcional. Sua escolha não altera seu resultado.</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level, index) => <Button key={level} title={['Baixa', 'Média', 'Alta'][index]} variant={confidence === level ? 'primary' : 'secondary'} onPress={() => { timer.markActivity(); setConfidence(level); }} />)}</View>
      </View>
      <View style={{ width: '100%', gap: 10 }}><Button title="Guardar no meu bestiário" icon={<CheckCircle2 size={18} color={c.purple} />} busy={task.busy} onPress={() => complete('/bestiary')} /><Button title="Concluir e voltar ao início" variant="ghost" busy={task.busy} onPress={() => complete('/')} /></View>
    </Card>}
    {task.error && <Txt color={c.danger}>{task.error}</Txt>}{battle.phase !== 'complete' && battle.phase !== 'paused' && <Button title="Pausar e continuar depois" variant="ghost" icon={<RotateCcw size={15} color={c.purple} />} busy={task.busy} onPress={pause} />}<Txt size={11} color={c.muted} style={{ textAlign: 'center' }}>Aprender no seu ritmo também é progresso.</Txt>
  </Page>;
}
