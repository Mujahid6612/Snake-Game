import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
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

const SettingsScreen = () => {
  const [difficulty, setDifficulty] = useState("EASY");
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(false);

  // const { showAd } = useInterstitialAd();

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
      // Show interstitial ad on game over
      // await showAd();
      Alert.alert(
        "Success",
        "Difficulty settings saved! Changes will apply to your next game."
      );
    } catch (error) {
      console.error("Error saving difficulty:", error);
    }
  };

  const saveSoundEffects = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SOUND_EFFECTS, value.toString());
      setSoundEffects(value);
      // Show interstitial ad on game over
      // await showAd();
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
      // Show interstitial ad on game over
      // await showAd();
    } catch (error) {
      console.error("Error saving background music setting:", error);
    }
  };

  const handleDeleteGameData = () => {
    Alert.alert(
      "Delete Game Data",
      "Are you sure you want to delete all game data? This action will reset all your progress, high scores, and settings. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Reset state to defaults
              setDifficulty("EASY");
              setSoundEffects(true);
              setBackgroundMusic(false);
              Alert.alert("Success", "All game data has been deleted.");
              // Show interstitial ad on game over
              // await showAd();
            } catch (error) {
              console.error("Error deleting game data:", error);
              Alert.alert("Error", "Failed to delete game data.");
            }
          },
        },
      ]
    );
  };

  const DifficultyButton = ({ level }: { level: string }) => (
    <TouchableOpacity
      style={[
        styles.difficultyButton,
        difficulty === level && styles.selectedDifficulty,
      ]}
      onPress={() => saveDifficulty(level)}
    >
      <Text
        style={[
          styles.difficultyText,
          difficulty === level && styles.selectedDifficultyText,
        ]}
      >
        {level.charAt(0) + level.slice(1).toLowerCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>
          <Text style={styles.settingTitle}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            <DifficultyButton level="EASY" />
            <DifficultyButton level="MEDIUM" />
            <DifficultyButton level="HARD" />
          </View>
          <Text style={styles.settingDescription}>
            Changes the speed of the snake:
            {"\n"}Easy - Normal speed
            {"\n"}Medium - 50% faster
            {"\n"}Hard - 100% faster
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.soundSection}>
            <View>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Toggle game sound effects
              </Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={saveSoundEffects}
              trackColor={{ false: "#767577", true: "#52B788" }}
              thumbColor={soundEffects ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.soundSection}>
            <View>
              <Text style={styles.settingTitle}>Background Music</Text>
              <Text style={styles.settingDescription}>
                Toggle background music
              </Text>
            </View>
            <Switch
              value={backgroundMusic}
              onValueChange={saveBackgroundMusic}
              trackColor={{ false: "#767577", true: "#52B788" }}
              thumbColor={backgroundMusic ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteGameData}
          >
            <Ionicons name="trash-outline" size={24} color="#FF4444" />
            <Text style={styles.deleteButtonText}>Delete Game Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={24} color="#52B788" />
          <Text style={styles.infoText}>
            Settings will be applied to your next game
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 10,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  settingDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
    lineHeight: 20,
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDifficulty: {
    backgroundColor: "#52B788",
  },
  difficultyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedDifficultyText: {
    color: "#fff",
  },
  soundSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(82, 183, 136, 0.1)",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    color: "#52B788",
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  deleteButtonText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SettingsScreen;
