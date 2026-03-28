# Islamic Society of Denton (ISD) Application

A cross-platform mobile application built for the Islamic Society of Denton using the **Ionic Framework** (v7) and **Angular** (v17). This project leverages **Capacitor** for seamless deployment to iOS, Android, and Web platforms. Additionally, it integrates with Firebase Cloud Messaging (FCM) for push notifications and utilizes various Cordova/Capacitor plugins for enhanced native capabilities.

---

## 📖 Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running Locally (Browser)](#running-locally-browser)
- [Building & Simulating (Android / iOS)](#building--simulating-android--ios)
  - [Android Setup](#android-setup)
  - [iOS Setup](#ios-setup)
- [Project Scripts](#project-scripts)
- [Environment Configuration](#environment-configuration)

---

## ✨ Features
- **Cross-Platform Compatibility:** Write once, run anywhere (iOS, Android, PWA).
- **Push Notifications:** Integrated with Firebase Cloud Messaging (FCM).
- **Native Device Features:** File management, social sharing, haptics, and custom splash screens.
- **Modern Architecture:** Built on Angular 17+ with standalone and modular paradigms.

---

## 🛠 Technologies Used
- **Frontend Framework:** Angular 17
- **UI Toolkit:** Ionic Framework 7
- **Native Runtime:** Capacitor 5/6
- **Backend / Services:** Firebase
- **Languages:** TypeScript, HTML, SCSS

---

## 📋 Prerequisites
Ensure you have the following installed on your local machine before setting up the project:
- **[Node.js](https://nodejs.org/)**: Recommended to use latest LTS version.
- **[npm](https://www.npmjs.com/)**: Comes bundled with Node.js.
- **Ionic CLI**: Must be installed globally.
  ```bash
  npm install -g @ionic/cli
  ```
- **Platform Specifics:**
  - **Android:** [Android Studio](https://developer.android.com/studio) installed and environment variables configured.
  - **iOS:** A Mac computer with [Xcode](https://developer.apple.com/xcode/) installed.

---

## 🚀 Installation & Setup

1. **Extract or Clone the Repository**:
   Download and extract the zip file, or clone the repository to your local machine.

2. **Open the Project in your IDE**:
   Open the root project directory in [Visual Studio Code](https://code.visualstudio.com/) (or your preferred editor).

3. **Open the Terminal**:
   Open an integrated terminal in your preferred IDE pointing to the root of the project directory.

4. **Install Dependencies**:
   Install project dependencies and force-install the Angular dev-kit as required for local building.
   ```bash
   npm install --save-dev @angular-devkit/build-angular --force
   ```

---

## 💻 Running Locally (Browser)

To launch the app in a web browser for rapid development and testing:

```bash
ionic serve
```
This will start a local development server, usually on `http://localhost:8100/`. The server provides live-reload so changes will immediately reflect in the browser.

> **Note:** If the `ionic` command is not recognized, ensure you have successfully installed the CLI globally using `npm install -g @ionic/cli`.

---

## 📱 Building & Simulating (Android / iOS)

Capacitor relies on the native IDEs (Android Studio and Xcode) to compile and run mobile platforms.

### 1. Sync Native Projects
First, sync your web code (builds the Angular app and copies it to native platforms) and sync Capacitor plugins. You can sync all platforms at once, or target a specific platform:
```bash
ionic cap sync          # Syncs both iOS and Android
ionic cap sync android  # Syncs only Android
ionic cap sync ios      # Syncs only iOS
```

### 2. Android Setup
1. Define the necessary System Environment Variables for Android so that the Ionic CLI can recognize the Android SDK and Android Studio locations.
2. Open Android Studio from the project:
   ```bash
   ionic cap open android
   ```
3. Once Android Studio launches, allow necessary permissions. You can now build an `.apk` file or run the app on a connected physical device or a virtual Android emulator.

### 3. iOS Setup
> **Note:** iOS simulation and build process require a macOS environment.
1. Open Xcode from the project:
   ```bash
   ionic cap open ios
   ```
2. In Xcode, configure your developer team signing profile.
3. Select your target device (physical iPhone or iOS Simulator) and click "Run".

---

## 📜 Project Scripts
Standard scripts defined in `package.json`:
- `npm start` - Shorthand to serve the application locally.
- `npm run build` - Builds a production output package.
- `npm test` - Executes unit tests using Karma/Jasmine.
- `npm run lint` - Lints the project codebase using ESLint.

---

## ⚙️ Environment Configuration
- Make sure to add any secure Firebase environment keys to `src/environments/environment.ts` and `src/environments/environment.prod.ts` locally (if omitted from the repository).
- Confirm that `.env` or related environment settings for Android/iOS builds are appropriately set natively inside Xcode or Android Studio.

---
*Built for the Islamic Society of Denton.*