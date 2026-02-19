import { ReactNode } from "react";
import { View, ViewProps } from "react-native";

type ThemeViewVariant = "default" | "card" | "rounded" | "error";

interface IThemeView extends ViewProps {
  children: ReactNode;
  variant?: ThemeViewVariant;
  className?: string; // Para permitir clases extra
}

const variantClasses: Record<ThemeViewVariant, string> = {
  default: "bg-white p-4",
  card: "bg-white p-6 rounded-lg shadow-md",
  rounded: "bg-white p-4 rounded-full",
  error: "bg-error p-4 rounded-md",
};

export default function ThemeView({
  children,
  variant = "default",
  className = "",
  ...rest
}: IThemeView) {
  return (
    <View className={`${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </View>
  );
}
