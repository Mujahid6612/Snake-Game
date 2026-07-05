import { theme } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer } from "expo-audio";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";

interface LevelCompletionDialogProps {
  visible: boolean;
  level: number;
  score: number;
  onContinue: () => void;
  onClose: () => void;
  onNextLevel?: () => void;
}

const LevelCompletionDialog: React.FC<LevelCompletionDialogProps> = ({
  visible,
  level,
  score,
  onContinue,
  onClose,
  onNextLevel,
}) => {
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    function playSound() {
      try {
        const player = createAudioPlayer(require("../../assets/level-up.mp3"));
        player.play();
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }

    if (visible) {
      playSound();
    }
  }, [visible]);

  const handleContinue = async () => {
    await AsyncStorage.setItem(`@Level_${level + 1}_Unlocked`, "true");
    await AsyncStorage.setItem(`@Level_${level}_BestScore`, score.toString());
    // Show interstitial ad on game over
    await showAd();
    onContinue();
  };

  const handleNextLevel = async () => {
    await AsyncStorage.setItem(`@Level_${level + 1}_Unlocked`, "true");
    await AsyncStorage.setItem(`@Level_${level}_BestScore`, score.toString());
    onNextLevel?.();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.celebrationIcons}>
            <Text style={styles.emoji}>🎮</Text>
            <Text style={styles.emoji}>🏆</Text>
            <Text style={styles.emoji}>⭐</Text>
          </View>

          <Text style={styles.title}>Congratulations! 🎉</Text>
          <Text style={styles.subtitle}>Level {level + 1} Unlocked!</Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Score: {score}</Text>
            <Ionicons name="star" size={24} color={theme.accent} />
          </View>

          <View style={styles.buttonContainer}>
            {onNextLevel && (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleNextLevel}
              >
                <Text style={styles.buttonTextPrimary}>Next Level</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.background}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Keep Playing</Text>
              <Ionicons name="play" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: theme.background,
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.primary,
  },
  celebrationIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: theme.primary,
    marginBottom: 20,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    backgroundColor: theme.whiteA10,
    padding: 12,
    borderRadius: 12,
  },
  statsText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "600",
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
  continueButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.whiteA10,
  },
  nextButton: {
    backgroundColor: theme.primary,
  },
  buttonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextPrimary: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "800",
  },
});

export default LevelCompletionDialog;
