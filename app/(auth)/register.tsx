import ThemePressable from "@/components/ui/ThemePressable";
import ThemeText from "@/components/ui/ThemeText";
import ThemeTextInput from "@/components/ui/ThemeTextInput";
import ThemeView from "@/components/ui/ThemeView";
import { useAuth } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
});
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await registerUser(data.email, data.password);
      router.replace("/(app)/workspace/ws1");
    } catch (error) {
      console.log("Error registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <ThemeView variant="card" className="bg-gray-800 p-4 m-2">
        {/* email */}
        <View className="p-2">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <ThemeTextInput
                placeholder="Correo electronico"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChange={onChange}
              />
            )}
          />
          {errors.email && (
            <ThemeText variant="error" className="text-center">
              {errors.email.message}
            </ThemeText>
          )}
        </View>
        {/* password */}
        <View className="p-2">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <ThemeTextInput
                placeholder="contraseña"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.password && (
            <ThemeText variant="error" className="flex text-center">
              {errors.password.message}
            </ThemeText>
          )}
        </View>
        {/* button */}
        <View className="flex items-center p-2">
          <ThemePressable
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemeText variant="default" className="flex text-center">
                Registrarse
              </ThemeText>
            )}
          </ThemePressable>
        </View>
      </ThemeView>
    </View>
  );
}
