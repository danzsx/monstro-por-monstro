import * as Notifications from 'expo-notifications';
import { TOPICS } from '@/content/catalog';
import { emptyMasteries } from './engine';
import { cancelReviewNotifications, scheduleSpacedReviewNotifications } from './notifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

test('sem adesão explícita não consulta permissão nem agenda revisão', async () => {
  await scheduleSpacedReviewNotifications(emptyMasteries(), TOPICS);
  expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('desativar cancela agendamentos de revisão no aparelho', async () => {
  await cancelReviewNotifications();
  expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
});
