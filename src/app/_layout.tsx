import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import mobileAds from "react-native-google-mobile-ads";
// import { useAppOpenAd } from '@/hooks/useAppOpenAd';

import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SoundManager from "@/utils/soundManager";
import { STORAGE_KEYS } from "@/app/(tabs)/settings";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // const { showAppOpenAd } = useAppOpenAd();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Background music lifecycle. Owned here (not per-screen) so music honors
  // the saved preference no matter which screen the app opens on, and pauses
  // while the app is backgrounded.
  useEffect(() => {
    const soundManager = SoundManager.getInstance();

    const startIfEnabled = async () => {
      try {
        const pref = await AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_MUSIC);
        if (pref === "true") {
          soundManager.playBackgroundMusic();
        }
      } catch (error) {
        console.error("Error starting background music:", error);
      }
    };

    startIfEnabled();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        startIfEnabled();
      } else {
        soundManager.stopBackgroundMusic();
      }
    });

    return () => subscription.remove();
  }, []);

  // Initialize the Google Mobile Ads SDK once on app start. Without this,
  // banners/interstitials load unreliably or not at all.
  useEffect(() => {
    mobileAds().initialize();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="game-levels" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
