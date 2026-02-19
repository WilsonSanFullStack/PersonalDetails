import { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

type ThemeTextInputVariant = "default" | "underline" | "rounded" | "error";

interface IThemeTextInput extends TextInputProps {
  variant?: ThemeTextInputVariant;
  className?: string; // Para permitir clases extra
}

const variantClasses: Record<ThemeTextInputVariant, string> = {
  default: "border border-gray-300 bg-white text-black px-3 py-2 rounded-md",
  underline: "border-b border-gray-400 bg-transparent text-black px-2 py-1",
  rounded: "border border-gray-300 bg-white text-black px-4 py-2 rounded-full",
  error: "border border-error bg-white text-error px-3 py-2 rounded-md",
};

const ThemeTextInput = forwardRef<TextInput, IThemeTextInput>(
  ({ variant = "default", className = "", ...rest }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`${variantClasses[variant]} ${className}`}
        {...rest}
      />
    );
  },
);

export default ThemeTextInput;
