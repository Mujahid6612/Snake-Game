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
import GameCompletionModal from "@/components/GameCompletionModal";
import { router } from "expo-router";
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

// Update GAME_ELEMENTS to remove MAGNET
const GAME_ELEMENTS = {
  SNAKE_HEAD: "🟢",
  SNAKE_BODY: "🟩",
  FOOD: "🍎",
  OBSTACLE: "🧱",
  SPEED_UP: { emoji: "⚡", name: "Speed Boost", size: 20, duration: 8 },
  SPEED_DOWN: { emoji: "🐌", name: "Slow Down", size: 18, duration: 10 },
  SCORE_BOOST: { emoji: "💫", name: "Score +5", size: 18, duration: 12 },
  WALL_PASS: { emoji: "🌈", name: "Wall Pass", size: 18, duration: 6 },
  SHIELD: { emoji: "🛡️", name: "Shield", size: 18, duration: 20 },
  RESTRICTED: "🚫",
};

const Level20 = () => {
  const INITIAL_GAME_SPEED = 70; // Keep speed at 7

  // Reset to original speed of 60
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);

  // Update initial game state
  const [snakes, setSnakes] = useState([
    INITIAL_SNAKE, // Player snake
    [{ x: 15, y: 15 }], // Enemy snake
  ]);

  // Reduce restricted areas
  const [restrictedAreas, setRestrictedAreas] = useState([
    { x: 2, y: 2, width: 3, height: 3 },
    { x: 15, y: 15, width: 3, height: 3 },
    { x: 8, y: 8, width: 4, height: 4 },
    { x: 3, y: 22, width: 4, height: 3 },
    { x: 13, y: 24, width: 4, height: 3 },
    { x: 1, y: 12, width: 3, height: 4 }, // Left middle
    { x: 16, y: 7, width: 3, height: 4 }, // Right upper
    { x: 7, y: 16, width: 4, height: 3 }, // Center lower
    { x: 11, y: 1, width: 3, height: 3 }, // Top right
    { x: 18, y: 20, width: 2, height: 4 }, // Bottom right
  ]);

  // Add enemy snake direction state
  const [enemyDirection, setEnemyDirection] = useState(DIRECTIONS.LEFT);

  // Function to get random direction
  const getRandomDirection = () => {
    const directions = [
      DIRECTIONS.UP,
      DIRECTIONS.DOWN,
      DIRECTIONS.LEFT,
      DIRECTIONS.RIGHT,
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  // Function to check if position is valid for enemy snake
  const isValidEnemyPosition = (position: { x: number; y: number }) => {
    return !(
      position.x < 0 ||
      position.x >= GRID_SIZE ||
      position.y < 0 ||
      position.y >= GRID_SIZE * 1.4 ||
      isInRestrictedArea(position)
    );
  };

  // Update initial obstacles to be static
  const [obstacles, setObstacles] = useState([
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 7, y: 7 },
    { x: 12, y: 8 },
    { x: 13, y: 13 },
  ]);

  // Add helper function to check if position is in restricted area
  const isInRestrictedArea = (position: { x: number; y: number }) => {
    return restrictedAreas.some(
      (area) =>
        position.x >= area.x &&
        position.x < area.x + area.width &&
        position.y >= area.y &&
        position.y < area.y + area.height
    );
  };

  // Now we can use isInRestrictedArea in getValidFoodPosition
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
        (obstacle) => obstacle.x === position.x && obstacle.y === position.y
      ) ||
      snakes.some(
        (segment: any) => segment.x === position.x && segment.y === position.y
      )
    );
    return position;
  };

  const [directions, setDirections] = useState([
    DIRECTIONS.RIGHT, // First snake
    DIRECTIONS.LEFT, // Second snake
  ]);

  const [food, setFood] = useState(getValidFoodPosition());
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const { eatSound, gameOverSound, scoreBoostSound } = useLevelSounds();
  const [powerUp, setPowerUp] = useState<null | {
    type: string;
    position: { x: number; y: number };
  }>(null);
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
  const [currentLevel, setCurrentLevel] = useState(20);
  const POINTS_TO_NEXT_LEVEL = 30;
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelBestScore, setLevelBestScore] = useState(0);
  const [hasShownLevelComplete, setHasShownLevelComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(true);
  const [isShielded, setIsShielded] = useState(false);
  const [obstaclesFrozen, setObstaclesFrozen] = useState(false);
  const [showGameCompletion, setShowGameCompletion] = useState(false);
  const [hasShownGameCompletion, setHasShownGameCompletion] = useState(false);
  // const { showAd, isAdLoaded, hasRewarded } = useRewardedAd();
  const [lastScore, setLastScore] = useState(0);
  const [adCooldown, setAdCooldown] = useState(0);
  const [baseSpeed, setBaseSpeed] = useState(INITIAL_GAME_SPEED);


  const loadSettings = async () => {
    try {
      const [difficultyValue, soundEffectsValue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DIFFICULTY),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_EFFECTS),
      ]);

      if (difficultyValue) {
        // Keep base speed for EASY, apply multiplier for MEDIUM and HARD
        const speedMultiplier = {
          EASY: 1,
          MEDIUM: 0.85, // 15% faster
          HARD: 0.7, // 30% faster
        }[difficultyValue as keyof typeof DIFFICULTY_SPEEDS];

        setGameSpeed(INITIAL_GAME_SPEED * speedMultiplier);
      } else {
        setGameSpeed(INITIAL_GAME_SPEED);
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
  }, [snakes, isPlaying, directions, isPaused, gameSpeed]);

  useEffect(() => {
    if (isPlaying) {
      const spawnPowerUp = () => {
        if (Math.random() < 0.8) {
          const types = [
            "SPEED_UP",
            "SPEED_DOWN",
            "SCORE_BOOST",
            "WALL_PASS",
            "SHIELD", // Removed TIME_FREEZE
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

  // Helper function to update power duration
  const updatePowerDuration = (type: string, duration: number) => {
    setActivePowers((prev) => {
      const existingPowerIndex = prev.findIndex((p) => p.type === type);

      if (existingPowerIndex !== -1) {
        // Update existing power duration
        const updatedPowers = [...prev];
        updatedPowers[existingPowerIndex] = {
          ...updatedPowers[existingPowerIndex],
          timeLeft: duration,
          startTime: Date.now(),
        };
        return updatedPowers;
      } else {
        // Add new power
        return [
          ...prev,
          {
            type,
            timeLeft: duration,
            startTime: Date.now(),
            initialDuration: duration,
          },
        ];
      }
    });

    // Clear existing timeout for this power type
    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      switch (type) {
        case "SPEED_UP":
        case "SPEED_DOWN":
          setGameSpeed(INITIAL_GAME_SPEED); // Reset to initial speed
          break;
        case "WALL_PASS":
          setCanPassWalls(false);
          break;
        case "SHIELD":
          setIsShielded(false);
          break;
      }
      setActivePowers((prev) => prev.filter((p) => p.type !== type));
    }, duration * 1000);

    setPowerUpTimeout(timeoutId);
  };

  // Modified handlePowerUp to handle stacking durations
  const handlePowerUp = async (type: string) => {
    const powerInfo = GAME_ELEMENTS[type as keyof typeof GAME_ELEMENTS] as any;
    await playSound(type === "SCORE_BOOST" ? scoreBoostSound : eatSound);

    // Check if power already exists and get remaining time
    const existingPower = activePowers.find((p) => p.type === type);
    const remainingTime = existingPower ? existingPower.timeLeft : 0;
    const newDuration = powerInfo.duration || 15; // Use power-specific duration or default to 15
    const totalDuration = remainingTime + newDuration;

    switch (type) {
      case "SPEED_UP":
        setGameSpeed((prevSpeed) => prevSpeed * 0.7); // 30% faster
        updatePowerDuration(type, totalDuration);
        break;

      case "SPEED_DOWN":
        setGameSpeed((prevSpeed) => prevSpeed * 1.3); // 30% slower
        updatePowerDuration(type, totalDuration);
        break;

      case "SCORE_BOOST":
        setScore((prev) => prev + 5);
        animateScore();
        break;

      case "WALL_PASS":
        setCanPassWalls(true);
        updatePowerDuration(type, totalDuration);
        break;

      case "SHIELD":
        setIsShielded(true);
        updatePowerDuration(type, totalDuration);
        break;
    }
  };

  // Modified power-up countdown effect
  useEffect(() => {
    if (activePowers.length > 0 && !isPaused && isPlaying) {
      const interval = setInterval(() => {
        setActivePowers((prev) => {
          const updatedPowers = prev.map((power) => ({
            ...power,
            timeLeft: power.timeLeft - 1,
          }));

          // Handle power-up expiration
          const expiredPowers = updatedPowers.filter(
            (power) => power.timeLeft <= 0
          );
          const remainingPowers = updatedPowers.filter(
            (power) => power.timeLeft > 0
          );

          // Reset effects for expired powers
          expiredPowers.forEach((power) => {
            switch (power.type) {
              case "SPEED_UP":
              case "SPEED_DOWN":
                setGameSpeed(INITIAL_GAME_SPEED); // Reset to base speed
                break;
              case "WALL_PASS":
                setCanPassWalls(false);
                break;
              case "SHIELD":
                setIsShielded(false);
                break;
            }
          });

          return remainingPowers;
        });
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
    if (score >= POINTS_TO_NEXT_LEVEL && !hasShownGameCompletion) {
      setShowGameCompletion(true);
      setIsPlaying(false);
      setHasShownGameCompletion(true);

      // Save final score
      if (score > levelBestScore) {
        setLevelBestScore(score);
        AsyncStorage.setItem(
          `@Level_${currentLevel}_BestScore`,
          score.toString()
        );
      }

      // Mark game as completed
      AsyncStorage.setItem("@Game_Completed", "true");
    }
  }, [score, hasShownGameCompletion]);

  useEffect(() => {
    setShowLevelInfo(true);
    setCountdown(null);
    setIsPlaying(false);
  }, []);

  const moveSnake = async () => {
    // Move player snake
    const playerSnake = [...snakes[0]];
    let playerHead = { ...playerSnake[0] };
    playerHead.x += directions[0].x;
    playerHead.y += directions[0].y;

    // Move enemy snake
    const enemySnake = [...snakes[1]];
    let enemyHead = { ...enemySnake[0] };

    // Try to move enemy in current direction
    let newEnemyHead = {
      x: enemyHead.x + enemyDirection.x,
      y: enemyHead.y + enemyDirection.y,
    };

    // If invalid position, choose new random direction
    if (!isValidEnemyPosition(newEnemyHead)) {
      let newDirection;
      let attempts = 0;
      do {
        newDirection = getRandomDirection();
        newEnemyHead = {
          x: enemyHead.x + newDirection.x,
          y: enemyHead.y + newDirection.y,
        };
        attempts++;
      } while (!isValidEnemyPosition(newEnemyHead) && attempts < 4);

      setEnemyDirection(newDirection);
    }

    enemyHead = newEnemyHead;

    // Check for collisions with enemy snake - FIXED COLLISION DETECTION
    if (
      !isShielded &&
      // Check collision with enemy head
      ((playerHead.x === enemyHead.x && playerHead.y === enemyHead.y) ||
        // Check collision with enemy body
        enemySnake.some(
          (segment) => playerHead.x === segment.x && playerHead.y === segment.y
        ))
    ) {
      setIsGameOver(true);
      await gameOver();
      return;
    }

    // Rest of collision checks
    if (isInRestrictedArea(playerHead) && !isShielded) {
      setIsGameOver(true);
      await gameOver();
      return;
    }

    const hitObstacle = obstacles.some(
      (obstacle) =>
        obstacle.x === playerHead.x &&
        obstacle.y === playerHead.y &&
        !isShielded
    );

    if (hitObstacle) {
      setIsGameOver(true);
      await gameOver();
      return;
    }

    // Wall collision checks
    if (canPassWalls) {
      if (playerHead.x < 0) playerHead.x = GRID_SIZE - 1;
      if (playerHead.x >= GRID_SIZE) playerHead.x = 0;
      if (playerHead.y < 0) playerHead.y = GRID_SIZE * 1.4 - 1;
      if (playerHead.y >= GRID_SIZE * 1.4) playerHead.y = 0;
    } else if (
      playerHead.x < 0 ||
      playerHead.x >= GRID_SIZE ||
      playerHead.y < 0 ||
      playerHead.y >= GRID_SIZE * 1.4
    ) {
      setIsGameOver(true);
      await gameOver();
      return;
    }

    playerSnake.unshift(playerHead);
    enemySnake.unshift(enemyHead);

    // Food collision
    if (playerHead.x === food.x && playerHead.y === food.y) {
      if (soundEffectsEnabled && eatSound) {
        try {
          eatSound.seekTo(0);
          eatSound.play();
        } catch (error) {
          console.log("Error playing sound:", error);
        }
      }
      setFood(getValidFoodPosition());
      setScore(score + 1);
      if (score + 1 > highScore) {
        setHighScore(score + 1);
      }
    } else {
      playerSnake.pop();
    }

    // Power-up collision
    if (
      powerUp &&
      playerHead.x === powerUp.position.x &&
      playerHead.y === powerUp.position.y
    ) {
      await handlePowerUp(powerUp.type);
      setPowerUp(null);
    }

    // Enemy snake always maintains its length
    enemySnake.pop();

    setSnakes([playerSnake, enemySnake]);
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
    setIsShielded(false);
    setPowerUp(null);
    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
      setPowerUpTimeout(null);
    }
    setActivePowers([]);
    setIsPaused(false);
  };

  const restartGame = () => {
    loadSettings(); // This will set the correct initial speed based on difficulty
    setSnakes([
      INITIAL_SNAKE, // Player snake
      [{ x: 15, y: 15 }], // Enemy snake
    ]);
    setDirections([DIRECTIONS.RIGHT, DIRECTIONS.LEFT]);
    setFood(getValidFoodPosition());
    setScore(0);
    setIsPaused(false);

    if (!hasGameStarted) {
      setCountdown(3);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }

    // Reset all power-related states
    setCanPassWalls(false);
    setIsShielded(false);
    setPowerUp(null);
    setActivePowers([]);
    if (powerUpTimeout) {
      clearTimeout(powerUpTimeout);
      setPowerUpTimeout(null);
    }
    setHasShownGameCompletion(false);
    setIsGameOver(false);

    // Reset enemy direction
    setEnemyDirection(DIRECTIONS.LEFT);

    // Reset obstacles with level-specific configuration
    setObstacles([
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 7, y: 7 },
      { x: 12, y: 8 },
      { x: 13, y: 13 },
    ]);

    // Reset restricted areas with new configuration
    setRestrictedAreas([
      { x: 2, y: 2, width: 3, height: 3 },
      { x: 15, y: 15, width: 3, height: 3 },
      { x: 8, y: 8, width: 4, height: 4 },
      { x: 3, y: 22, width: 4, height: 3 },
      { x: 13, y: 24, width: 4, height: 3 },
      { x: 1, y: 12, width: 3, height: 4 },
      { x: 16, y: 7, width: 3, height: 4 },
      { x: 7, y: 16, width: 4, height: 3 },
      { x: 11, y: 1, width: 3, height: 3 },
      { x: 18, y: 20, width: 2, height: 4 },
    ]);

    setShowGameCompletion(false);
  };

  const handleGesture = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      const { translationX, translationY } = nativeEvent;
      const newDirections = [...directions];

      if (Math.abs(translationX) > Math.abs(translationY)) {
        newDirections[0] =
          translationX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
      } else {
        newDirections[0] = translationY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
      }

      setDirections(newDirections);
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
                setGameSpeed(INITIAL_GAME_SPEED);
                break;
              case "SPEED_DOWN":
                setGameSpeed(INITIAL_GAME_SPEED);
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

  const handleCloseGameCompletion = () => {
    setShowGameCompletion(false);
    setIsPlaying(false);
  };

  // Add continue game functionality from level17
  const continueGame = async () => {
    const previousScore = lastScore;

    // Reset game state
    setSnakes([
      INITIAL_SNAKE,  // Player snake
      [{ x: 15, y: 15 }]  // Enemy snake
    ]);
    setDirections([
      DIRECTIONS.RIGHT,  // First snake
      DIRECTIONS.LEFT   // Second snake
    ]);
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

  // Add effect for handling ad reward from level17
  // useEffect(() => {
  //   if (hasRewarded) {
  //     const previousScore = lastScore;

  //     // Reset game state
  //     setSnakes([
  //       INITIAL_SNAKE,  // Player snake
  //       [{ x: 15, y: 15 }]  // Enemy snake
  //     ]);
  //     setDirections([
  //       DIRECTIONS.RIGHT,  // First snake
  //       DIRECTIONS.LEFT   // Second snake
  //     ]);
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

  // Add effect for ad cooldown from level17
  useEffect(() => {
    if (adCooldown > 0) {
      const timer = setInterval(() => {
        setAdCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [adCooldown]);

  return (
    <TouchableWithoutFeedback onPress={() => resumeGame()}>
      <View style={styles.container}>
        {/* Add LevelInfoModal */}
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

        {/* Add Level Progress Bar below header */}
        <LevelProgressBar
          currentLevel={currentLevel}
          currentScore={score}
          pointsToNextLevel={POINTS_TO_NEXT_LEVEL}
        />

        {/* Score Boost Animation */}
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

        {/* Add countdown overlay */}
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        {/* Add pause overlay */}
        {isPaused && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.pausedText}>PAUSED</Text>
          </View>
        )}

        {/* Game Area */}
        <View style={styles.gameContainer}>
          <PanGestureHandler onHandlerStateChange={handleGesture}>
            <View style={styles.gameArea}>
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
                  <Text style={styles.restrictedEmoji}>
                    {GAME_ELEMENTS.RESTRICTED}
                  </Text>
                </View>
              ))}

              {/* Add obstacles */}
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

              {snakes.map((snake, snakeIndex) =>
                snake.map((segment, index) => (
                  <View
                    key={`snake-${snakeIndex}-${index}`}
                    style={[
                      styles.snake,
                      index === 0 ? styles.snakeHead : styles.snakeBody,
                      {
                        left: segment.x * CELL_SIZE,
                        top: segment.y * CELL_SIZE,
                      },
                    ]}
                  >
                    <Text style={styles.emoji}>
                      {snakeIndex === 1
                        ? "💀" // Enemy snake emoji
                        : index === 0
                        ? GAME_ELEMENTS.SNAKE_HEAD
                        : GAME_ELEMENTS.SNAKE_BODY}
                    </Text>
                  </View>
                ))
              )}
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
                  <Text style={styles.powerUpEmoji}>
                    {
                      (
                        GAME_ELEMENTS[
                          powerUp.type as keyof typeof GAME_ELEMENTS
                        ] as any
                      )?.emoji
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
            </View>
          </PanGestureHandler>
        </View>

        {/* Game Controls */}
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

        <GameCompletionModal
          visible={showGameCompletion}
          onClose={() => {
            setShowGameCompletion(false);
          }}
          finalScore={score}
          onRestart={() => {
            router.replace("/(tabs)");
          }}
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
  activePowersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 40,
    marginBottom: -40,
    padding: 10,
  },
  activePower: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.whiteA10,
    padding: 8,
    borderRadius: 20,
    gap: 8,
  },
  powerEmoji: {
    fontSize: SCREEN_WIDTH * 0.04,
    lineHeight: SCREEN_WIDTH * 0.04,
    textAlign: 'center',
  },
  powerName: {
    color: theme.white,
    fontSize: 14,
    fontWeight: "600",
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
    left: "50%",
    zIndex: 10,
    transform: [{ translateX: -25 }], // Center horizontally
  },
  scoreBoostText: {
    color: theme.primary,
    fontSize: 32,
    fontWeight: "bold",
    textShadowColor: theme.overlayMedium,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  pausedText: {
    color: theme.primary,
    fontSize: 48,
    fontWeight: "bold",
  },
  obstacle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  restrictedArea: {
    position: "absolute",
    backgroundColor: theme.hazardA20,
    borderWidth: 1,
    borderColor: theme.hazardA50,
    justifyContent: "center",
    alignItems: "center",
  },
  restrictedEmoji: {
    fontSize: CELL_SIZE - 2,
    opacity: 0.7,
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

export default Level20;
