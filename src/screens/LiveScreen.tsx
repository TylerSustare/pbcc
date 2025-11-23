import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY, BRAND_COLORS, CHURCH_INFO } from '../config/constants';

interface LiveScreenProps {
  onBack: () => void;
  onLandscapeChange?: (isLandscape: boolean) => void;
}

const LiveScreen: React.FC<LiveScreenProps> = ({ onBack, onLandscapeChange }) => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    checkLiveStream();

    // Track dimension changes for responsive player
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
    };

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      subscription?.remove();
    };
  }, []);

  const checkLiveStream = async () => {
    if (!YOUTUBE_API_KEY) {
      console.log('[LiveScreen] No YouTube API key configured');
      setLoading(false);
      return;
    }

    try {
      console.log('[LiveScreen] Checking for live stream...');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      console.log('[LiveScreen] API Response:', JSON.stringify(data, null, 2));

      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        console.log('[LiveScreen] Live stream found! Video ID:', videoId);
        setIsLive(true);
        setLiveVideoId(videoId);
        setPlayerError(null);
      } else {
        console.log('[LiveScreen] No live stream found');
      }
    } catch (error) {
      console.error('[LiveScreen] Error checking live stream:', error);
    }

    setLoading(false);
  };

  const openYouTubeApp = () => {
    const url = liveVideoId
      ? `https://www.youtube.com/watch?v=${liveVideoId}`
      : `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}/live`;
    Linking.openURL(url);
  };

  const handleBack = () => {
    onBack();
  };

  const onPlayerReady = () => {
    console.log('[LiveScreen] YouTube player ready');
  };

  const onPlayerError = (error: string) => {
    console.error('[LiveScreen] YouTube Player Error:', error);
    setPlayerError(`Unable to load video: ${error}`);
  };

  const onPlaybackStateChange = (state: string) => {
    console.log('[LiveScreen] Playback state changed:', state);
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
    console.log('[LiveScreen] Rendering player - videoId:', liveVideoId);

    if (playerError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>🚫 Video Load Error</Text>
            <Text style={styles.errorMessage}>{playerError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setPlayerError(null);
                checkLiveStream();
              }}
            >
              <Text style={styles.retryText}>🔄 Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.openAppButton} onPress={openYouTubeApp}>
              <Text style={styles.openAppText}>📱 Open in YouTube App</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.playerContainer}>
        <YoutubePlayer
          height={dimensions.height}
          width={dimensions.width}
          videoId={liveVideoId}
          play={true}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            autoplay: 1,
            playsinline: 0,
            fs: 1,
          }}
          forceAndroidAutoplay={true}
          onReady={onPlayerReady}
          onError={onPlayerError}
          onChangeState={onPlaybackStateChange}
          webViewStyle={styles.player}
          webViewProps={{
            androidLayerType: 'hardware',
            allowsFullscreenVideo: true,
          }}
        />
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
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
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
  player: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: BRAND_COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: BRAND_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryText: {
    color: BRAND_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  openAppButton: {
    backgroundColor: '#FF0000',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  landscapeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  landscapeButtonText: {
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
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