import { theme } from "@/constants/theme";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer } from "expo-audio";

interface GameCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  finalScore: number;
  onRestart: () => void;
}

const GameCompletionModal = ({ visible, onClose, finalScore, onRestart }: GameCompletionModalProps) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [rotateAnim] = React.useState(new Animated.Value(0));
  const [bounceAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    function playSound() {
      try {
        const player = createAudioPlayer(require("../../assets/level-up.wav"));
        player.play();
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }

    if (visible) {
      playSound();
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    // Reset animations
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    bounceAnim.setValue(0);

    // Start animations
    Animated.parallel([
      // Scale animation for modal entry
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Rotation animation for trophy
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ),
      // Bounce animation for emojis
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.dialog,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Celebration Emojis */}
          <Animated.View 
            style={[
              styles.celebrationIcons,
              {
                transform: [{ translateY: bounce }]
              }
            ]}
          >
            <Text style={styles.emoji}>🎮</Text>
            <Text style={styles.emoji}>👑</Text>
            <Text style={styles.emoji}>🏆</Text>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.emoji}>🎯</Text>
          </Animated.View>

          {/* Trophy Icon */}
          <Animated.View 
            style={[
              styles.trophyContainer,
              {
                transform: [{ rotate }]
              }
            ]}
          >
            <Ionicons name="trophy" size={80} color={theme.accent} />
          </Animated.View>

          <Text style={styles.title}>Game Complete! 🎉</Text>
          <Text style={styles.subtitle}>You're a Snake Master!</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Final Score</Text>
              <Text style={styles.statValue}>{finalScore}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Levels Mastered</Text>
              <Text style={styles.statValue}>20</Text>
            </View>
          </View>

          <Text style={styles.achievementText}>
            Congratulations on completing all levels! You've proven yourself as an elite Snake Master!
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.playAgainButton]} 
              onPress={onRestart}
            >
              <Text style={styles.buttonText}>Play Again</Text>
              <Ionicons name="refresh" size={20} color={theme.white} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.closeButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
              <Ionicons name="close" size={20} color={theme.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlayHeavy,
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: theme.background,
    borderRadius: 25,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.primary,
  },
  celebrationIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  trophyContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: theme.goldA10,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: theme.white,
    marginBottom: 24,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.primaryA10,
    padding: 16,
    borderRadius: 15,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: theme.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  achievementText: {
    color: theme.white,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  playAgainButton: {
    backgroundColor: theme.primary,
  },
  closeButton: {
    backgroundColor: theme.gray600,
  },
  buttonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GameCompletionModal; 