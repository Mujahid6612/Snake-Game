import { theme } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";

interface GameOverModalProps {
  visible: boolean;
  score: number;
  onRestart: () => void;
  onContinue: () => void;
  onHome: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  onRestart,
  onContinue,
  onHome,
}) => {
  const { showAd } = useInterstitialAd();

  // Show the interstitial when the player taps Continue, then resume the game.
  const handleContinue = async () => {
    await showAd();
    onContinue();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name="skull-outline"
              size={40}
              color={theme.danger}
            />
          </View>

          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.subtitle}>Better luck this time!</Text>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.restartButton]}
              onPress={onRestart}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={20} color={theme.background} />
              <Text style={styles.buttonTextPrimary}>Restart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={20} color={theme.primary} />
              <Text style={styles.buttonText}>Continue ({score})</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={onHome}
            activeOpacity={0.7}
          >
            <Ionicons name="grid-outline" size={16} color={theme.textMuted} />
            <Text style={styles.homeText}>Back to levels</Text>
          </TouchableOpacity>
        </View>
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
    borderRadius: 22,
    padding: 24,
    width: "85%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.whiteA10,
  },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.dangerA10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textMuted,
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: theme.whiteA10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 22,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  statValue: {
    color: theme.accent,
    fontSize: 28,
    fontWeight: "800",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 14,
    gap: 8,
  },
  restartButton: {
    backgroundColor: theme.primary,
  },
  continueButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.whiteA10,
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
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 6,
  },
  homeText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default GameOverModal;
