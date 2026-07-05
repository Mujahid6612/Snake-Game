import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LevelInfoModalProps {
  visible: boolean;
  level: number;
  onStart: () => void;
  onClose: () => void;
}

// This could be moved to a separate config file if it grows larger
const LEVEL_INFO = {
  1: {
    title: "Welcome to Level 1",
    description: "Get started with the basics! In this level, you'll need to:",
    challenges: [
      "Collect apples to grow your snake",
      "Score 80 points to complete the level",
      "Watch out for walls - hitting them means game over!",
      "Collect power-ups to gain special abilities",
    ],
  },
  2: {
    title: "Level 2: First Obstacles",
    description:
      "Time to face some obstacles! In this level, you'll encounter:",
    challenges: [
      "Navigate around stationary obstacles",
      "Score 70 points to complete the level",
      "Master the use of power-ups",
      "Keep an eye on your power-up timers",
    ],
  },
  3: {
    title: "Level 3: Maze Runner",
    description: "The challenge increases with more obstacles! Your tasks:",
    challenges: [
      "Navigate through a maze-like environment",
      "Score 60 points to advance",
      "Use walls strategically to your advantage",
      "Time your power-up usage carefully",
    ],
  },
  4: {
    title: "Level 4: Moving Hazards",
    description:
      "Things are getting trickier with moving obstacles! Be ready to:",
    challenges: [
      "Dodge moving obstacles that patrol the area",
      "Score 45 points to complete the level",
      "Predict obstacle movement patterns",
      "Use power-ups to escape tight situations",
      "Snake body can pass through moving obstacles",
      "Moving obstacles sometimes allows you to pass through them.",
    ],
  },
  5: {
    title: "Level 5: The Ultimate Challenge",
    description: "The final challenge awaits! Can you handle:",
    challenges: [
      "Complex obstacle patterns and movements",
      "Score 40 points to beat the game",
      "Master all power-up combinations",
      "Prove your snake-handling skills",
      "Snake body can pass through moving obstacles",
      "Moving obstacles sometimes allows you to pass through them.",
    ],
  },
  6: {
    title: "Level 6: Speed Challenge",
    description: "Welcome to the speed levels! Get ready for:",
    challenges: [
      "Faster base game speed",
      "Score 35 points to complete the level",
      "Navigate around moving and stationary obstacles",
      "Master speed-related power-ups",
      "Moving obstacles patrol in predictable patterns",
      "Time your movements carefully between obstacles",
      "Snake body can pass through moving obstacles",
      "Moving obstacles sometimes allows you to pass through them.",
    ],
  },
  7: {
    title: "Level 7: Advanced Speed & Obstacles",
    description: "The challenge intensifies with faster obstacles! Ready for:",
    challenges: [
      "Even faster base game speed",
      "Score 20 points to complete the level",
      "Complex obstacle patterns and movements",
      "Quick reflexes needed for power-up management",
      "Moving obstacles follow intricate patterns",
      "Master the art of timing between obstacles",
      "Snake body can pass through moving obstacles",
      "Moving obstacles sometimes allows you to pass through them.",
    ],
  },
  8: {
    title: "Level 8: Speed Master",
    description: "The ultimate speed challenge! Are you ready for:",
    challenges: [
      "Maximum speed challenge",
      "Score 20 points to complete the level",
      "Complex obstacle patterns with varying speeds",
      "Fast-paced power-up management",
      "Moving obstacles with unpredictable patterns",
      "Quick decision making required",
      "Snake body can pass through moving obstacles",
      "Moving obstacles sometimes allows you to pass through them.",
    ],
  },
  9: {
    title: "Level 9: Teleporter Challenge",
    description: "Master the art of teleportation! Get ready for:",
    challenges: [
      "Navigate through teleporter portals",
      "Score 20 points to complete the level",
      "High-speed obstacle patterns",
      "Strategic teleporter usage",
      "Quick thinking for portal escapes",
      "Combine power-ups with teleporters",
      "Snake body can pass through moving obstacles",
      "Moving obstacles sometimes allows you to pass through them.",
    ],
  },
  10: {
    title: "Level 10: Ultimate Challenge",
    description:
      "The final test! All mechanics combined for the ultimate challenge:",
    challenges: [
      "Master all game mechanics",
      "Score 15 points to complete the level",
      "Maximum speed challenge",
      "Complex obstacle patterns",
      "Strategic teleporter usage",
      "Power-up mastery required",
      "Most challenging level yet",
      "Prove your snake mastery!",
    ],
  },
  11: {
    title: "Level 11: Food Variety",
    description:
      "Welcome to advanced challenges! Master the art of food collection:",
    challenges: [
      "Multiple food types with different point values",
      "🍎 Apple: 1 point (common)",
      "🍒 Cherry: 2 points (uncommon)",
      "🍌 Banana: 3 points (rare)",
      "Score 20 points to complete the level",
      "Navigate through moving obstacles",
      "Use teleporters strategically",
      "Manage power-ups effectively",
    ],
  },
  12: {
    title: "Level 12: Power-Up Master",
    description: "Master the art of power-up timing and combinations!",
    challenges: [
      "New power-ups with shorter durations",
      "🛡️ Shield: Temporary immunity (10s)",
      "👻 Ghost Mode: Temporary immunity (10s)",
      "❄️ Time Freeze: Stop obstacles (10s)",
      "⚡ Speed Boost: Move faster (8s)",
      "🐌 Slow Down: Move slower (10s)",
      "💫 Score Boost: +5 points (12s)",
      "🌈 Wall Pass: Pass through walls (6s)",
      "More frequent power-up spawns",
      "Power-ups disappear quickly",
      "Score 20 points to complete",
      "Combine power-ups strategically",
    ],
  },
  13: {
    title: "Level 13: Restricted Zones",
    description:
      "Navigate through a dangerous field with a central restricted area! Your challenge:",
    challenges: [
      "Avoid the central restricted zone - it's deadly!",
      "Score 50 points to complete the level",
      "Navigate around moving obstacles with unique patterns",
      "Watch out for fast diagonal obstacles",
      "🛡️ Shield power-up allows temporary passage through restricted areas",
      "Use power-ups strategically to escape tight spots",
      "Moving obstacles follow predictable patterns",
      "Snake body can pass through moving obstacles",
    ],
  },
  14: {
    title: "Level 14: Multiple Restricted Areas",
    description:
      "The challenge intensifies with multiple restricted zones! Face new obstacles:",
    challenges: [
      "Navigate through five restricted zones",
      "Score 40 points to complete the level",
      "Avoid static obstacles placed strategically",
      "Plan your route carefully between restricted areas",
      "🛡️ Shield power-up grants temporary immunity",
      "Master precise movements between zones",
      "Use power-ups to create safe passages",
      "Time your movements carefully",
    ],
  },
  15: {
    title: "Level 15: Advanced Restricted Challenge",
    description: "The ultimate restricted zone challenge! Can you handle:",
    challenges: [
      "Navigate through seven restricted zones",
      "Score 35 points to complete the level",
      "Two new restricted areas added to the mix",
      "Extremely limited safe paths available",
      "🛡️ Shield power-up is crucial for survival",
      "Master strategic power-up usage",
      "Plan your route several moves ahead",
      "Prove your mastery of restricted zone navigation",
    ],
  },
  16: {
    title: "Level 16: Monster Snake Challenge",
    description: "Face off against a monster snake! Can you survive?",
    challenges: [
      "Avoid the monster snake at all costs",
      "Monster snake moves randomly through the arena",
      "Score 30 points to complete the level",
      "Navigate through restricted zones",
      "🛡️ Shield power-up provides temporary immunity",
      "Use power-ups strategically to escape",
      "Plan your route to avoid the monster",
      "Quick reflexes required!",
    ],
  },
  17: {
    title: "Level 17: Extreme Restricted Challenge",
    description:
      "Navigate through a highly confined space with multiple hazards!",
    challenges: [
      "Avoid the monster snake that hunts you",
      "Navigate through five restricted zones",
      "Score 30 points to complete the level",
      "Use power-ups strategically to survive",
      "🛡️ Shield power-up provides temporary immunity",
      "Plan your route carefully between zones",
      "Quick reflexes required for survival",
      "Master precise movements in tight spaces",
    ],
  },
  18: {
    title: "Level 18: High-Speed Monster Challenge",
    description:
      "Face the monster snake at breakneck speeds! Are you ready for:",
    challenges: [
      "Much faster base game speed",
      "Avoid the aggressive monster snake",
      "Navigate through five restricted zones",
      "Score 25 points to complete the level",
      "🛡️ Shield power-up is crucial for survival",
      "⚡ Speed power-ups are extra effective",
      "Master high-speed navigation",
      "Quick decision-making is essential",
    ],
  },
  19: {
    title: "Level 19: Restricted Zone Master",
    description:
      "Navigate through a complex maze of restricted zones while avoiding an enemy snake!",
    challenges: [
      "Constant game speed (50ms)",
      "Avoid the enemy snake that hunts you",
      "Navigate through ten restricted zones",
      "Score 20 points to complete the level",
      "🛡️ Shield power-up grants safe passage through restricted areas",
      "⚡ Speed power-ups help escape the enemy snake",
      "🌈 Wall Pass helps create shortcuts",
      "Strategic positioning between restricted zones is crucial",
      "Enemy snake follows predictable patterns - use this to your advantage",
      "Quick decision-making required for survival",
    ],
  },
  20: {
    title: "Level 20: The Final Challenge",
    description:
      "The ultimate test of your snake mastery! Face multiple challenges simultaneously in this epic finale.",
    challenges: [
      "Multiple food items (3) appear simultaneously",
      "Each food item gives +2 points",
      "Navigate through teleport portals for quick escapes",
      "Avoid moving skull obstacles that patrol horizontally",
      "Deal with ten restricted zones",
      "Dodge the enemy snake while collecting food",
      "Score 30 points to complete the game",
      "💀 Watch out for deadly moving skull obstacles",
      "🛡️ Shield power-up is crucial for survival",
      "⚡ Speed power-ups help navigate tight spaces",
      "Master all mechanics to prove your ultimate snake skills!",
    ],
  },
};

const LevelInfoModal = ({
  visible,
  level,
  onStart,
  onClose,
}: LevelInfoModalProps) => {
  const levelData = LEVEL_INFO[level as keyof typeof LEVEL_INFO];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>

          <Text style={styles.levelNumber}>Level {level}</Text>
          <Text style={styles.title}>{levelData.title}</Text>
          <Text style={styles.description}>{levelData.description}</Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.challengesContainer}>
              {levelData.challenges.map((challenge, index) => (
                <View key={index} style={styles.challengeItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#52B788" />
                  <Text style={styles.challengeText}>{challenge}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>Let's Start!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    maxHeight: "80%", // Limit maximum height
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
  },
  levelNumber: {
    color: "#52B788",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    color: "#888",
    fontSize: 16,
    marginBottom: 16,
  },
  scrollView: {
    marginBottom: 16,
    maxHeight: "60%", // Control scroll area height
  },
  scrollContent: {
    paddingRight: 12, // Space for scroll bar
  },
  challengesContainer: {
    paddingBottom: 8, // Add some bottom padding in scroll
  },
  challengeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  challengeText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  startButton: {
    backgroundColor: "#52B788",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 8, // Add some space after scroll
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LevelInfoModal;
