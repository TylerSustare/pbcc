import 'package:flutter/material.dart';
import 'package:app_links/app_links.dart';
import 'screens/home_screen.dart';
import 'services/notification_service.dart';
import 'config/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.initialize();
  runApp(const PbccApp());
}

class PbccApp extends StatelessWidget {
  const PbccApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: ChurchInfo.name,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: BrandColors.primary,
        colorScheme: ColorScheme.fromSeed(
          seedColor: BrandColors.primary,
          primary: BrandColors.primary,
          secondary: BrandColors.accent1,
          surface: BrandColors.background,
        ),
        scaffoldBackgroundColor: BrandColors.background,
        useMaterial3: true,
      ),
      home: const NotificationWrapper(child: HomeScreen()),
    );
  }
}

class NotificationWrapper extends StatefulWidget {
  final Widget child;

  const NotificationWrapper({super.key, required this.child});

  @override
  State<NotificationWrapper> createState() => _NotificationWrapperState();
}

class _NotificationWrapperState extends State<NotificationWrapper> {
  final _appLinks = AppLinks();

  @override
  void initState() {
    super.initState();
    _initializeNotifications();
    _initDeepLinks();
  }

  void _initDeepLinks() {
    _appLinks.uriLinkStream.listen((uri) {
      debugPrint('On Link: $uri');
      // TODO: Handle deep links
    });
  }

  Future<void> _initializeNotifications() async {
    final shouldPrompt = await NotificationService.shouldPromptForNotifications();
    if (shouldPrompt) {
      if (!mounted) return;
      _showNotificationPrompt();
    } else {
      await NotificationService.scheduleServiceNotifications();
    }
  }

  void _showNotificationPrompt() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Service Reminders"),
        content: const Text(
          "Get notified when Sunday services and Bible study begin. You can disable these anytime in Settings.",
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final navigator = Navigator.of(context);
              await NotificationService.saveDismissal();
              if (mounted) navigator.pop();
            },
            child: const Text("Not Now"),
          ),
          TextButton(
            onPressed: () async {
              final navigator = Navigator.of(context);
              await NotificationService.saveNeverAskAgain();
              if (mounted) navigator.pop();
            },
            child: const Text(
              "Don't Ask Again",
              style: TextStyle(color: Colors.red),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(context).pop();
              final granted = await NotificationService.requestPermissions();
              if (granted && mounted) {
                _showServiceSelectionPrompt();
              }
            },
            child: const Text("Enable Reminders"),
          ),
        ],
      ),
    );
  }

  void _showServiceSelectionPrompt() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text("Choose Your Reminders"),
        children: [
          SimpleDialogOption(
            onPressed: () async {
              Navigator.of(context).pop();
              final prefs = {
                "earlyService": true,
                "traditionalService": true,
                "contemporaryService": true,
              };
              await NotificationService.saveServicePreferences(prefs);
              await NotificationService.scheduleServiceNotifications(prefs);
            },
            child: const Text("All Sunday Services"),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.of(context).pop();
              _showIndividualServiceSelection();
            },
            child: const Text("Pick One Service"),
          ),
        ],
      ),
    );
  }

  void _showIndividualServiceSelection() {
    showDialog(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text("Pick Your Service"),
        children: [
          SimpleDialogOption(
            onPressed: () async {
              Navigator.of(context).pop();
              final prefs = {
                "earlyService": true,
                "traditionalService": false,
                "contemporaryService": false,
              };
              await NotificationService.saveServicePreferences(prefs);
              await NotificationService.scheduleServiceNotifications(prefs);
            },
            child: const Text("Early Service (8:30 AM)"),
          ),
          SimpleDialogOption(
            onPressed: () async {
              Navigator.of(context).pop();
              final prefs = {
                "earlyService": false,
                "traditionalService": true,
                "contemporaryService": false,
              };
              await NotificationService.saveServicePreferences(prefs);
              await NotificationService.scheduleServiceNotifications(prefs);
            },
            child: const Text("Traditional Service (10:30 AM)"),
          ),
          SimpleDialogOption(
            onPressed: () async {
              Navigator.of(context).pop();
              final prefs = {
                "earlyService": false,
                "traditionalService": false,
                "contemporaryService": true,
              };
              await NotificationService.saveServicePreferences(prefs);
              await NotificationService.scheduleServiceNotifications(prefs);
            },
            child: const Text("Contemporary Service (11:30 AM)"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
