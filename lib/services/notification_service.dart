import 'dart:convert';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static const String _notificationDismissalKey = "notificationDismissalTimestamp";
  static const String _notificationNeverAskKey = "notificationNeverAskAgain";
  static const String _servicePreferencesKey = "serviceNotificationPreferences";
  static const int _repromptDelayMs = 14 * 24 * 60 * 60 * 1000;

  static Future<void> initialize() async {
    tz.initializeTimeZones();

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _notificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        // Handle notification tap
      },
    );
  }

  static Future<bool> requestPermissions() async {
    final bool? result = await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );

    if (result == true) {
      return true;
    }

    // Android 13+ permission request
    final bool? androidResult = await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    return androidResult == true;
  }

  static Future<bool> shouldPromptForNotifications() async {
    final prefs = await SharedPreferences.getInstance();

    final neverAskAgain = prefs.getBool(_notificationNeverAskKey) ?? false;
    if (neverAskAgain) return false;

    final lastDismissal = prefs.getInt(_notificationDismissalKey);
    if (lastDismissal != null) {
      final timeSinceDismissal =
          DateTime.now().millisecondsSinceEpoch - lastDismissal;
      return timeSinceDismissal >= _repromptDelayMs;
    }

    return true;
  }

  static Future<void> saveDismissal() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(
        _notificationDismissalKey, DateTime.now().millisecondsSinceEpoch);
  }

  static Future<void> saveNeverAskAgain() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_notificationNeverAskKey, true);
  }

  static Future<void> saveServicePreferences(
      Map<String, bool> preferences) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_servicePreferencesKey, json.encode(preferences));
  }

  static Future<Map<String, bool>> getServicePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final String? prefsStr = prefs.getString(_servicePreferencesKey);
    if (prefsStr != null) {
      return Map<String, bool>.from(json.decode(prefsStr));
    }
    return {
      "earlyService": true,
      "traditionalService": true,
      "contemporaryService": true,
    };
  }

  static Future<void> scheduleServiceNotifications(
      [Map<String, bool>? preferences]) async {
    final Map<String, bool> prefs = preferences ?? await getServicePreferences();
    await _notificationsPlugin.cancelAll();

    final List<Map<String, dynamic>> services = [
      {
        "enabled": prefs["earlyService"] ?? true,
        "hour": 8,
        "minute": 30,
        "name": "Early Service",
      },
      {
        "enabled": prefs["traditionalService"] ?? true,
        "hour": 10,
        "minute": 30,
        "name": "Traditional Service",
      },
      {
        "enabled": prefs["contemporaryService"] ?? true,
        "hour": 11,
        "minute": 30,
        "name": "Contemporary Service",
      },
    ];

    for (int i = 0; i < services.length; i++) {
      final service = services[i];
      if (service["enabled"]) {
        final scheduledDate = _nextInstanceOfSunday(service["hour"], service["minute"]);

        await _notificationsPlugin.zonedSchedule(
          i,
          "🔴 ${service["name"]} Starting Now!",
          "${ChurchInfo.shortName} is live. Tap to watch the service.",
          scheduledDate,
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'service_reminders',
              'Service Reminders',
              channelDescription: 'Get notified when Sunday services begin',
              importance: Importance.high,
              priority: Priority.high,
            ),
            iOS: DarwinNotificationDetails(),
          ),
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime,
          matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime,
          payload: 'live',
        );
      }
    }
  }

  static tz.TZDateTime _nextInstanceOfSunday(int hour, int minute) {
    tz.TZDateTime scheduledDate = _nextInstanceOfTime(hour, minute);
    while (scheduledDate.weekday != DateTime.sunday) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }

  static tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate =
        tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}
