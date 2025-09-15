# Powell Butte Christian Church Mobile App

A React Native church app built with Expo that displays the church's website in a WebView with native mobile features.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Run on device
pnpm run ios     # iOS
pnpm run android # Android
```

## Sharing the App

### For Quick Testing (Easiest)
```bash
# Start dev server
pnpm start

# Share the QR code with testers
# They download "Expo Go" from App Store and scan your QR code
```

### For Direct Installation
```bash
# Android APK (works on any Android device)
pnpm run build:android

# iOS Development Build (requires adding device UUIDs)
pnpm run build:dev --platform ios
```

### For App Store Distribution
```bash
# Configure EAS (first time only)
pnpm run build:configure

# Build for production
pnpm run build:ios

# Submit to TestFlight/App Store
pnpm run submit:ios
```

## Requirements

- **Development**: Node.js, pnpm, Expo CLI
- **iOS Builds**: Apple Developer Account ($99/year)
- **Android Builds**: Free (Google Play Console for store distribution)

## App Features

- **Home Tab**: Church website in WebView
- **Live Tab**: YouTube live stream detection and embedding
- **Native Features**: Phone, email, share buttons
- **Notifications**: Automatic service reminders

## Configuration

Update `src/config/constants.js`:
- Replace `YOUR_YOUTUBE_API_KEY_HERE` with real YouTube API key
- Verify church contact info and service times

## Architecture

Simple hybrid approach using WebView for existing content with minimal native features for App Store compliance.