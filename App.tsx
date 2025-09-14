import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { BRAND_COLORS, CHURCH_INFO } from './src/config/constants';
import LiveScreen from './src/screens/LiveScreen';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'live'>('home');

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
      Alert.alert('Error', 'Unable to share');
    }
  };

  const showLiveStream = () => {
    setCurrentView('live');
  };

  const showWebsite = () => {
    setCurrentView('home');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_COLORS.primary} />

        {/* Header with native actions */}
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

        {/* Main content */}
        {currentView === 'home' ? (
          <WebView
            source={{ uri: CHURCH_INFO.website }}
            style={styles.webview}
            startInLoadingState={true}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : (
          <LiveScreen onBack={showWebsite} />
        )}

        {/* Bottom navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navButton, currentView === 'home' && styles.activeNavButton]}
            onPress={showWebsite}
          >
            <Text style={[styles.navButtonText, currentView === 'home' && styles.activeNavButtonText]}>
              🏠 Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, currentView === 'live' && styles.activeNavButton]}
            onPress={showLiveStream}
          >
            <Text style={[styles.navButtonText, currentView === 'live' && styles.activeNavButtonText]}>
              📺 Live
            </Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: {
    color: BRAND_COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.border,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  navButtonText: {
    color: BRAND_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeNavButton: {
    backgroundColor: BRAND_COLORS.primary,
  },
  activeNavButtonText: {
    color: BRAND_COLORS.white,
  },
});
