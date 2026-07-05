import React from "react";
import { View, StyleSheet } from "react-native";
import { VideoView, useVideoPlayer } from 'expo-video';

export default function Intro() {
  const player = useVideoPlayer(require("../../assets/intro.mp4"), (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: '100%',
  },
});
