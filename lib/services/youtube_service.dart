import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import 'package:logger/logger.dart';

class YoutubeService {
  static final Logger _logger = Logger();

  static Future<String?> checkLiveStream() async {
    if (youtubeApiKey.isEmpty) {
      _logger.w('YouTube API key is empty');
      return null;
    }

    try {
      final response = await http.get(
        Uri.parse(
          'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=$youtubeChannelId&eventType=live&type=video&key=$youtubeApiKey',
        ),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final items = data['items'] as List;
        if (items.isNotEmpty) {
          final videoId = items[0]['id']['videoId'];
          _logger.i('Live stream found! Video ID: $videoId');
          return videoId;
        }
      } else {
        _logger.e('YouTube API error: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      _logger.e('Error checking live stream: $e');
    }

    return null;
  }
}
