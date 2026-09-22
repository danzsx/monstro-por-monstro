import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { nextDiagnosticQuestion } from './engine';
import { Button, Card, Choice, Eyebrow, Heading, Monster, Page, Pill, Progress, Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
export default function DiagnosticScreen() {
  const { state, cloudConfigured, topicById } = useApp(); const actions = useActions(); const task = useTask();
  const [choice, setChoice] = useState<number | null>(null);
  if (!state.student) return <Redirect href="/onboarding" />;
  const question = nextDiagnosticQuestion(state.diagnosticAttempts);
  if (state.diagnosticCompletedAt || !question) return <Page narrow><Card style={{ alignItems: 'center', paddingVertical: 30 }}><Monster id="proportions" size={190} /><Pill green>DIAGNÓSTICO CONCLUÍDO</Pill><Heading>Seu caminho começa a tomar forma.</Heading><Txt color={c.muted}>Conhecemos um pouco da sua base. Ela será ajustada a cada batalha — ninguém é definido por uma primeira tentativa.</Txt><View style={{ alignSelf: 'stretch', gap: 12 }}><Button title="Conhecer meu próximo monstro" onPress={() => router.replace('/')} /><Button title="Salvar minha jornada com e-mail" onPress={() => router.push('/profile')} variant="secondary" /><Txt size={12} color={c.muted}>{cloudConfigured ? 'O cadastro vincula o progresso à sua conta para você continuar em outros aparelhos.' : 'Seu progresso já está salvo neste aparelho. A conta ficará disponível após conectar a nuvem.'}</Txt></View></Card></Page>;
  return <Page narrow><View style={{ gap: 12 }}><Eyebrow>UM RETRATO DO QUE VOCÊ JÁ SABE</Eyebrow><Heading>Vamos descobrir juntos.</Heading><Txt color={c.muted}>Não é uma prova. Pode dizer “ainda não sei” — isso ajuda a escolher um começo melhor.</Txt></View><View style={{ gap: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt size={12} weight="bold">Questão {state.diagnosticAttempts.length + 1}</Txt><Txt size={12} color={c.muted}>12 a 20 questões · sem cronômetro</Txt></View><Progress value={state.diagnosticAttempts.length / 20} label="Progresso do diagnóstico" /></View><Card style={{ gap: 23 }}><Pill>{topicById(question.topicId).discipline}</Pill><Heading size={24}>{question.prompt}</Heading><View style={{ gap: 10 }}>{question.options.map((option, index) => <Choice key={`${question.id}-${index}`} text={option} index={index} selected={choice === index} onPress={() => setChoice(index)} disabled={task.busy} />)}</View><Button title="Confirmar resposta" disabled={choice === null} busy={task.busy} onPress={() => task.run(async () => { await actions.answerDiagnostic(question.id, choice!); setChoice(null); })} /><Button title="Ainda não sei" variant="ghost" disabled={task.busy} onPress={() => task.run(async () => { await actions.answerDiagnostic(question.id, -1); setChoice(null); })} /></Card><View style={{ flexDirection: 'row', gap: 10 }}><Sparkles size={18} color={c.purple} /><Txt size={12} color={c.muted} style={{ flex: 1 }}>As próximas questões se ajustam às suas respostas. Seu progresso é salvo automaticamente.</Txt></View>{task.error && <Txt color={c.danger}>{task.error}</Txt>}<Button title="Pausar por agora" variant="ghost" onPress={() => router.replace('/')} /></Page>;
}
