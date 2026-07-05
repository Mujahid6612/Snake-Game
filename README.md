# Classic Snake 🐍

A classic Snake game built with [Expo](https://expo.dev) and [expo-router](https://docs.expo.dev/router/introduction/). Features 20 hand-crafted levels plus an infinity mode, sound effects, background music, and AdMob ads.

## Tech stack

- Expo SDK 57 / React Native 0.86 (New Architecture)
- expo-router (file-based routing, tabs: Home, Level Infinity, Settings, Help)
- expo-audio / expo-video for sound and video
- react-native-google-mobile-ads for ads
- TypeScript

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a development build, Android emulator, iOS simulator, or [Expo Go](https://expo.dev/go).

This project uses the New Architecture and native modules (ads, audio, video), so **Expo Go is not supported** — use a development build instead (see below).

## Local Android builds (APK)

The project is set up to build signed development and production APKs entirely on your machine with [EAS Build's local mode](https://docs.expo.dev/build-reference/local-builds/) — no EAS cloud build minutes required.

### Prerequisites

- **Java 17** (`brew install openjdk@17`)
- **Android SDK** with build-tools, platform-tools, and an NDK installed (e.g. via Android Studio or `brew install android-commandlinetools`)
- `JAVA_HOME`, `ANDROID_HOME`, and `ANDROID_SDK_ROOT` set in your shell profile
- Logged in to an Expo account: `npx eas-cli login`

### Build commands

```bash
# Development client APK (debug, installable dev client)
eas build --platform android --profile development --local

# Production APK (release, signed for distribution)
eas build --platform android --profile production --local
```

Both profiles are defined in [eas.json](eas.json) and produce an `.apk` file in the project root once the build finishes. Install it on a device with:

```bash
adb install <the-generated-file>.apk
```

## Project structure

- `src/app/` — expo-router routes
  - `(tabs)/` — the main tab navigator (Home, Level Infinity, Settings, Help)
  - `game-levels.tsx` — hosts the 20 individual level screens
  - `_layout.tsx` — root layout, fonts, theming
- `src/levels/` — `level1.tsx`–`level20.tsx`, one Snake variant per level
- `src/components/` — game UI (modals, progress bar, banner ads, etc.)
- `src/hooks/` — shared hooks (`useLevelSounds`, ad hooks, color scheme)
- `src/utils/` — `soundManager.ts` and other helpers
- `assets/` — images, fonts, and audio (background music, SFX)

## Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [expo-router documentation](https://docs.expo.dev/router/introduction/)
- [EAS Build local builds](https://docs.expo.dev/build-reference/local-builds/)
