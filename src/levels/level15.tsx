import { theme } from "@/constants/theme";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useLevelSounds } from "@/hooks/useLevelSounds";
import type { AudioPlayer } from "expo-audio";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, DIFFICULTY_SPEEDS } from "../app/(tabs)/settings";
import LevelProgressBar from "../components/LevelProgressBar";
import LevelCompletionDialog from "../components/LevelCompletionDialog";
import GameOverModal from "../components/GameOverModal";
// import { useRewardedAd } from "@/hooks/useRewardedAd";

const GRID_SIZE = 20;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CELL_SIZE = Math.floor(Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) / 25); // Responsive cell size
const GAME_AREA_SCALE = Math.min(
  SCREEN_WIDTH / (GRID_SIZE * CELL_SIZE),
  SCREEN_HEIGHT / (GRID_SIZE * CELL_SIZE * 1.4)
);
const INITIAL_SNAKE = [{ x: 5, y: 5 }];
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Keep level15's base speed
const INITIAL_GAME_SPEED = 100;

// Update GAME_ELEMENTS to match level14's powers
const GAME_ELEMENTS = {
  SNAKE_HEAD: "🟢",
  SNAKE_BODY: "🟩",
  FOOD: "🍎",
  OBSTACLE: "🧱",
  SPEED_UP: { emoji: "⚡", name: "Speed Boost", size: 20, duration: 15 },
  SPEED_DOWN: { emoji: "🐌", name: "Slow Down", size: 18, duration: 15 },
  SCORE_BOOST: { emoji: "💫", name: "Score +5", size: 18, duration: 15 },
  WALL_PASS: { emoji: "🌈", name: "Wall Pass", size: 18, duration: 15 },
  SHIELD: { emoji: "🛡️", name: "Shield", size: 18, duration: 15 },
  RESTRICTED: "🚫",
};

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Vector icons for power-ups (consistent across Android versions).
const POWER_ICONS: Record<string, MciName> = {
  SPEED_UP: "lightning-bolt",
  SPEED_DOWN: "snail",
  SCORE_BOOST: "star-four-points",
  WALL_PASS: "wall",
  SHIELD: "shield",
  GHOST: "ghost",
  TIME_FREEZE: "snowflake",
};

