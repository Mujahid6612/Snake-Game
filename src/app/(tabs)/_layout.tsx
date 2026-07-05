import { theme } from "@/constants/theme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Settings from "@expo/vector-icons/Ionicons";
// import { BannerAd } from '@/components/BannerAd';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            android: {
              backgroundColor: theme.black,
              color: theme.white,
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <Feather
                name="home"
                size={24}
                style={{
                  color: focused ? theme.primary : theme.white,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="infinity-level"
          options={{
            title: "Level Infinity",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name="game-controller-outline"
                style={{ color: focused ? theme.primary : theme.white }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <Settings
                size={24}
                name="settings-outline"
                style={{ color: focused ? theme.primary : theme.white }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="help"
          options={{
            title: "Help",
            tabBarIcon: ({ focused }) => (
              <Feather
                name="help-circle"
                size={24}
                style={{ color: focused ? theme.primary : theme.white }}
              />
            ),
          }}
        />        
      </Tabs>
      {/* <BannerAd /> */}
    </>
  );
}
