import { theme } from "@/constants/theme";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useLevelSounds } from "@/hooks/useLevelSounds";
import type { AudioPlayer } from "expo-audio";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, DIFFICULTY_SPEEDS } from "../app/(tabs)/settings";
import LevelProgressBar from "../components/LevelProgressBar";
import LevelCompletionDialog from "../components/LevelCompletionDialog";
import LevelInfoModal from "@/components/LevelInfoModal";
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

// Update GAME_ELEMENTS with power names
const GAME_ELEMENTS = {
  SNAKE_HEAD: "🟢",
  SNAKE_BODY: "🟩",
  FOOD: "🍎",
  SPEED_UP: { emoji: "⚡", name: "Speed Boost", size: 20 },
  SPEED_DOWN: { emoji: "🐌", name: "Slow Down", size: `18` },
  SCORE_BOOST: { emoji: "💫", name: "Score +5", size: 18 },
  WALL_PASS: { emoji: "🌈", name: "Wall Pass", size: 18 },
  OBSTACLE: "🧱",
};

// Keep level8's base speed
const INITIAL_GAME_SPEED = 170;

const Level8 = () => {
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
  const [currentLevel, setCurrentLevel] = useState(8);
  const POINTS_TO_NEXT_LEVEL = 20;
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelBestScore, setLevelBestScore] = useState(0);
  const [hasShownLevelComplete, setHasShownLevelComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(true);
  // const { showAd, isAdLoaded, hasRewarded } = useRewardedAd();
  const [lastScore, setLastScore] = useState(0);
  const [adCooldown, setAdCooldown] = useState(0);
  const [baseSpeed, setBaseSpeed] = useState(INITIAL_GAME_SPEED); // Track original speed separately

  // Keep level8's obstacles with slower speeds
  const [obstacles, setObstacles] = useState([
    // Two vertical moving obstacles with slower speeds
    { x: 5, y: 5, direction: { x: 0, y: 1 }, speed: 0.8 },
    { x: 15, y: 5, direction: { x: 0, y: 1 }, speed: 0.8 },

    // Two horizontal moving obstacles with slower speeds
    { x: 8, y: 15, direction: { x: 1, y: 0 }, speed: 0.8 },
    { x: 12, y: 8, direction: { x: -1, y: 0 }, speed: 0.8 },

    // Only two strategic stationary obstacles
    { x: 2, y: 2, direction: { x: 0, y: 0 } },
    { x: 18, y: 18, direction: { x: 0, y: 0 } },
  ]);


  const loadSettings = async () => {
    try {
      const [difficultyValue, soundEffectsValue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DIFFICULTY),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_EFFECTS),
      ]);

      if (difficultyValue) {
        setGameSpeed(
          DIFFICULTY_SPEEDS[difficultyValue as keyof typeof DIFFICULTY_SPEEDS]
        );
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
          const types = ["SPEED_UP", "SPEED_DOWN", "SCORE_BOOST", "WALL_PASS"];
          const randomType = types[Math.floor(Math.random() * types.length)];
          setPowerUp({
            type: randomType,
            position: getValidFoodPosition(),
          });

          setTimeout(() => {
            setPowerUp(null);
          }, 20000);
        }
      };

      const interval = setInterval(spawnPowerUp, 12000);
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
    setShowLevelInfo(true);
    setCountdown(null);
    setIsPlaying(false);
  }, []);

  // Keep level8's obstacle movement logic
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const moveObstacles = setInterval(() => {
      setObstacles((currentObstacles) =>
        currentObstacles.map((obstacle) => {
          // Skip movement for stationary obstacles
          if (obstacle.direction.x === 0 && obstacle.direction.y === 0) {
            return obstacle;
          }

          let newX = obstacle.x + obstacle.direction.x * (obstacle.speed || 1);
          let newY = obstacle.y + obstacle.direction.y * (obstacle.speed || 1);

          // Enhanced bounce logic for diagonal movement
          if (newX < 0 || newX >= GRID_SIZE) {
            obstacle.direction.x *= -1;
            newX = obstacle.x + obstacle.direction.x * (obstacle.speed || 1);
          }
          if (newY < 0 || newY >= GRID_SIZE * 1.4) {
            obstacle.direction.y *= -1;
            newY = obstacle.y + obstacle.direction.y * (obstacle.speed || 1);
          }

          return { ...obstacle, x: newX, y: newY };
        })
      );
    }, gameSpeed); // Removed multiplier for maximum speed challenge

    return () => clearInterval(moveObstacles);
  }, [isPlaying, isPaused]);

  // Modify moveSnake to handle moving obstacles
  const moveSnake = async () => {
    const newSnake = [...snake];
    let head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y,
    };

    // Check for obstacle collision with snake head only
    const hitObstacle = obstacles.some((obstacle) => {
      // Use a more precise collision detection
      const distance =
        Math.abs(obstacle.x - head.x) + Math.abs(obstacle.y - head.y);
      return distance < 1; // If distance is less than 1, it means they're occupying the same cell
    });

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

    // Reset obstacles to level8's specific pattern
    setObstacles([
      // Two vertical moving obstacles with slower speeds
      { x: 5, y: 5, direction: { x: 0, y: 1 }, speed: 0.8 },
      { x: 15, y: 5, direction: { x: 0, y: 1 }, speed: 0.8 },

      // Two horizontal moving obstacles with slower speeds
      { x: 8, y: 15, direction: { x: 1, y: 0 }, speed: 0.8 },
      { x: 12, y: 8, direction: { x: -1, y: 0 }, speed: 0.8 },

      // Only two strategic stationary obstacles
      { x: 2, y: 2, direction: { x: 0, y: 0 } },
      { x: 18, y: 18, direction: { x: 0, y: 0 } },
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

  // Modify handlePowerUp to use timeouts that respect pause state
  const handlePowerUp = async (type: string) => {
    // Clear any existing timeout first
    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
      setPowerUpTimeout(null);
    }

    const playPowerUpSound = async () => {
      if (type === "SCORE_BOOST") {
        await playSound(scoreBoostSound);
      } else {
        await playSound(eatSound);
      }
    };

    // For SCORE_BOOST, we don't need to remove existing powers
    if (type !== "SCORE_BOOST") {
      setActivePowers((prev) => prev.filter((p) => p.type !== type));
    }

    switch (type) {
      case "SPEED_UP":
        setGameSpeed(Math.round(baseSpeed * 0.5)); // 50% faster
        setActivePowers((prev) => {
          const filtered = prev.filter((p) => p.type !== "SPEED_DOWN");
          return [...filtered, { type, timeLeft: 15, startTime: Date.now() }];
        });
        await playPowerUpSound();
        break;
      case "SPEED_DOWN":
        setGameSpeed(Math.round(baseSpeed * 1.6)); // 60% slower
        setActivePowers((prev) => {
          const filtered = prev.filter((p) => p.type !== "SPEED_UP");
          return [...filtered, { type, timeLeft: 15, startTime: Date.now() }];
        });
        await playPowerUpSound();
        break;
      case "SCORE_BOOST":
        setScore((prev) => prev + 5);
        animateScore();
        await playPowerUpSound();
        break;
      case "WALL_PASS":
        setCanPassWalls(true);
        setActivePowers((prev) => [
          ...prev,
          { type, timeLeft: 15, startTime: Date.now() },
        ]);
        await playPowerUpSound();
        break;
    }

    // Set timeout for power-up expiration (except SCORE_BOOST which is instant)
    if (type !== "SCORE_BOOST") {
      const timeoutId = setTimeout(() => {
        setActivePowers((prev) => {
          const updatedPowers = prev.filter((p) => p.type !== type);
          // If no wall pass powers are active, disable wall passing
          if (
            type === "WALL_PASS" &&
            !updatedPowers.some((p) => p.type === "WALL_PASS")
          ) {
            setCanPassWalls(false);
          }
          // If no speed powers are active, reset speed
          if (
            (type === "SPEED_UP" || type === "SPEED_DOWN") &&
            !updatedPowers.some(
              (p) => p.type === "SPEED_UP" || p.type === "SPEED_DOWN"
            )
          ) {
            setGameSpeed(baseSpeed);
          }
          return updatedPowers;
        });
      }, 15000);
      setPowerUpTimeout(timeoutId);
    }
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

  const handleStartGame = () => {
    setShowLevelInfo(false);
    if (!hasGameStarted) {
      setCountdown(3);
    }
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

  // Keep level8's getValidFoodPosition helper
  const getValidFoodPosition = () => {
    let position: { x: number; y: number };
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      // Check against static obstacles (those with no movement direction)
      obstacles?.some(
        (obstacle) =>
          obstacle.x === position.x &&
          obstacle.y === position.y &&
          obstacle.direction.x === 0 &&
          obstacle.direction.y === 0
      ) ||
      snake.some(
        (segment) => segment.x === position.x && segment.y === position.y
      )
    );
    return position;
  };

  const [food, setFood] = useState(getValidFoodPosition());

  return (
    <TouchableWithoutFeedback onPress={() => resumeGame()}>
      <View style={styles.container}>
        <LevelInfoModal
          visible={showLevelInfo}
          level={currentLevel}
          onStart={handleStartGame}
          onClose={() => {
            handleStartGame();
            setShowLevelInfo(false);
          }}
        />

        {/* Game Header */}
        <View style={styles.header}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          {/* Power ups counter in header */}
          <View style={styles.headerPowersContainer}>
            {activePowers.map((power, index) => (
              <View key={`${power.type}-${index}`} style={styles.headerPower}>
                <Text style={styles.powerEmoji}>
                  {
                    (
                      GAME_ELEMENTS[
                        power.type as keyof typeof GAME_ELEMENTS
                      ] as any
                    ).emoji
                  }
                </Text>
                <Text style={styles.powerTimer}>{power.timeLeft}s</Text>
              </View>
            ))}
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Best</Text>
            <Text style={styles.scoreValue}>{highScore}</Text>
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
            <Text style={styles.scoreBoostText}>+5</Text>
          </Animated.View>
        )}

        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        {isPaused && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.pausedText}>PAUSED</Text>
          </View>
        )}

        <View style={styles.gameContainer}>
          <PanGestureHandler onHandlerStateChange={handleGesture}>
            <View style={styles.gameArea}>
              {snake.map((segment, index) => (
                <View
                  key={index}
                  style={[
                    styles.snake,
                    index === 0 ? styles.snakeHead : styles.snakeBody,
                    { left: segment.x * CELL_SIZE, top: segment.y * CELL_SIZE },
                  ]}
                >
                  <Text style={styles.emoji}>
                    {index === 0
                      ? GAME_ELEMENTS.SNAKE_HEAD
                      : GAME_ELEMENTS.SNAKE_BODY}
                  </Text>
                </View>
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
                  <Text style={styles.powerEmoji}>
                    {
                      (
                        GAME_ELEMENTS[
                          powerUp.type as keyof typeof GAME_ELEMENTS
                        ] as any
                      ).emoji
                    }
                  </Text>
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
          {!isPlaying && !countdown && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.gameButton} onPress={restartGame}>
                <Ionicons name="refresh" size={24} color={theme.white} />
                <Text style={styles.buttonText}>Restart</Text>
              </TouchableOpacity>

              {isGameOver && (
                <TouchableOpacity
                  style={[
                    styles.gameButton,
                    // (!isAdLoaded || adCooldown > 0) && { opacity: 0.5 },
                  ]}
                  onPress={continueGame}
                  // disabled={!isAdLoaded || adCooldown > 0}
                >
                  <Ionicons name="play" size={24} color={theme.white} />
                  <Text style={styles.buttonText}>
                    Continue ({lastScore})
                    {/* {adCooldown > 0 && ` (${adCooldown}s)`} */}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <LevelCompletionDialog
          visible={showLevelComplete}
          level={currentLevel}
          score={score}
          onContinue={handleContinueGame}
          onClose={() => setShowLevelComplete(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: SCREEN_HEIGHT * 0.05,
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
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE * 1.4,
    backgroundColor: theme.surface,
    borderRadius: 8,
    position: "relative",
    borderWidth: 0,
    borderColor: theme.whiteA10,
    overflow: "hidden",
    transform: [{ scale: GAME_AREA_SCALE * 0.9 }],
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
  },
  snake: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  snakeHead: {
    backgroundColor: "transparent",
  },
  snakeBody: {
    backgroundColor: "transparent",
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
    textAlign: "center",
  },
  scoreBoostContainer: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    zIndex: 1000,
  },
  scoreBoostText: {
    color: theme.primary,
    fontSize: 48,
    fontWeight: "bold",
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
});

export default Level8;
