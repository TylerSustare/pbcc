import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY, CHURCH_INFO } from '../config/constants';

const BACKGROUND_TASK_NAME = 'BACKGROUND_LIVE_CHECK';
const LAST_NOTIFICATION_KEY = 'lastNotificationTime';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('live-stream', {
        name: 'Service Reminders',
        description: 'Get notified when Sunday services and Bible study begin',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6b334b',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
          allowAnnouncements: false,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async checkLiveStreamAndNotify(): Promise<void> {
    const now = new Date();
    const currentTime = { hour: now.getHours(), minute: now.getMinutes() };
    const dayOfWeek = now.getDay(); // 0 = Sunday, 3 = Wednesday

    // Check if we're during service times
    const isServiceTime = this.isServiceTime(currentTime, dayOfWeek);
    if (!isServiceTime) {
      return;
    }

    // Check if we've already sent a notification recently (within 10 minutes)
    const lastNotificationTime = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
    if (lastNotificationTime) {
      const timeSinceLastNotification = Date.now() - parseInt(lastNotificationTime);
      if (timeSinceLastNotification < 10 * 60 * 1000) { // 10 minutes
        return;
      }
    }

    try {
      const isLive = await this.checkIfChannelIsLive();
      if (isLive) {
        await this.sendLiveNotification();
        await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error('Error checking live stream:', error);
    }
  }

  private static isServiceTime(currentTime: { hour: number; minute: number }, dayOfWeek: number): boolean {
    // Sunday services: 8:30, 10:30, 11:30
    if (dayOfWeek === 0) { // Sunday
      const serviceTimes = [
        { hour: 8, minute: 30 },
        { hour: 10, minute: 30 },
        { hour: 11, minute: 30 }
      ];

      return serviceTimes.some(serviceTime => {
        // Check if current time is within 30 minutes of service start
        const serviceMinutes = serviceTime.hour * 60 + serviceTime.minute;
        const currentMinutes = currentTime.hour * 60 + currentTime.minute;
        const timeDiff = currentMinutes - serviceMinutes;
        return timeDiff >= 0 && timeDiff <= 30; // 0 to 30 minutes after service start
      });
    }

    // Wednesday Bible Study: 7:00 PM
    if (dayOfWeek === 3) { // Wednesday
      const serviceMinutes = 19 * 60; // 7:00 PM
      const currentMinutes = currentTime.hour * 60 + currentTime.minute;
      const timeDiff = currentMinutes - serviceMinutes;
      return timeDiff >= 0 && timeDiff <= 30; // 0 to 30 minutes after 7 PM
    }

    return false;
  }

  private static async checkIfChannelIsLive(): Promise<boolean> {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      return data.items && data.items.length > 0;
    } catch (error) {
      console.error('YouTube API error:', error);
      return false;
    }
  }

  private static async sendLiveNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${CHURCH_INFO.shortName} is Live! 🔴`,
        body: 'Sunday service is streaming now! Tap to watch.',
        data: {
          type: 'live_stream',
          deepLink: 'pbcc://live'
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  }

  static async scheduleServiceTimeChecks(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return;
    }

    // Schedule checks during each service time
    const serviceTimes = [
      { hour: 8, minute: 30, day: 0 }, // Sunday 8:30 AM
      { hour: 10, minute: 30, day: 0 }, // Sunday 10:30 AM
      { hour: 11, minute: 30, day: 0 }, // Sunday 11:30 AM
      { hour: 19, minute: 0, day: 3 },  // Wednesday 7:00 PM
    ];

    for (const serviceTime of serviceTimes) {
      // Schedule a repeating notification check
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Checking for live stream...',
          body: 'This is a background check (you should not see this)',
          data: { type: 'background_check' },
        },
        trigger: {
          weekday: serviceTime.day + 1, // Expo uses 1-7 for Sunday-Saturday
          hour: serviceTime.hour,
          minute: serviceTime.minute,
          repeats: true,
        },
      });
    }
  }

  static async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Background task for checking live stream
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    await NotificationService.checkLiveStreamAndNotify();
    return { success: true };
  } catch (error) {
    console.error('Background task error:', error);
    return { success: false };
  }
});