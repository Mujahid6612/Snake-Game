import type { ReactElement } from "react";
import { Text, View } from "react-native";
import Level1 from "../levels/level1";
import Level10 from "../levels/level10";
import Level11 from "../levels/level11";
import Level12 from "../levels/level12";
import Level13 from "../levels/level13";
import Level14 from "../levels/level14";
import Level15 from "../levels/level15";
import Level16 from "../levels/level16";
import Level17 from "../levels/level17";
import Level18 from "../levels/level18";
import Level19 from "../levels/level19";
import Level2 from "../levels/level2";
import Level20 from "../levels/level20";
import Level3 from "../levels/level3";
import Level4 from "../levels/level4";
import Level5 from "../levels/level5";
import Level6 from "../levels/level6";
import Level7 from "../levels/level7";
import Level8 from "../levels/level8";
import Level9 from "../levels/level9";

import { useLocalSearchParams } from "expo-router";

const GameLevels = () => {
  const { level } = useLocalSearchParams();
  console.log(level, "level");

  // Convert level to a number and ensure it's valid
  const levelNumber = level ? Number(level) : undefined;

  const levelsHash: Record<number, ReactElement> = {
    1: <Level1 />,
    2: <Level2 />,
    3: <Level3 />,
    4: <Level4 />,
    5: <Level5 />,
    6: <Level6 />,
    7: <Level7 />,
    8: <Level8 />,
    9: <Level9 />,
    10: <Level10 />,
    11: <Level11 />,
    12: <Level12 />,
    13: <Level13 />,
    14: <Level14 />,
    15: <Level15 />,
    16: <Level16 />,
    17: <Level17 />,
    18: <Level18 />,
    19: <Level19 />,
    20: <Level20 />,
  };

  return (
    <View style={{ flex: 1 }}>
      {levelNumber && levelsHash[levelNumber] ? (
        levelsHash[levelNumber]
      ) : (
        <Text>Invalid level</Text>
      )}
    </View>
  );
};

export default GameLevels;
