import { theme } from "@/constants/theme";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Animated } from "react-native";
import { useEffect } from "react";

export default function NotFoundScreen() {
  const bounceAnimation = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.spring(bounceAnimation, {
          toValue: 1.1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnimation, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Oops! 404", headerShown: false }} />
      <View style={styles.container}>
        <Animated.Text
          style={[styles.emoji, { transform: [{ scale: bounceAnimation }] }]}
        >
          🐍❓
        </Animated.Text>
        <Text style={styles.title}>This screen doesn't exist</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Home</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.background,
    backgroundImage:
      "linear-gradient(45deg, rgba(82, 183, 136, 0.05) 25%, transparent 25%, transparent 75%, rgba(82, 183, 136, 0.05) 75%, rgba(82, 183, 136, 0.05))",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 10px 10px",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.white,
    textShadowColor: theme.primaryA50,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20,
  },
  link: {
    backgroundColor: theme.primaryA15,
    padding: 16,
    borderRadius: 16,
    marginTop: 15,
  },
  linkText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
