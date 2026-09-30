import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router, Redirect } from 'expo-router';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { Button, Card, Choice, Eyebrow, Heading, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c, fonts } from '@/ui/theme';
import { useTask } from '@/ui/use-task';

export default function OnboardingScreen() {
  const { state } = useApp(); const actions = useActions(); const task = useTask();
  const [name, setName] = useState('');
  const [age, setAge] = useState(false);
  if (state.student) return <Redirect href="/" />;
  return <Page narrow><View style={{ gap: 12 }}><Eyebrow>PREFERÊNCIAS OPCIONAIS</Eyebrow><Heading>Deixe a jornada com a sua cara.</Heading><Txt color={c.muted}>Você já pode estudar sem preencher esta etapa. A conversa sobre familiaridade também pode ficar para depois.</Txt></View><Card>
    <Pill green>OBJETIVO · ENEM</Pill>
    <Txt weight="bold">Como podemos chamar você?</Txt><TextInput accessibilityLabel="Seu nome" placeholder="Seu primeiro nome" maxLength={40} value={name} onChangeText={setName} style={{ fontFamily: fonts.body, color: c.purple, fontSize: 17, padding: 16, borderRadius: 12, backgroundColor: c.background, borderWidth: 1, borderColor: c.line }} />
    <Choice text="Tenho 16 anos ou mais" selected={age} onPress={() => setAge(!age)} /><Txt size={12} color={c.muted}>Este piloto foi pensado para estudantes a partir de 16 anos. Você pode ajustar seu ritmo no perfil depois.</Txt>
  </Card>{task.error && <Txt color={c.danger}>{task.error}</Txt>}<Button title="Salvar preferências" disabled={!name.trim() || !age} busy={task.busy} onPress={() => task.run(async () => { await actions.saveStudent({ name: name.trim(), exam: 'ENEM', goal: 'Preparar para o ENEM', ageConfirmed: age }); router.replace('/'); })} /><Button title="Agora não" variant="ghost" onPress={() => router.replace('/')} /></Page>;
}
