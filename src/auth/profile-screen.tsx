import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Cloud, Download, Heart, UserRound } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { useActions } from '@/learning/actions';
import { exportProgress } from '@/data/export';
import { Button, Card, Eyebrow, Heading, Page, Pill, Txt } from '@/ui/primitives';
import { colors as c, fonts } from '@/ui/theme';
import { useTask } from '@/ui/use-task';
import { linkEmail, sendLoginCode, signOut, supabase, verifyEmail } from './client';
import { requestNotificationPermission, scheduleSpacedReviewNotifications } from '@/learning/notifications';
export default function ProfileScreen() {
  const app = useApp(); const { state } = app; const actions = useActions(); const task = useTask();
  const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<'link' | 'login'>('link'); const [notice, setNotice] = useState(''); const [accountEmail, setAccountEmail] = useState<string>();
  const [name, setName] = useState(state.student?.name ?? ''); const [hours, setHours] = useState(state.student?.weeklyHours ?? 5);
  useEffect(() => {
    void supabase?.auth.getSession().then(({ data }) => setAccountEmail(data.session?.user.email));
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => setAccountEmail(session?.user.email));
    return () => subscription?.data.subscription.unsubscribe();
  }, []);
  const field = { fontFamily: fonts.body, fontSize: 16, color: c.purple, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.background };
  return <Page narrow><View style={{ gap: 10 }}><Eyebrow>UM CAMINHO COM A SUA CARA</Eyebrow><Heading size={39}>Meu perfil.</Heading><Txt color={c.muted}>Seu objetivo pode ser grande. Seu próximo passo pode ser pequeno.</Txt></View>
    {state.student ? <Card><UserRound size={24} color={c.purple} /><Heading size={24}>Seu ritmo de estudo</Heading><Txt weight="bold">Como podemos chamar você?</Txt><TextInput value={name} onChangeText={setName} maxLength={40} accessibilityLabel="Nome no perfil" style={field} /><Txt weight="bold">Horas disponíveis por semana</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>{[3, 5, 10, 15].map(h => <Button key={h} title={`${h} h`} variant={h === hours ? 'primary' : 'secondary'} icon={<></>} onPress={() => setHours(h)} />)}</View><Txt size={13} color={c.muted}>Objetivo: {state.student.goal}</Txt><Pill>ENEM · MATEMÁTICA E BIOLOGIA</Pill><Button title="Salvar preferências" disabled={!name.trim()} busy={task.busy} onPress={() => task.run(async () => {
      await actions.saveStudent({ ...state.student!, name: name.trim(), weeklyHours: hours });
      await requestNotificationPermission();
      void scheduleSpacedReviewNotifications(state.masteries, app.topics);
      setNotice('Seu ritmo foi atualizado e os lembretes de revisão estão ativos.');
    })} /></Card> : <Card><Heading size={24}>Seu primeiro passo espera por você.</Heading><Txt>Comece pelo diagnóstico para descobrir seu próximo monstro.</Txt><Button title="Começar minha jornada" onPress={() => router.push('/onboarding')} /></Card>}
    <Card><Cloud size={25} color={c.purple} /><Heading size={24}>{accountEmail ? 'Sua jornada está vinculada' : 'Leve sua jornada com você.'}</Heading><Txt color={c.muted}>{accountEmail ? accountEmail : 'Vincule um e-mail para continuar no celular ou no computador, sem perder suas conquistas.'}</Txt>
      {!app.cloudConfigured ? <View style={{ padding: 18, borderRadius: 14, backgroundColor: c.peach, gap: 8 }}><Txt weight="bold" color={c.purple}>Salvo neste aparelho</Txt><Txt size={13}>A conexão com a nuvem ainda está sendo preparada. Você pode estudar e exportar sua jornada. Por enquanto, não limpe os dados do aplicativo ou do navegador.</Txt></View> : <>
        <Pill green={!app.syncError}>{app.syncing ? 'SINCRONIZANDO' : app.syncError ? 'SINCRONIZAÇÃO PENDENTE' : `${app.envelope.pending.length} OPERAÇÕES PENDENTES`}</Pill>{app.syncError && <Txt color={c.danger} size={13}>{app.syncError}</Txt>}<Button title="Sincronizar agora" variant="secondary" busy={app.syncing} onPress={() => { void app.syncNow(); }} />
        {accountEmail ? <View style={{ gap: 8, marginTop: 4 }}>
          <Button title="Sair desta conta" variant="ghost" busy={task.busy} onPress={() => task.run(async () => {
            await app.store.signOutAccount();
            await signOut();
            setAccountEmail(undefined);
            setNotice('Você saiu da conta. Seu progresso anterior está preservado na nuvem.');
          })} />
        </View> : <>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}><Button title="Salvar com e-mail" variant={mode === 'link' ? 'primary' : 'secondary'} icon={<></>} onPress={() => { setMode('link'); setSent(false); }} /><Button title="Já tenho conta" variant={mode === 'login' ? 'primary' : 'secondary'} icon={<></>} onPress={() => { setMode('login'); setSent(false); }} /></View>{mode === 'login' && <Txt size={12} color={c.muted}>Ao entrar, será carregada a jornada da conta. Uma cópia do progresso atual ficará preservada neste aparelho. Você também pode exportá-la abaixo.</Txt>}<TextInput accessibilityLabel="Seu e-mail" placeholder="voce@exemplo.com" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" style={field} />
          {sent ? <><TextInput accessibilityLabel="Código recebido por e-mail" placeholder="Código do e-mail" value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} style={field} /><Button title="Confirmar código" disabled={code.length < 6} busy={task.busy} onPress={() => task.run(async () => { const user = await verifyEmail(email.trim(), code.trim(), mode); if (mode === 'login' && user) await app.store.loadAccount(user.id); setNotice('E-mail confirmado. Sua jornada está vinculada.'); setSent(false); await app.syncNow(); })} /></> : <Button title={mode === 'link' ? 'Receber código para salvar' : 'Receber código para entrar'} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} busy={task.busy} onPress={() => task.run(async () => { if (mode === 'link') { await app.store.sync(); await linkEmail(email.trim()); } else await sendLoginCode(email.trim()); setSent(true); setNotice('Confira seu e-mail e digite o código recebido.'); })} />}
        </>}
      </>}
    </Card>
    <Card><Heart size={23} color={c.purple} /><Heading size={23}>Um espaço para aprender.</Heading><Txt size={14} color={c.muted}>Confiança, insegurança e cansaço ajudam a ajustar o tamanho do desafio. Essas percepções não alteram o que você demonstrou saber, nem são usadas como diagnóstico psicológico.</Txt><Button title="Exportar minha jornada" variant="secondary" icon={<Download size={16} color={c.purple} />} onPress={() => task.run(() => exportProgress(state))} /><Txt size={11} color={c.muted}>A exportação contém seu perfil, respostas e percepções declaradas. Guarde o arquivo com cuidado.</Txt></Card>
    {!!notice && <Txt accessibilityLiveRegion="polite" color={c.greenDark}>{notice}</Txt>}{task.error && <Txt accessibilityLiveRegion="polite" color={c.danger}>{task.error}</Txt>}
  </Page>;
}
