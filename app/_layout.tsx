import { router, Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "../global.css";

//importacion de componentes de ui
import ThemePressable from "@/components/ui/ThemePressable";
import ThemeSafeAreaView from "@/components/ui/ThemeSafeAreaView";
import ThemeText from "@/components/ui/ThemeText";
import ThemeView from "@/components/ui/ThemeView";
import { Image } from "react-native";

export default function RootLayout() {
  const para = usePathname();
  console.log(para);

  return (
    <ThemeSafeAreaView className="flex-1 justify-center px-4">
      <ThemeView className="flex-row">
        <ThemePressable
          variant="default"
          onPress={() => router.back()}
          className="w-20 h-12">
          <ThemeText variant="pressable">back</ThemeText>
        </ThemePressable>

        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: 60,
            height: 60,
            resizeMode: "contain",
            marginHorizontal: 72,
          }}
        />
      </ThemeView>
      <Slot />
      <StatusBar style="light" />
    </ThemeSafeAreaView>
  );
}
