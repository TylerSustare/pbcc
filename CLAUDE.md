# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native church mobile app for Powell Butte Christian Church built with Expo and TypeScript. The app uses a hybrid WebView approach - displaying the church's existing GoDaddy website (<https://powellbuttechurch.com>) with native mobile features layered on top for App Store compliance.

**Key Design Philosophy**: Low-effort, quick development by reusing existing web content rather than rebuilding from scratch. Uses minimal native features to pass App Store review while maintaining the church's existing web presence.

## Development Commands

### Core Development

```bash
# Start Expo development server (use pnpm, not npm)
pnpm start

# Run on specific platforms
pnpm run ios
pnpm run android
pnpm run web
```

### EAS Build & Deploy

```bash
# Install dependencies
pnpm install

# Configure EAS builds (creates eas.json)
pnpm run build:configure

# Build for specific platforms
pnpm run build:ios          # iOS production build
pnpm run build:android      # Android production build
pnpm run build:all          # Both platforms
pnpm run build:dev          # Development build (for direct sharing)

# Submit to app stores
pnpm run submit:ios         # Submit to App Store/TestFlight
pnpm run submit:android     # Submit to Google Play
```

**Package Manager**: Uses `pnpm` exclusively - the project was created with `pnpm dlx create-expo-app` and all dependencies should be managed with pnpm.

## Architecture & Code Structure

### Hybrid WebView Architecture

- **Main App (App.tsx)**: Simple two-tab navigation (Home/Live) with native header controls
- **Home Tab**: WebView displaying church's GoDaddy website
- **Live Tab**: Custom LiveScreen component that intelligently handles YouTube live streams
- **Native Features**: Phone call, email, and share buttons in header for App Store compliance

### Key Components

**App.tsx**

- Root component with SafeAreaProvider wrapper
- Two-view state management: `currentView: 'home' | 'live'`
- Native linking functions (call, email, share) using church contact info
- Bottom tab navigation with active state highlighting

**LiveScreen (src/screens/LiveScreen.tsx)**

- Checks YouTube API for live streams using `YOUTUBE_CHANNEL_ID`
- If live: Shows embedded YouTube player (`youtube.com/embed/{videoId}`)
- If not live: Shows service times and "Visit Our YouTube Channel" button
- Prevents showing full YouTube interface - only embedded content or fallback message

**Constants (src/config/constants.js)**

- Central configuration for church info, brand colors, YouTube credentials
- Brand colors extracted from pbcc-logo.svg: primary `#6b334b`, accent colors
- Contains all church contact details, service times, and notification schedules
- YouTube API credentials (replace `YOUR_YOUTUBE_API_KEY_HERE` with real key)

### State Management

Simple useState-based state management:

- `currentView` for tab switching
- LiveScreen manages its own live stream detection state
- No external state management libraries

### Styling Approach

- Uses React Native StyleSheet with brand colors from constants
- Church brand colors: burgundy primary (#6b334b) with gradient accents
- Emoji icons instead of vector icons to avoid additional dependencies
- SafeAreaView with proper safe area context for modern React Native

## Technical Constraints & Decisions

### WebView Strategy

- Uses `react-native-webview` to display existing church website
- Avoids rebuilding content that already exists on GoDaddy site
- Minimal custom screens (only LiveScreen for YouTube integration)

### YouTube Integration

- Uses YouTube API v3 to check for live streams
- Embeds videos using `youtube.com/embed/` URLs instead of full YouTube interface
- Fallback to showing service times when not live
- API key required for live detection (works with demo data if not configured)

### Push Notifications & Service Reminders

- **ScheduledNotifications**: Local notifications scheduled at exact service times
- **Service Schedule**:
  - Sunday: 8:30 AM (Early), 10:30 AM (Traditional), 11:30 AM (Contemporary)
  - Wednesday: 7:00 PM (Bible Study)
- **Deep Linking**: Notifications open the app directly to Live tab (`pbcc://live`)
- **Works When App Closed**: Uses native OS scheduling - no background execution needed
- **Auto-repeating**: Weekly recurring notifications for each service time

### Dependencies

- **Expo SDK 54**: Modern Expo with new architecture enabled
- **React Native 0.81.4**: Stable RN version
- **TypeScript**: Full TypeScript configuration
- **Notifications**: expo-notifications, expo-linking, expo-task-manager
- **Storage**: @react-native-async-storage/async-storage for notification throttling

### Platform Support

- iOS: Supports tablets, uses proper safe area handling
- Android: Edge-to-edge enabled, adaptive icons configured
- Web: Has favicon and web support through Expo

## Church-Specific Configuration

### Service Times (for Live screen messaging)

- Sunday: 8:30 AM (Early), 10:30 AM (Traditional), 11:30 AM (Contemporary)
- Wednesday: 7:00 PM (Bible Study)

### Contact Information

- Phone: (541) 548-3066 (links to tel: scheme)
- Email: <info@powellbuttechurch.com> (links to mailto: scheme)
- Website: <https://powellbuttechurch.com> (displayed in WebView)

### YouTube Channel

- Channel ID: UCUerZC3kOwd13O3BlJFPSaA
- Used for live stream detection and fallback links

## Testing Notes

**Simulator Limitations**:

- Phone calling (`tel:` links) won't work in iOS Simulator - only works on real devices
- Email and sharing work in simulator
- WebView and YouTube embedding work normally

**Live Stream Testing**:

- If YouTube API key not configured, uses demo offline state
- Live detection requires valid YouTube Data API v3 key
- Embedded videos require network connectivity

## Deployment & Sharing

### TestFlight/App Store Distribution
1. **Setup**: Requires Apple Developer Account ($99/year)
2. **Build**: `pnpm run build:ios`
3. **Submit**: `pnpm run submit:ios`
4. **TestFlight**: Available in App Store Connect after submission

### Direct Sharing (No App Store)
1. **Expo Go**: `pnpm start` → Share QR code (easiest for testing)
2. **Development Build**: `pnpm run build:dev` → Share .ipa/.apk directly
3. **Android APK**: `pnpm run build:android` → Share .apk file (no restrictions)

### Prerequisites for EAS
- **Expo Account**: Sign up at expo.dev
- **EAS CLI**: Included as dev dependency, login with `npx eas login`
- **Apple Developer Account**: Required for iOS builds/distribution
- **Google Play Console**: Required for Android Play Store distribution
