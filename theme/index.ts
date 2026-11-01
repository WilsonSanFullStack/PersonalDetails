import { createElement, forwardRef } from "react";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import {
  Pressable as NativePressable,
  Text as NativeText,
  View as NativeView,
  useColorScheme,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from "react-native";

const lightColors = {
  background: "#F5F5F4",
  surface: "#FFFFFF",
  surfaceMuted: "#FAFAF9",
  text: "#1C1C1C",
  textMuted: "#737373",
  textSubtle: "#A3A3A3",
  border: "#E5E5E5",
  accent: "#262626",
  accentMuted: "#404040",
  onAccent: "#FFFFFF",
  danger: "#DC2626",
  dangerSurface: "#FEF2F2",
  success: "#16A34A",
  warning: "#D97706",
};

const darkColors = {
  background: "#121212",
  surface: "#1C1C1C",
  surfaceMuted: "#242424",
  text: "#F5F5F5",
  textMuted: "#A3A3A3",
  textSubtle: "#737373",
  border: "#333333",
  accent: "#E5E5E5",
  accentMuted: "#BDBDBD",
  onAccent: "#171717",
  danger: "#F87171",
  dangerSurface: "#2A1414",
  success: "#4ADE80",
  warning: "#FBBF24",
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

/* ------------------------------------------------------------------ */
/* TEXT VARIANTS                                                       */
/* ------------------------------------------------------------------ */

export type TextVariant =
  | "title"      // H1
  | "subtitle"   // H2
  | "heading"    // H3
  | "body"       // párrafo normal
  | "bodyMuted"  // párrafo secundario
  | "caption"    // texto pequeño
  | "label"      // label de formulario
  | "input"      // texto dentro de inputs
  | "error"      // mensaje de error
  | "success"    // mensaje de éxito
  | "link";      // texto tipo enlace / botón

export interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
}

export const Text = forwardRef<NativeText, ThemedTextProps>(function ThemedText(
  { style, variant = "body", ...props },
  ref,
) {
  const { colors } = useAppTheme();

  const variantStyles = getTextVariantStyles(variant, colors);

  return createElement(NativeText, {
    ...props,
    ref,
    style: [{ color: colors.text }, variantStyles, style],
  });
});

function getTextVariantStyles(
  variant: TextVariant,
  colors: ReturnType<typeof useAppTheme>["colors"],
) {
  switch (variant) {
    case "title":
      return {
        fontSize: 28,
        fontWeight: "700" as const,
        color: colors.text,
        lineHeight: 34,
      };
    case "subtitle":
      return {
        fontSize: 22,
        fontWeight: "600" as const,
        color: colors.text,
        lineHeight: 28,
      };
    case "heading":
      return {
        fontSize: 18,
        fontWeight: "600" as const,
        color: colors.text,
        lineHeight: 24,
      };
    case "body":
      return {
        fontSize: 16,
        fontWeight: "400" as const,
        color: colors.text,
        lineHeight: 22,
      };
    case "bodyMuted":
      return {
        fontSize: 15,
        fontWeight: "400" as const,
        color: colors.textMuted,
        lineHeight: 21,
      };
    case "caption":
      return {
        fontSize: 12,
        fontWeight: "400" as const,
        color: colors.textMuted,
        lineHeight: 16,
      };
    case "label":
      return {
        fontSize: 14,
        fontWeight: "600" as const,
        color: colors.text,
        marginBottom: 6,
      };
    case "input":
      return {
        fontSize: 16,
        fontWeight: "400" as const,
        color: colors.text,
        lineHeight: 22,
      };
    case "error":
      return {
        fontSize: 13,
        fontWeight: "500" as const,
        color: colors.danger,
        marginTop: 4,
      };
    case "success":
      return {
        fontSize: 13,
        fontWeight: "500" as const,
        color: colors.success,
        marginTop: 4,
      };
    case "link":
      return {
        fontSize: 16,
        fontWeight: "600" as const,
        color: colors.accent,
      };
    default:
      return {};
  }
}

/* ------------------------------------------------------------------ */
/* VIEW VARIANTS                                                       */
/* ------------------------------------------------------------------ */

export type ViewVariant =
  | "default"    // fondo principal de la app
  | "surface"    // tarjeta / card
  | "muted"      // superficie sutil
  | "bordered"   // superficie con borde
  | "card"       // tarjeta con sombra
  | "row"        // fila horizontal centrada
  | "center"     // centra contenido
  | "divider"    // separador
  | "error"      // caja de error
  | "success";   // caja de éxito

export interface ThemedViewProps extends ViewProps {
  variant?: ViewVariant;
}

export const View = forwardRef<NativeView, ThemedViewProps>(function ThemedView(
  { style, variant = "default", ...props },
  ref,
) {
  const { colors } = useAppTheme();

  const variantStyles = getViewVariantStyles(variant, colors);

  return createElement(NativeView, {
    ...props,
    ref,
    style: [{ backgroundColor: colors.background }, variantStyles, style],
  });
});

function getViewVariantStyles(
  variant: ViewVariant,
  colors: ReturnType<typeof useAppTheme>["colors"],
) {
  switch (variant) {
    case "surface":
      return { backgroundColor: colors.surface };
    case "muted":
      return { backgroundColor: colors.surfaceMuted };
    case "bordered":
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
      };
    case "card":
      return {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      };
    case "row":
      return {
        flexDirection: "row" as const,
        alignItems: "center" as const,
      };
    case "center":
      return {
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };
    case "divider":
      return {
        height: 1,
        backgroundColor: colors.border,
        width: "100%" as const,
      };
    case "error":
      return {
        backgroundColor: colors.dangerSurface,
        borderWidth: 1,
        borderColor: colors.danger,
        borderRadius: 8,
        padding: 12,
      };
    case "success":
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.success,
        borderRadius: 8,
        padding: 12,
      };
    case "default":
    default:
      return {};
  }
}

