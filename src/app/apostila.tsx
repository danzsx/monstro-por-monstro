import { useLocalSearchParams } from 'expo-router';
import { ApostilaScreen } from '@/apostila/reader';

export default function ApostilaRoute() {
  const { topicId, from, mapNode } = useLocalSearchParams<{ topicId?: string; from?: string; mapNode?: string }>();
  return <ApostilaScreen topicId={topicId ?? ''} from={from} mapNode={mapNode} />;
}
