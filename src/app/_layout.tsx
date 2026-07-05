import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
// import { useAppOpenAd } from '@/hooks/useAppOpenAd';

import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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

  // useEffect(() => {
  //   // Initialize mobile ads
  //   mobileAds()
  //     .initialize()
  //     .then(adapterStatuses => {
  //       console.log('Ads initialized');
  //     });

  //   // Handle app state changes for app open ads
  //   const subscription = AppState.addEventListener('change', nextAppState => {
  //     if (nextAppState === 'active') {
  //       showAppOpenAd();
  //     }
  //   });

  //   return () => {
  //     subscription.remove();
  //   };
  // }, [showAppOpenAd]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="game-levels" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