/* ------------------------------------------------------------------ */
/* PRESSABLE VARIANTS                                                  */
/* ------------------------------------------------------------------ */

export type PressableVariant =
  | "primary"     // botón principal (fondo accent)
  | "secondary"   // botón secundario (fondo surface con borde)
  | "ghost"       // solo texto
  | "danger"      // acción destructiva
  | "link"        // como enlace
  | "card";       // tarjeta pulsable

export interface ThemedPressableProps extends PressableProps {
  variant?: PressableVariant;
}

export const Pressable = forwardRef<NativeView, ThemedPressableProps>(
  function ThemedPressable({ style, variant = "primary", disabled, ...props }, ref) {
    const { colors } = useAppTheme();

    const variantStyles = getPressableVariantStyles(variant, colors);

    return createElement(NativePressable, {
      ...props,
      ref,
      disabled,
      style: (state) => [
        variantStyles,
        typeof style === "function" ? style(state) : style,
        state.pressed && { opacity: 0.75 },
        disabled && { opacity: 0.5 },
      ],
    });
  },
);

function getPressableVariantStyles(
  variant: PressableVariant,
  colors: ReturnType<typeof useAppTheme>["colors"],
) {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };
    case "secondary":
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };
    case "danger":
      return {
        backgroundColor: colors.danger,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      };
    case "link":
      return {
        backgroundColor: "transparent",
        paddingVertical: 4,
        paddingHorizontal: 0,
      };
    case "card":
      return {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      };
    default:
      return {};
  }
}

/* ------------------------------------------------------------------ */
/* Helper para texto de botones según variante                         */
/* ------------------------------------------------------------------ */

/**
 * Devuelve el color de texto adecuado para el contenido de un Pressable
 * según su variante. Úsalo así:
 *
 *   <Pressable variant="primary">
 *     <Text style={{ color: getPressableTextColor("primary", colors) }}>
 *       Aceptar
 *     </Text>
 *   </Pressable>
 */
export function getPressableTextColor(
  variant: PressableVariant,
  colors: ReturnType<typeof useAppTheme>["colors"],
) {
  switch (variant) {
    case "primary":
      return colors.onAccent;
    case "danger":
      return "#FFFFFF";
    case "ghost":
    case "link":
      return colors.accent;
    case "secondary":
    case "card":
    default:
      return colors.text;
  }
}