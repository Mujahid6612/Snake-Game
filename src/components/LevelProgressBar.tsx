import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LevelProgressBarProps {
  currentLevel: number;
  currentScore: number;
  pointsToNextLevel: number;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  currentLevel,
  currentScore,
  pointsToNextLevel,
}) => {
  const progress = Math.min((currentScore / pointsToNextLevel) * 100, 100);

  return (
    <View style={styles.container}>
      {/* Current Level */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelNumber}>{currentLevel}</Text>
        <Text style={styles.levelLabel}>LEVEL</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.scoreText}>
          {currentScore}/{pointsToNextLevel}
        </Text>
      </View>

      {/* Next Level */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelNumber}>{currentLevel + 1}</Text>
        <Text style={styles.levelLabel}>NEXT</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  levelContainer: {
    alignItems: 'center',
    minWidth: 40,
  },
  levelNumber: {
    color: '#52B788',
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#52B788',
    borderRadius: 4,
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default LevelProgressBar; 