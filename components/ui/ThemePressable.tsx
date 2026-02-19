import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";

type ThemePressableVariant = "default" | "primary" | "secondary" | "error";

interface IThemePressable extends PressableProps {
  children: ReactNode;
  variant?: ThemePressableVariant;
  className?: string; // Para permitir clases extra
}

const variantClasses: Record<ThemePressableVariant, string> = {
  default: "bg-gray-200 px-4 py-2 rounded-md",
  primary: "bg-accent px-4 py-2 rounded-md text-white",
  secondary: "bg-white border border-gray-300 px-4 py-2 rounded-md text-black",
  error: "bg-error px-4 py-2 rounded-md text-white",
};

export default function ThemePressable({
  children,
  variant = "default",
  className = "",
  ...rest
}: IThemePressable) {
  return (
    <Pressable className={`${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </Pressable>
  );
}
