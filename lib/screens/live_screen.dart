import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../config/constants.dart';
import '../services/youtube_service.dart';

class LiveScreen extends StatefulWidget {
  final VoidCallback onBack;

  const LiveScreen({super.key, required this.onBack});

  @override
  State<LiveScreen> createState() => _LiveScreenState();
}

class _LiveScreenState extends State<LiveScreen> {
  String? _videoId;
  bool _isLoading = true;
  bool _isLive = false;
  YoutubePlayerController? _controller;

  @override
  void initState() {
    super.initState();
    _checkLiveStream();
  }

  Future<void> _checkLiveStream() async {
    setState(() {
      _isLoading = true;
    });

    final videoId = await YoutubeService.checkLiveStream();

    if (videoId != null) {
      _videoId = videoId;
      _isLive = true;
      _controller = YoutubePlayerController(
        initialVideoId: videoId,
        flags: const YoutubePlayerFlags(
          autoPlay: true,
          mute: false,
          isLive: true,
        ),
      );
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: BrandColors.primary),
              SizedBox(height: 16),
              Text("Checking for live stream..."),
            ],
          ),
        ),
      );
    }

    if (_isLive && _videoId != null && _controller != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: YoutubePlayer(
            controller: _controller!,
            showVideoProgressIndicator: true,
            progressIndicatorColor: BrandColors.primary,
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: BrandColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(30.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "We're not currently live",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: BrandColors.primary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              const Text(
                "Check back during our service times:",
                style: TextStyle(fontSize: 18, color: BrandColors.text),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: BrandColors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      offset: const Offset(0, 2),
                      blurRadius: 4,
                    ),
                  ],
                ),
                child: Column(
                  children: ChurchInfo.serviceTimes
                      .map((time) => Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Text(
                              time,
                              style: const TextStyle(
                                  fontSize: 16, color: BrandColors.textLight),
                              textAlign: TextAlign.center,
                            ),
                          ))
                      .toList(),
                ),
              ),
              const SizedBox(height: 30),
              ElevatedButton(
                onPressed: () {
                  // TODO: Open YouTube channel in browser/app
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: BrandColors.primary,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  "Visit Our YouTube Channel",
                  style: TextStyle(
                    color: BrandColors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
