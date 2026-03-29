import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import {
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_API_KEY,
  CHURCH_INFO,
} from "../config/constants";

const MONITOR_INTERVAL = 2 * 60 * 1000; // Check every 2 minutes
const LAST_CHECK_KEY = "lastLiveCheck";
const LAST_NOTIFICATION_KEY = "lastLiveNotification";

export class LiveStreamMonitor {
  private static interval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;

  static async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log("Starting live stream monitoring...");

    // Initial check
    await this.checkAndNotify();

    // Set up interval for regular checks
    this.interval = setInterval(async () => {
      await this.checkAndNotify();
    }, MONITOR_INTERVAL);

    // Monitor app state changes
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  static stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isMonitoring = false;
    console.log("Stopped live stream monitoring");
  }

  private static handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active" && !this.isMonitoring) {
      // Resume monitoring when app becomes active
      this.startMonitoring();
    } else if (nextAppState === "background") {
      // Continue monitoring in background for a while
      // iOS will eventually suspend, but Android can continue
    }
  };

  private static async checkAndNotify(): Promise<void> {
    try {
      const now = new Date();

      // Only check during service times
      if (!this.isServiceTime(now)) {
        return;
      }

      // Check if we've already notified recently
      const lastNotification = await AsyncStorage.getItem(
        LAST_NOTIFICATION_KEY
      );
      if (lastNotification) {
        const timeSinceNotification = Date.now() - parseInt(lastNotification);
        if (timeSinceNotification < 15 * 60 * 1000) {
          // Don't notify again within 15 minutes
          return;
        }
      }

      const isLive = await this.checkYouTubeAPI();

      if (isLive) {
        await this.sendLiveNotification();
        await AsyncStorage.setItem(
          LAST_NOTIFICATION_KEY,
          Date.now().toString()
        );
        console.log("Live stream detected and notification sent!");
      }

      await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error in live stream check:", error);
    }
  }

  private static isServiceTime(date: Date): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Only Sunday services are live streamed: 8:30 AM, 10:30 AM, 11:30 AM
    if (dayOfWeek === 0) {
      const serviceTimes = [
        { hour: 8, minute: 30 },
        { hour: 10, minute: 30 },
        { hour: 11, minute: 30 },
      ];

      return serviceTimes.some((serviceTime) => {
        // Check if we're within service window (15 minutes before to 45 minutes after)
        const serviceStart = serviceTime.hour * 60 + serviceTime.minute - 15; // 15 min before
        const serviceEnd = serviceTime.hour * 60 + serviceTime.minute + 45; // 45 min after
        const currentTime = hour * 60 + minute;

        return currentTime >= serviceStart && currentTime <= serviceEnd;
      });
    }

    // Bible study is in-person only, no live stream
    return false;
  }

  private static async checkYouTubeAPI(): Promise<boolean> {
    if (!YOUTUBE_API_KEY) {
      console.log("YouTube API key not configured");
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`,
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `YouTube API responded with status: ${response.status}`
        );
      }

      const data = await response.json();
      return data.items && data.items.length > 0;
    } catch (error) {
      console.error("YouTube API error:", error);
      return false;
    }
  }

  private static async sendLiveNotification(): Promise<void> {
    try {
      const notificationContent = {
        title: `📺 ${CHURCH_INFO.shortName} Live Stream`,
        body: "Service is streaming now! Tap to watch.",
        data: {
          type: "live_stream",
          deepLink: "pbcc://live",
          timestamp: Date.now(),
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: "live_stream",
      };

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Send immediately
      });

      console.log("Live notification sent successfully");
    } catch (error) {
      console.error("Failed to send live notification:", error);
    }
  }

  // Manual trigger for testing
  static async testNotification(): Promise<void> {
    await this.sendLiveNotification();
  }

  // Get monitoring status
  static getStatus(): { isMonitoring: boolean; lastCheck?: number } {
    return {
      isMonitoring: this.isMonitoring,
    };
  }
}
