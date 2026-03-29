import * as Notifications from 'expo-notifications';
import { CHURCH_INFO } from '../config/constants';

interface ServicePreferences {
  earlyService: boolean;
  traditionalService: boolean;
  contemporaryService: boolean;
}

export class ScheduledNotifications {
  static async scheduleServiceNotifications(preferences?: ServicePreferences): Promise<void> {
    // Cancel any existing scheduled notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // If no preferences provided, schedule all Sunday services (backward compatibility)
    if (!preferences) {
      await this.scheduleSundayNotifications();
    } else {
      // Schedule based on user preferences
      await this.scheduleSelectedServices(preferences);
    }

    console.log('Service notifications scheduled successfully');
  }

  private static async scheduleSelectedServices(preferences: ServicePreferences): Promise<void> {
    const services = [
      {
        enabled: preferences.earlyService,
        hour: 8, minute: 30, name: 'Early Service'
      },
      {
        enabled: preferences.traditionalService,
        hour: 10, minute: 30, name: 'Traditional Service'
      },
      {
        enabled: preferences.contemporaryService,
        hour: 11, minute: 30, name: 'Contemporary Service'
      }
    ];

    for (const service of services) {
      if (service.enabled) {
        // Calculate next Sunday occurrence
        const nextOccurrence = this.getNextWeekdayOccurrence(0, service.hour, service.minute);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔴 ${service.name} Starting Now!`,
            body: `${CHURCH_INFO.shortName} is live. Tap to watch the service.`,
            data: {
              type: 'scheduled_service',
              deepLink: 'pbcc://live',
              serviceName: service.name
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: nextOccurrence,
            repeats: true,
            type: Notifications.SchedulableTriggerInputTypes.DATE,
          },
        });

        console.log(`Scheduled ${service.name} notification for ${nextOccurrence.toLocaleString()}`);
      }
    }
  }

  private static async scheduleSundayNotifications(): Promise<void> {
    const sundayServices = [
      { hour: 8, minute: 30, name: 'Early Service' },
      { hour: 10, minute: 30, name: 'Traditional Service' },
      { hour: 11, minute: 30, name: 'Contemporary Service' }
    ];

    for (const service of sundayServices) {
      // Calculate next Sunday occurrence
      const nextSunday = this.getNextWeekdayOccurrence(0, service.hour, service.minute); // 0 = Sunday

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔴 ${service.name} Starting Now!`,
          body: `${CHURCH_INFO.shortName} is live. Tap to watch the service.`,
          data: {
            type: 'scheduled_service',
            deepLink: 'pbcc://live',
            serviceName: service.name
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: nextSunday,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      });

      console.log(`Scheduled ${service.name} notification for ${nextSunday.toLocaleString()}`);
    }
  }


  static async cancelAllServiceNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All service notifications cancelled');
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Helper function to calculate next occurrence of a specific weekday and time
  private static getNextWeekdayOccurrence(weekday: number, hour: number, minute: number): Date {
    const now = new Date();
    const nextDate = new Date();

    // Set the time
    nextDate.setHours(hour, minute, 0, 0);

    // Calculate days until next occurrence
    const currentDay = now.getDay();
    let daysUntilTarget = weekday - currentDay;

    // If the target day is today but the time has passed, schedule for next week
    if (daysUntilTarget === 0 && now >= nextDate) {
      daysUntilTarget = 7;
    }

    // If target day is in the past this week, schedule for next week
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7;
    }

    // Set the date
    nextDate.setDate(now.getDate() + daysUntilTarget);

    return nextDate;
  }

  // For testing - schedule a notification 10 seconds from now
  static async scheduleTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔴 Test Service Live!',
        body: `${CHURCH_INFO.shortName} test notification. Tap to watch.`,
        data: {
          type: 'test_notification',
          deepLink: 'pbcc://live'
        },
        sound: true,
      },
      trigger: {
        seconds: 10,
      },
    });

    console.log('Test notification scheduled for 10 seconds from now');
  }
}