import { theme } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import { useInterstitialAd } from "@/hooks/useInterstitialAd";

const HelpScreen = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = async (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    // Show interstitial ad on game over
    // await showAd();
  };

  // const { showAd } = useInterstitialAd();

  const Section = ({
    title,
    content,
  }: {
    title: string;
    content: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(title)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={expandedSection === title ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.primary}
        />
      </TouchableOpacity>
      {expandedSection === title && (
        <View style={styles.sectionContent}>{content}</View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help & Information</Text>

      <Section
        title="How to Play Game"
        content={
          <View>
            <Text style={styles.contentText}>
              • Swipe in any direction to control the snake{"\n"}• Collect food
              (🍎) to grow longer and earn points{"\n"}• Collect power-ups for
              special abilities:{"\n"}
              {"  "}⚡ Speed Boost - Increases snake speed{"\n"}
              {"  "}🐌 Slow Down - Decreases snake speed{"\n"}
              {"  "}💫 Score Boost - Adds 5 points{"\n"}
              {"  "}🌈 Wall Pass - Allows passing through walls{"\n"}• Avoid
              hitting walls{"\n"}• Try to achieve the highest score possible
            </Text>
          </View>
        }
      />

      <Section
        title="How to Control Settings"
        content={
          <Text style={styles.contentText}>
            • Access settings from the main menu{"\n"}• Adjust game difficulty
            {"\n"}• Toggle sound effects and background music{"\n"}• Your
            settings are automatically saved
          </Text>
        }
      />

      <Section
        title="How to Level Up"
        content={
          <Text style={styles.contentText}>
            • Each level requires specific points to complete{"\n"}• Collect
            food to earn points{"\n"}• Use power-ups strategically{"\n"}•
            Complete levels to unlock achievements{"\n"}• Try to beat your best
            score in each level
          </Text>
        }
      />

      <Section
        title="About"
        content={
          <Text style={styles.contentText}>
            Snake Game v1.0.0{"\n\n"}A modern take on the classic snake game,
            featuring power-ups, levels, and exciting gameplay mechanics.
            Created with love using React Native and Expo.{"\n\n"}
            This game is a product of{" "}
            <Text style={{ fontWeight: "bold" }}>@SHAMILA's CREATIVITY</Text>©
            2025 Snake Game. All rights reserved.
          </Text>
        }
      />

      <Section
        title="Contact"
        content={
          <View>
            <Text style={styles.contentText}>
              Have questions or feedback? Reach out to us:{"\n\n"}
              Email: techtool269@gmail.com{"\n"}
              {/* Twitter: @SnakeGame{'\n'} */}
              {/* Discord: discord.gg/snakegame */}
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL("mailto:techtool269@gmail.com")}
            >
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Section
        title="Terms and Conditions"
        content={
          <Text style={styles.contentText}>
            By using this app, you agree to our terms and conditions:{"\n\n"}•
            This app is provided "as is" without warranty{"\n"}• Users must be
            13 years or older{"\n"}• We reserve the right to modify the game
            {"\n"}• User data not collected by us{"\n\n"}
          </Text>
        }
      />

      <Section
        title="Privacy Policy"
        content={
          <Text style={styles.contentText}>
            We respect your privacy:{"\n\n"}• We don't collect any user data
            {"\n"}• Game progress is stored locally{"\n"}• No personal
            information is shared{"\n"}• Analytics are used to improve gameplay
            {"\n"}• You can delete your data anytime{"\n\n"}
          </Text>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.white,
    marginBottom: 24,
    marginTop: 40,
  },
  section: {
    marginBottom: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.white,
  },
  sectionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  contentText: {
    color: theme.textFaint,
    fontSize: 16,
    lineHeight: 24,
  },
  contactButton: {
    backgroundColor: theme.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  contactButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HelpScreen;
