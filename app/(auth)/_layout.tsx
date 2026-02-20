import ThemeSafeAreaView from "@/components/ui/ThemeSafeAreaView";
import ThemeText from "@/components/ui/ThemeText";
import { Slot, Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function _layout() {
  return (
    <ThemeSafeAreaView>
      <Slot />
          </ThemeSafeAreaView>
  );
}
