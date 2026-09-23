import { PropsWithChildren } from 'react';
import { Link, usePathname } from 'expo-router';
import { View, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, BookOpen, UserRound, ArrowUpRight, Sparkles, CloudOff, Map } from 'lucide-react-native';
import { useApp } from '@/data/provider';
import { colors as c } from './theme';
import { Txt } from './primitives';
const nav = [{ href: '/' as const, label: 'Meu próximo monstro', short: 'Início', Icon: House }, { href: '/bestiary' as const, label: 'Meu bestiário', short: 'Bestiário', Icon: BookOpen }, { href: '/map' as const, label: 'Mapa dos monstros', short: 'Mapa', Icon: Map }, { href: '/profile' as const, label: 'Meu perfil', short: 'Perfil', Icon: UserRound }];
function Logo() { return <View style={{ gap: 0 }}><Txt weight="heading" size={29} color={c.purple} style={{ lineHeight: 29, letterSpacing: -1 }}>monstro</Txt><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ backgroundColor: c.green, borderRadius: 5, paddingHorizontal: 5, transform: [{ rotate: '-5deg' }] }}><Txt size={12} weight="heading" color={c.purple}>por</Txt></View><Txt weight="heading" size={26} color={c.purple} style={{ lineHeight: 29, letterSpacing: -1 }}>monstro</Txt></View></View>; }
export function Shell({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions(); const wide = width >= 1000; const path = usePathname(); const insets = useSafeAreaInsets();
  const { state, online, error, syncError, cloudConfigured } = useApp();
  const study = path === '/battle' || path === '/diagnostic' || path === '/onboarding';
  const items = nav.map(({ href, label, short, Icon }) => {
    const active = path === href;
    return <Link key={href} href={href} asChild><Pressable accessibilityRole="link" accessibilityLabel={label} style={{ flex: wide ? undefined : 1, flexDirection: wide ? 'row' : 'column', gap: wide ? 12 : 4, alignItems: 'center', padding: wide ? 15 : 9, borderRadius: 14, backgroundColor: active ? c.lavender : 'transparent' }}><Icon size={wide ? 19 : 21} color={active ? c.purple : c.muted} strokeWidth={active ? 2.2 : 1.6} /><Txt size={wide ? 13 : 10} weight={active ? 'bold' : 'medium'} color={active ? c.purple : c.muted}>{wide ? label : short}</Txt></Pressable></Link>;
  });
  return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.background }}>
    {wide && <View style={{ width: 238, borderRightWidth: 1, borderColor: c.line, padding: 24, paddingTop: 39, gap: 45, backgroundColor: '#FFFCF9' }}><Link href="/" accessibilityLabel="Monstro por Monstro, início"><Logo /></Link><View style={{ gap: 8 }}>{items}</View><View style={{ flex: 1 }} /><View style={{ padding: 17, backgroundColor: c.peach, borderRadius: 18, gap: 10 }}><Sparkles size={19} color={c.purple} /><Txt size={13} weight="bold" color={c.purple}>O próximo passo{ '\n' }cabe no seu dia.</Txt><Txt size={11} color={c.muted}>Pequenos passos.{ '\n' }Conquistas reais.</Txt></View><Txt size={10} color={c.muted}>FEITO PARA O SEU RITMO</Txt></View>}
    <View style={{ flex: 1, paddingTop: wide ? 0 : insets.top }}>
      <View style={{ height: wide ? 78 : 60, paddingHorizontal: wide ? 44 : 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: c.line }}><Txt size={12} color={c.muted}>{wide ? 'Sua jornada / ' : ''}<Txt size={12} weight="bold" color={c.purple}>{study ? 'Um passo de cada vez' : path === '/bestiary' ? 'Bestiário' : path === '/profile' ? 'Perfil' : path === '/map' ? 'Mapa' : 'Início'}</Txt></Txt><View style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}><View style={{ borderColor: c.line, borderWidth: 1, borderRadius: 30, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}><Txt size={10} weight="bold">JORNADA ENEM</Txt><ArrowUpRight size={10} color={c.muted} /></View><Link href="/profile"><View style={{ width: 33, height: 33, borderRadius: 17, backgroundColor: c.lavender, alignItems: 'center', justifyContent: 'center' }}><Txt size={12} weight="bold" color={c.purple}>{state.student?.name.slice(0, 1).toUpperCase() || 'M'}</Txt></View></Link></View></View>
      {(error || !online || syncError) && <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: 22, paddingVertical: 10, backgroundColor: c.peach, flexDirection: 'row', gap: 10 }}><CloudOff size={16} color={c.purple} /><Txt size={12} style={{ flex: 1 }}>{error ?? (!online ? 'Sem conexão. A batalha atual continua salva neste aparelho.' : 'Salvo neste aparelho. A sincronização precisa de atenção no Perfil.')}</Txt></View>}
      <View style={{ flex: 1 }}>{children}</View>
      {!wide && !study && <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 9), borderTopWidth: 1, borderColor: c.line, backgroundColor: '#FFFCF9' }}>{items}</View>}
      {!cloudConfigured && path === '/profile' && <View style={{ padding: 10 }}><Txt size={11} color={c.muted}>Modo local · o progresso fica neste aparelho até conectar a nuvem.</Txt></View>}
    </View>
  </View>;
}
