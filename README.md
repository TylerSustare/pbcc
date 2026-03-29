# PBCC (Powell Butte Christian Church) Mobile App

This is the mobile application for **Powell Butte Christian Church**, ported from React Native to **Flutter** for enhanced performance, native feel, and maintainability.

## 🛠️ Tech Stack & Requirements

- **Framework:** [Flutter](https://flutter.dev/) (using SDK version 3.41.5)
- **SDK Management:** [FVM (Flutter Version Management)](https://fvm.app/)
- **State Management:** `StatefulWidget` (minimal state approach for simplicity)
- **Native Bridges:** 
  - `webview_flutter` for the main website and giving page.
  - `youtube_player_flutter` for the live stream screen.
  - `flutter_local_notifications` for Sunday service reminders.

## 🚀 Getting Started

This project **requires** `fvm` for all Flutter and Dart workflows to ensure version consistency.

### 1. Initial Setup

If you haven't installed `fvm`, you can do so via `pub`:
```bash
dart pub global activate fvm
```

Then, initialize the project:
```bash
make dev-setup
```

### 2. Common Commands

We've abstracted the complex `fvm flutter` commands into a simple `Makefile`.

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make get` | Fetch dependencies |
| `make run` | Launch the app in debug mode |
| `make analyze` | Run the static analyzer |
| `make test` | Run unit and widget tests |
| `make icons` | Regenerate launcher icons |
| `make splash` | Regenerate splash screens |
| `make build-apk` | Build a production Android APK |
| `make build-ios` | Build a production iOS bundle |

## 📁 Project Structure

```text
pbcc/
├── lib/
│   ├── config/        # App-wide constants (colors, links, service times)
│   ├── screens/       # Main UI screens (Home, Live, etc.)
│   ├── services/      # Business logic (Notifications, YouTube API)
│   └── main.dart      # App entry point and deep link handling
├── assets/            # App icons, logos, and splash screen images
├── test/              # Unit and widget tests
├── Makefile           # Dev-tooling abstraction
└── TODO.md            # Plan for Version 2 (Native Content Migration)
```

## 🗓️ Features

- **Home Screen:** Live WebView of the church's primary website.
- **Live Stream:** Automatically detects and displays active YouTube live streams during service times.
- **Service Reminders:** Optional push notifications for Sunday services (8:30 AM, 10:30 AM, 11:30 AM).
- **Giving:** Native navigation to the church's secure Giving page.
- **Deep Linking:** Supports `PBCC://live` and `PBCC://give` schemes.

## 🔮 Version 2: Native Migration

The next phase of this project is to replace the WebViews with a fully native UI by scraping `powellbuttechurch.com` via a cloud-hosted API. See [TODO.md](./TODO.md) for the detailed roadmap.

---

*Originally migrated from React Native in March 2026.*
