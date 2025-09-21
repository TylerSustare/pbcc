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
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY, BRAND_COLORS, CHURCH_INFO } from '../config/constants';

interface LiveScreenProps {
  onBack: () => void;
  onLandscapeChange?: (isLandscape: boolean) => void;
}

const LiveScreen: React.FC<LiveScreenProps> = ({ onBack, onLandscapeChange }) => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  const getYouTubeHTML = (videoId: string) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #000;
            overflow: hidden;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&modestbranding=1&rel=0"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
          allowfullscreen>
        </iframe>
      </body>
    </html>
    `;
  };

  useEffect(() => {
    checkLiveStream();

    // Track orientation changes
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      const landscape = width > height;
      setIsLandscape(landscape);
      onLandscapeChange?.(landscape && isLive && liveVideoId && !webViewError);
    };

    // Initial check
    updateLayout();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // Set landscape orientation when live video is playing
    if (isLive && liveVideoId && !webViewError) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }

    // Notify parent about landscape state
    onLandscapeChange?.(isLandscape && isLive && liveVideoId && !webViewError);

    // Cleanup function to reset orientation when component unmounts or live ends
    return () => {
      ScreenOrientation.unlockAsync();
      onLandscapeChange?.(false);
    };
  }, [isLive, liveVideoId, webViewError, isLandscape]);

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
        const videoId = data.items[0].id.videoId;
        setIsLive(true);
        setLiveVideoId(videoId);
        // Reset retry attempts for new video
        setRetryAttempts(0);
        setWebViewError(null);
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

  const handleBack = () => {
    ScreenOrientation.unlockAsync();
    onBack();
  };

  const retryConnection = async (errorMessage: string) => {
    const maxRetries = 3;
    const retryDelays = [500, 1000, 2000]; // milliseconds

    if (retryAttempts < maxRetries) {
      setIsRetrying(true);
      const delay = retryDelays[retryAttempts];

      console.log(`Retry attempt ${retryAttempts + 1}/${maxRetries} after ${delay}ms`);

      setTimeout(() => {
        setRetryAttempts(prev => prev + 1);
        setWebViewError(null);
        setIsRetrying(false);
        // Force WebView to reload by changing key
        setWebViewKey(prev => prev + 1);
      }, delay);
    } else {
      // After 3 failed attempts, show the error
      setWebViewError(errorMessage);
      setIsRetrying(false);
    }
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
    if (webViewError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>🚫 Video Load Error</Text>
            <Text style={styles.errorMessage}>{webViewError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setWebViewError(null);
                setRetryAttempts(0);
                setWebViewKey(prev => prev + 1);
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
      <View style={styles.container}>
        <WebView
          key={webViewKey}
          source={{ html: getYouTubeHTML(liveVideoId) }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          mixedContentMode="always"
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
              <Text style={styles.loadingText}>
                {isRetrying ? `Retrying connection... (${retryAttempts}/3)` : 'Loading live stream...'}
              </Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            const errorMessage = `WebView Error: ${nativeEvent.description || 'Unknown error'} (Code: ${nativeEvent.code || 'N/A'})`;
            retryConnection(errorMessage);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
            const errorMessage = `HTTP Error: ${nativeEvent.statusCode} - ${nativeEvent.description || 'Network error'}`;
            retryConnection(errorMessage);
          }}
          onLoadEnd={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (!nativeEvent.loading && nativeEvent.url.includes('error')) {
              const errorMessage = `Page Load Error: Unable to load video content`;
              retryConnection(errorMessage);
            }
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