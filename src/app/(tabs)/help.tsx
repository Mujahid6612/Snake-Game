import { theme } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
type MciName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const HelpScreen = () => {
  const [expanded, setExpanded] = useState<string | null>("How to play");

  const toggle = (section: string) =>
    setExpanded((prev) => (prev === section ? null : section));

  const Section = ({
    icon,
    title,
    children,
  }: {
    icon: IoniconName;
    title: string;
    children: React.ReactNode;
  }) => {
    const open = expanded === title;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggle(title)}
          activeOpacity={0.8}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={icon} size={20} color={theme.primary} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.textMuted}
          />
        </TouchableOpacity>
        {open && <View style={styles.cardBody}>{children}</View>}
      </View>
    );
  };

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Ionicons
        name="checkmark-circle"
        size={16}
        color={theme.primary}
        style={styles.bulletIcon}
      />
      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );

  const PowerRow = ({
    icon,
    name,
    desc,
  }: {
    icon: MciName;
    name: string;
    desc: string;
  }) => (
    <View style={styles.powerRow}>
      <View style={styles.powerIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={theme.primary} />
      </View>
      <View style={styles.powerText}>
        <Text style={styles.powerName}>{name}</Text>
        <Text style={styles.powerDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="help-buoy-outline" size={24} color={theme.background} />
        </View>
        <Text style={styles.headerTitle}>Help</Text>
      </View>

      <Section icon="game-controller-outline" title="How to play">
        <Bullet>Swipe up, down, left or right to steer the snake.</Bullet>
        <Bullet>Eat food to grow longer and earn points.</Bullet>
        <Bullet>Reach the level&apos;s target score to clear it.</Bullet>
        <Bullet>
          Avoid the walls, obstacles, restricted zones and enemy snakes.
        </Bullet>
        <Bullet>Tap the screen to pause or resume.</Bullet>
      </Section>

      <Section icon="flash-outline" title="Power-ups">
        <Text style={styles.bodyIntro}>
          Grab power-ups that appear during play for a temporary edge:
        </Text>
        <PowerRow
          icon="lightning-bolt"
          name="Speed Boost"
          desc="Move faster for a short burst."
        />
        <PowerRow
          icon="snail"
          name="Slow Down"
          desc="Slow the snake to handle tight spots."
        />
        <PowerRow
          icon="star-four-points"
          name="Score Boost"
          desc="Instantly adds bonus points."
        />
        <PowerRow
          icon="wall"
          name="Wall Pass"
          desc="Pass through walls for a few seconds."
        />
      </Section>

      <Section icon="trophy-outline" title="Levels & progress">
        <Bullet>20 hand-crafted levels, each tougher than the last.</Bullet>
        <Bullet>
          New hazards appear as you go: moving obstacles, teleporters,
          restricted zones and rival snakes.
        </Bullet>
        <Bullet>Every level has a target score to reach.</Bullet>
        <Bullet>Replay any level to beat your best score.</Bullet>
      </Section>

      <Section icon="settings-outline" title="Settings">
        <Bullet>Difficulty sets the snake&apos;s base speed.</Bullet>
        <Bullet>Toggle sound effects and background music.</Bullet>
        <Bullet>Your preferences are saved automatically.</Bullet>
      </Section>

      <Section icon="information-circle-outline" title="About">
        <Text style={styles.bodyText}>
          Classic Snake is a modern take on the arcade classic — 20 levels of
          power-ups and escalating hazards.{"\n\n"}Built with React Native and
          Expo.{"\n"}Version 1.0.0 · © 2026 Classic Snake.
        </Text>
      </Section>

      <Section icon="mail-outline" title="Contact">
        <Text style={styles.bodyText}>
          Questions or feedback? We&apos;d love to hear from you.
        </Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL("mailto:techtool269@gmail.com")}
          activeOpacity={0.85}
        >
          <Ionicons name="mail-outline" size={18} color={theme.background} />
          <Text style={styles.contactButtonText}>Contact support</Text>
        </TouchableOpacity>
      </Section>

      <Section icon="shield-checkmark-outline" title="Privacy & terms">
        <Bullet>We don&apos;t collect any personal data.</Bullet>
        <Bullet>Your progress is stored locally on your device.</Bullet>
        <Bullet>You should be 13 or older to play.</Bullet>
        <Bullet>
          The game is provided &quot;as is&quot; and may be updated over time.
        </Bullet>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 44,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.white,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.whiteA10,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.primaryA15,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: theme.white,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: theme.whiteA10,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bodyText: {
    flex: 1,
    color: theme.textFaint,
    fontSize: 14,
    lineHeight: 21,
  },
  bodyIntro: {
    color: theme.textFaint,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 4,
  },
  powerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  powerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.primaryA15,
    alignItems: "center",
    justifyContent: "center",
  },
  powerText: {
    flex: 1,
  },
  powerName: {
    color: theme.white,
    fontSize: 14,
    fontWeight: "700",
  },
  powerDesc: {
    color: theme.textMuted,
    fontSize: 13,
    marginTop: 1,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.primary,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 14,
  },
  contactButtonText: {
    color: theme.background,
    fontSize: 15,
    fontWeight: "800",
  },
});

export default HelpScreen;
