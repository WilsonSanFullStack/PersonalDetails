import * as Linking from "expo-linking";
import { ReactNode } from "react";
import { Text, TextProps } from "react-native";

type ThemeLinkVariant = "default" | "primary" | "secondary";

interface IThemeLink extends TextProps {
  children: ReactNode;
  href: string;
  variant?: ThemeLinkVariant;
  className?: string; // Para permitir clases extra
}

const variantClasses: Record<ThemeLinkVariant, string> = {
  default: "text-accent underline",
  primary: "text-accent font-bold underline",
  secondary: "text-blue-500 underline",
};

export default function ThemeLink({
  children,
  href,
  variant = "default",
  className = "",
  ...rest
}: IThemeLink) {
  const handlePress = () => {
    Linking.openURL(href);
  };
  return (
    <Text
      className={`${variantClasses[variant]} ${className}`}
      onPress={handlePress}
      {...rest}>
      {children}
    </Text>
  );
}
