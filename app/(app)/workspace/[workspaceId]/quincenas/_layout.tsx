import { Stack } from "expo-router";
import React from "react";

export default function QuincenasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Resumen Quincena" }} />
      <Stack.Screen name="days/[dayId]" options={{ title: "Detalle Día" }} />
    </Stack>
  );
}
