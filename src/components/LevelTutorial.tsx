import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const STEPS: { dir: Dir; label: string; icon: IoniconName }[] = [
  { dir: "RIGHT", label: "Swipe right", icon: "arrow-forward" },
  { dir: "DOWN", label: "Swipe down", icon: "arrow-down" },
  { dir: "LEFT", label: "Swipe left", icon: "arrow-back" },
  { dir: "UP", label: "Swipe up", icon: "arrow-up" },
];

const SWIPE_MIN = 30;

/**
 * First-level-only interactive tutorial: asks the user to swipe in each
 * direction. Advances on the correct swipe and can be skipped at any time.
 */
const LevelTutorial = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const current = STEPS[step];

  const onGesture = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state !== State.END) return;
    const { translationX: tx, translationY: ty } = nativeEvent;
    if (Math.max(Math.abs(tx), Math.abs(ty)) < SWIPE_MIN) return;

    const dir: Dir =
      Math.abs(tx) > Math.abs(ty)
        ? tx > 0
          ? "RIGHT"
          : "LEFT"
        : ty > 0
        ? "DOWN"
        : "UP";

    if (dir !== current.dir) return;
    if (step + 1 >= STEPS.length) {
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  };

  const nudge = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const negNudge = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });
  const transform =
    current.dir === "RIGHT"
      ? [{ translateX: nudge }]
      : current.dir === "LEFT"
      ? [{ translateX: negNudge }]
      : current.dir === "DOWN"
      ? [{ translateY: nudge }]
      : [{ translateY: negNudge }];

  return (
    <PanGestureHandler onHandlerStateChange={onGesture}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.skip}
          onPress={onDone}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="close" size={16} color={theme.textMuted} />
        </TouchableOpacity>

        <Text style={styles.title}>How to play</Text>
        <Text style={styles.subtitle}>
          Guide the snake by swiping. Give it a try:
        </Text>

        <Animated.View style={[styles.arrowCircle, { transform }]}>
          <Ionicons name={current.icon} size={54} color={theme.background} />
        </Animated.View>

        <Text style={styles.instruction}>{current.label}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= step && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.overlayHeavy,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 200,
  },
  skip: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.whiteA10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    color: theme.white,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 40,
  },
  arrowCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  instruction: {
    color: theme.white,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 32,
  },
  dots: {
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.whiteA10,
  },
  dotActive: {
    backgroundColor: theme.primary,
  },
});

export default LevelTutorial;
