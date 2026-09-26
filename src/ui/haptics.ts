import * as Haptics from 'expo-haptics';

export const haptic = {
  selection: () => {
    if (process.env.EXPO_OS !== 'web') {
      void Haptics.selectionAsync().catch(() => {});
    }
  },
  impactLight: () => {
    if (process.env.EXPO_OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  },
  impactMedium: () => {
    if (process.env.EXPO_OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  },
  success: () => {
    if (process.env.EXPO_OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  },
  warning: () => {
    if (process.env.EXPO_OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  },
};
