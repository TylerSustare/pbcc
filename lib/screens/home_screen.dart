import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../config/constants.dart';
import 'live_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late final WebViewController _homeController;
  late final WebViewController _giveController;

  @override
  void initState() {
    super.initState();
    _homeController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse(ChurchInfo.website));

    _giveController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse(ChurchInfo.givingUrl));
  }

  void _callChurch() async {
    final Uri url = Uri.parse('tel:${ChurchInfo.phone}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _emailChurch() async {
    final Uri url = Uri.parse('mailto:${ChurchInfo.email}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _shareChurch() {
    Share.share(
      'Check out ${ChurchInfo.name}!\n\n${ChurchInfo.address}\n${ChurchInfo.phone}\n${ChurchInfo.website}',
      subject: ChurchInfo.name,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Powell Butte Church",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: BrandColors.primary,
        actions: [
          IconButton(
            icon: const Text("📞", style: TextStyle(fontSize: 20)),
            onPressed: _callChurch,
          ),
          IconButton(
            icon: const Text("✉️", style: TextStyle(fontSize: 20)),
            onPressed: _emailChurch,
          ),
          IconButton(
            icon: const Text("📤", style: TextStyle(fontSize: 20)),
            onPressed: _shareChurch,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          WebViewWidget(controller: _homeController),
          LiveScreen(onBack: () => setState(() => _currentIndex = 0)),
          WebViewWidget(controller: _giveController),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: BrandColors.primary,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: "Home",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.tv),
            label: "Live",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: "Give",
          ),
        ],
      ),
    );
  }
}
