import { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextProps, View, ViewStyle, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight, Check } from 'lucide-react-native';
import { TopicId } from '@/learning/types';
import { colors as c, fonts } from './theme';
export function Txt({ children, size = 15, color = c.ink, weight = 'body', style, ...rest }: TextProps & { size?: number; color?: string; weight?: keyof typeof fonts }) {
  return <Text selectable {...rest} style={[{ fontFamily: fonts[weight], fontSize: size, lineHeight: size * 1.48, color }, style]}>{children}</Text>;
}
export function Heading({ children, size = 32 }: PropsWithChildren<{ size?: number }>) { return <Txt weight="heading" size={size} color={c.purple} style={{ lineHeight: size * 1.12, letterSpacing: -.8 }} accessibilityRole="header">{children}</Txt>; }
export function Eyebrow({ children, color = c.muted }: PropsWithChildren<{ color?: string }>) { return <Txt size={11} weight="bold" color={color} style={{ letterSpacing: 2 }}>{children}</Txt>; }
export function Button({ title, onPress, variant = 'primary', disabled, busy, icon, testID }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; busy?: boolean; icon?: ReactNode; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled || !!busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed, hovered }) => ({ minHeight: 52, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: variant === 'primary' ? c.green : variant === 'secondary' ? c.lavender : 'transparent', opacity: disabled || busy ? .5 : pressed ? .75 : 1, borderWidth: 1, borderColor: hovered ? c.purple : variant === 'secondary' ? c.line : 'transparent' })}>
    {busy ? <ActivityIndicator color={c.purple} /> : <><Txt weight="bold" color={c.purple}>{title}</Txt>{icon ?? (variant === 'primary' ? <ArrowRight size={18} color={c.purple} /> : null)}</>}
  </Pressable>;
}
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) { return <View style={[{ borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, padding: 24, gap: 14 }, style]}>{children}</View>; }
export function Pill({ children, green = false }: PropsWithChildren<{ green?: boolean }>) { return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 30, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: green ? c.softGreen : c.lavender }}><Txt size={11} weight="bold" color={green ? c.greenDark : c.purple}>{children}</Txt></View>; }
const monsters: Record<string, any> = {
  proportions: require('../../assets/monsters/proportions.png'),
  'rule-of-three': require('../../assets/monsters/rule-of-three.png'),
  cytology: require('../../assets/monsters/cytology.png'),
  genetics: require('../../assets/monsters/genetics.png'),
};
export function Monster({ id, size = 260, muted = false }: { id: TopicId; size?: number; muted?: boolean }) {
  const source = monsters[id] ?? monsters.proportions;
  return <Image source={source} contentFit="contain" accessibilityLabel={`Monstro ${id}`} style={{ width: size, height: size, opacity: muted ? .32 : 1 }} />;
}
export function Page({ children, narrow = false }: PropsWithChildren<{ narrow?: boolean }>) {
  const { width } = useWindowDimensions();
  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: width < 700 ? 22 : 44, paddingBottom: 36, flexGrow: 1 }} style={{ backgroundColor: c.background }}><View style={{ width: '100%', maxWidth: narrow ? 760 : 1160, alignSelf: 'center', gap: 28 }}>{children}</View></ScrollView>;
}
export function Progress({ value, label }: { value: number; label: string }) { return <View style={{ gap: 8 }} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}><View style={{ height: 7, backgroundColor: c.lavender, borderRadius: 20, overflow: 'hidden' }}><View style={{ height: 7, width: `${Math.min(100, Math.max(0, value * 100))}%`, backgroundColor: c.green, borderRadius: 20 }} /></View></View>; }
export function Choice({ text, selected, onPress, disabled, index }: { text: string; selected: boolean; onPress: () => void; disabled?: boolean; index?: number }) {
  return <Pressable accessibilityRole="radio" accessibilityLabel={text} accessibilityState={{ checked: selected, disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ hovered, pressed }) => ({ padding: 17, minHeight: 56, flexDirection: 'row', gap: 14, alignItems: 'center', borderWidth: 1.5, borderColor: selected || hovered ? c.purple : c.line, backgroundColor: selected ? c.lavender : c.surface, borderRadius: 16, opacity: pressed ? .7 : 1 })}>
    <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: selected ? c.purple : c.background, alignItems: 'center', justifyContent: 'center' }}>{selected ? <Check size={16} color="white" /> : <Txt size={12} weight="bold">{index !== undefined ? String.fromCharCode(65 + index) : '○'}</Txt>}</View><Txt style={{ flex: 1 }} weight={selected ? 'bold' : 'body'}>{text}</Txt>
  </Pressable>;
}
