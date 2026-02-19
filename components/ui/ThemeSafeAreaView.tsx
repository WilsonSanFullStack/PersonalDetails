import { ReactNode } from "react";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

interface ThemeSafeAreaViewProps extends SafeAreaViewProps {
  children: ReactNode;
  className?: string;
}

export default function ThemeSafeAreaView({
  children,
  className = "",
  ...rest
}: ThemeSafeAreaViewProps) {
  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`} {...rest}>
      {children}
    </SafeAreaView>
  );
}