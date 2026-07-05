import { theme } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import Intro from "@/components/intro";
// import SoundManager from "@/utils/soundManager";

const TOTAL_LEVELS = 20;

// Levels unlock through normal progression (each unlocks after you complete
// the previous one). Flip to true to temporarily unlock everything for testing.
const UNLOCK_ALL_FOR_TESTING = false;

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Vector icons per level (escalating difficulty) — used instead of emoji so
// glyphs render identically across Android OS versions.
const LEVEL_ICONS: IconName[] = [
  "sprout",
  "leaf",
  "food-apple",
  "lightning-bolt",
  "star-four-points",
  "flash",
  "run-fast",
  "rocket",
  "orbit",
  "target",
  "food-variant",
  "auto-fix",
  "shield",
  "shield-alert",
  "shield-star",
  "skull",
  "skull-outline",
  "skull-crossbones",
  "sword-cross",
  "crown",
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
    }, []),
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
      ]),
    ).start();
  };

  const loadUnlockedLevels = async () => {
    if (UNLOCK_ALL_FOR_TESTING) {
      setUnlockedLevels(Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1));
      return;
    }
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

  // Levels with a saved best score count as completed.
  const completedCount = Object.keys(bestScores).length;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandBadge}>
                <MaterialCommunityIcons
                  name="snake"
                  size={26}
                  color={theme.background}
                />
              </View>
              <Text style={styles.brandTitle}>Classic Snake</Text>
            </View>

            <View style={styles.progressChip}>
              <MaterialCommunityIcons
                name="trophy"
                size={16}
                color={theme.accent}
              />
              <Text style={styles.progressText}>
                {completedCount}/{TOTAL_LEVELS}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
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
                        styles.card,
                        isUnlocked ? styles.cardUnlocked : styles.cardLocked,
                      ]}
                      onPress={() => handleLevelPress(level)}
                      disabled={!isUnlocked}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.inner,
                          !isUnlocked && styles.innerLocked,
                        ]}
                      >
                        <View
                          style={[
                            styles.iconBadge,
                            !isUnlocked && styles.iconBadgeLocked,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={LEVEL_ICONS[index]}
                            size={30}
                            color={
                              isUnlocked ? theme.background : theme.textMuted
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.levelText,
                            !isUnlocked && styles.levelTextLocked,
                          ]}
                        >
                          Level {level}
                        </Text>
                      </View>

                      {isUnlocked && !!bestScores[level] && (
                        <View style={styles.scoreBadge}>
                          <MaterialCommunityIcons
                            name="star"
                            size={12}
                            color={theme.accent}
                          />
                          <Text style={styles.scoreText}>
                            {bestScores[level]}
                          </Text>
                        </View>
                      )}
                      {!isUnlocked && (
                        <View style={styles.lockBadge}>
                          <MaterialCommunityIcons
                            name="lock"
                            size={13}
                            color={theme.whiteA80}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
    backgroundColor: theme.background,
    backgroundImage:
      "linear-gradient(45deg, rgba(82, 183, 136, 0.05) 25%, transparent 25%, transparent 75%, rgba(82, 183, 136, 0.05) 75%, rgba(82, 183, 136, 0.05)), linear-gradient(45deg, rgba(82, 183, 136, 0.05) 25%, transparent 25%, transparent 75%, rgba(82, 183, 136, 0.05) 75%, rgba(82, 183, 136, 0.05))",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 10px 10px",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.white,
    letterSpacing: 0.3,
  },
  progressChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.primaryA15,
    borderWidth: 1,
    borderColor: theme.primaryA50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.white,
  },
  scrollView: {
    flex: 1,
  },
  levelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  levelCard: {
    width: "48%",
    marginBottom: 14,
  },
  card: {
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
  },
  cardUnlocked: {
    backgroundColor: theme.primaryA15,
    borderColor: theme.primaryA50,
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardLocked: {
    backgroundColor: theme.lockedSurface,
    borderColor: theme.lockedBorder,
  },
  inner: {
    width: "100%",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.surface,
  },
  innerLocked: {
    backgroundColor: theme.background,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeLocked: {
    backgroundColor: theme.whiteA10,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.white,
  },
  levelTextLocked: {
    color: theme.textMuted,
  },
  scoreBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.overlay,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: "700",
  },
  lockBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: theme.primary,
    opacity: 0.8,
  },
});
