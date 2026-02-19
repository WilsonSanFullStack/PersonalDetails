import { Slot } from "expo-router";
import React from "react";
import "../global.css";

//importacion de componentes de ui
import ThemeSafeAreaView from "@/components/ui/ThemeSafeAreaView";
import ThemeText from "@/components/ui/ThemeText";


export default function RootLayout() {
  return (
    <ThemeSafeAreaView >
      <ThemeText variant="title" className="text-center">bienvenido a agenda</ThemeText>
      <Slot />

      {/* <StatusBar style="light" translucent  />   */}
    </ThemeSafeAreaView>
  );
}
