import { Stack } from 'expo-router/stack';
import { useFonts, Nunito_900Black } from '@expo-google-fonts/nunito';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { AppProvider } from '@/data/provider';
import { Shell } from '@/ui/shell';
export { ErrorBoundary } from 'expo-router';
export default function Layout() {
  const [loaded, error] = useFonts({ Nunito_900Black, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: '#FCF8F4', justifyContent: 'center' }}><ActivityIndicator color="#1E0C59" /></View>;
  return <SafeAreaProvider><AppProvider><StatusBar style="dark" /><Shell><Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#FCF8F4' } }}><Stack.Screen name="index" options={{ title: 'Seu próximo monstro' }} /><Stack.Screen name="onboarding" options={{ title: 'Seu ponto de partida' }} /><Stack.Screen name="diagnostic" options={{ title: 'Diagnóstico inicial' }} /><Stack.Screen name="battle" options={{ title: 'Sua batalha' }} /><Stack.Screen name="bestiary" options={{ title: 'Meu bestiário' }} /><Stack.Screen name="profile" options={{ title: 'Meu perfil' }} /></Stack></Shell></AppProvider></SafeAreaProvider>;
}
