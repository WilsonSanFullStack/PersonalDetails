import { createElement, forwardRef } from "react";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import {
  Text as NativeText,
  View as NativeView,
  useColorScheme,
  type TextProps,
  type ViewProps,
} from "react-native";

const lightColors = {
  background: "#F5F5F4",
  surface: "#FFFFFF",
  text: "#1C1C1C",
  textMuted: "#737373",
  border: "#E5E5E5",
  accent: "#262626",
  onAccent: "#FFFFFF",
};

const darkColors = {
  background: "#121212",
  surface: "#1C1C1C",
  text: "#F5F5F5",
  textMuted: "#A3A3A3",
  border: "#333333",
  accent: "#E5E5E5",
  onAccent: "#171717",
};

export function useAppTheme() {
  const mode = useColorScheme() === "dark" ? "dark" : "light";
  const colors = mode === "dark" ? darkColors : lightColors;
  const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  const navigationTheme: Theme = {
    ...baseTheme,
    dark: mode === "dark",
    colors: {
      ...baseTheme.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return { mode, colors, navigationTheme };
}

export const View = forwardRef<NativeView, ViewProps>(function ThemedView(
  { style, ...props },
  ref,
) {
  const { colors } = useAppTheme();

  return createElement(NativeView, {
    ...props,
    ref,
    style: [{ backgroundColor: colors.background }, style],
  });
});

export const Text = forwardRef<NativeText, TextProps>(function ThemedText(
  { style, ...props },
  ref,
) {
  const { colors } = useAppTheme();

  return createElement(NativeText, {
    ...props,
    ref,
    style: [{ color: colors.text }, style],
  });
});