const Level15 = () => {
  const router = useRouter();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const { eatSound, gameOverSound, scoreBoostSound } = useLevelSounds();
  const [powerUp, setPowerUp] = useState<null | {
    type: string;
    position: { x: number; y: number };
  }>(null);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);
  const [canPassWalls, setCanPassWalls] = useState(false);
  const [powerUpTimeout, setPowerUpTimeout] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [activePowers, setActivePowers] = useState<
    {
      type: string;
      timeLeft: number;
      startTime: number;
      pausedAt?: number;
    }[]
  >([]);
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [showScoreBoost, setShowScoreBoost] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(15);
  const POINTS_TO_NEXT_LEVEL = 35;
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelBestScore, setLevelBestScore] = useState(0);
  const [hasShownLevelComplete, setHasShownLevelComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  // const { showAd, isAdLoaded, hasRewarded } = useRewardedAd();
  const [lastScore, setLastScore] = useState(0);
  const [adCooldown, setAdCooldown] = useState(0);
  const [baseSpeed, setBaseSpeed] = useState(INITIAL_GAME_SPEED); // Track original speed separately
  const [boostText, setBoostText] = useState("+5");
  const [isShielded, setIsShielded] = useState(false);
  const [obstacles, setObstacles] = useState([
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 7, y: 7 },
    { x: 12, y: 8 },
    { x: 13, y: 13 },
  ]);

  // Keep level15's restricted areas
  const [restrictedAreas, setRestrictedAreas] = useState([
    { x: 2, y: 2, width: 3, height: 3 },
    { x: 15, y: 15, width: 3, height: 3 },
    { x: 2, y: 15, width: 3, height: 3 },
    { x: 15, y: 2, width: 3, height: 3 },
    { x: 8, y: 8, width: 4, height: 4 },
    { x: 2, y: 20, width: 3, height: 3 },
    { x: 15, y: 20, width: 3, height: 3 },
  ]);


  const loadSettings = async () => {
    try {
      const [difficultyValue, soundEffectsValue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DIFFICULTY),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_EFFECTS),
      ]);

      if (difficultyValue) {
        const speed =
          DIFFICULTY_SPEEDS[difficultyValue as keyof typeof DIFFICULTY_SPEEDS];
        setBaseSpeed(speed);
        setGameSpeed(speed);
      }

      if (soundEffectsValue !== null) {
        setSoundEffectsEnabled(soundEffectsValue === "true");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(interval);
  }, [snake, isPlaying, direction, isPaused, gameSpeed]);

  useEffect(() => {
    if (isPlaying) {
      const spawnPowerUp = () => {
        if (Math.random() < 0.8) {
          const types = [
            "SPEED_UP", "SPEED_DOWN", "SCORE_BOOST", 
            "WALL_PASS", "SHIELD"
          ];
          const randomType = types[Math.floor(Math.random() * types.length)];
          setPowerUp({
            type: randomType,
            position: getValidFoodPosition(),
          });

          setTimeout(() => {
            setPowerUp(null);
          }, 5000);
        }
      };

      const interval = setInterval(spawnPowerUp, 6000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Modify the power-up countdown effect to respect pause state
  useEffect(() => {
    if (activePowers.length > 0 && !isPaused && isPlaying) {
      const interval = setInterval(() => {
        setActivePowers((prev) =>
          prev
            .map((power) => ({
              ...power,
              timeLeft: power.timeLeft - 1,
            }))
            .filter((power) => power.timeLeft > 0)
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activePowers, isPaused, isPlaying]);

  // Add countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsPlaying(true);
      setHasGameStarted(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (score >= POINTS_TO_NEXT_LEVEL && !hasShownLevelComplete) {
      setShowLevelComplete(true);
      setIsPlaying(false);
      setHasShownLevelComplete(true);

      if (score > levelBestScore) {
        setLevelBestScore(score);
      }
    }
  }, [score, hasShownLevelComplete]);

  useEffect(() => {
    setCountdown(null);
    setIsPlaying(false);
  }, []);

  // Keep level8's obstacle movement logic
  // useEffect(() => {
  //   if (!isPlaying || isPaused) return;
  //   const moveObstacles = setInterval(() => { ... });
  //   return () => clearInterval(moveObstacles);
  // }, [isPlaying, isPaused]);

  // Keep the restricted area check function
  const isInRestrictedArea = (position: { x: number; y: number }) => {
    return restrictedAreas.some(area => 
      position.x >= area.x && 
      position.x < area.x + area.width &&
      position.y >= area.y && 
      position.y < area.y + area.height
    );
  };

  // Modify moveSnake to include restricted area check
  const moveSnake = async () => {
    const newSnake = [...snake];
    let head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y,
    };

    // Check for restricted area collision
    if (isInRestrictedArea(head) && !isShielded) {
      setIsGameOver(true);
      gameOver();
      return;
    }

    // Check for obstacle collision with shield protection
    const hitObstacle = obstacles.some((obstacle) => 
      obstacle.x === head.x && obstacle.y === head.y && !isShielded
    );

    if (hitObstacle) {
      setIsGameOver(true);
      gameOver();
      return;
    }

    if (canPassWalls) {
      if (head.x < 0) head.x = GRID_SIZE - 1;
      if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE * 1.4 - 1;
      if (head.y >= GRID_SIZE * 1.4) head.y = 0;
    } else if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE * 1.4
    ) {
      setIsGameOver(true);
      gameOver();
      return;
    }

    newSnake.unshift(head);

    // Check for power-up collision
    if (
      powerUp &&
      head.x === powerUp.position.x &&
      head.y === powerUp.position.y
    ) {
      handlePowerUp(powerUp.type);
      setPowerUp(null);
    }

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
      await playSound(eatSound);
      setFood(getValidFoodPosition());
      setScore(score + 1);
      if (score + 1 > highScore) {
        setHighScore(score + 1);
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const gameOver = async () => {
    setIsPlaying(false);
    await playSound(gameOverSound);
    setLastScore(score);

    if (score > highScore) {
      setHighScore(score);
    }

    // Reset all power-related states
    setGameSpeed(baseSpeed);
    setCanPassWalls(false);
    setPowerUp(null);
    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
      setPowerUpTimeout(null);
    }
    setActivePowers([]);
    setIsPaused(false);
  };

  const resumeGame = () => {
    loadSettings();
    if (isGameOver) return;

    if (!hasGameStarted) {
      // First time starting the game
      setCountdown(3);
      return;
    }

    if (isPlaying) {
      // Pause the game
      setIsPaused(true);
      setIsPlaying(false);
    } else {
      // Resume or start the game
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  const restartGame = () => {
    loadSettings();
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS.RIGHT);
    setFood(getValidFoodPosition());
    setScore(0);
    setIsPaused(false);
    setIsPlaying(false);
    setGameSpeed(baseSpeed);
    setCanPassWalls(false);
    setPowerUp(null);
    setActivePowers([]);

    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
      setPowerUpTimeout(null);
    }

    setHasShownLevelComplete(false);
    setIsGameOver(false);
    setHasGameStarted(false);

    // Set countdown last to ensure UI updates properly
    setTimeout(() => {
      setCountdown(3);
    }, 0);

    // Reset restricted areas specific to level15
    setRestrictedAreas([
      { x: 2, y: 2, width: 3, height: 3 },
      { x: 15, y: 15, width: 3, height: 3 },
      { x: 2, y: 15, width: 3, height: 3 },
      { x: 15, y: 2, width: 3, height: 3 },
      { x: 8, y: 8, width: 4, height: 4 },
      { x: 2, y: 20, width: 3, height: 3 },
      { x: 15, y: 20, width: 3, height: 3 },
    ]);

    // Reset obstacles specific to level15
    setObstacles([
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 7, y: 7 },
      { x: 12, y: 8 },
      { x: 13, y: 13 },
    ]);
  };

  const handleGesture = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      const { translationX, translationY } = nativeEvent;
      if (Math.abs(translationX) > Math.abs(translationY)) {
        setDirection(translationX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
      } else {
        setDirection(translationY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
      }
    }
  };

  const animateScore = () => {
    setShowScoreBoost(true);
    scoreAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(scoreAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnimation, {
        toValue: 0,
        duration: 300,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowScoreBoost(false));
  };

  const showPowerToast = (text: string) => {
    setBoostText(text);
    animateScore();
  };

  // Keep power effects in sync with the active power-ups so each one ends
  // exactly when its timer runs out (fixes powers lingering after expiry).
  useEffect(() => {
    setIsShielded(activePowers.some((p) => p.type === "SHIELD"));
    setCanPassWalls(activePowers.some((p) => p.type === "WALL_PASS"));
    if (activePowers.some((p) => p.type === "SPEED_UP")) {
      setGameSpeed(Math.round(baseSpeed * 0.7));
    } else if (activePowers.some((p) => p.type === "SPEED_DOWN")) {
      setGameSpeed(Math.round(baseSpeed * 1.3));
    } else {
      setGameSpeed(baseSpeed);
    }
  }, [activePowers, baseSpeed]);

  const goToNextLevel = () => {
    setShowLevelComplete(false);
    router.replace(`/game-levels?level=${currentLevel + 1}`);
  };

  // Modify handlePowerUp to use timeouts that respect pause state
  const handlePowerUp = async (type: string) => {
    const powerInfo = GAME_ELEMENTS[type as keyof typeof GAME_ELEMENTS] as any;
    
    if (type === "SCORE_BOOST" && scoreBoostSound) {
      await playSound(scoreBoostSound);
    } else if (eatSound) {
      await playSound(eatSound);
    }

    const existingPower = activePowers.find(p => p.type === type);
    const remainingTime = existingPower ? existingPower.timeLeft : 0;
    const newDuration = powerInfo.duration || 15;
    const totalDuration = remainingTime + newDuration;

    switch (type) {
      case "SHIELD":
        setIsShielded(true);
        updatePowerDuration(type, totalDuration);
        break;
      case "SPEED_UP":
        setGameSpeed(INITIAL_GAME_SPEED * 0.7);
        updatePowerDuration(type, totalDuration);
        break;
      case "SPEED_DOWN":
        setGameSpeed(INITIAL_GAME_SPEED * 1.3);
        updatePowerDuration(type, totalDuration);
        break;
      case "SCORE_BOOST":
        setScore(prev => prev + 5);
        break;
      case "WALL_PASS":
        setCanPassWalls(true);
        updatePowerDuration(type, totalDuration);
        break;
    }

    showPowerToast(type === "SCORE_BOOST" ? "+5" : powerInfo.name);
  };

  // Update power expiration in updatePowerDuration
  const updatePowerDuration = (type: string, duration: number) => {
    setActivePowers(prev => {
      const existingPowerIndex = prev.findIndex(p => p.type === type);
      
      if (existingPowerIndex !== -1) {
        const updatedPowers = [...prev];
        updatedPowers[existingPowerIndex] = {
          ...updatedPowers[existingPowerIndex],
          timeLeft: duration
        };
        return updatedPowers;
      } else {
        return [...prev, { type, timeLeft: duration, startTime: Date.now() }];
      }
    });

    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
    }

    const timeoutId = setTimeout(() => {
      switch (type) {
        case "SHIELD":
          setIsShielded(false);
          break;
        case "SPEED_UP":
        case "SPEED_DOWN":
          setGameSpeed(INITIAL_GAME_SPEED);
          break;
        case "WALL_PASS":
          setCanPassWalls(false);
          break;
      }
      setActivePowers(prev => prev.filter(p => p.type !== type));
    }, duration * 1000);

    setPowerUpTimeout(timeoutId);
  };

  // Add pause handling
  useEffect(() => {
    if (isPaused) {
      // Store remaining time for each power when pausing
      setActivePowers((prev) =>
        prev.map((power) => ({
          ...power,
          pausedAt: Date.now(),
        }))
      );

      // Clear existing timeout
      if (powerUpTimeout) {
        clearTimeout(powerUpTimeout);
      }
    } else if (!isPaused && isPlaying) {
      // Resume powers with adjusted time
      setActivePowers((prev) =>
        prev.map((power) => {
          if (power.pausedAt) {
            const pauseDuration = Date.now() - power.pausedAt;
            return {
              ...power,
              timeLeft: power.timeLeft + Math.floor(pauseDuration / 1000),
              pausedAt: undefined,
            };
          }
          return power;
        })
      );

      // Recreate timeouts for active powers
      activePowers.forEach((power) => {
        if (power.timeLeft > 0) {
          const timeoutId = setTimeout(() => {
            switch (power.type) {
              case "SPEED_UP":
                setGameSpeed(140);
                break;
              case "SPEED_DOWN":
                setGameSpeed(140);
                break;
              case "WALL_PASS":
                setCanPassWalls(false);
                break;
            }
            setActivePowers((prev) =>
              prev.filter((p) => p.type !== power.type)
            );
          }, power.timeLeft * 1000);
          setPowerUpTimeout(timeoutId);
        }
      });
    }
  }, [isPaused, isPlaying]);

  const playSound = (sound: AudioPlayer) => {
    if (soundEffectsEnabled) {
      try {
        sound.seekTo(0);
        sound.play();
      } catch (error) {
        console.log("Error playing sound:", error);
      }
    }
  };

  const loadBestScore = async () => {
    try {
      const bestScore = await AsyncStorage.getItem(
        `@Level_${currentLevel}_BestScore`
      );
      if (bestScore) {
        setLevelBestScore(parseInt(bestScore));
      }
    } catch (error) {
      console.error("Error loading best score:", error);
    }
  };

  useEffect(() => {
    loadBestScore();
  }, [currentLevel]);

  const handleContinueGame = () => {
    setShowLevelComplete(false);
    setIsPlaying(true);
  };

  // Add continue game functionality
  const continueGame = async () => {
    const previousScore = lastScore;

    // Reset game state
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS.RIGHT);
    setFood(getValidFoodPosition());
    setIsGameOver(false);
    setIsPaused(false);
    setGameSpeed(baseSpeed);
    setCanPassWalls(false);
    setPowerUp(null);
    setActivePowers([]);

    // Restore the previous score
    setScore(previousScore);

    // Start countdown to resume game
    setCountdown(3);

    // Reset game started flag to ensure countdown works
    setHasGameStarted(false);

    // Start ad cooldown
    setAdCooldown(30);
    // try {
    //   if (!isAdLoaded) {
    //     return;
    //   }

    //   await showAd();
    //   console.log("Ad shown");
    // } catch (error) {
    //   console.log("Error showing ad:", error);
    // }
  };

  // Add effect for handling ad reward
  // useEffect(() => {
  //   if (hasRewarded) {
  //     const previousScore = lastScore;

  //     // Reset game state
  //     setSnake(INITIAL_SNAKE);
  //     setDirection(DIRECTIONS.RIGHT);
  //     setFood(getValidFoodPosition());
  //     setIsGameOver(false);
  //     setIsPaused(false);
  //     setGameSpeed(baseSpeed);
  //     setCanPassWalls(false);
  //     setPowerUp(null);
  //     setActivePowers([]);

  //     // Restore the previous score
  //     setScore(previousScore);

  //     // Start countdown to resume game
  //     setCountdown(3);

  //     // Reset game started flag to ensure countdown works
  //     setHasGameStarted(false);

  //     // Start ad cooldown
  //     setAdCooldown(30);
  //   }
  // }, [hasRewarded]);

  // Add effect for ad cooldown
  useEffect(() => {
    if (adCooldown > 0) {
      const timer = setInterval(() => {
        setAdCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adCooldown]);

  // Modify getValidFoodPosition to check for restricted areas
  const getValidFoodPosition = () => {
    let position: { x: number; y: number };
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      isInRestrictedArea(position) ||
      obstacles.some(
        (obstacle) =>
          obstacle.x === position.x &&
          obstacle.y === position.y
      ) ||
      snake.some(
        (segment) => segment.x === position.x && segment.y === position.y
      )
    );
    return position;
  };

  const [food, setFood] = useState(getValidFoodPosition());

  return (
    <View style={styles.container}>
        {/* Top bar: back · title · play/pause */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color={theme.white} />
          </TouchableOpacity>

          <Text style={styles.levelTitle}>Level {currentLevel}</Text>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={resumeGame}
            disabled={isGameOver}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={22}
              color={isGameOver ? theme.textMuted : theme.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>

          <View style={styles.headerPowersContainer}>
            {activePowers.map((power, index) => (
              <View key={`${power.type}-${index}`} style={styles.headerPower}>
                <MaterialCommunityIcons
                  name={POWER_ICONS[power.type]}
                  size={15}
                  color={theme.primary}
                />
                <Text style={styles.powerTimer}>{power.timeLeft}s</Text>
              </View>
            ))}
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statValue}>{highScore}</Text>
          </View>
        </View>

        <LevelProgressBar
          currentLevel={currentLevel}
          currentScore={score}
          pointsToNextLevel={POINTS_TO_NEXT_LEVEL}
        />

        {showScoreBoost && (
          <Animated.View
            style={[
              styles.scoreBoostContainer,
              {
                opacity: scoreAnimation,
                transform: [
                  {
                    translateY: scoreAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.scoreBoostText}>{boostText}</Text>
          </Animated.View>
        )}

        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown || "GO!"}</Text>
          </View>
        )}

        {isPaused && (
          <View style={styles.centerOverlay}>
            <Text style={styles.pausedText}>Paused</Text>
            <TouchableOpacity
              style={styles.bigPlayBtn}
              onPress={resumeGame}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={40} color={theme.background} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.gameContainer}>
          <PanGestureHandler onHandlerStateChange={handleGesture}>
            <View style={[styles.gameArea, canPassWalls && styles.gameAreaNoWall]}>
              {/* Add restricted areas visualization */}
              {restrictedAreas.map((area, index) => (
                <View
                  key={`restricted-${index}`}
                  style={[
                    styles.restrictedArea,
                    {
                      left: area.x * CELL_SIZE,
                      top: area.y * CELL_SIZE,
                      width: area.width * CELL_SIZE,
                      height: area.height * CELL_SIZE,
                    },
                  ]}
                >
                  <Text style={styles.restrictedEmoji}>{GAME_ELEMENTS.RESTRICTED}</Text>
                </View>
              ))}
              {snake.map((segment, index) => (
                <View
                  key={index}
                  style={[
                    styles.snakeSegment,
                    index === 0 ? styles.snakeHead : styles.snakeBody,
                    { left: segment.x * CELL_SIZE, top: segment.y * CELL_SIZE },
                  ]}
                />
              ))}
              {powerUp && (
                <View
                  style={[
                    styles.powerUp,
                    {
                      left: powerUp.position.x * CELL_SIZE,
                      top: powerUp.position.y * CELL_SIZE,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={POWER_ICONS[powerUp.type]}
                    size={CELL_SIZE}
                    color={theme.accent}
                  />
                </View>
              )}
              <View
                style={[
                  styles.food,
                  { left: food.x * CELL_SIZE, top: food.y * CELL_SIZE },
                ]}
              >
                <Text style={styles.emoji}>{GAME_ELEMENTS.FOOD}</Text>
              </View>
              {obstacles.map((obstacle, index) => (
                <View
                  key={`obstacle-${index}`}
                  style={[
                    styles.obstacle,
                    {
                      left: obstacle.x * CELL_SIZE,
                      top: obstacle.y * CELL_SIZE,
                    },
                  ]}
                >
                  <Text style={styles.emoji}>{GAME_ELEMENTS.OBSTACLE}</Text>
                </View>
              ))}
            </View>
          </PanGestureHandler>
        </View>

        <View style={styles.controls}>
          <Text style={styles.controlsText}>Swipe to control the snake</Text>
        </View>
        <LevelCompletionDialog
          visible={showLevelComplete}
          level={currentLevel}
          score={score}
          onContinue={handleContinueGame}
          onClose={() => setShowLevelComplete(false)}
          onNextLevel={goToNextLevel}
        />

        <GameOverModal
          visible={isGameOver}
          score={score}
          onRestart={restartGame}
          onContinue={continueGame}
          onHome={() => router.back()}
        />

        {!hasGameStarted && countdown === null && !isGameOver && !isPaused && (
          <View style={styles.centerOverlay}>
            <TouchableOpacity
              style={styles.bigPlayBtn}
              onPress={resumeGame}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={40} color={theme.background} />
            </TouchableOpacity>
            <Text style={styles.overlayHint}>Tap to start</Text>
          </View>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.whiteA10,
    alignItems: "center",
    justifyContent: "center",
  },
  levelTitle: {
    color: theme.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.whiteA10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    minWidth: SCREEN_WIDTH * 0.22,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  statValue: {
    color: theme.white,
    fontSize: 18,
    fontWeight: "800",
  },
  centerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    zIndex: 60,
  },
  bigPlayBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayHint: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.01,
    height: SCREEN_HEIGHT * 0.08,
  },
  scoreCard: {
    backgroundColor: theme.whiteA10,
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: 12,
    alignItems: "center",
    minWidth: SCREEN_WIDTH * 0.2,
  },
  scoreTitle: {
    color: theme.textMuted,
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: "600",
    marginBottom: 2,
  },
  scoreValue: {
    color: theme.white,
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
  },
  pauseButton: {
    padding: 10,
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: -SCREEN_HEIGHT * 0.02,
  },
  gameArea: {
    width: GRID_SIZE * CELL_SIZE + 6,
    height: GRID_SIZE * CELL_SIZE * 1.4 + 6,
    backgroundColor: theme.surface,
    borderRadius: 10,
    position: "relative",
    borderWidth: 3,
    borderColor: theme.wall,
    overflow: "hidden",
    transform: [{ scale: GAME_AREA_SCALE * 0.9 }],
  },
  gameAreaNoWall: {
    borderColor: "transparent",
  },
  snakeSegment: {
    position: "absolute",
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  snakeHead: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.background,
    zIndex: 10,
  },
  snakeBody: {
    backgroundColor: theme.primaryDark,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.background,
  },
  food: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    width: CELL_SIZE + 2.5,
    height: CELL_SIZE + 4,
    fontSize: CELL_SIZE - 2,
    lineHeight: CELL_SIZE,
  },
  controls: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  controlsText: {
    color: theme.whiteA60,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  gameButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
  },
  buttonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: "700",
  },
  powerUp: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  powerEmoji: {
    fontSize: SCREEN_WIDTH * 0.04,
    lineHeight: SCREEN_WIDTH * 0.04,
    textAlign: 'center',
  },
  powerTimer: {
    color: theme.primary,
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: "bold",
    minWidth: SCREEN_WIDTH * 0.06,
    textAlign: 'center',
  },
  powerUpEmoji: {
    fontSize: SCREEN_WIDTH * 0.04,
    lineHeight: SCREEN_WIDTH * 0.04,
    textAlign: 'center',
  },
  scoreBoostContainer: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    zIndex: 1000,
    backgroundColor: theme.overlay,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.primaryA50,
  },
  scoreBoostText: {
    color: theme.primary,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: theme.overlayMedium,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  countdownText: {
    color: theme.primary,
    fontSize: 72,
    fontWeight: "bold",
  },
  obstacle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  pausedText: {
    color: theme.primary,
    fontSize: 48,
    fontWeight: "bold",
  },
  headerPowersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  headerPower: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.overlay,
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4,
  },
  restrictedArea: {
    position: 'absolute',
    backgroundColor: theme.hazardA20,
    borderWidth: 1,
    borderColor: theme.hazardA50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictedEmoji: {
    fontSize: 20,
    opacity: 0.7,
  },
});

export default Level15; 
