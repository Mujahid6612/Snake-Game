import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Text,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
// import Intro from "@/components/intro";
// import SoundManager from "@/utils/soundManager";

const TOTAL_LEVELS = 20;
const LEVEL_EMOJIS = [
  "🐍",
  "🌿",
  "🍎",
  "⚡",
  "🌈",
  "🎯",
  "🎮",
  "🏆",
  "💫",
  "🌟",
  "🔥",
  "⭐",
  "🎪",
  "🎨",
  "🎭",
  "🎪",
  "🎯",
  "🎲",
  "🎳",
  "👑",
];

export default function HomeScreen() {
  const router = useRouter();
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]);
  const [bestScores, setBestScores] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const bounceAnimation = new Animated.Value(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadUnlockedLevels(), loadBestScores()]);
      startBounceAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  const startBounceAnimation = () => {
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
  };

  const loadUnlockedLevels = async () => {
    try {
      const levels = [];
      for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const isUnlocked = await AsyncStorage.getItem(`@Level_${i}_Unlocked`);
        if (isUnlocked === "true" || i === 1) {
          levels.push(i);
        }
      }
      setUnlockedLevels(levels);
    } catch (error) {
      console.error("Error loading unlocked levels:", error);
    }
  };

  const loadBestScores = async () => {
    try {
      const scores: { [key: number]: number } = {};
      for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const score = await AsyncStorage.getItem(`@Level_${i}_BestScore`);
        if (score) {
          scores[i] = parseInt(score);
        }
      }
      setBestScores(scores);
    } catch (error) {
      console.error("Error loading best scores:", error);
    }
  };

  const handleLevelPress = (level: number) => {
    if (unlockedLevels.includes(level)) {
      router.push(`/game-levels?level=${level}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  // const getIntro = async () => {
  //   try {
  //     const intro = await AsyncStorage.getItem("@intro_shown");
  //     if (intro === "true") {
  //       setShowIntro(false);
  //     } else {
  //       setShowIntro(true);
  //       await AsyncStorage.setItem("@intro_shown", "true");
  //       setTimeout(() => {
  //         setShowIntro(false);
  //       }, 10000); // 10 seconds
  //     }
  //   } catch (error) {
  //     console.error("Error checking intro status:", error);
  //     setShowIntro(false);
  //   }
  // };

  // useEffect(() => {
  //   // getIntro();
  // }, []);

  // if (showIntro) {
  //   return <Intro />;
  // }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Snake Game</Text>
            <Text style={styles.subtitle}>Choose your level</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#52B788"
                colors={["#52B788"]}
              />
            }
          >
            <View style={styles.levelsGrid}>
              {Array.from({ length: TOTAL_LEVELS }).map((_, index) => {
                const level = index + 1;
                const isUnlocked = unlockedLevels.includes(level);

                return (
                  <Animated.View
                    key={level}
                    style={[
                      styles.levelCard,
                      level === 1 && {
                        transform: [{ scale: bounceAnimation }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.levelButton,
                        !isUnlocked && styles.lockedLevel,
                      ]}
                      onPress={() => handleLevelPress(level)}
                      disabled={!isUnlocked}
                    >
                      <View style={styles.levelContent}>
                        <Text style={styles.levelEmoji}>
                          {LEVEL_EMOJIS[index]}
                        </Text>
                        <Text style={styles.levelText}>Level {level}</Text>
                      </View>
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Ionicons
                            name="lock-closed"
                            size={24}
                            style={styles.lockIcon}
                          />
                        </View>
                      )}
                      {isUnlocked && bestScores[level] && (
                        <View style={styles.scoreOverlay}>
                          <View style={styles.scoreContainer}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.scoreText}>
                              {bestScores[level]}
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Complete levels to unlock more challenges! 🎮
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1A1A1A",
    backgroundImage:
      "linear-gradient(45deg, rgba(82, 183, 136, 0.05) 25%, transparent 25%, transparent 75%, rgba(82, 183, 136, 0.05) 75%, rgba(82, 183, 136, 0.05)), linear-gradient(45deg, rgba(82, 183, 136, 0.05) 25%, transparent 25%, transparent 75%, rgba(82, 183, 136, 0.05) 75%, rgba(82, 183, 136, 0.05))",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 10px 10px",
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#52B788",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
    textShadowColor: "rgba(82, 183, 136, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    color: "#52B788",
  },
  scrollView: {
    flex: 1,
  },
  levelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8,
  },
  levelCard: {
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  levelButton: {
    backgroundColor: "rgba(82, 183, 136, 0.15)",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    backdropFilter: "blur(8px)",
  },
  lockedLevel: {
    backgroundColor: "rgba(100, 100, 100, 0.15)",
    borderColor: "rgba(102, 102, 102, 0.3)",
  },
  levelContent: {
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  levelEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  scoreOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(82, 183, 136, 0.05)",
    borderRadius: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.8,
    color: "#52B788",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  lockIcon: {
    color: "rgba(255, 255, 255, 0.8)",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#52B788",
    opacity: 0.8,
  },
});
