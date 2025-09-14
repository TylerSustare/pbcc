import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY, BRAND_COLORS, CHURCH_INFO } from '../config/constants';

interface LiveScreenProps {
  onBack: () => void;
}

const LiveScreen: React.FC<LiveScreenProps> = ({ onBack }) => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    checkLiveStream();
  }, []);

  const checkLiveStream = async () => {
    if (!YOUTUBE_API_KEY) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setIsLive(true);
        setLiveVideoId(data.items[0].id.videoId);
      }
    } catch (error) {
      console.error('Error checking live stream:', error);
    }

    setLoading(false);
  };

  const openYouTubeApp = () => {
    const url = liveVideoId
      ? `https://www.youtube.com/watch?v=${liveVideoId}`
      : `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}/live`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
          <Text style={styles.loadingText}>Checking for live stream...</Text>
        </View>
      </View>
    );
  }

  if (isLive && liveVideoId) {
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${liveVideoId}?autoplay=1` }}
          style={styles.webview}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
        />
        <TouchableOpacity style={styles.openAppButton} onPress={openYouTubeApp}>
          <Text style={styles.openAppText}>Open in YouTube App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.notLiveContainer}>
        <Text style={styles.notLiveTitle}>We're not currently live</Text>
        <Text style={styles.notLiveMessage}>
          Check back during our service times:
        </Text>

        <View style={styles.serviceTimesContainer}>
          {CHURCH_INFO.serviceTimes.map((time, index) => (
            <Text key={index} style={styles.serviceTime}>
              {time}
            </Text>
          ))}
        </View>

        <TouchableOpacity style={styles.channelButton} onPress={openYouTubeApp}>
          <Text style={styles.channelButtonText}>Visit Our YouTube Channel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: BRAND_COLORS.textLight,
  },
  webview: {
    flex: 1,
  },
  openAppButton: {
    backgroundColor: '#FF0000',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  openAppText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notLiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  notLiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  notLiveMessage: {
    fontSize: 18,
    color: BRAND_COLORS.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  serviceTimesContainer: {
    backgroundColor: BRAND_COLORS.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTime: {
    fontSize: 16,
    color: BRAND_COLORS.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  channelButton: {
    backgroundColor: BRAND_COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  channelButtonText: {
    color: BRAND_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LiveScreen;