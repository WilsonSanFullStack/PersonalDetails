import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

export default function Logout() {
  const router = useRouter();

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    router.replace("/(auth)/loggin");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>¿Desea cerrar sesión?</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}
