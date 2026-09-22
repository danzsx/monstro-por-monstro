import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { Feeling } from '@/learning/types';
import { Button, Card, Choice, Eyebrow, Heading, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c, fonts } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
export default function OnboardingScreen() {
  const { state } = useApp(); const actions = useActions(); const task = useTask();
  const [name, setName] = useState(state.student?.name ?? ''); const [hours, setHours] = useState(state.student?.weeklyHours ?? 5);
  const [goal, setGoal] = useState(state.student?.goal ?? 'Construir uma base para o ENEM');
  const [feeling, setFeeling] = useState<Feeling>(state.student?.perception ?? 'insecure');
  const [age, setAge] = useState(state.student?.ageConfirmed ?? false);
  if (state.diagnosticCompletedAt) return <Redirect href="/" />;
  return <Page narrow><View style={{ gap: 12 }}><Eyebrow>SEU PONTO DE PARTIDA</Eyebrow><Heading>Primeiro, vamos conhecer você.</Heading><Txt color={c.muted}>Sem planejar uma semana inteira. Só o suficiente para encontrar o primeiro passo.</Txt></View><Card>
    <Txt weight="bold">Como podemos chamar você?</Txt><TextInput accessibilityLabel="Seu nome" placeholder="Seu primeiro nome" maxLength={40} value={name} onChangeText={setName} style={{ fontFamily: fonts.body, color: c.purple, fontSize: 17, padding: 16, borderRadius: 12, backgroundColor: c.background, borderWidth: 1, borderColor: c.line }} />
    <Txt weight="bold">Seu destino</Txt><Pill green>ENEM · TRILHA PILOTO</Pill><Txt size={13} color={c.muted}>Matemática e Biologia. Quatro conteúdos para começar.</Txt>
    <Txt weight="bold">Quanto tempo cabe na sua semana?</Txt><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{[3, 5, 10, 15].map(h => <Button key={h} title={`${h} h`} variant={h === hours ? 'primary' : 'secondary'} icon={<></>} onPress={() => setHours(h)} />)}</View><Txt size={12} color={c.muted}>Vamos distribuir batalhas curtas. Você pode ajustar depois.</Txt>
    <Txt weight="bold">O que você quer conquistar agora?</Txt>{['Construir uma base para o ENEM', 'Retomar os estudos com constância', 'Fortalecer minhas dificuldades'].map(g => <Choice key={g} text={g} selected={goal === g} onPress={() => setGoal(g)} />)}
    <Txt weight="bold">Como você está chegando?</Txt>{([{ id: 'confident', label: 'Confiante — vamos nessa' }, { id: 'insecure', label: 'Inseguro — quero ir por partes' }, { id: 'anxious', label: 'Ansioso — parece muita coisa' }, { id: 'avoid', label: 'Com vontade de evitar' }] as const).map(f => <Choice key={f.id} text={f.label} selected={feeling === f.id} onPress={() => setFeeling(f.id)} />)}
    <Choice text="Tenho 16 anos ou mais" selected={age} onPress={() => setAge(!age)} /><Txt size={12} color={c.muted}>Este piloto foi pensado para estudantes a partir de 16 anos. Suas percepções são usadas para ajustar o estudo; não são uma avaliação psicológica.</Txt>
  </Card>{task.error && <Txt color={c.danger}>{task.error}</Txt>}<Button title="Descobrir meu ponto de partida" disabled={!name.trim() || !age} busy={task.busy} onPress={() => task.run(async () => { await actions.saveStudent({ name: name.trim(), exam: 'ENEM', weeklyHours: hours, goal, perception: feeling, ageConfirmed: age }); router.replace('/diagnostic'); })} /><Button title="Voltar" variant="ghost" onPress={() => router.replace('/')} /></Page>;
}
