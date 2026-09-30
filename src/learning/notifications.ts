import * as Notifications from 'expo-notifications';
import { Masteries, Topic } from './types';
import { usableQuestions } from './recommendation';

if (process.env.EXPO_OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (process.env.EXPO_OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

export async function cancelReviewNotifications() {
  if (process.env.EXPO_OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleSpacedReviewNotifications(masteries: Masteries, topics: Topic[], enabled = false) {
  if (!enabled || process.env.EXPO_OS === 'web') return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    const candidates = Object.values(masteries)
      .filter(m => m.nextReviewAt && Date.parse(m.nextReviewAt) > now
        && topics.some(topic => topic.id === m.topicId && usableQuestions(topic, 'review').length > 0))
      .sort((a, b) => Date.parse(a.nextReviewAt!) - Date.parse(b.nextReviewAt!));

    const next = candidates[0];
    if (!next || !next.nextReviewAt) return;

    const topic = topics.find(t => t.id === next.topicId);
    if (!topic) return;

    const reviewDate = new Date(next.nextReviewAt);
    const seconds = Math.max(10, Math.floor((reviewDate.getTime() - now) / 1000));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Hora de reencontrar ${topic.name}`,
        body: 'Quando houver tempo, uma revisão pode ajudar você a retomar o conteúdo.',
        data: { topicId: topic.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
  } catch {}
}
