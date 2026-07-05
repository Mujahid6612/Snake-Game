import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SoundManager from "../../utils/soundManager";
// import { useInterstitialAd } from "@/hooks/useInterstitialAd";

// Constants for settings
export const DIFFICULTY_SPEEDS = {
  EASY: 150,
  MEDIUM: 100,
  HARD: 70,
};

export const STORAGE_KEYS = {
  DIFFICULTY: "@snake_difficulty",
  SOUND_EFFECTS: "@snake_sound_effects",
  BACKGROUND_MUSIC: "@snake_background_music",
};

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

const SettingsScreen = () => {
  const [difficulty, setDifficulty] = useState("EASY");
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedDifficulty = await AsyncStorage.getItem(
        STORAGE_KEYS.DIFFICULTY
      );
      const storedSoundEffects = await AsyncStorage.getItem(
        STORAGE_KEYS.SOUND_EFFECTS
      );
      const storedBackgroundMusic = await AsyncStorage.getItem(
        STORAGE_KEYS.BACKGROUND_MUSIC
      );

      if (storedDifficulty) {
        setDifficulty(storedDifficulty);
      }
      if (storedSoundEffects !== null) {
        setSoundEffects(storedSoundEffects === "true");
      }
      if (storedBackgroundMusic !== null) {
        const musicEnabled = storedBackgroundMusic === "true";
        setBackgroundMusic(musicEnabled);
        const soundManager = SoundManager.getInstance();
        if (musicEnabled) {
          soundManager.playBackgroundMusic();
        } else {
          soundManager.stopBackgroundMusic();
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveDifficulty = async (value: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DIFFICULTY, value);
      setDifficulty(value);
    } catch (error) {
      console.error("Error saving difficulty:", error);
    }
  };

  const saveSoundEffects = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SOUND_EFFECTS, value.toString());
      setSoundEffects(value);
    } catch (error) {
      console.error("Error saving sound effects setting:", error);
    }
  };

  const saveBackgroundMusic = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BACKGROUND_MUSIC,
        value.toString()
      );
      setBackgroundMusic(value);
      const soundManager = SoundManager.getInstance();
      if (value) {
        await soundManager.playBackgroundMusic();
      } else {
        await soundManager.stopBackgroundMusic();
      }
    } catch (error) {
      console.error("Error saving background music setting:", error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="settings-outline" size={24} color={theme.background} />
        </View>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Difficulty */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="speedometer-outline" size={20} color={theme.primary} />
          </View>
          <Text style={styles.cardTitle}>Difficulty</Text>
        </View>

        <View style={styles.segment}>
          {DIFFICULTIES.map((level) => {
            const active = difficulty === level;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => saveDifficulty(level)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.cardDescription}>
          Controls the snake&apos;s speed — Easy is normal, Medium is 50%
          faster, Hard is 100% faster.
        </Text>
      </View>

      {/* Sound effects */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="volume-high-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.cardTitle}>Sound Effects</Text>
              <Text style={styles.cardSubtitle}>Eat, game over & power-ups</Text>
            </View>
          </View>
          <Switch
            value={soundEffects}
            onValueChange={saveSoundEffects}
            trackColor={{ false: theme.switchTrackOff, true: theme.primary }}
            thumbColor={soundEffects ? theme.white : theme.switchThumbOff}
          />
        </View>
      </View>

      {/* Background music */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="musical-notes-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.cardTitle}>Background Music</Text>
              <Text style={styles.cardSubtitle}>Plays while you navigate</Text>
            </View>
          </View>
          <Switch
            value={backgroundMusic}
            onValueChange={saveBackgroundMusic}
            trackColor={{ false: theme.switchTrackOff, true: theme.primary }}
            thumbColor={backgroundMusic ? theme.white : theme.switchThumbOff}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={theme.primary}
        />
        <Text style={styles.infoText}>
          Settings apply to your next game.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 44,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.white,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.whiteA10,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.primaryA15,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.white,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 14,
    lineHeight: 19,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: theme.background,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: theme.primary,
  },
  segmentText: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: theme.background,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  toggleTextWrap: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.primaryA10,
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginTop: 4,
  },
  infoText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default SettingsScreen;
