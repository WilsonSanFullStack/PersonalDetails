import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";

export default function WorkspaceLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="quincenas" options={{ title: "Quincenas" }} />
      <Drawer.Screen name="pages" options={{ title: "Pages" }} />
      <Drawer.Screen name="members" options={{ title: "Miembros" }} />
      <Drawer.Screen name="logout" options={{ title: "Cerrar sesión" }} />
      <Stack>{/* Stack navigation for internal screens */}</Stack>
    </Drawer>
  );
}
