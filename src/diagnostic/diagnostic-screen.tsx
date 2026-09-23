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

const familiarityOptions = [
  'Sei fazer e me sinto à vontade com isso',
  'Sei algumas partes, mas ainda me confundo',
  'Vi na escola, mas não lembro dos detalhes',
  'Ainda não tive contato ou prefiro começar do início',
];

const topicPrompts: Record<string, string[]> = {
  proportions: [
    'Você reconhece quando duas quantidades estão em proporção?',
    'Você se sente à vontade para comparar quantidades, como numa receita ou num mapa?',
    'Quando uma quantidade muda, você consegue perceber como a outra acompanha?',
  ],
  'rule-of-three': [
    'Você sabe fazer regra de três para encontrar um valor que falta?',
    'Você consegue decidir se duas grandezas crescem juntas ou em sentidos opostos?',
    'Você se sente à vontade para usar proporções em situações do dia a dia?',
  ],
  cytology: [
    'Você se lembra do que as partes de uma célula fazem?',
    'Você reconhece a diferença básica entre células animais e vegetais?',
    'Você se sente à vontade com ideias como núcleo, membrana e citoplasma?',
  ],
  genetics: [
    'Você sabe o básico de genética, como genes e hereditariedade?',
    'Você se lembra de como características podem passar de uma geração para outra?',
    'Você se sente à vontade com termos como DNA, gene e cromossomo?',
  ],
};

export default function DiagnosticScreen() {
  const { state, cloudConfigured, topicById } = useApp(); const actions = useActions(); const task = useTask();
  const [choice, setChoice] = useState<number | null>(null);
  if (!state.student) return <Redirect href="/onboarding" />;
  const question = nextDiagnosticQuestion(state.diagnosticAttempts);
  if (state.diagnosticCompletedAt || !question) return <Page narrow><Card style={{ alignItems: 'center', paddingVertical: 30 }}><Monster id="proportions" size={190} /><Pill green>CONVERSA CONCLUÍDA</Pill><Heading>Seu caminho começa a tomar forma.</Heading><Txt color={c.muted}>Obrigada por contar como você está hoje. Vamos ajustar o caminho a cada batalha — ninguém é definido por este primeiro retrato.</Txt><View style={{ alignSelf: 'stretch', gap: 12 }}><Button title="Conhecer meu próximo monstro" onPress={() => router.replace('/')} /><Button title="Salvar minha jornada com e-mail" onPress={() => router.push('/profile')} variant="secondary" /><Txt size={12} color={c.muted}>{cloudConfigured ? 'O cadastro vincula o progresso à sua conta para você continuar em outros aparelhos.' : 'Seu progresso já está salvo neste aparelho. A conta ficará disponível após conectar a nuvem.'}</Txt></View></Card></Page>;
  const answeredForTopic = state.diagnosticAttempts.filter(attempt => attempt.topicId === question.topicId).length;
  const prompts = topicPrompts[question.topicId] ?? [`Como você se sente em relação a ${topicById(question.topicId).name}?`];
  const prompt = prompts[Math.min(answeredForTopic, prompts.length - 1)];
  return <Page narrow><View style={{ gap: 12 }}><Eyebrow>CONHECENDO SEU PONTO DE PARTIDA</Eyebrow><Heading>Conte um pouco sobre o que você lembra.</Heading><Txt color={c.muted}>Não é uma prova e não há resposta certa. Sua percepção já é suficiente para encontrarmos um começo confortável.</Txt></View><View style={{ gap: 12 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt size={12} weight="bold">Pergunta {state.diagnosticAttempts.length + 1}</Txt><Txt size={12} color={c.muted}>cerca de 12 perguntas · no seu ritmo</Txt></View><Progress value={state.diagnosticAttempts.length / 12} label="Progresso da conversa inicial" /></View><Card style={{ gap: 23 }}><Pill>{topicById(question.topicId).discipline}</Pill><Heading size={24}>{prompt}</Heading><Txt size={13} color={c.muted}>Escolha a opção que mais parece com você hoje.</Txt><View style={{ gap: 10 }}>{familiarityOptions.map((option, index) => <Choice key={`${question.id}-${index}`} text={option} index={index} selected={choice === index} onPress={() => setChoice(index)} disabled={task.busy} />)}</View><Button title="Continuar" disabled={choice === null} busy={task.busy} onPress={() => task.run(async () => { await actions.answerDiagnostic(question.id, choice!); setChoice(null); })} /></Card><View style={{ flexDirection: 'row', gap: 10 }}><Sparkles size={18} color={c.purple} /><Txt size={12} color={c.muted} style={{ flex: 1 }}>Vamos usar o que você contar para sugerir um primeiro passo possível. Isso pode mudar conforme você aprende.</Txt></View>{task.error && <Txt color={c.danger}>{task.error}</Txt>}<Button title="Pausar por agora" variant="ghost" onPress={() => router.replace('/')} /></Page>;
}
