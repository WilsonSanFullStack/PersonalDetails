import ThemeSafeAreaView from "@/components/ui/ThemeSafeAreaView";
import ThemeView from "@/components/ui/ThemeView";
import { AuthProvider } from "@/context/AuthContext";
import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image } from "react-native";
import "../global.css";

export default function RootLayout() {
  const para = usePathname();
  console.log(para);

  return (
    <AuthProvider>
      <ThemeSafeAreaView className="flex-1 px-4">
        <ThemeView className="w-full items-center justify-center py-0">
          <Image
            source={require("../assets/images/logo.png")}
            style={{
              width: 48,
              height: 48,
              resizeMode: "contain",
            }}
          />
        </ThemeView>
        <Slot />
        <StatusBar style="light" />
      </ThemeSafeAreaView>
    </AuthProvider>
  );
}
