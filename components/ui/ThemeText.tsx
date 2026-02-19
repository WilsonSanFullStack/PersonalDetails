import { ReactNode } from "react";
import { Text, TextProps } from "react-native";

type ThemeTextVariant = "title" | "paragraph" | "error" | "default" | "pressable";

interface IThemeText extends TextProps {
  children: ReactNode;
  variant?: ThemeTextVariant;
  className?: string; // Para permitir clases extra
}

const variantClasses: Record<ThemeTextVariant, string> = {
  title: "text-2xl font-bold text-accent mb-2",
  pressable: "text-xl font-bold text-black mb-2 text-center",
  paragraph: "text-base text-textSecondary mb-1",
  error: "text-sm font-bold text-error mb-1",
  default: "text-base text-text",
};

export default function ThemeText({
  children,
  variant = "default",
  className = "",
  ...rest
}: IThemeText) {
  return (
    <Text className={`${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </Text>
  );
}
