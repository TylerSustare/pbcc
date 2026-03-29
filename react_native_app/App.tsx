import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as ExpoLinking from "expo-linking";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BRAND_COLORS, CHURCH_INFO } from "./src/config/constants";
import LiveScreen from "./src/screens/LiveScreen";
import { NotificationService } from "./src/services/NotificationService";
import { ScheduledNotifications } from "./src/services/ScheduledNotifications";

// Storage keys for notification dismissal tracking
const NOTIFICATION_DISMISSAL_KEY = "notificationDismissalTimestamp";
const NOTIFICATION_NEVER_ASK_KEY = "notificationNeverAskAgain";
const SERVICE_PREFERENCES_KEY = "serviceNotificationPreferences";

// Re-prompt after 2 weeks (14 days)
const REPROMPT_DELAY_MS = 14 * 24 * 60 * 60 * 1000;

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "live" | "give">(
    "home"
  );
  const [isLiveInLandscape, setIsLiveInLandscape] = useState(false);

  useEffect(() => {
    // Initialize notifications
    initializeNotifications();

    // Handle deep links
    const handleDeepLink = (url: string) => {
      if (url.includes("live")) {
        setCurrentView("live");
      } else if (url.includes("give")) {
        setCurrentView("give");
      }
    };

    // Handle initial URL if app was opened from notification
    ExpoLinking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = ExpoLinking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    // Listen for notification responses
    const notificationSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (
          data?.type === "live_stream" ||
          data?.type === "scheduled_service"
        ) {
          setCurrentView("live");
        }
      });

    return () => {
      subscription?.remove();
      notificationSubscription.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check if we already have permission
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      if (existingStatus !== "granted") {
        // Check if user has permanently declined or if enough time has passed
        const shouldAskForNotifications = await shouldPromptForNotifications();

        if (shouldAskForNotifications) {
          // Show custom explanation before requesting permissions
          Alert.alert(
            "Service Reminders",
            "Get notified when Sunday services and Bible study begin. You can disable these anytime in Settings.",
            [
              {
                text: "Not Now",
                style: "cancel",
                onPress: async () => {
                  // Save dismissal timestamp
                  await AsyncStorage.setItem(
                    NOTIFICATION_DISMISSAL_KEY,
                    Date.now().toString()
                  );
                },
              },
              {
                text: "Don't Ask Again",
                style: "destructive",
                onPress: async () => {
                  // Mark as never ask again
                  await AsyncStorage.setItem(NOTIFICATION_NEVER_ASK_KEY, "true");
                },
              },
              {
                text: "Enable Reminders",
                onPress: async () => {
                  const hasPermission =
                    await NotificationService.requestPermissions();
                  if (hasPermission) {
                    // Show service selection after getting permission
                    await showServiceSelectionPrompt();
                    // Clear any dismissal tracking since they accepted
                    await AsyncStorage.removeItem(NOTIFICATION_DISMISSAL_KEY);
                    await AsyncStorage.removeItem(NOTIFICATION_NEVER_ASK_KEY);
                  }
                },
              },
            ]
          );
        }
      } else {
        // Already have permission, just schedule notifications
        await ScheduledNotifications.scheduleServiceNotifications();
      }
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  };

  const shouldPromptForNotifications = async (): Promise<boolean> => {
    try {
      // Check if user has permanently declined
      const neverAskAgain = await AsyncStorage.getItem(NOTIFICATION_NEVER_ASK_KEY);
      if (neverAskAgain === "true") {
        return false;
      }

      // Check if enough time has passed since last dismissal
      const lastDismissalStr = await AsyncStorage.getItem(NOTIFICATION_DISMISSAL_KEY);
      if (lastDismissalStr) {
        const lastDismissal = parseInt(lastDismissalStr);
        const timeSinceDismissal = Date.now() - lastDismissal;

        // Only prompt again if 2 weeks have passed
        return timeSinceDismissal >= REPROMPT_DELAY_MS;
      }

      // First time, should prompt
      return true;
    } catch (error) {
      console.error("Error checking notification prompt status:", error);
      return true; // Default to prompting if there's an error
    }
  };

  const showServiceSelectionPrompt = async () => {
    Alert.alert(
      "Choose Your Reminders",
      "Which Sunday services would you like to be reminded about?",
      [
        {
          text: "All Sunday Services",
          onPress: async () => {
            const preferences = {
              earlyService: true,
              traditionalService: true,
              contemporaryService: true,
            };
            await saveServicePreferences(preferences);
            await ScheduledNotifications.scheduleServiceNotifications(preferences);
          },
        },
        {
          text: "Pick One Service",
          onPress: () => showIndividualServiceSelection(),
        },
      ]
    );
  };

  const showIndividualServiceSelection = () => {
    Alert.alert(
      "Pick Your Service",
      "Choose which Sunday service you'd like reminders for:",
      [
        {
          text: "Early Service (8:30 AM)",
          onPress: async () => {
            const preferences = {
              earlyService: true,
              traditionalService: false,
              contemporaryService: false,
            };
            await saveServicePreferences(preferences);
            await ScheduledNotifications.scheduleServiceNotifications(preferences);
          },
        },
        {
          text: "Traditional Service (10:30 AM)",
          onPress: async () => {
            const preferences = {
              earlyService: false,
              traditionalService: true,
              contemporaryService: false,
            };
            await saveServicePreferences(preferences);
            await ScheduledNotifications.scheduleServiceNotifications(preferences);
          },
        },
        {
          text: "Contemporary Service (11:30 AM)",
          onPress: async () => {
            const preferences = {
              earlyService: false,
              traditionalService: false,
              contemporaryService: true,
            };
            await saveServicePreferences(preferences);
            await ScheduledNotifications.scheduleServiceNotifications(preferences);
          },
        },
      ]
    );
  };

  const saveServicePreferences = async (preferences: {
    earlyService: boolean;
    traditionalService: boolean;
    contemporaryService: boolean;
  }) => {
    try {
      await AsyncStorage.setItem(SERVICE_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving service preferences:", error);
    }
  };

  // Helper function for testing - uncomment to reset notification prompts
  // const resetNotificationPrompts = async () => {
  //   await AsyncStorage.removeItem(NOTIFICATION_DISMISSAL_KEY);
  //   await AsyncStorage.removeItem(NOTIFICATION_NEVER_ASK_KEY);
  //   console.log("Notification prompts reset - app will prompt again on next launch");
  // };

  const callChurch = () => {
    Linking.openURL(`tel:${CHURCH_INFO.phone}`);
  };

  const emailChurch = () => {
    Linking.openURL(`mailto:${CHURCH_INFO.email}`);
  };

  const shareChurch = async () => {
    try {
      await Share.share({
        message: `Check out ${CHURCH_INFO.name}!\n\n${CHURCH_INFO.address}\n${CHURCH_INFO.phone}\n${CHURCH_INFO.website}`,
        title: CHURCH_INFO.name,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share");
    }
  };

  const showLiveStream = () => {
    setCurrentView("live");
  };

  const showWebsite = () => {
    setCurrentView("home");
  };

  const showGiving = () => {
    setCurrentView("give");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_COLORS.primary}
        />

        {/* Header with native actions */}
        {!isLiveInLandscape && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Powell Butte Church</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={callChurch}>
                <Text style={styles.headerButtonText}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={emailChurch}>
                <Text style={styles.headerButtonText}>✉️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={shareChurch}>
                <Text style={styles.headerButtonText}>📤</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main content */}
        {currentView === "home" ? (
          <WebView
            source={{ uri: CHURCH_INFO.website }}
            style={styles.webview}
            startInLoadingState={true}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : currentView === "live" ? (
          <LiveScreen onBack={showWebsite} onLandscapeChange={setIsLiveInLandscape} />
        ) : (
          <WebView
            source={{ uri: "https://pushpay.com/g/thenetministry?src=hpp" }}
            style={styles.webview}
            startInLoadingState={true}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}

        {/* Bottom navigation */}
        {!isLiveInLandscape && (
          <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentView === "home" && styles.activeNavButton,
            ]}
            onPress={showWebsite}
          >
            <Text
              style={[
                styles.navButtonText,
                currentView === "home" && styles.activeNavButtonText,
              ]}
            >
              🏠 Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentView === "live" && styles.activeNavButton,
            ]}
            onPress={showLiveStream}
          >
            <Text
              style={[
                styles.navButtonText,
                currentView === "live" && styles.activeNavButtonText,
              ]}
            >
              📺 Live
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentView === "give" && styles.activeNavButton,
            ]}
            onPress={showGiving}
          >
            <Text
              style={[
                styles.navButtonText,
                currentView === "give" && styles.activeNavButtonText,
              ]}
            >
              💝 Give
            </Text>
          </TouchableOpacity>
        </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  header: {
    backgroundColor: BRAND_COLORS.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    color: BRAND_COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 15,
    padding: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  webview: {
    flex: 1,
  },
  bottomNav: {
    backgroundColor: BRAND_COLORS.white,
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.border,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  navButtonText: {
    color: BRAND_COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  activeNavButton: {
    backgroundColor: BRAND_COLORS.primary,
  },
  activeNavButtonText: {
    color: BRAND_COLORS.white,
  },
});
