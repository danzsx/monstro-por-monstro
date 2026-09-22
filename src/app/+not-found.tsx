import { router } from 'expo-router';
import { Page, Heading, Txt, Button } from '@/ui/primitives';
export default function NotFound() { return <Page narrow><Heading>Esse caminho ainda não existe.</Heading><Txt>Seu próximo monstro está na tela inicial.</Txt><Button title="Voltar ao início" onPress={() => router.replace('/')} /></Page>; }
