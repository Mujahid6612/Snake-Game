import { theme } from "@/constants/theme";
import { Tabs } from "expo-router";
import React, { type ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Derive the exact tab-bar prop shape expo-router expects for its `tabBar`.
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
// import { BannerAd } from '@/components/BannerAd';

type IconFn = (color: string, size: number) => React.ReactNode;

const TAB_ICONS: Record<string, IconFn> = {
  index: (color, size) => <Feather name="home" size={size} color={color} />,
  settings: (color, size) => (
    <Ionicons name="settings-outline" size={size} color={color} />
  ),
  help: (color, size) => (
    <Feather name="help-circle" size={size} color={color} />
  ),
};

/**
 * Fully custom floating tab bar. Active tab renders as a green pill that
 * expands to show its label; inactive tabs show just a muted icon.
 * (React Navigation's built-in `tabBarIcon` slot is too narrow to hold an
 * icon + label without clipping, hence the custom `tabBar`.)
 */
function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { bottom: insets.bottom + 12 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.title === "string" ? options.title : route.name;
        const focused = state.index === index;
        const renderIcon = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.item}
          >
            <View style={[styles.pill, focused && styles.pillActive]}>
              {renderIcon?.(focused ? theme.background : theme.textMuted, 20)}
              {focused && <Text style={styles.pillLabel}>{label}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="help" options={{ title: "Help" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 64,
    paddingHorizontal: 8,
    borderRadius: 30,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.whiteA10,
    elevation: 16,
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    overflow: "hidden",
  },
  pillActive: {
    backgroundColor: theme.primary,
    borderRadius: 24,
    // Green glow on iOS only — Android `elevation` draws a rectangular
    // shadow that pokes past the rounded corners.
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      default: {},
    }),
  },
  pillLabel: {
    color: theme.background,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
